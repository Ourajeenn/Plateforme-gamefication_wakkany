-- ═════════════════════════════════════════════════
-- Racine de l'arbre : toujours considérée comme débloquée
-- ═════════════════════════════════════════════════
-- La migration 20261026000002 redéfinit unlock_skill_secure sans l'exception
-- pour 'root'. Or le client (SkillTree.jsx) et les données (branches.js) considèrent
-- la racine comme acquise : sans cette exception, ecca, ejpt et ejca deviennent
-- impossibles à débloquer. Corps identique à la version précédente, plus le CONTINUE.

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
    -- La racine est toujours acquise (cf. SkillTree.jsx et branches.js)
    IF missing_req = 'root' THEN
      CONTINUE;
    END IF;

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
