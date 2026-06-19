-- Politiques RLS complémentaires pour Wakkany

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own skills" ON unlocked_skills
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON unlocked_skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can select own skills" ON unlocked_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests" ON completed_quests
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON completed_quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can select own quests" ON completed_quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create clans" ON clans
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Clan owners can update clan" ON clans
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Clan owners can delete clan" ON clans
  FOR DELETE USING (auth.uid() = owner_id);
