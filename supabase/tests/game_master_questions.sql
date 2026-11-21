-- ════════════════════════════════════════════════════════════════════════════
-- Tests de la migration 20261122000000 (Game Master).
-- psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/game_master_questions.sql
-- Transaction annulée à la fin.
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
DECLARE raised boolean := false;
BEGIN
  BEGIN
    EXECUTE sql;
  EXCEPTION WHEN others THEN
    raised := true;
  END;
  IF NOT raised THEN RAISE EXCEPTION 'ECHEC % : aucune erreur levée', label; END IF;
  RAISE NOTICE 'OK % (erreur attendue)', label;
END $$;

-- 1. Empreinte unique : deux questions identiques après normalisation
INSERT INTO ai_questions (theme, mode, difficulty, type, question, options, answer, status, source, fingerprint)
VALUES ('culture', 'coop_meute', 'hunter', 'mcq', 'Où est Paris ?', '["a","b","c","d"]', 'a', 'approved', 'gemini', 'ou est paris');

SELECT pg_temp.expect_error($q$
  INSERT INTO ai_questions (theme, mode, difficulty, type, question, options, answer, status, source, fingerprint)
  VALUES ('culture', 'coop_meute', 'hunter', 'mcq', 'ou est paris', '["a","b","c","d"]', 'a', 'approved', 'gemini', 'ou est paris')
$q$, 'doublon d empreinte refusé');

-- Les questions manuelles, sans empreinte, ne sont pas concernées
INSERT INTO ai_questions (theme, mode, difficulty, type, question, options, answer, status)
VALUES ('culture', 'coop_meute', 'hunter', 'mcq', 'Où est Paris ?', '["a","b","c","d"]', 'a', 'approved');

-- 2. Origine : seule la liste des valeurs est acceptée
SELECT pg_temp.expect_error($q$
  INSERT INTO ai_questions (theme, mode, difficulty, type, question, options, answer, status, source)
  VALUES ('culture', 'coop_meute', 'hunter', 'mcq', 'Test ?', '[]', 'x', 'pending', 'inconnu')
$q$, 'origine inconnue refusée');

-- 3. Budget : plafond atomique
DO $$
BEGIN
  PERFORM pg_temp.expect_eq(public.game_master_consume_budget(DATE '2026-11-22', 2), true,  'budget 1/2');
  PERFORM pg_temp.expect_eq(public.game_master_consume_budget(DATE '2026-11-22', 2), true,  'budget 2/2');
  PERFORM pg_temp.expect_eq(public.game_master_consume_budget(DATE '2026-11-22', 2), false, 'budget épuisé');
  PERFORM pg_temp.expect_eq(public.game_master_consume_budget(DATE '2026-11-23', 2), true,  'nouveau jour, budget rétabli');
END $$;

-- 4. Droits : anon ne lit ni n'écrit l'historique, et ne peut pas consommer le budget
GRANT SELECT ON game_room_questions, game_master_budget TO anon;
SET LOCAL ROLE anon;
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM game_room_questions;
  PERFORM pg_temp.expect_eq(n, 0, 'anon ne lit pas game_room_questions');
  SELECT count(*) INTO n FROM game_master_budget;
  PERFORM pg_temp.expect_eq(n, 0, 'anon ne lit pas le budget');
END $$;
SELECT pg_temp.expect_error($q$SELECT public.game_master_consume_budget(DATE '2026-11-24', 100)$q$,
  'anon ne peut pas consommer le budget');
RESET ROLE;

DO $$ BEGIN RAISE NOTICE 'Tous les tests Game Master (migration) sont passés.'; END $$;
ROLLBACK;
