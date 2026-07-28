import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { theme, mode, difficulty, count = 5, type = "mcq" } = await req.json();

    if (!theme || !mode || !difficulty) {
      return new Response(
        JSON.stringify({ error: "theme, mode et difficulty sont requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifie que l'appelant est bien un admin (RLS s'appliquerait aussi,
    // mais on utilise la service_role key ici donc on vérifie nous-mêmes).
    const authHeader = req.headers.get("Authorization");
    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader ?? "" } } }
    );
    const { data: { user } } = await supabaseAuthClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseAuthClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Réservé aux administrateurs" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mcqPrompt = `Génère ${count} questions QCM en français pour un quiz sur le thème "${theme}".
Contexte : jeu de société familial gamifié nommé Wakkany, mode de jeu "${mode}", niveau de difficulté "${difficulty}".
Si le thème est "rpg", inspire-toi d'un univers de chasseurs/monarques façon Solo Leveling, sans jamais violer de droits d'auteur (pas de noms de personnages protégés en dehors du contexte générique demandé par l'utilisateur).
Chaque question doit avoir exactement 4 options, une seule bonne réponse, et une explication courte (1 phrase).
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, sans markdown, format exact :
[{"question":"...","options":["...","...","...","..."],"answer":"...","explanation":"..."}]`;

    const bluffPrompt = `Génère ${count} questions pour un mini-jeu de "bluff" façon Fibbage, en français, sur le thème "${theme}".
Contexte : jeu de société familial gamifié nommé Wakkany, niveau de difficulté "${difficulty}".
Chaque question doit avoir UNE SEULE vraie réponse, courte (2 à 5 mots, un nombre, une date ou un nom), 
suffisamment surprenante ou peu connue pour qu'un joueur puisse inventer une fausse réponse crédible à la place.
Évite les réponses évidentes. Pas d'options : les joueurs inventeront eux-mêmes des fausses réponses.
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, sans markdown, format exact :
[{"question":"...","answer":"...","explanation":"..."}]`;

    const prompt = type === "bluff" ? bluffPrompt : mcqPrompt;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return new Response(JSON.stringify({ error: "Réponse Gemini vide ou inattendue", raw: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let questions;
    try {
      questions = JSON.parse(raw);
    } catch (_e) {
      return new Response(JSON.stringify({ error: "JSON invalide renvoyé par Gemini", raw }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rows = questions.map((q: { question: string; options?: string[]; answer: string; explanation?: string }) => ({
      theme,
      mode,
      difficulty,
      type,
      question: q.question,
      options: q.options ?? [],
      answer: q.answer,
      explanation: q.explanation ?? null,
      status: "pending",
      created_by: user.id,
    }));

    const { data: inserted, error } = await supabaseAdmin
      .from("ai_questions")
      .insert(rows)
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
