// src/utils/activityFeed.js
//
// Flux d'activité en direct : chaque exploit (quête validée, compétence débloquée)
// est écrit dans la table `activity_events`. Tous les joueurs connectés reçoivent
// les nouvelles lignes via Supabase Realtime (postgres_changes).

import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './isSupabaseConfigured';

const MAX_LENGTH = 140;

/** Publie un événement. Ne bloque jamais le jeu en cas d'échec. */
export async function publishActivity({ userId, pseudo, message }) {
  if (!isSupabaseConfigured() || !userId || !message) return;
  try {
    await supabase.from('activity_events').insert({
      user_id: userId,
      pseudo: (pseudo || 'Chasseur').slice(0, 40),
      message: message.slice(0, MAX_LENGTH),
    });
  } catch (err) {
    console.warn('[activity] publication impossible:', err?.message);
  }
}

/** Derniers événements, du plus récent au plus ancien. */
export async function fetchRecentActivity(limit = 5) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('activity_events')
    .select('id, pseudo, message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

/** Abonnement temps réel aux nouveaux événements. Retourne la fonction de désabonnement. */
export function subscribeActivity(onEvent) {
  if (!isSupabaseConfigured()) return () => {};
  const channel = supabase
    .channel('activity_feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_events' },
      (payload) => onEvent(payload.new)
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
