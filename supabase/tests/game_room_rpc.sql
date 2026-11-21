-- ════════════════════════════════════════════════════════════════════════════
-- Tests des RPC de salles multijoueur (migration 20261121000000).
--
-- À exécuter sur une base où les migrations game_rooms ont été appliquées :
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/game_room_rpc.sql
-- Tout est dans une transaction annulée à la fin : aucune donnée n'est conservée.
-- Les tests se jouent avec le rôle anon, comme le client web.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.expect_eq(actual anyelement, expected anyelement, label text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'ECHEC % : obtenu %, attendu %', label, actual, expected;
  END IF;
  RAISE NOTICE 'OK %', label;
END $$;

CREATE OR REPLACE FUNCTION pg_temp.expect_error(sql text, label text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  raised boolean := false;
BEGIN
  BEGIN
    EXECUTE sql;
  EXCEPTION WHEN others THEN
    raised := true;
  END;
  IF NOT raised THEN
    RAISE EXCEPTION 'ECHEC % : aucune erreur levée', label;
  END IF;
  RAISE NOTICE 'OK % (erreur attendue)', label;
END $$;

-- ── Données de test (rôle propriétaire) ───────────────────────────────────
INSERT INTO game_rooms (id, code, host_id, status) VALUES
  (1001, 'TST001', 'host-dev', 'lobby'),
  (1002, 'TST002', 'h2-dev',   'lobby');
INSERT INTO game_room_players (room_id, device_id, pseudo, is_host) VALUES
  (1001, 'host-dev', 'Hote',  true),
  (1001, 'p2-dev',   'Alice', false),
  (1002, 'h2-dev',   'Solo',  true);

-- Supabase accorde ces droits de table à anon par défaut : c'est la RLS seule
-- qui doit bloquer les écritures directes. On reproduit donc ces droits ici.
GRANT SELECT, INSERT, UPDATE, DELETE ON game_rooms, game_room_players TO anon, authenticated;

SET LOCAL ROLE anon;

-- 1. Écritures directes refusées
DO $$
DECLARE n int;
BEGIN
  UPDATE game_room_players SET score = 999999 WHERE room_id = 1001;
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM pg_temp.expect_eq(n, 0, 'UPDATE direct du score refusé');

  UPDATE game_rooms SET status = 'finished' WHERE id = 1001;
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM pg_temp.expect_eq(n, 0, 'UPDATE direct du statut refusé');

  DELETE FROM game_room_players WHERE room_id = 1001;
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM pg_temp.expect_eq(n, 0, 'DELETE direct des joueurs refusé');
END $$;

-- 2. Prêt / pas prêt
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.room_set_ready(1001, 'p2-dev', true), true,  'joueur prêt');
  PERFORM pg_temp.expect_eq(public.room_set_ready(1001, 'imposteur', true), false, 'identifiant inconnu ignoré');
END $$;

-- 3. Lancement : hôte seulement
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.room_start_game(1001, 'p2-dev', '{"round":0}'), false, 'lancement refusé à un non-hôte');
  PERFORM pg_temp.expect_eq(public.room_start_game(1001, 'host-dev', '{"round":0}'), true, 'lancement par l hôte');
  PERFORM pg_temp.expect_eq((SELECT status FROM game_rooms WHERE id = 1001), 'playing', 'statut passé à playing');
  PERFORM pg_temp.expect_eq(public.room_start_game(1001, 'host-dev', '{}'), false, 'second lancement refusé');
  PERFORM pg_temp.expect_eq(public.room_set_ready(1001, 'p2-dev', false), false, 'prêt impossible hors lobby');
END $$;

-- 4. État de partie : hôte seulement, objet JSON, taille bornée
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.room_update_state(1001, 'p2-dev', '{"round":9}'), false, 'état refusé à un non-hôte');
  PERFORM pg_temp.expect_eq(public.room_update_state(1001, 'host-dev', '{"round":1}'), true, 'état mis à jour par l hôte');
  PERFORM pg_temp.expect_eq((SELECT game_state->>'round' FROM game_rooms WHERE id = 1001), '1', 'fusion de game_state');
END $$;

SELECT pg_temp.expect_error($q$SELECT public.room_update_state(1001, 'host-dev', '[1,2]')$q$, 'patch non objet rejeté');
SELECT pg_temp.expect_error(
  $q$SELECT public.room_update_state(1001, 'host-dev', jsonb_build_object('blob', repeat('x', 25000)))$q$,
  'patch trop volumineux rejeté');

-- 5. Score : delta borné, joueur présent, salle en cours
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.room_update_score(1001, 'p2-dev', 100), 100::int, 'ajout de 100 points');
  PERFORM pg_temp.expect_eq(public.room_update_score(1001, 'p2-dev', -30), 70::int,  'retrait de 30 points');
  PERFORM pg_temp.expect_eq(public.room_update_score(1001, 'imposteur', 50), NULL::int, 'score d un inconnu ignoré');
END $$;

SELECT pg_temp.expect_error($q$SELECT public.room_update_score(1001, 'p2-dev', 600)$q$, 'delta au-dessus de 500 rejeté');
SELECT pg_temp.expect_error($q$SELECT public.room_update_score(1001, 'p2-dev', -501)$q$, 'delta sous -500 rejeté');

-- 6. Fin de partie : hôte seulement, puis plus de score
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.room_end_game(1001, 'p2-dev'), false, 'fin refusée à un non-hôte');
  PERFORM pg_temp.expect_eq(public.room_end_game(1001, 'host-dev'), true, 'fin par l hôte');
  PERFORM pg_temp.expect_eq(public.room_update_score(1001, 'p2-dev', 10), NULL::int, 'score figé après la fin');
  PERFORM pg_temp.expect_eq(public.room_update_state(1001, 'host-dev', '{"round":2}'), false, 'état figé après la fin');
END $$;

-- 6 bis. Arrivées et reconnexions
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(
    (SELECT score FROM public.room_join(1001, 'p2-dev', 'Alice')), 70, 'reconnexion conserve le score');
END $$;
SELECT pg_temp.expect_error($q$SELECT public.room_join(1001, 'nouveau-dev', 'Bob')$q$,
  'nouvelle arrivée refusée après la fin de partie');
SELECT pg_temp.expect_error($q$SELECT public.room_join(1002, 'x-dev', '   ')$q$, 'pseudo vide rejeté');

-- 7. Départs
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.room_leave(1001, 'p2-dev'), 'left', 'joueur quitte la salle');
  PERFORM pg_temp.expect_eq(
    (SELECT count(*)::int FROM game_room_players WHERE room_id = 1001), 1, 'un seul joueur restant');
  PERFORM pg_temp.expect_eq(public.room_leave(1002, 'h2-dev'), 'room_deleted', 'hôte en lobby supprime la salle');
  PERFORM pg_temp.expect_eq(
    (SELECT count(*)::int FROM game_rooms WHERE id = 1002), 0, 'salle 1002 supprimée');
END $$;

RESET ROLE;
DO $$ BEGIN RAISE NOTICE 'Tous les tests des RPC de salles sont passés.'; END $$;
ROLLBACK;
