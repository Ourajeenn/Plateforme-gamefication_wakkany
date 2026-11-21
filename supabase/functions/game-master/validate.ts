// ════════════════════════════════════════════════════════════════════════════
// Validation pure des questions produites par le Game Master (sans accès réseau).
// Partagé par la fonction Edge `game-master` et les tests Vitest.
// ════════════════════════════════════════════════════════════════════════════

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const LIMITS = { question: 200, option: 80, explanation: 300 } as const;

/** Forme normalisée : minuscules, sans accents, ponctuation réduite à des espaces. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type Validation =
  | { ok: true; value: GeneratedQuestion }
  | { ok: false; reason: string };

function str(v: unknown): string | null {
  return typeof v === "string" ? v.trim() : null;
}

/** Vérifie la structure et les règles de contenu d'une question générée. */
export function validateGenerated(input: unknown): Validation {
  if (!input || typeof input !== "object") return { ok: false, reason: "format" };
  const raw = input as Record<string, unknown>;

  const question = str(raw.question);
  if (!question || question.length > LIMITS.question) return { ok: false, reason: "question" };

  if (!Array.isArray(raw.options) || raw.options.length !== 4) return { ok: false, reason: "options" };
  const options = raw.options.map(str);
  if (options.some((o) => !o || o.length > LIMITS.option)) return { ok: false, reason: "option" };
  const normOptions = new Set((options as string[]).map(normalizeText));
  if (normOptions.size !== 4) return { ok: false, reason: "options_doublons" };

  const answer = str(raw.answer);
  if (!answer || !options.includes(answer)) return { ok: false, reason: "reponse_absente" };

  const explanation = str(raw.explanation) ?? "";
  if (explanation.length > LIMITS.explanation) return { ok: false, reason: "explication" };

  // La question ne doit pas révéler la réponse.
  const normAnswer = normalizeText(answer);
  if (normAnswer.length >= 3 && normalizeText(question).includes(normAnswer)) {
    return { ok: false, reason: "fuite_reponse" };
  }

  return { ok: true, value: { question, options: options as string[], answer, explanation } };
}

/** Sujets de diversification par thème : un sujet est tiré au hasard à chaque génération. */
export const SUBTOPICS: Record<string, string[]> = {
  culture: ["histoire", "géographie", "sciences", "littérature", "arts", "inventions"],
  rpg: ["mythologie", "fantasy", "bestiaire", "alchimie", "héros légendaires", "royaumes"],
  sport: ["football", "jeux olympiques", "tennis", "cyclisme", "records", "règles des sports"],
  cinema: ["films cultes", "réalisateurs", "séries", "dessins animés", "bandes originales", "Oscars"],
  animaux: ["mammifères", "oiseaux", "océans", "insectes", "animaux disparus", "comportements"],
  musique: ["années 80", "rock", "musique classique", "rap français", "instruments", "chanteurs"],
};

export function pickSubtopic(theme: string, rng: () => number = Math.random): string {
  const list = SUBTOPICS[theme] ?? ["culture générale"];
  return list[Math.floor(rng() * list.length)];
}

/** Décide si une question est relue par un administrateur (échantillon, ici 10 %). */
export function shouldSampleForReview(rate = 0.1, rng: () => number = Math.random): boolean {
  return rng() < rate;
}
