-- ════════════════════════════════════════════════════════════════════════════
-- Game Master : génération automatique de questions sans répétition.
--
-- 1. ai_questions : empreinte normalisée (anti-doublon), origine, échantillon
--    relu par un administrateur.
-- 2. game_room_questions : questions déjà posées dans chaque salle.
-- 3. game_master_budget : plafond quotidien d'appels au modèle, consommé de
--    façon atomique.
-- Les trois tables n'ont aucune policy : seule la fonction Edge (service_role)
-- y accède.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. ai_questions ────────────────────────────────────────────────────────
ALTER TABLE ai_questions
  ADD COLUMN IF NOT EXISTS fingerprint   TEXT,
  ADD COLUMN IF NOT EXISTS source        TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS review_sample BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE ai_questions
  DROP CONSTRAINT IF EXISTS ai_questions_source_check;
ALTER TABLE ai_questions
  ADD CONSTRAINT ai_questions_source_check
  CHECK (source IN ('manual', 'seed', 'gemini'));

-- Deux questions dont le texte normalisé est identique ne peuvent pas coexister.
CREATE UNIQUE INDEX IF NOT EXISTS ai_questions_fingerprint_key
  ON ai_questions (fingerprint)
  WHERE fingerprint IS NOT NULL;

-- Index pour l'historique récent des questions générées (anti-répétition).
CREATE INDEX IF NOT EXISTS ai_questions_source_theme_idx
  ON ai_questions (source, theme, created_at DESC);

-- ── 2. Questions déjà posées dans une salle ────────────────────────────────
CREATE TABLE IF NOT EXISTS game_room_questions (
  room_id     BIGINT NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES ai_questions(id) ON DELETE CASCADE,
  round       INTEGER NOT NULL,
  served_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, question_id)
);

ALTER TABLE game_room_questions ENABLE ROW LEVEL SECURITY;

-- ── 3. Budget quotidien ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_master_budget (
  day   DATE PRIMARY KEY,
  calls INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE game_master_budget ENABLE ROW LEVEL SECURITY;

-- Consomme un appel si le plafond du jour n'est pas atteint.
-- Retourne true si l'appel est autorisé, false sinon. Atomique.
CREATE OR REPLACE FUNCTION public.game_master_consume_budget(p_day DATE, p_cap INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO game_master_budget (day, calls)
  VALUES (p_day, 1)
  ON CONFLICT (day) DO UPDATE
    SET calls = game_master_budget.calls + 1
    WHERE game_master_budget.calls < p_cap;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.game_master_consume_budget(DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.game_master_consume_budget(DATE, INTEGER) TO service_role;
