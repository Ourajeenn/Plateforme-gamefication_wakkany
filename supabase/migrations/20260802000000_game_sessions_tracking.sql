-- ════════════════════════════════════════════════════════════════
-- Track chaque partie jouée — analytics + déblocages
-- ════════════════════════════════════════════════════════════════

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  device_id TEXT,
  mode TEXT NOT NULL,          -- quiz, bluff-royal, boss-raid, family-game
  category TEXT,                -- trivia, bluff, raid, etc.
  won BOOLEAN NOT NULL,
  xp_gained INTEGER DEFAULT 0,
  score INTEGER,                -- Score final
  duration_seconds INTEGER,     -- Durée du jeu
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes pour queries rapides
CREATE INDEX idx_game_sessions_user ON game_sessions(user_id, created_at DESC);
CREATE INDEX idx_game_sessions_device ON game_sessions(device_id, created_at DESC);
CREATE INDEX idx_game_sessions_mode ON game_sessions(mode, created_at DESC);
CREATE INDEX idx_game_sessions_won ON game_sessions(won, created_at DESC);

-- RLS: Utilisateurs peuvent voir leurs propres sessions
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON game_sessions FOR SELECT
  USING (
    auth.uid() = user_id 
    OR device_id IS NOT NULL  -- Allow anon users to view by device_id
  );

CREATE POLICY "Users can insert own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR device_id IS NOT NULL  -- Allow anon users
  );

-- ════════════════════════════════════════════════════════════════
-- Analytics views
-- ════════════════════════════════════════════════════════════════

-- Vue: Statistiques par mode
CREATE OR REPLACE VIEW game_stats_by_mode AS
SELECT 
  mode,
  COUNT(*) as total_plays,
  SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins,
  ROUND(100.0 * SUM(CASE WHEN won THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate,
  ROUND(AVG(xp_gained)::numeric, 0) as avg_xp,
  SUM(xp_gained) as total_xp_distributed
FROM game_sessions
WHERE created_at > now() - interval '30 days'
GROUP BY mode
ORDER BY total_plays DESC;

-- Vue: Top performers (par device_id ou user_id)
CREATE OR REPLACE VIEW top_performers AS
SELECT 
  COALESCE(user_id::text, device_id) as player,
  COUNT(*) as games_played,
  SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins,
  ROUND(100.0 * SUM(CASE WHEN won THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate,
  SUM(xp_gained) as total_xp
FROM game_sessions
WHERE created_at > now() - interval '30 days'
GROUP BY COALESCE(user_id::text, device_id)
ORDER BY total_xp DESC
LIMIT 50;
