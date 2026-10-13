/**
 * Supabase Edge Function - LLM Assistant & Question Generator
 * Deploy to: supabase/functions/assistant/index.ts
 * 
 * This function handles:
 * 1. Chat assistant responses
 * 2. Question generation
 * 3. Dynamic content creation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = "gpt-4-turbo-preview";

interface RequestBody {
  prompt: string;
  mode?: "chat" | "generate_question" | "generate_scenario";
  user?: { id: string; name: string; level?: number };
  context?: Record<string, unknown>;
}

interface QuestionResponse {
  id: string;
  round: number;
  situation: string;
  question: string;
  difficulty: string;
  category: string;
  answers: Array<{
    text: string;
    isCorrect: boolean;
    xpReward: number;
    consequence: {
      type: string;
      description: string;
      [key: string]: unknown;
    };
  }>;
}

async function callOpenAI(prompt: string, mode: string = "chat"): Promise<string> {
  const systemPrompt = getSystemPrompt(mode);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: mode === "chat" ? 0.7 : 0.8,
      max_tokens: mode === "chat" ? 500 : 1500,
      response_format:
        mode === "generate_question"
          ? { type: "json_object" }
          : { type: "text" },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function getSystemPrompt(mode: string): string {
  if (mode === "generate_question") {
    return `Tu es un maître de jeu IA pour Wakkany, un jeu de quiz narratif.
Tu génères des questions de quiz intéressantes avec des conséquences qui affectent le monde du jeu.
Réponds TOUJOURS en JSON valide avec exactement 4 réponses (dont au least 1 correcte).
Chaque question doit avoir une narration engageante et des conséquences significatives.`;
  } else if (mode === "chat") {
    return `Tu es l'Assistant Wakkany, un guide utile et amical pour les joueurs.
Tu aides les joueurs à comprendre le jeu, suggères des stratégies et réponds aux questions.
Sois concis, sympathique et encourage les joueurs.
Réponds en français.`;
  } else {
    return "Tu es un assistant utile pour le jeu Wakkany. Réponds de manière concise et engageante.";
  }
}

async function generateQuestion(
  prompt: string,
  context?: Record<string, unknown>
): Promise<QuestionResponse> {
  const response = await callOpenAI(prompt, "generate_question");

  try {
    // Essayer de parser la réponse comme JSON
    const parsed = JSON.parse(response);

    // Valider la structure
    if (!parsed.question || !parsed.answers || parsed.answers.length !== 4) {
      throw new Error("Invalid question structure");
    }

    // Assurer qu'au moins une réponse est correcte
    if (!parsed.answers.some((a: { isCorrect: boolean }) => a.isCorrect)) {
      parsed.answers[0].isCorrect = true;
    }

    return {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      round: (context?.round as number) || 0,
      situation: parsed.situation || "Une nouvelle situation apparaît.",
      question: parsed.question,
      difficulty: parsed.difficulty || "medium",
      category: parsed.category || "general",
      answers: parsed.answers.map(
        (a: {
          text: string;
          isCorrect: boolean;
          xpReward?: number;
          consequence?: object;
        }) => ({
          text: a.text,
          isCorrect: a.isCorrect,
          xpReward: a.xpReward || (a.isCorrect ? 100 : 20),
          consequence: a.consequence || {
            type: "none",
            description: "Pas de conséquence particulière.",
          },
        })
      ),
    };
  } catch (error) {
    console.error("Failed to parse question JSON:", error);
    throw new Error("Failed to generate valid question");
  }
}

serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { prompt, mode = "chat", user, context } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let result: object;

    if (mode === "generate_question") {
      result = await generateQuestion(prompt, context);
    } else {
      // Chat mode
      const response = await callOpenAI(prompt, "chat");
      result = {
        answer: response,
        user: user?.name || "Joueur",
        timestamp: new Date().toISOString(),
      };
    }

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Function error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
