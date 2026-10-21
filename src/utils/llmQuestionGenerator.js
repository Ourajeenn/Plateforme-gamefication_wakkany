/**
 * LLM Question Generator — Generate dynamic questions autonomously
 * Uses AI to create questions with consequences
 */

import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './isSupabaseConfigured';

/**
 * Generate a question using LLM
 */
export async function generateQuestionWithLLM(context = {}) {
  try {
    if (!isSupabaseConfigured()) {
      return generateFallbackQuestion(context);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const prompt = buildGenerationPrompt(context);

    const { data, error } = await supabase.functions.invoke('assistant', {
      body: { 
        prompt,
        mode: 'generate_question',
        context
      },
      headers: {
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
    });

    if (error || !data?.question) {
      console.warn('[LLM] Generation failed, using fallback');
      return generateFallbackQuestion(context);
    }

    return parseQuestionResponse(data.question);
  } catch (err) {
    console.error('[LLM Question Generator]', err);
    return generateFallbackQuestion(context);
  }
}

/**
 * Generate multiple questions in batch
 */
export async function generateQuestionsInBatch(count = 5, context = {}) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const question = await generateQuestionWithLLM({
      ...context,
      index: i,
      batchSize: count
    });
    questions.push(question);
  }
  return questions;
}

/**
 * Generate a question for a specific round
 */
export async function generateRoundQuestion(round, worldState = {}) {
  const context = {
    round,
    worldState,
    previousDecisions: worldState.decisions || [],
    worldMood: calculateWorldMood(worldState)
  };

  return generateQuestionWithLLM(context);
}

/**
 * Generate a consequence-based question
 */
export async function generateConsequenceQuestion(consequence, worldState = {}) {
  const context = {
    consequence,
    worldState,
    followUp: true,
    relatedTo: consequence.type
  };

  return generateQuestionWithLLM(context);
}

/**
 * Build the prompt for question generation
 */
function buildGenerationPrompt(context) {
  const {
    round = 0,
    worldState = {},
    previousDecisions = [],
    followUp = false,
    consequence = null,
    category = 'general',
    difficulty = 'medium'
  } = context;

  let prompt = `Tu es un maître de jeu IA pour Wakkany.

Génère une question de quiz avec 4 réponses et des conséquences basées sur le contexte suivant:

CONTEXTE:
- Tour/Round: ${round}
- Catégorie: ${category}
- Difficulté: ${difficulty}
- État du monde: Prospérité ${worldState.prosperity || 50}%, Population ${worldState.population || 1000}`;

  if (followUp && consequence) {
    prompt += `

QUESTION SUIVANTE (suite à une conséquence):
- Conséquence précédente: ${consequence.description}
- Type: ${consequence.type}
- La nouvelle question doit être liée à cette conséquence`;
  }

  if (previousDecisions.length > 0) {
    prompt += `

DÉCISIONS PRÉCÉDENTES:
${previousDecisions.slice(-2).map(d => `- ${d.answer}`).join('\n')}`;
  }

  prompt += `

INSTRUCTIONS:
1. Crée une situation narrative intéressante
2. Pose une question claire avec 4 réponses plausibles
3. Spécifie quelle réponse est correcte (isCorrect: true)
4. Pour chaque réponse, définis une conséquence:
   - Type: 'resource_gain', 'reputation_loss', 'technology_unlock', 'quest_unlock', 'event_trigger', 'memory_callback', ou 'mixed_consequence'
   - Description: Explique l'impact
   - Montants: xpReward, coins, reputation, etc.
5. Assure-toi que les conséquences influencent l'état du monde

RÉPONDS EN JSON AVEC CETTE STRUCTURE:
{
  "id": "question_uuid",
  "round": ${round},
  "situation": "Description narrative de la situation",
  "question": "La question à poser",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "answers": [
    {
      "text": "Première réponse",
      "isCorrect": true/false,
      "xpReward": 100,
      "consequence": {
        "type": "resource_gain",
        "resource": "coins",
        "amount": 50,
        "description": "Vous gagnez 50 pièces"
      }
    }
  ]
}`;

  return prompt;
}

