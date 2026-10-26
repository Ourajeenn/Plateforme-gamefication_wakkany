-- ============================================================================
-- 20261026000002_secure_xp_and_quests.sql
-- Correction C2 (anti-farming XP & quêtes côté serveur), S2 (search_path fixé), R4 (rate limit assistant)
-- ============================================================================

-- ── 1. Table de suivi des gains d'XP (anti-farming C2) ────────────────────────
CREATE TABLE IF NOT EXISTS xp_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_xp_grants_user_time ON xp_grants(user_id, granted_at DESC);
ALTER TABLE xp_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own xp grants" ON xp_grants;
CREATE POLICY "Users can read own xp grants" ON xp_grants
  FOR SELECT USING (auth.uid() = user_id);

-- ── 2. Table des définitions de quêtes gérée par le serveur (C2) ──────────────
CREATE TABLE IF NOT EXISTS quest_definitions (
  quest_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
  difficulty TEXT,
  branch TEXT
);

ALTER TABLE quest_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quest definitions viewable by everyone" ON quest_definitions;
CREATE POLICY "Quest definitions viewable by everyone" ON quest_definitions
  FOR SELECT USING (true);

-- Insertion des quêtes officielles
INSERT INTO quest_definitions (quest_id, title, xp_reward, difficulty, branch)
VALUES
  ('q1', 'Appel aux Armes Cosmiques', 30, 'Facile', 'heroes'),
  ('q2', 'L''Arène de Sparte', 30, 'Facile', 'warriors'),
  ('q3', 'L''Œuf Primordial', 30, 'Facile', 'dinos'),
  ('q4', 'Piste Néon', 30, 'Facile', 'cars'),
  ('q5', 'Guerre de l''Infini', 50, 'Moyen', 'heroes'),
  ('q6', 'Le Choc des Titans', 60, 'Difficile', 'warriors'),
  ('q7', 'La Chasse du T-Rex', 60, 'Difficile', 'dinos'),
  ('q8', 'Grand Prix du Multivers', 75, 'Expert', 'cars'),
  ('q9', 'Épreuve Légendaire: La Collision', 150, 'Légendaire', 'all'),
  ('q10', 'Infiltration Hydra', 40, 'Moyen', 'heroes'),
  ('q11', 'Le Siège de Troie', 45, 'Moyen', 'warriors'),
  ('q12', 'Migration Arctique', 40, 'Moyen', 'dinos'),
  ('q13', 'Drift Nocturne', 55, 'Difficile', 'cars'),
  ('archive_historian', 'L''Archiviste de l''Histoire', 300, 'Moyen', 'character'),
  ('the_last_explorer', 'Le Dernier Explorateur', 500, 'Difficile', 'character'),
  ('guardian_of_light', 'Gardien de la Lumière', 350, 'Moyen', 'character'),
  ('save_the_crops', 'Sauver les Récoltes', 200, 'Moyen', 'community'),
  ('ancient_library', 'Restaurer la Bibliothèque Ancienne', 250, 'Moyen', 'community')
ON CONFLICT (quest_id) DO UPDATE SET
  title = EXCLUDED.title,
  xp_reward = EXCLUDED.xp_reward,
  difficulty = EXCLUDED.difficulty,
  branch = EXCLUDED.branch;

-- ── 3. Durcissement de increment_xp (anti-farming + search_path fixé S2) ──────
CREATE OR REPLACE FUNCTION increment_xp(amount INTEGER)
RETURNS profiles
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_profile profiles;
  safe_amount INTEGER;
  recent_count INTEGER;
  recent_total INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Le montant d''XP doit être positif';
  END IF;

  -- 1. Garde-fou unitaire : max 500 XP par appel
  safe_amount := LEAST(amount, 500);

  -- 2. Anti-farming : max 20 gains d'XP par minute
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO recent_count, recent_total
  FROM xp_grants
  WHERE user_id = auth.uid() AND granted_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 20 OR recent_total >= 1500 THEN
    RAISE EXCEPTION 'Limite de fréquence d''XP atteinte. Réessayez dans une minute.';
  END IF;

  -- 3. Enregistrer l'attribution d'XP
  INSERT INTO xp_grants (user_id, amount)
  VALUES (auth.uid(), safe_amount);

  -- 4. Mettre à jour le profil utilisateur
  PERFORM set_config('app.allow_profile_update', 'true', true);

  UPDATE profiles
  SET xp = xp + safe_amount,
      level = FLOOR((xp + safe_amount) / 100) + 1
  WHERE id = auth.uid()
  RETURNING * INTO updated_profile;

  PERFORM set_config('app.allow_profile_update', 'false', true);

  IF updated_profile IS NULL THEN
    RAISE EXCEPTION 'Profil introuvable pour cet utilisateur';
  END IF;

  RETURN updated_profile;
END;
$$;

