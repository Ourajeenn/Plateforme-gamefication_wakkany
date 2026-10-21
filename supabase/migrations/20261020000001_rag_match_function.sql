-- ============================================================
-- Migration RAG Step 2 : fonction de recherche plein texte
-- Recherche dans ai_questions (status = 'approved') les entrées
-- les plus pertinentes pour une requête donnée.
-- ============================================================

-- Index GIN pour la recherche plein texte (French unaccent)
-- On crée l'index uniquement s'il n'existe pas déjà.
CREATE INDEX IF NOT EXISTS idx_ai_questions_fts_fr
  ON ai_questions
  USING GIN (
    to_tsvector(
      'french',
      coalesce(question, '') || ' ' || coalesce(explanation, '') || ' ' || coalesce(answer, '')
    )
  );

-- ============================================================
-- Fonction match_approved_questions
-- Paramètres :
--   query_text  TEXT  – la question du joueur, déjà normalisée
--   match_count INT   – nombre max d'entrées à retourner (défaut 5)
--   min_rank    FLOAT – seuil minimal de pertinence (défaut 0.01)
-- Retourne les colonnes nécessaires à la construction du prompt RAG.
-- SECURITY INVOKER : la fonction s'exécute avec les droits du
-- rôle appelant, donc les politiques RLS sur ai_questions
-- s'appliquent normalement.
-- ============================================================
CREATE OR REPLACE FUNCTION match_approved_questions(
  query_text  TEXT,
  match_count INT   DEFAULT 5,
  min_rank    FLOAT DEFAULT 0.01
)
RETURNS TABLE (
  id          BIGINT,
  question    TEXT,
  answer      TEXT,
  explanation TEXT,
  theme       TEXT,
  rank        FLOAT
)
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
  SELECT
    aq.id,
    aq.question,
    aq.answer,
    aq.explanation,
    aq.theme,
    ts_rank(
      to_tsvector('french',
        coalesce(aq.question, '') || ' ' ||
        coalesce(aq.explanation, '') || ' ' ||
        coalesce(aq.answer, '')
      ),
      websearch_to_tsquery('french', query_text)
    )::FLOAT AS rank
  FROM ai_questions aq
  WHERE
    aq.status = 'approved'
    AND to_tsvector('french',
          coalesce(aq.question, '') || ' ' ||
          coalesce(aq.explanation, '') || ' ' ||
          coalesce(aq.answer, '')
        ) @@ websearch_to_tsquery('french', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
$$;

-- Commentaire explicatif (visible dans Supabase Studio)
COMMENT ON FUNCTION match_approved_questions IS
  'Recherche plein texte (French tsvector) dans les questions approuvées. '
  'Utilisée par la Edge Function assistant pour le RAG. '
  'Retourne au maximum match_count entrées ayant un rang >= min_rank.';
