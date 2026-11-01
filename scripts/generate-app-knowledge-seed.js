// scripts/generate-app-knowledge-seed.js
//
// Génère une migration qui alimente l'assistant avec des connaissances VALIDÉES
// sur l'application (règles de points, quêtes, talents, limites, fonctionnement).
// Les réponses sont insérées dans ai_questions au type 'knowledge' et au statut
// 'approved' : c'est le seul stock que le RAG (edge function assistant) consulte.
//
// Chaque règle est reprise du code (src/data, src/hooks, src/utils) pour éviter
// qu'une réponse de l'assistant ne contredise le jeu réel.
//
// La recherche RAG (match_approved_questions) classe sur question + explanation :
// la réponse est donc recopiée dans explanation, sinon son contenu serait invisible.
// Idempotent : WHERE NOT EXISTS sur la question, relançable sans doublon.
// Usage : node scripts/generate-app-knowledge-seed.js

import fs from 'fs/promises';
import path from 'path';

const KNOWLEDGE = [
  {
    q: 'Comment sont calculés les points en mode coop ?',
    a: '100 points par bonne réponse, plus un bonus de vitesse pouvant aller jusqu\'à 50 points par question. Le bonus vaut (temps limite − temps mis) / temps limite × 50, arrondi.',
  },
  {
    q: 'Comment débloquer une quête ?',
    a: 'Une quête est verrouillée tant que le nœud de l\'arbre de talents qui lui est associé n\'est pas débloqué. Une fois ce nœud acquis, la quête devient disponible et sa validation rapporte de l\'XP.',
  },
  {
    q: 'Valider une quête débloque-t-il un talent ?',
    a: 'Non. Valider une quête rapporte de l\'XP seulement. Les talents se débloquent dans l\'arbre de compétences, en dépensant l\'XP nécessaire et après avoir débloqué leurs prérequis.',
  },
  {
    q: 'Comment débloquer un talent dans l\'arbre ?',
    a: 'Il faut disposer de l\'XP correspondant au coût du talent, et avoir débloqué tous ses prérequis. Le nœud racine NEXUS est toujours débloqué au départ.',
  },
  {
    q: 'Combien d\'XP peut-on gagner ?',
    a: 'Un gain d\'XP est plafonné à 500 points, et un joueur peut recevoir au maximum 30 gains d\'XP par heure. Ces limites protègent contre l\'abus.',
  },
  {
    q: 'Quels sont les thèmes de quiz disponibles ?',
    a: 'Culture générale, Films & Séries, Animaux, Sport, Musique, et Hunter & RPG (Wakkany). Le thème « Multi-Thèmes » mélange les catégories.',
  },
  {
    q: 'Quels niveaux de difficulté existent ?',
    a: 'Trois niveaux : Rookie (débutant), Hunter (normal) et Monarque (difficile).',
  },
  {
    q: 'Qu\'est-ce que le Bluff Royal ?',
    a: 'Un jeu de bluff à plusieurs : chaque joueur invente une fausse réponse crédible à une question dont la vraie réponse est cachée. Les autres joueurs votent pour retrouver la vraie réponse. On gagne des points en trouvant la vérité et en faisant croire ses bluffs.',
  },
  {
    q: 'Qu\'est-ce que le Flux Live ?',
    a: 'C\'est le fil d\'activité en direct qui affiche les derniers exploits des joueurs connectés : quêtes validées et talents débloqués. Il se met à jour en temps réel.',
  },
  {
    q: 'Qu\'est-ce que la Meute ?',
    a: 'Le classement « Meutes » regroupe les joueurs par académie ou origine, renseignée à la création du profil. Il additionne leur XP pour comparer les groupes entre eux.',
  },
  {
    q: 'Puis-je utiliser Wakkany sans connexion internet ?',
    a: 'Oui pour l\'essentiel : l\'application se charge hors ligne grâce à son service worker. Les actions qui modifient la progression sont mises en file d\'attente et envoyées dès que la connexion revient.',
  },
  {
    q: 'Comment installer Wakkany sur mon téléphone ?',
    a: 'Ouvrez le site dans votre navigateur puis choisissez « Ajouter à l\'écran d\'accueil » (ou « Installer l\'application »). Wakkany se lance ensuite en plein écran, comme une application.',
  },
  {
    q: 'Que se passe-t-il si je choisis un clan ?',
    a: 'Le clan choisi à la création du profil définit votre faction et l\'ambiance visuelle de votre avatar. Quatre factions sont proposées : Légion Héroïque, Ordre Antique, Ère Primaire et Syndicat Mécanique.',
  },
  {
    q: 'Que faire si l\'assistant ne connaît pas la réponse ?',
    a: 'L\'assistant ne répond qu\'à partir de connaissances validées. Si la réponse n\'existe pas encore, la question est transmise à un administrateur, qui pourra la valider.',
  },
];

const sqlText = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function main() {
  const rows = KNOWLEDGE.map((k) => `  (${sqlText('general')}, ${sqlText('knowledge')}, ${sqlText('rookie')}, ${sqlText(k.q)}, ${sqlText(k.a)})`);

  const sql = `-- Généré automatiquement par scripts/generate-app-knowledge-seed.js
-- NE PAS éditer à la main : modifier le script puis le relancer.
-- Connaissances validées sur l'application, consultées par l'assistant (RAG).

INSERT INTO ai_questions (theme, mode, difficulty, type, question, options, answer, explanation, status)
SELECT v.theme, v.mode, v.difficulty, 'knowledge', v.question, '[]'::jsonb, v.answer,
       v.answer, 'approved'
FROM (VALUES
${rows.join(',\n')}
) AS v(theme, mode, difficulty, question, answer)
WHERE NOT EXISTS (
  SELECT 1 FROM ai_questions e WHERE e.type = 'knowledge' AND e.question = v.question
);
`;

  const stamp = '20261101000100';
  const outPath = path.resolve(process.cwd(), 'supabase/migrations', `${stamp}_app_knowledge_seed.sql`);
  await fs.writeFile(outPath, sql, 'utf-8');
  console.log(`✓ Migration générée : ${outPath} (${KNOWLEDGE.length} connaissances)`);
}

main().catch((err) => {
  console.error('Erreur de génération :', err);
  process.exit(1);
});
