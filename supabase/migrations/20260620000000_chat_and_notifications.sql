-- 20260620000000_chat_and_notifications.sql

-- ==========================================
-- 1. CHAT MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    username text NOT NULL,
    content text NOT NULL,
    academy text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Activation de Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour le Chat
CREATE POLICY "Tout le monde peut lire le chat public"
    ON public.chat_messages
    FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent envoyer des messages"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Activer le temps réel (Realtime) sur cette table
alter publication supabase_realtime add table public.chat_messages;


-- ==========================================
-- 2. NOTIFICATIONS PERSISTANTES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'xp', 'achievement', 'level', 'info', 'success', 'error', 'chat'
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Activation de Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les Notifications
CREATE POLICY "Les utilisateurs peuvent lire leurs propres notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent se créer des notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier (marquer lues) leurs notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Activer le temps réel (Realtime) sur cette table
alter publication supabase_realtime add table public.notifications;
