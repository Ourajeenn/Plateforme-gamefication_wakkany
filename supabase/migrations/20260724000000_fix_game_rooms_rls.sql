-- ════════════════════════════════════════════════════════════
-- Fix RLS for game_rooms — Allow anonymous users (public gameplay)
-- ════════════════════════════════════════════════════════════

-- Drop existing policies that are too restrictive or obsolete
DROP POLICY IF EXISTS "game_rooms_insert" ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_update" ON game_rooms;
DROP POLICY IF EXISTS "game_rooms_delete" ON game_rooms;
DROP POLICY IF EXISTS "game_room_players_insert" ON game_room_players;
DROP POLICY IF EXISTS "game_room_players_update" ON game_room_players;
DROP POLICY IF EXISTS "game_room_players_delete" ON game_room_players;

-- ── game_rooms RLS policies ─────────────────────────────────

-- Read: anyone can see active game rooms (public)
CREATE POLICY "game_rooms_read_public"
  ON game_rooms FOR SELECT
  USING (true);

-- Insert: anyone can create a room (public, no auth required)
-- Note: This allows anonymous users to create rooms via Supabase client
CREATE POLICY "game_rooms_create_public"
  ON game_rooms FOR INSERT
  WITH CHECK (true);

-- Update: anyone can update game_state, status (during gameplay)
-- This allows real-time sync without authentication
CREATE POLICY "game_rooms_update_public"
  ON game_rooms FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Delete: anyone can delete (host can close room, or cleanup)
-- In production, you may want to restrict this to host_id only
-- For now, allowing public delete for testing purposes
CREATE POLICY "game_rooms_delete_public"
  ON game_rooms FOR DELETE
  USING (true);

-- ── game_room_players RLS policies ──────────────────────────

-- Read: anyone can see who's in a room (public join list)
CREATE POLICY "game_room_players_read_public"
  ON game_room_players FOR SELECT
  USING (true);

-- Insert: anyone can join a room (public, no auth required)
-- Allows self-join via device_id without authentication
CREATE POLICY "game_room_players_join_public"
  ON game_room_players FOR INSERT
  WITH CHECK (true);

-- Update: anyone can update their own player state
-- (is_ready, score during gameplay, etc.)
CREATE POLICY "game_room_players_update_public"
  ON game_room_players FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Delete: anyone can leave their room
-- In production, restrict to device_id matching for security
CREATE POLICY "game_room_players_delete_public"
  ON game_room_players FOR DELETE
  USING (true);
