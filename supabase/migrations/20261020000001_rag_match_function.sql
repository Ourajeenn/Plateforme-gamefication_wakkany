-- ============================================================
-- Migration RAG Étape 2 : fonction SQL de recherche plein texte
-- Recherche dans ai_questions (status = 'approved') les entrées
-- les plus pertinentes pour une question donnée.
-- ============================================================

CREATE OR REPLACE FUNCTION match_approved_questions(
  query_text TEXT,
  match_count INT DEFAULT 4,
  min_rank REAL DEFAULT 0.01
)
RETURNS TABLE (
  id BIGINT,
  question TEXT,
  answer TEXT,
  explanation TEXT,
  theme TEXT,
  rank REAL
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT
    q.id,
    q.question,
    q.answer,
    q.explanation,
    q.theme,
    ts_rank(
      to_tsvector('french', coalesce(q.question, '') || ' ' || coalesce(q.explanation, '')),
      websearch_to_tsquery('french', query_text)
    ) AS rank
  FROM ai_questions q
  WHERE q.status = 'approved'
    AND to_tsvector('french', coalesce(q.question, '') || ' ' || coalesce(q.explanation, ''))
        @@ websearch_to_tsquery('french', query_text)
    AND ts_rank(
      to_tsvector('french', coalesce(q.question, '') || ' ' || coalesce(q.explanation, '')),
      websearch_to_tsquery('french', query_text)
    ) >= min_rank
  ORDER BY rank DESC
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_approved_questions IS
  'Recherche plein texte (French tsvector) dans les questions approuvées. '
  'Utilisée par la Edge Function assistant pour le RAG. '
  'Retourne au maximum match_count entrées ayant un rang >= min_rank.';
