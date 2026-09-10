-- Table pour définir toutes les quêtes du jeu
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiants
  quest_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  narrative TEXT,

  -- Organisation
  act TEXT NOT NULL,
  quest_order INT NOT NULL,
  type TEXT NOT NULL,

  -- Objectifs
  objectives JSONB NOT NULL,
  requirements JSONB,

  -- Récompenses
  rewards JSONB NOT NULL,

  -- Relations
  required_quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  unlocks_quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,

  -- Metadata
  difficulty_level INT DEFAULT 1,
  estimated_playtime_minutes INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_quests_act ON quests(act);
CREATE INDEX idx_quests_order ON quests(quest_order);
CREATE INDEX idx_quests_type ON quests(type);

-- RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests are readable by all authenticated users"
  ON quests FOR SELECT
  USING (true);