-- ── 4. Durcissement de unlock_skill_secure (search_path fixé S2) ──────────────
CREATE OR REPLACE FUNCTION unlock_skill_secure(p_skill_id TEXT)
RETURNS unlocked_skills
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  def skill_definitions;
  current_xp INTEGER;
  missing_req TEXT;
  inserted unlocked_skills;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  SELECT * INTO def FROM skill_definitions WHERE skill_id = p_skill_id;
  IF def IS NULL THEN
    RAISE EXCEPTION 'Compétence inconnue: %', p_skill_id;
  END IF;

  SELECT xp INTO current_xp FROM profiles WHERE id = auth.uid();
  IF current_xp IS NULL OR current_xp < def.xp_cost THEN
    RAISE EXCEPTION 'XP insuffisant pour débloquer %', p_skill_id;
  END IF;

  FOREACH missing_req IN ARRAY def.requires LOOP
    IF NOT EXISTS (
      SELECT 1 FROM unlocked_skills
      WHERE user_id = auth.uid() AND skill_id = missing_req
    ) THEN
      RAISE EXCEPTION 'Prérequis manquant: %', missing_req;
    END IF;
  END LOOP;

  PERFORM set_config('app.allow_profile_update', 'true', true);
  
  UPDATE profiles
  SET xp = xp - def.xp_cost,
      level = FLOOR((xp - def.xp_cost) / 100) + 1
  WHERE id = auth.uid();

  PERFORM set_config('app.allow_profile_update', 'false', true);

  INSERT INTO unlocked_skills (user_id, skill_id)
  VALUES (auth.uid(), p_skill_id)
  ON CONFLICT (user_id, skill_id) DO NOTHING
  RETURNING * INTO inserted;

  RETURN inserted;
END;
$$;

-- ── 5. Durcissement de complete_quest_secure (C2 + search_path fixé S2) ────────
-- Version à 1 paramètre (récompense déterminée strictement par quest_definitions)
CREATE OR REPLACE FUNCTION complete_quest_secure(p_quest_id TEXT)
RETURNS completed_quests
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  server_reward INTEGER;
  inserted_quest completed_quests;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  IF p_quest_id IS NULL OR length(trim(p_quest_id)) = 0 THEN
    RAISE EXCEPTION 'Identifiant de quête invalide';
  END IF;

  IF EXISTS (
    SELECT 1 FROM completed_quests
    WHERE user_id = auth.uid() AND quest_id = p_quest_id
  ) THEN
    RAISE EXCEPTION 'Quête déjà complétée: %', p_quest_id;
  END IF;

  -- Détermination de la récompense depuis la base de données
  SELECT xp_reward INTO server_reward
  FROM quest_definitions
  WHERE quest_id = p_quest_id;

  IF server_reward IS NULL THEN
    server_reward := 30; -- Valeur par défaut sûre
  END IF;

  INSERT INTO completed_quests (user_id, quest_id)
  VALUES (auth.uid(), p_quest_id)
  RETURNING * INTO inserted_quest;

  IF server_reward > 0 THEN
    PERFORM increment_xp(server_reward);
  END IF;

  RETURN inserted_quest;
END;
$$;

-- Surcharge à 2 paramètres pour compatibilité ascendante avec les clients existants
CREATE OR REPLACE FUNCTION complete_quest_secure(p_quest_id TEXT, p_xp_reward INTEGER)
RETURNS completed_quests
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  server_reward INTEGER;
  effective_reward INTEGER;
  inserted_quest completed_quests;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  IF p_quest_id IS NULL OR length(trim(p_quest_id)) = 0 THEN
    RAISE EXCEPTION 'Identifiant de quête invalide';
  END IF;

  IF EXISTS (
    SELECT 1 FROM completed_quests
    WHERE user_id = auth.uid() AND quest_id = p_quest_id
  ) THEN
    RAISE EXCEPTION 'Quête déjà complétée: %', p_quest_id;
  END IF;

  -- Si la quête existe dans quest_definitions, sa valeur fait foi (bloque la triche client)
  SELECT xp_reward INTO server_reward
  FROM quest_definitions
  WHERE quest_id = p_quest_id;

  IF server_reward IS NOT NULL THEN
    effective_reward := server_reward;
  ELSE
    effective_reward := LEAST(COALESCE(p_xp_reward, 30), 150);
  END IF;

  INSERT INTO completed_quests (user_id, quest_id)
  VALUES (auth.uid(), p_quest_id)
  RETURNING * INTO inserted_quest;

  IF effective_reward > 0 THEN
    PERFORM increment_xp(effective_reward);
  END IF;

  RETURN inserted_quest;
END;
$$;

-- ── 6. Table et fonction de rate limit assistant en base (R4) ──────────────────
CREATE TABLE IF NOT EXISTS assistant_rate (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  hits INT NOT NULL DEFAULT 0
);

ALTER TABLE assistant_rate ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION assistant_hit(p_limit INT DEFAULT 10)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  allowed BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO assistant_rate (user_id, window_start, hits)
  VALUES (auth.uid(), now(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    hits = CASE WHEN assistant_rate.window_start < now() - interval '1 minute'
                THEN 1 ELSE assistant_rate.hits + 1 END,
    window_start = CASE WHEN assistant_rate.window_start < now() - interval '1 minute'
                        THEN now() ELSE assistant_rate.window_start END
  RETURNING hits <= p_limit INTO allowed;
  
  RETURN allowed;
END;
$$;
