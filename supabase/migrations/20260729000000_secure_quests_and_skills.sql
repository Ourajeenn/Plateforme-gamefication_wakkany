-- ============================================================================
-- 20260729000000_secure_quests_and_skills.sql
-- Sécurisation de l'achèvement des quêtes et fermeture des accès directs
-- aux tables `unlocked_skills` et `completed_quests`.
-- ============================================================================

-- 1. RPC sécurisée pour enregistrer l'achèvement d'une quête et créditer l'XP.
--    - Vérifie que l'utilisateur est authentifié.
--    - Vérifie que la quête n'a pas déjà été validée.
--    - Insère dans completed_quests.
--    - Crédite l'XP en réutilisant directement la RPC `increment_xp(p_xp_reward)`.
CREATE OR REPLACE FUNCTION complete_quest_secure(p_quest_id TEXT, p_xp_reward INTEGER)
RETURNS completed_quests AS $$
DECLARE
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

  INSERT INTO completed_quests (user_id, quest_id)
  VALUES (auth.uid(), p_quest_id)
  RETURNING * INTO inserted_quest;

  IF p_xp_reward IS NOT NULL AND p_xp_reward > 0 THEN
    PERFORM increment_xp(p_xp_reward);
  END IF;

  RETURN inserted_quest;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Suppression des anciennes politiques INSERT permissives
--    Seules les fonctions RPC SECURITY DEFINER (unlock_skill_secure, complete_quest_secure)
--    peuvent désormais insérer dans unlocked_skills et completed_quests.
DROP POLICY IF EXISTS "Users can insert own skills" ON unlocked_skills;
DROP POLICY IF EXISTS "Users can insert own quests" ON completed_quests;
