-- ════════════════════════════════════════════════════════════════════════════
-- Salles multijoueur : toutes les écritures passent par des RPC serveur.
--
-- Problème corrigé :
--   Les policies UPDATE/DELETE de game_rooms et game_room_players utilisaient
--   USING (device_id IS NOT NULL) ou (status = 'lobby'), c'est-à-dire presque
--   toujours vrai. N'importe quel client disposant de la clé publique pouvait
--   modifier le score de n'importe quel joueur, l'état de partie, ou terminer
--   une salle.
--
-- Correctif :
--   1. Suppression des policies UPDATE/DELETE directes.
--   2. Fonctions SECURITY DEFINER qui vérifient l'identité (device_id), le rôle
--      (hôte = game_rooms.host_id), le statut de la salle et les bornes des valeurs.
--
-- Limite connue (voir docs/DOCUMENTATION_COMPLETE.md, section 15) :
--   device_id est un identifiant de navigateur, pas une authentification. Il est
--   lisible publiquement via game_room_players_select ; un client qui le connaît
--   peut donc agir au nom d'un autre joueur. Un correctif complet exige une
--   identité serveur (session anonyme Supabase) ou une colonne masquée.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Suppression des écritures directes ──────────────────────────────────
DROP POLICY IF EXISTS "game_rooms_update_restricted"         ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_delete_restricted"         ON game_rooms;
DROP POLICY IF EXISTS "game_room_players_update_restricted"  ON game_room_players;
DROP POLICY IF EXISTS "game_room_players_delete_restricted"  ON game_room_players;

