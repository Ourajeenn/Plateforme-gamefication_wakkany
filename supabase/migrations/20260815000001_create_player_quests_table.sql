-- Table pour tracker le progrès de chaque joueur sur chaque quête
CREATE TABLE player_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID,
  device_id TEXT,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,

  -- Statut
  status TEXT NOT NULL DEFAULT 'locked',
  progress INT DEFAULT 0,
  target_count INT,

  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(COALESCE(user_id, device_id), quest_id)
);

-- Indexes
CREATE INDEX idx_player_quests_user ON player_quests(user_id);
CREATE INDEX idx_player_quests_device ON player_quests(device_id);
CREATE INDEX idx_player_quests_status ON player_quests(status);

-- RLS
ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
  ON player_quests FOR SELECT
  USING (
    auth.uid() = user_id 
    OR device_id = current_setting('app.device_id')::text
  );

CREATE POLICY "Users can update own quests"
  ON player_quests FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR device_id = current_setting('app.device_id')::text
  );

CREATE POLICY "Users can insert own quests"
  ON player_quests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR device_id = current_setting('app.device_id')::text
  );
