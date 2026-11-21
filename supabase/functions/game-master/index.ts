import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  normalizeText,
  pickSubtopic,
  shouldSampleForReview,
  validateGenerated,
  type GeneratedQuestion,
} from "./validate.ts";

// ════════════════════════════════════════════════════════════════════════════
// Game Master — génère la question de la manche suivante.
// Appelée par l'hôte d'une partie en cours. Les joueurs n'appellent jamais
// cette fonction directement.
//
// Entrée : { room_id, device_id, round, theme, difficulty? }
// Sortie : { id, question, options, answer, explanation, round, source }
//          source = 'gemini' (nouvelle question) ou 'pool' (repli).
// ════════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const DAILY_BUDGET = Number(Deno.env.get("GAME_MASTER_DAILY_BUDGET") ?? 500);

const ROOM_MAX_QUESTIONS = 40;   // plafond de questions par salle
const MAX_ATTEMPTS = 3;          // tentatives de génération avant repli
const GEMINI_TIMEOUT_MS = 15000;
const HISTORY_SIZE = 60;         // questions récentes évitées (salle + thème)
const DIFFICULTIES = ["rookie", "hunter", "monarque"];

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface Input {
  room_id: number;
  device_id: string;
  round: number;
  theme: string;
  difficulty: string;
}

function parseInput(raw: unknown): Input | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Number.isInteger(r.room_id)) return null;
  if (typeof r.device_id !== "string" || r.device_id.length < 8 || r.device_id.length > 100) return null;
  if (!Number.isInteger(r.round) || (r.round as number) < 0 || (r.round as number) > 500) return null;
  if (typeof r.theme !== "string" || r.theme.length === 0 || r.theme.length > 40) return null;
  const difficulty = typeof r.difficulty === "string" ? r.difficulty : "hunter";
  if (!DIFFICULTIES.includes(difficulty)) return null;
  return {
    room_id: r.room_id as number,
    device_id: r.device_id,
    round: r.round as number,
    theme: r.theme,
    difficulty,
  };
}

