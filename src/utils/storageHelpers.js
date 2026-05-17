import { supabase } from './supabaseClient';
import { getDominantBranch } from './xpHelpers';

const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

export const storage = {
  async setItem(key, value, options = { shared: false }) {
    try {
      if (isSupabaseConfigured && key.startsWith('player:')) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const { user, xp, unlockedSkills, completedQuests, unlockedAchievements } = value;
          
          // Upsert profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              username: user.name,
              avatar_state: { faction: user.faction, academy: user.academy },
              xp: xp,
              level: Math.floor(xp / 100) + 1,
              school: user.academy || 'Nomade',
              dominant_branch: getDominantBranch(unlockedSkills) || 'Novice'
            });

          if (profileError) console.error("Supabase Profile Sync Error:", profileError);

          // Sync unlocked skills
          await supabase.from('unlocked_skills').delete().eq('user_id', authUser.id);
          if (unlockedSkills && unlockedSkills.length > 0) {
            const { error: skillError } = await supabase
              .from('unlocked_skills')
              .insert(unlockedSkills.map(skillId => ({ user_id: authUser.id, skill_id: skillId })));
            if (skillError) console.error("Supabase Skills Sync Error:", skillError);
          }

          // Sync completed quests
          await supabase.from('completed_quests').delete().eq('user_id', authUser.id);
          if (completedQuests && completedQuests.length > 0) {
            const { error: questError } = await supabase
              .from('completed_quests')
              .insert(completedQuests.map(questId => ({ user_id: authUser.id, quest_id: questId })));
            if (questError) console.error("Supabase Quests Sync Error:", questError);
          }
        }
      }
      
      // Local storage backup/fallback
      if (window.storage?.setItem) {
        await window.storage.setItem(key, value, options);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`Erreur lors de la sauvegarde de la clé ${key}:`, e);
    }
  },

  async getItem(key, options = { shared: false }) {
    try {
      if (isSupabaseConfigured && key.startsWith('player:')) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          const { data: skills, error: skillsError } = await supabase
            .from('unlocked_skills')
            .select('skill_id')
            .eq('user_id', authUser.id);

          const { data: quests, error: questsError } = await supabase
            .from('completed_quests')
            .select('quest_id')
            .eq('user_id', authUser.id);

          if (profile && !profileError) {
            return {
              user: {
                name: profile.username,
                faction: profile.avatar_state?.faction || 'heroes',
                academy: profile.school || 'Nomade',
                clan: null
              },
              xp: profile.xp || 0,
              unlockedSkills: skills ? skills.map(s => s.skill_id) : [],
              completedQuests: quests ? quests.map(q => q.quest_id) : [],
              unlockedAchievements: [],
              xpHistory: []
            };
          }
        }
      }

      if (window.storage?.getItem) {
        return await window.storage.getItem(key, options);
      } else {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (e) {
      console.error(`Erreur lors de la récupération de la clé ${key}:`, e);
      return null;
    }
  },

  async removeItem(key, options = { shared: false }) {
    try {
      if (window.storage?.removeItem) {
        await window.storage.removeItem(key, options);
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`Erreur lors de la suppression de la clé ${key}:`, e);
    }
  },

  async listItems(options = { shared: false }) {
    try {
      if (window.storage?.listItems) {
        return await window.storage.listItems(options);
      } else {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          items.push({
            key,
            value: JSON.parse(localStorage.getItem(key))
          });
        }
        return items;
      }
    } catch (e) {
      console.error('Erreur lors du listage des éléments:', e);
      return [];
    }
  }
};
