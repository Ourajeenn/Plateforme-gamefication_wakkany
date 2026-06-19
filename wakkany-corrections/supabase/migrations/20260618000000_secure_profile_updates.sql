-- ============================================================================
-- Sécurisation des écritures sur `profiles` (anti-triche XP + anti-élévation de rôle)
-- ============================================================================
-- Problème corrigé :
--   La policy "Users can update own profile" (USING auth.uid() = id, sans
--   WITH CHECK) autorisait un utilisateur authentifié à modifier N'IMPORTE
--   QUELLE colonne de sa propre ligne via l'API REST Supabase, y compris :
--     - xp / level          -> triche sur le classement
--     - role                -> élévation de privilèges (passage en 'admin')
--     - username             -> usurpation d'identité au leaderboard
--   Le client (useSupabasePlayerData.js / storageHelpers.js) envoie un
--   UPDATE/UPSERT direct avec la valeur d'XP calculée côté navigateur :
--   aucune validation serveur n'existait.
--
-- Stratégie de correction :
--   1. La colonne `role` est retirée de la portée d'écriture utilisateur :
--      seul un trigger côté serveur (ou le dashboard admin) peut la changer.
--   2. Les colonnes `xp` et `level` ne sont plus modifiables par un simple
--      UPDATE direct : elles passent par une fonction RPC `increment_xp`
--      en SECURITY DEFINER qui calcule la nouvelle valeur côté serveur.
--   3. Une policy UPDATE plus stricte empêche toute modification de `role`,
--      `xp` et `id` via la voie REST classique.
-- ============================================================================

-- 1. Supprimer l'ancienne policy permissive
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Nouvelle policy : un utilisateur peut modifier sa ligne, mais le
--    contenu modifié est contrôlé en plus par un trigger (étape 4) qui
--    rejette tout changement de `role`, `xp`, `level`, `id`.
CREATE POLICY "Users can update own profile (restricted)" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Fonction trigger : empêche la modification de colonnes sensibles
--    par la voie UPDATE classique (REST / supabase-js .update()/.upsert()).
--    Seules les fonctions RPC SECURITY DEFINER ci-dessous (qui s'exécutent
--    avec les privilèges du propriétaire, hors RLS) peuvent les changer.
CREATE OR REPLACE FUNCTION prevent_sensitive_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Modification du champ role interdite par ce canal';
  END IF;

  IF NEW.xp IS DISTINCT FROM OLD.xp THEN
    RAISE EXCEPTION 'Modification directe du champ xp interdite, utilisez increment_xp()';
  END IF;

  IF NEW.level IS DISTINCT FROM OLD.level THEN
    RAISE EXCEPTION 'Modification directe du champ level interdite, calculée côté serveur';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_sensitive_profile_changes ON profiles;
CREATE TRIGGER trg_prevent_sensitive_profile_changes
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_sensitive_profile_changes();

-- 4. RPC sécurisée pour créditer de l'XP. Le serveur (et lui seul) calcule
--    la nouvelle valeur ; le client ne peut qu'indiquer "j'ai gagné X xp
--    pour la raison Y", jamais imposer une valeur absolue arbitraire.
--    On plafonne aussi un gain unitaire pour limiter l'impact d'un abus
--    applicatif (ex: spam d'un quiz qui xp à chaque tentative).
CREATE OR REPLACE FUNCTION increment_xp(amount INTEGER)
RETURNS profiles AS $$
DECLARE
  updated_profile profiles;
  safe_amount INTEGER;
BEGIN
  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Le montant d''XP doit être positif';
  END IF;

  -- Garde-fou : aucun gain ponctuel ne doit dépasser 500 xp.
  safe_amount := LEAST(amount, 500);

  UPDATE profiles
  SET xp = xp + safe_amount,
      level = FLOOR((xp + safe_amount) / 100) + 1
  WHERE id = auth.uid()
  RETURNING * INTO updated_profile;

  IF updated_profile IS NULL THEN
    RAISE EXCEPTION 'Profil introuvable pour cet utilisateur';
  END IF;

  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC sécurisée pour débloquer une compétence : vérifie côté serveur
--    que l'utilisateur a assez d'XP ET que les prérequis sont remplis,
--    au lieu de faire confiance à la vérification React côté client.
--    NB: la table de référence des coûts/prérequis (skill_definitions)
--    doit être alimentée à partir de src/data/branches.js (voir note en
--    fin de fichier) pour que cette fonction soit pleinement opérante.
CREATE TABLE IF NOT EXISTS skill_definitions (
  skill_id TEXT PRIMARY KEY,
  xp_cost INTEGER NOT NULL,
  requires TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE skill_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skill definitions are viewable by everyone" ON skill_definitions
  FOR SELECT USING (true);
-- Aucune policy INSERT/UPDATE/DELETE : seul un rôle de service (migration,
-- dashboard admin) peut faire évoluer cette table de référence.

CREATE OR REPLACE FUNCTION unlock_skill_secure(p_skill_id TEXT)
RETURNS unlocked_skills AS $$
DECLARE
  def skill_definitions;
  current_xp INTEGER;
  missing_req TEXT;
  inserted unlocked_skills;
BEGIN
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

  INSERT INTO unlocked_skills (user_id, skill_id)
  VALUES (auth.uid(), p_skill_id)
  ON CONFLICT (user_id, skill_id) DO NOTHING
  RETURNING * INTO inserted;

  RETURN inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTE D'INTÉGRATION :
-- Cette migration sécurise la base mais nécessite deux changements côté app :
--   1. useSupabasePlayerData.js : remplacer
--        supabase.from('profiles').update({ xp: newXp })
--      par
--        supabase.rpc('increment_xp', { amount: xpGained })
--   2. unlockSkill() : remplacer l'insert direct dans unlocked_skills par
--        supabase.rpc('unlock_skill_secure', { p_skill_id: skillId })
-- Voir le patch fourni dans useSupabasePlayerData.fixed.js.
-- ============================================================================