-- ── 2. Prêt / pas prêt (joueur, salle en lobby) ────────────────────────────
CREATE OR REPLACE FUNCTION public.room_set_ready(
  p_room_id BIGINT,
  p_device_id TEXT,
  p_ready BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE game_room_players p
     SET is_ready = p_ready
    FROM game_rooms r
   WHERE p.room_id = r.id
     AND r.id = p_room_id
     AND p.device_id = p_device_id
     AND r.status = 'lobby';
  RETURN FOUND;
END;
$$;

-- ── 3. Lancer la partie (hôte, salle en lobby) ─────────────────────────────
CREATE OR REPLACE FUNCTION public.room_start_game(
  p_room_id BIGINT,
  p_device_id TEXT,
  p_state JSONB DEFAULT '{}'::jsonb
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_state IS NOT NULL AND length(p_state::text) > 20000 THEN
    RAISE EXCEPTION 'game_state trop volumineux';
  END IF;

  UPDATE game_rooms
     SET status = 'playing',
         game_state = COALESCE(p_state, '{}'::jsonb)
   WHERE id = p_room_id
     AND host_id = p_device_id
     AND status = 'lobby';
  RETURN FOUND;
END;
$$;

-- ── 4. Mise à jour de l'état de partie (hôte, salle en cours) ──────────────
CREATE OR REPLACE FUNCTION public.room_update_state(
  p_room_id BIGINT,
  p_device_id TEXT,
  p_patch JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_patch IS NULL OR jsonb_typeof(p_patch) <> 'object' THEN
    RAISE EXCEPTION 'patch invalide : un objet JSON est attendu';
  END IF;
  IF length(p_patch::text) > 20000 THEN
    RAISE EXCEPTION 'patch trop volumineux';
  END IF;

  UPDATE game_rooms
     SET game_state = COALESCE(game_state, '{}'::jsonb) || p_patch
   WHERE id = p_room_id
     AND host_id = p_device_id
     AND status = 'playing';
  RETURN FOUND;
END;
$$;

-- ── 5. Ajout de points (joueur présent, salle en cours) ────────────────────
-- Le delta est borné par appel. Le score réel reste dérivé des règles de jeu
-- côté client : cette borne limite les abus, elle ne les empêche pas.
CREATE OR REPLACE FUNCTION public.room_update_score(
  p_room_id BIGINT,
  p_device_id TEXT,
  p_delta INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_score INTEGER;
BEGIN
  IF p_delta IS NULL OR p_delta < -500 OR p_delta > 500 THEN
    RAISE EXCEPTION 'delta hors limites (-500 à 500)';
  END IF;

  UPDATE game_room_players p
     SET score = p.score + p_delta
    FROM game_rooms r
   WHERE p.room_id = r.id
     AND r.id = p_room_id
     AND p.device_id = p_device_id
     AND r.status = 'playing'
  RETURNING p.score INTO v_score;

  RETURN v_score; -- NULL si le joueur n'est pas dans une salle en cours
END;
$$;

-- ── 6. Terminer la partie (hôte) ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.room_end_game(
  p_room_id BIGINT,
  p_device_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE game_rooms
     SET status = 'finished'
   WHERE id = p_room_id
     AND host_id = p_device_id
     AND status <> 'finished';
  RETURN FOUND;
END;
$$;

-- ── 7. Quitter la salle ────────────────────────────────────────────────────
-- Hôte en lobby : la salle est supprimée (les joueurs suivent par cascade).
-- Sinon : seul le joueur appelant est retiré.
CREATE OR REPLACE FUNCTION public.room_leave(
  p_room_id BIGINT,
  p_device_id TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM game_rooms
     WHERE id = p_room_id AND host_id = p_device_id AND status = 'lobby'
  ) THEN
    DELETE FROM game_rooms WHERE id = p_room_id;
    RETURN 'room_deleted';
  END IF;

  DELETE FROM game_room_players
   WHERE room_id = p_room_id AND device_id = p_device_id;
  RETURN 'left';
END;
$$;

-- ── 8. Droits d'exécution ──────────────────────────────────────────────────
-- Les salles sont anonymes (device_id) : les rôles anon et authenticated
-- appellent ces fonctions. Aucune n'est accessible à PUBLIC sans rôle.
REVOKE ALL ON FUNCTION public.room_set_ready(BIGINT, TEXT, BOOLEAN)   FROM PUBLIC;
REVOKE ALL ON FUNCTION public.room_start_game(BIGINT, TEXT, JSONB)    FROM PUBLIC;
REVOKE ALL ON FUNCTION public.room_update_state(BIGINT, TEXT, JSONB)  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.room_update_score(BIGINT, TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.room_end_game(BIGINT, TEXT)             FROM PUBLIC;
REVOKE ALL ON FUNCTION public.room_leave(BIGINT, TEXT)                FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.room_set_ready(BIGINT, TEXT, BOOLEAN)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_start_game(BIGINT, TEXT, JSONB)     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_update_state(BIGINT, TEXT, JSONB)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_update_score(BIGINT, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_end_game(BIGINT, TEXT)              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_leave(BIGINT, TEXT)                 TO anon, authenticated;

-- ── 9. Rejoindre une salle (ou se reconnecter) ─────────────────────────────
-- Remplace l'upsert client : en cas de reconnexion, le score et l'état "prêt"
-- sont conservés (l'ancien upsert remettait le score à 0).
CREATE OR REPLACE FUNCTION public.room_join(
  p_room_id BIGINT,
  p_device_id TEXT,
  p_pseudo TEXT
) RETURNS game_room_players
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r game_room_players;
BEGIN
  IF p_pseudo IS NULL OR length(trim(p_pseudo)) = 0 OR length(p_pseudo) > 40 THEN
    RAISE EXCEPTION 'Pseudo invalide (1 à 40 caractères).';
  END IF;

  -- Nouvelle arrivée : la salle doit encore être en lobby.
  -- Reconnexion : un joueur déjà présent peut toujours revenir.
  IF NOT EXISTS (SELECT 1 FROM game_rooms WHERE id = p_room_id AND status = 'lobby')
     AND NOT EXISTS (SELECT 1 FROM game_room_players WHERE room_id = p_room_id AND device_id = p_device_id) THEN
    RAISE EXCEPTION 'Salle introuvable ou partie déjà commencée.';
  END IF;

  INSERT INTO game_room_players (room_id, device_id, pseudo, is_host, is_ready, score)
  VALUES (p_room_id, p_device_id, trim(p_pseudo), false, false, 0)
  ON CONFLICT (room_id, device_id) DO UPDATE SET pseudo = EXCLUDED.pseudo
  RETURNING * INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.room_join(BIGINT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.room_join(BIGINT, TEXT, TEXT) TO anon, authenticated;