/**
 * Parse the LLM response into a question object
 */
function parseQuestionResponse(response) {
  try {
    // Si c'est une string JSON
    if (typeof response === 'string') {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    // Si c'est déjà un objet
    if (typeof response === 'object' && response.question) {
      return response;
    }

    console.warn('[LLM] Could not parse response, using fallback');
    return generateFallbackQuestion();
  } catch (err) {
    console.error('[LLM Parser]', err);
    return generateFallbackQuestion();
  }
}

/**
 * Fallback question generator (when LLM is unavailable)
 */
export function generateFallbackQuestion(context = {}) {
  const { round = 0, category = 'general' } = context;

  const fallbackQuestions = {
    history: {
      situation: 'Une ancienne tablette est découverte dans les ruines.',
      question: 'Quelle civilisation a développé l\'une des premières formes d\'écriture?',
      answers: [
        {
          text: 'Les Sumériens en Mésopotamie',
          isCorrect: true,
          xpReward: 100,
          consequence: { type: 'knowledge_gain', amount: 50 }
        },
        {
          text: 'Les Égyptiens seuls',
          isCorrect: false,
          xpReward: 20,
          consequence: { type: 'none' }
        },
        {
          text: 'Les Romains',
          isCorrect: false,
          xpReward: 10,
          consequence: { type: 'none' }
        },
        {
          text: 'Les Grecs',
          isCorrect: false,
          xpReward: 15,
          consequence: { type: 'none' }
        }
      ]
    },
    science: {
      situation: 'Un scientifique découvre une anomalie dans la nature.',
      question: 'Quel gaz compose environ 78% de l\'atmosphère terrestre?',
      answers: [
        {
          text: 'Azote',
          isCorrect: true,
          xpReward: 100,
          consequence: { type: 'technology_unlock', tech: 'atmospheric_science' }
        },
        {
          text: 'Oxygène',
          isCorrect: false,
          xpReward: 30,
          consequence: { type: 'none' }
        },
        {
          text: 'Dioxyde de carbone',
          isCorrect: false,
          xpReward: 20,
          consequence: { type: 'none' }
        },
        {
          text: 'Hydrogène',
          isCorrect: false,
          xpReward: 10,
          consequence: { type: 'none' }
        }
      ]
    },
    general: {
      situation: 'Vous devez prendre une décision importante pour votre royaume.',
      question: 'Quelle est la capitale de la France?',
      answers: [
        {
          text: 'Paris',
          isCorrect: true,
          xpReward: 50,
          consequence: { type: 'reputation_gain', amount: 10 }
        },
        {
          text: 'Lyon',
          isCorrect: false,
          xpReward: 10,
          consequence: { type: 'none' }
        },
        {
          text: 'Marseille',
          isCorrect: false,
          xpReward: 5,
          consequence: { type: 'none' }
        },
        {
          text: 'Toulouse',
          isCorrect: false,
          xpReward: 5,
          consequence: { type: 'none' }
        }
      ]
    }
  };

  const selectedCategory = fallbackQuestions[category] || fallbackQuestions.general;

  return {
    id: `fallback-q${round}-${Date.now()}`,
    round,
    situation: selectedCategory.situation,
    question: selectedCategory.question,
    category,
    difficulty: 'medium',
    answers: selectedCategory.answers
  };
}

/**
 * Calculate world mood from state
 */
function calculateWorldMood(worldState) {
  const prosperity = worldState.prosperity || 50;
  const population = worldState.population || 1000;

  if (prosperity > 70 && population > 900) return 'flourishing';
  if (prosperity < 20 || population < 500) return 'crisis';
  if (prosperity > 50) return 'stable';
  return 'uncertain';
}

/**
 * Validate a generated question
 */
export function validateQuestion(question) {
  const errors = [];

  if (!question.id) errors.push('Missing question ID');
  if (!question.question) errors.push('Missing question text');
  if (!question.answers || question.answers.length !== 4) {
    errors.push('Must have exactly 4 answers');
  }
  if (!question.answers.some(a => a.isCorrect)) {
    errors.push('Must have at least one correct answer');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default generateQuestionWithLLM;
