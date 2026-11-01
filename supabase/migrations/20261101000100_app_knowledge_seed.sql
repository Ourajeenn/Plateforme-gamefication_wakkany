-- Généré automatiquement par scripts/generate-app-knowledge-seed.js
-- NE PAS éditer à la main : modifier le script puis le relancer.
-- Connaissances validées sur l'application, consultées par l'assistant (RAG).

INSERT INTO ai_questions (theme, mode, difficulty, type, question, options, answer, explanation, status)
SELECT v.theme, v.mode, v.difficulty, 'knowledge', v.question, '[]'::jsonb, v.answer,
       v.answer, 'approved'
FROM (VALUES
  ('general', 'knowledge', 'rookie', 'Comment sont calculés les points en mode coop ?', '100 points par bonne réponse, plus un bonus de vitesse pouvant aller jusqu''à 50 points par question. Le bonus vaut (temps limite − temps mis) / temps limite × 50, arrondi.'),
  ('general', 'knowledge', 'rookie', 'Comment débloquer une quête ?', 'Une quête est verrouillée tant que le nœud de l''arbre de talents qui lui est associé n''est pas débloqué. Une fois ce nœud acquis, la quête devient disponible et sa validation rapporte de l''XP.'),
  ('general', 'knowledge', 'rookie', 'Valider une quête débloque-t-il un talent ?', 'Non. Valider une quête rapporte de l''XP seulement. Les talents se débloquent dans l''arbre de compétences, en dépensant l''XP nécessaire et après avoir débloqué leurs prérequis.'),
  ('general', 'knowledge', 'rookie', 'Comment débloquer un talent dans l''arbre ?', 'Il faut disposer de l''XP correspondant au coût du talent, et avoir débloqué tous ses prérequis. Le nœud racine NEXUS est toujours débloqué au départ.'),
  ('general', 'knowledge', 'rookie', 'Combien d''XP peut-on gagner ?', 'Un gain d''XP est plafonné à 500 points, et un joueur peut recevoir au maximum 30 gains d''XP par heure. Ces limites protègent contre l''abus.'),
  ('general', 'knowledge', 'rookie', 'Quels sont les thèmes de quiz disponibles ?', 'Culture générale, Films & Séries, Animaux, Sport, Musique, et Hunter & RPG (Wakkany). Le thème « Multi-Thèmes » mélange les catégories.'),
  ('general', 'knowledge', 'rookie', 'Quels niveaux de difficulté existent ?', 'Trois niveaux : Rookie (débutant), Hunter (normal) et Monarque (difficile).'),
  ('general', 'knowledge', 'rookie', 'Qu''est-ce que le Bluff Royal ?', 'Un jeu de bluff à plusieurs : chaque joueur invente une fausse réponse crédible à une question dont la vraie réponse est cachée. Les autres joueurs votent pour retrouver la vraie réponse. On gagne des points en trouvant la vérité et en faisant croire ses bluffs.'),
  ('general', 'knowledge', 'rookie', 'Qu''est-ce que le Flux Live ?', 'C''est le fil d''activité en direct qui affiche les derniers exploits des joueurs connectés : quêtes validées et talents débloqués. Il se met à jour en temps réel.'),
  ('general', 'knowledge', 'rookie', 'Qu''est-ce que la Meute ?', 'Le classement « Meutes » regroupe les joueurs par académie ou origine, renseignée à la création du profil. Il additionne leur XP pour comparer les groupes entre eux.'),
  ('general', 'knowledge', 'rookie', 'Puis-je utiliser Wakkany sans connexion internet ?', 'Oui pour l''essentiel : l''application se charge hors ligne grâce à son service worker. Les actions qui modifient la progression sont mises en file d''attente et envoyées dès que la connexion revient.'),
  ('general', 'knowledge', 'rookie', 'Comment installer Wakkany sur mon téléphone ?', 'Ouvrez le site dans votre navigateur puis choisissez « Ajouter à l''écran d''accueil » (ou « Installer l''application »). Wakkany se lance ensuite en plein écran, comme une application.'),
  ('general', 'knowledge', 'rookie', 'Que se passe-t-il si je choisis un clan ?', 'Le clan choisi à la création du profil définit votre faction et l''ambiance visuelle de votre avatar. Quatre factions sont proposées : Légion Héroïque, Ordre Antique, Ère Primaire et Syndicat Mécanique.'),
  ('general', 'knowledge', 'rookie', 'Que faire si l''assistant ne connaît pas la réponse ?', 'L''assistant ne répond qu''à partir de connaissances validées. Si la réponse n''existe pas encore, la question est transmise à un administrateur, qui pourra la valider.')
) AS v(theme, mode, difficulty, question, answer)
WHERE NOT EXISTS (
  SELECT 1 FROM ai_questions e WHERE e.type = 'knowledge' AND e.question = v.question
);
