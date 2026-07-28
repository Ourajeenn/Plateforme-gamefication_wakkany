import { supabase } from './supabaseClient';
import { getDominantBranch } from './xpHelpers';
import { isSupabaseConfigured } from './isSupabaseConfigured';
import { enqueueOfflineOperation } from './offlineQueue';

// ─── Helpers localStorage (source de vérité locale) ─────────────────────────

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[Storage] localStorage write failed:', e);
  }
}

function loadLocal(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

// ─── Sync Supabase avec fallback offline ────────────────────────────────────

/**
 * Synchronise les métadonnées de profil du joueur vers Supabase.
 * NOTE DE SÉCURITÉ : `xp` et `level` sont intentionnellement EXCLUS du payload.
 * Les modifications d'XP et le déblocage de compétences/quêtes se font
 * exclusivement via les fonctions RPC sécurisées (increment_xp, unlock_skill_secure,
 * complete_quest_secure).
 */
async function syncToSupabase(authUser, value) {
  const { user, unlockedSkills } = value;

  const profilePayload = {
    id: authUser.id,
    username: user?.name,
    avatar_state: {
      faction: user?.clan?.id || user?.faction || 'heroes',
      academy: user?.academy,
      clan: user?.clan || null,
    },
    school: user?.academy || 'Nomade',
    dominant_branch: getDominantBranch(unlockedSkills) || 'Novice',
  };

  if (!navigator.onLine) {
    enqueueOfflineOperation('upsert', 'profiles', profilePayload);
    return;
  }

  const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
  if (profileError) {
    console.error('[Storage] Supabase profile sync error:', profileError);
    enqueueOfflineOperation('upsert', 'profiles', profilePayload);
  }
}

// ─── API publique ────────────────────────────────────────────────────────────

export const storage = {
  /**
   * Sauvegarde d'abord en localStorage (offline-safe), puis sync Supabase.
   */
  async setItem(key, value) {
    try {
      // 1. Toujours sauvegarder localement en premier
      saveLocal(key, value);

      // 2. Tenter la sync Supabase si configuré et clé joueur
      if (isSupabaseConfigured() && key.startsWith('player:')) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
          .catch(() => ({ data: { user: null } }));
        if (authUser) {
          await syncToSupabase(authUser, value);
        }
      }
    } catch (e) {
      console.error(`[Storage] setItem error for key ${key}:`, e);
      saveLocal(key, value);
    }
  },

  /**
   * Lit depuis Supabase si en ligne, sinon retourne le cache localStorage.
   */
  async getItem(key) {
    try {
      if (isSupabaseConfigured() && key.startsWith('player:') && navigator.onLine) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
          .catch(() => ({ data: { user: null } }));
        if (authUser) {
          const [{ data: profile, error: profileError }, { data: skills }, { data: quests }] =
            await Promise.all([
              supabase.from('profiles').select('*').eq('id', authUser.id).single(),
              supabase.from('unlocked_skills').select('skill_id').eq('user_id', authUser.id),
              supabase.from('completed_quests').select('quest_id').eq('user_id', authUser.id),
            ]);

          if (profile && !profileError) {
            const serverData = {
              user: {
                name: profile.username,
                faction: profile.avatar_state?.faction || 'heroes',
                academy: profile.school || profile.avatar_state?.academy || 'Nomade',
                clan: profile.avatar_state?.clan || null,
              },
              xp: profile.xp || 0,
              unlockedSkills: skills ? skills.map(s => s.skill_id) : [],
              completedQuests: quests ? quests.map(q => q.quest_id) : [],
              unlockedAchievements: [],
              xpHistory: [],
            };
            saveLocal(key, serverData);
            return serverData;
          }
        }
      }

      // Fallback offline : données locales
      return loadLocal(key);
    } catch (e) {
      console.error(`[Storage] getItem error for key ${key}:`, e);
      return loadLocal(key);
    }
  },

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[Storage] removeItem error for key ${key}:`, e);
    }
  },

  async listItems() {
    try {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const rawValue = localStorage.getItem(key);
        let parsedValue = rawValue;
        try { parsedValue = JSON.parse(rawValue); } catch { /* keep raw */ }
        items.push({ key, value: parsedValue });
      }
      return items;
    } catch (e) {
      console.error('[Storage] listItems error:', e);
      return [];
    }
  },
};
