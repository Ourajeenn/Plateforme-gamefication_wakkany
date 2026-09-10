-- PROLOGUE
INSERT INTO quests (quest_id, name, description, narrative, act, quest_order, type, objectives, rewards, difficulty_level, estimated_playtime_minutes)
VALUES
  (
    'prologue_1',
    'Premier Pas',
    'Créer votre première salle de jeu',
    'Bienvenue à Wakkany ! Commencez votre aventure en créant une salle de jeu.',
    'prologue',
    1,
    'linear',
    '{"type": "create_room", "count": 1}'::jsonb,
    '{"xp": 50, "gold": 0, "unlock": "prologue_2"}'::jsonb,
    1,
    5
  ),
  (
    'prologue_2',
    'Le Roulette',
    'Jouer une partie de Topic Roulette',
    'Testez votre chance avec Topic Roulette, le jeu de hasard suprême !',
    'prologue',
    2,
    'linear',
    '{"type": "game_complete", "gameMode": "topic-roulette", "count": 1}'::jsonb,
    '{"xp": 75, "gold": 10, "unlock": "prologue_3"}'::jsonb,
    1,
    5
  ),
  (
    'prologue_3',
    'Première Victoire',
    'Remporter une partie',
    'La victoire est douce ! Gagnez votre première partie.',
    'prologue',
    3,
    'linear',
    '{"type": "game_win", "count": 1}'::jsonb,
    '{"xp": 100, "gold": 25, "unlock": "prologue_4"}'::jsonb,
    2,
    10
  ),
  (
    'prologue_4',
    'Apportez un Ami',
    'Jouer en multijoueur',
    'L''aventure est meilleure en groupe ! Jouez avec au moins 2 joueurs.',
    'prologue',
    4,
    'linear',
    '{"type": "multiplayer_game", "minPlayers": 2, "count": 1}'::jsonb,
    '{"xp": 150, "gold": 50, "unlock": "act1_1"}'::jsonb,
    2,
    10
  );

-- ACT 1 : L'Apprenti
INSERT INTO quests (quest_id, name, description, narrative, act, quest_order, type, objectives, rewards, difficulty_level, estimated_playtime_minutes, required_quest_id)
VALUES
  (
    'act1_1',
    'Maître du Hasard',
    'Jouer 5 Topic Roulette',
    'Le hasard est votre allié. Jouez 5 fois à Topic Roulette pour maîtriser ce jeu.',
    'act1',
    1,
    'linear',
    '{"type": "game_complete", "gameMode": "topic-roulette", "count": 5}'::jsonb,
    '{"xp": 100, "gold": 30}'::jsonb,
    1,
    15,
    (SELECT id FROM quests WHERE quest_id = 'prologue_4')
  ),
  (
    'act1_2',
    'L''Artiste du Bluff',
    'Remporter 3 Bluff Royal',
    'Le Bluff Royal est un art. Maîtrisez-le en remportant 3 victoires.',
    'act1',
    2,
    'linear',
    '{"type": "game_win", "gameMode": "bluff-royal", "count": 3}'::jsonb,
    '{"xp": 150, "gold": 40, "skill": "bluff_1"}'::jsonb,
    2,
    20,
    (SELECT id FROM quests WHERE quest_id = 'act1_1')
  ),
  (
    'act1_3',
    'Éloquence',
    'Atteindre un score total de 100+',
    'L''éloquence vient avec la pratique. Accumulez un score de 100 en une session.',
    'act1',
    3,
    'linear',
    '{"type": "score_total", "minScore": 100, "count": 1}'::jsonb,
    '{"xp": 200, "gold": 50}'::jsonb,
    2,
    25,
    (SELECT id FROM quests WHERE quest_id = 'act1_2')
  ),
  (
    'act1_boss',
    'BOSS : Le Maître Bluff',
    'Affronter et vaincre le Maître Bluff',
    'C''est l''heure du combat ! Affrontez le légendaire Maître Bluff, une IA redoutable.',
    'act1',
    4,
    'boss',
    '{"type": "boss_win", "bossName": "master_bluff", "aiLevel": 10, "count": 1}'::jsonb,
    '{"xp": 500, "gold": 100, "unlock": "act2_1", "title": "Champion du Bluff"}'::jsonb,
    4,
    15,
    (SELECT id FROM quests WHERE quest_id = 'act1_3')
  );
