-- ============================================================================
-- 20261026000003_allow_knowledge_type.sql
-- Extension de la contrainte CHECK de ai_questions pour autoriser le type 'knowledge' (R1)
-- ============================================================================

-- Remplacement de la contrainte de type pour accepter 'knowledge' en plus de 'mcq' et 'bluff'
ALTER TABLE ai_questions DROP CONSTRAINT IF EXISTS ai_questions_type_check;
ALTER TABLE ai_questions ADD CONSTRAINT ai_questions_type_check CHECK (type IN ('mcq', 'bluff', 'knowledge'));

-- Index pour accélérer les requêtes RAG et isoler les types
CREATE INDEX IF NOT EXISTS idx_ai_questions_status_type ON ai_questions(status, type);
