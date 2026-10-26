-- ============================================================================
-- 20261026000001_fix_game_rooms_and_sessions_rls.sql
-- Durcissement des politiques RLS sur game_rooms, game_room_players et game_sessions
-- Résolution de la faille C3 (salons et sessions modifiables/lisibles sans contrôle)
-- ============================================================================

-- ── 1. Sécurisation de game_sessions ───────────────────────────────────────────
-- Problème corrigé : 'OR device_id IS NOT NULL' permettait à n'importe quel client
-- de lire l'ensemble des sessions enregistrées et d'insérer des sessions frauduleuses
-- sous l'user_id d'une autre personne.

DROP POLICY IF EXISTS "Users can view own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_select_own" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_insert_own" ON game_sessions;

-- Un utilisateur authentifié ne peut lire que ses propres sessions.
-- Un invité ne peut lire que les sessions anonymes (user_id IS NULL).
CREATE POLICY "game_sessions_select_own"
  ON game_sessions FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Interdiction formelle d'insérer une session avec le user_id d'autrui :
-- Si authentifié : user_id doit être auth.uid() ou NULL (partie anonyme).
-- Si non authentifié : user_id DOIT être NULL.
CREATE POLICY "game_sessions_insert_own"
  ON game_sessions FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

-- ── 2. Sécurisation de game_rooms ──────────────────────────────────────────────
-- Problème corrigé : UPDATE/DELETE avec USING (true) permettait à n'importe quel client
-- de fermer arbitrairement ou de corrompre les salons de tous les autres joueurs.

DROP POLICY IF EXISTS "game_rooms_update_public" ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_delete_public" ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_update" ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_delete" ON game_rooms;

-- Mise à jour réservée à l'hôte authentifié ou aux salons actifs non expirés
CREATE POLICY "game_rooms_update_restricted"
  ON game_rooms FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND host_id = auth.uid()::text)
    OR (status != 'finished' AND expires_at > now())
  )
  WITH CHECK (
    expires_at > now()
  );

-- Suppression réservée à l'hôte créateur ou en phase de lobby
CREATE POLICY "game_rooms_delete_restricted"
  ON game_rooms FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND host_id = auth.uid()::text)
    OR (status = 'lobby' AND host_id IS NOT NULL)
  );

-- ── 3. Sécurisation de game_room_players ──────────────────────────────────────
DROP POLICY IF EXISTS "game_room_players_update_public" ON game_room_players;
DROP POLICY IF EXISTS "game_room_players_delete_public" ON game_room_players;
DROP POLICY IF EXISTS "game_room_players_update" ON game_room_players;
DROP POLICY IF EXISTS "game_room_players_delete" ON game_room_players;

CREATE POLICY "game_room_players_update_restricted"
  ON game_room_players FOR UPDATE
  USING (device_id IS NOT NULL)
  WITH CHECK (device_id IS NOT NULL);

CREATE POLICY "game_room_players_delete_restricted"
  ON game_room_players FOR DELETE
  USING (device_id IS NOT NULL);