async function callGemini(prompt: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Réponse Gemini vide");
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(
  theme: string,
  difficulty: string,
  subtopic: string,
  examples: string[],
  avoid: string[],
): string {
  return `Tu écris UNE question de quiz en français pour un jeu familial nommé Wakkany.
Thème : "${theme}". Sujet précis : "${subtopic}". Niveau : "${difficulty}".

Exigences :
- Une question claire, vérifiable, adaptée à un public familial.
- Exactement 4 options, toutes plausibles, une seule bonne réponse.
- La réponse ne doit pas apparaître dans l'énoncé.
- Une explication d'une phrase.
- Ne reprends PAS une question de la liste suivante, ni son sens :
${avoid.slice(0, 40).map((q) => `  - ${q.slice(0, 120)}`).join("\n") || "  (aucune)"}

Exemples de style (questions validées, ne pas les recopier) :
${examples.map((q) => `  - ${q.slice(0, 120)}`).join("\n") || "  (aucun)"}

Réponds UNIQUEMENT avec un objet JSON, sans texte autour :
{"question":"...","options":["...","...","...","..."],"answer":"...","explanation":"..."}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  let input: Input | null;
  try {
    input = parseInput(await req.json());
  } catch {
    return json({ error: "JSON invalide" }, 400);
  }
  if (!input) return json({ error: "Paramètres invalides" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Seul l'hôte d'une partie en cours peut demander une question.
  const { data: room } = await admin
    .from("game_rooms")
    .select("id, host_id, status")
    .eq("id", input.room_id)
    .maybeSingle();
  if (!room || room.status !== "playing" || room.host_id !== input.device_id) {
    return json({ error: "Non autorisé : partie en cours et hôte requis." }, 403);
  }

  // 2. Plafonds : par salle, puis global du jour (consommé atomiquement).
  const { count: roomCount } = await admin
    .from("game_room_questions")
    .select("question_id", { count: "exact", head: true })
    .eq("room_id", input.room_id);
  if ((roomCount ?? 0) >= ROOM_MAX_QUESTIONS) {
    return json({ error: "Limite de questions atteinte pour cette salle." }, 429);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: allowed } = await admin.rpc("game_master_consume_budget", {
    p_day: today,
    p_cap: DAILY_BUDGET,
  });
  const budgetOk = allowed === true;

  // 3. Historique à éviter : questions de la salle + récentes du même thème.
  const { data: inRoom } = await admin
    .from("game_room_questions")
    .select("ai_questions(question)")
    .eq("room_id", input.room_id);
  const { data: recent } = await admin
    .from("ai_questions")
    .select("question")
    .eq("source", "gemini")
    .eq("theme", input.theme)
    .order("created_at", { ascending: false })
    .limit(HISTORY_SIZE);

  const avoidTexts = [
    ...(inRoom ?? []).map((r: { ai_questions: { question: string } | null }) => r.ai_questions?.question ?? ""),
    ...(recent ?? []).map((r: { question: string }) => r.question),
  ].filter(Boolean);
  const avoid = new Set(avoidTexts.map(normalizeText));

  // 4. Contexte RAG : exemples validés du même thème, pour le style.
  const { data: examplesRows } = await admin
    .from("ai_questions")
    .select("question")
    .eq("status", "approved")
    .eq("theme", input.theme)
    .limit(5);
  const examples = (examplesRows ?? []).map((r: { question: string }) => r.question);

  // 5. Génération, validation, anti-doublon.
  if (budgetOk && GEMINI_KEY) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let candidate: unknown;
      try {
        const subtopic = pickSubtopic(input.theme);
        candidate = await callGemini(buildPrompt(input.theme, input.difficulty, subtopic, examples, avoidTexts));
      } catch (err) {
        console.error("game-master: génération échouée", attempt, err);
        continue;
      }

      const v = validateGenerated(candidate);
      if (!v.ok) continue;
      const q: GeneratedQuestion = v.value;
      const fingerprint = normalizeText(q.question);
      if (avoid.has(fingerprint)) continue;

      const { data: inserted, error: insertErr } = await admin
        .from("ai_questions")
        .insert({
          theme: input.theme,
          mode: "coop_meute",
          difficulty: input.difficulty,
          type: "mcq",
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation || null,
          status: "approved",          // publication automatique après contrôles
          source: "gemini",
          fingerprint,
          review_sample: shouldSampleForReview(0.1),
        })
        .select("id")
        .single();

      // Violation d'unicité = une question identique vient d'être créée : on relance.
      if (insertErr || !inserted) continue;

      await admin.from("game_room_questions").insert({
        room_id: input.room_id,
        question_id: inserted.id,
        round: input.round,
      });

      return json({
        id: inserted.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        round: input.round,
        source: "gemini",
      });
    }
  }

  // 6. Repli : une question validée, jamais déjà posée dans cette salle.
  const { data: poolRows } = await admin
    .from("ai_questions")
    .select("id, question, options, answer, explanation")
    .eq("status", "approved")
    .eq("theme", input.theme)
    .eq("type", "mcq")
    .limit(200);
  const { data: usedRows } = await admin
    .from("game_room_questions")
    .select("question_id")
    .eq("room_id", input.room_id);
  const used = new Set((usedRows ?? []).map((r: { question_id: number }) => r.question_id));
  const candidates = (poolRows ?? []).filter((r: { id: number }) => !used.has(r.id));

  if (candidates.length === 0) {
    return json({ error: "Aucune question disponible pour ce thème." }, 503);
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  await admin.from("game_room_questions").insert({
    room_id: input.room_id,
    question_id: pick.id,
    round: input.round,
  });

  return json({
    id: pick.id,
    question: pick.question,
    options: pick.options,
    answer: pick.answer,
    explanation: pick.explanation,
    round: input.round,
    source: "pool",
  });
});
