import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

/**
 * CORRECTIF :
 * L'ancienne implémentation lisait/écrivait via `window.storage` (l'API de
 * stockage clé-valeur fournie par l'environnement "artifact" de Claude.ai).
 * Cette API N'EXISTE PAS dans une vraie build Vite déployée sur Vercel,
 * GitHub Pages ou via le Dockerfile/nginx : `window.storage` y est
 * `undefined`. Le code retombait alors silencieusement sur `localStorage`,
 * qui est strictement personnel au navigateur — chaque joueur ne voyait
 * donc QUE son propre score, jamais un vrai classement global.
 *
 * Le classement global existe déjà côté base (table `profiles`, lisible
 * par tous via la policy "Public profiles are viewable by everyone").
 * Ce hook l'utilise directement, avec un fallback gracieux si Supabase
 * n'est pas configuré (mode démo / dev local sans backend).
 */

const MOCK_PLAYERS = [
  { name: 'SlayerX', xp: 2450, level: 12, dominant: 'force', school: 'Tech Academy' },
  { name: 'CloudGhost', xp: 2200, level: 11, dominant: 'arcane', school: 'MIT' },
  { name: 'CodeNinja', xp: 2100, level: 10, dominant: 'ombre', school: 'Polytechnique' },
];

export default function useLeaderboard(currentUser, { limit = 100 } = {}) {
  const [globalPlayers, setGlobalPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGlobalScores = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setGlobalPlayers(MOCK_PLAYERS);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('username, xp, level, dominant_branch, school')
        .order('xp', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const mapped = (data || []).map((row) => ({
        name: row.username,
        xp: row.xp,
        level: row.level,
        dominant: row.dominant_branch,
        school: row.school,
      }));

      setGlobalPlayers(mapped.length > 0 ? mapped : MOCK_PLAYERS);
      setError(null);
    } catch (e) {
      console.error('Erreur de récupération du classement', e);
      setError(e);
      // En cas d'erreur réseau ponctuelle, on garde l'affichage précédent
      // plutôt que de vider la liste (évite un flash "classement vide").
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // NB: il n'y a plus de "syncMyScore" écrivant l'XP du joueur courant ici.
  // L'écriture du score se fait désormais exclusivement via la RPC
  // sécurisée `increment_xp` (voir useSupabasePlayerData.fixed.js) au
  // moment où l'XP est réellement gagnée, jamais depuis le composant
  // d'affichage du classement.

  useEffect(() => {
    fetchGlobalScores();

    // Rafraîchissement périodique en fallback du temps réel.
    const interval = setInterval(fetchGlobalScores, 30000);

    // Mise à jour en direct dès qu'un profil change (XP, niveau...).
    let channel;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('leaderboard-updates')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
          fetchGlobalScores();
        })
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchGlobalScores]);

  return { globalPlayers, loading, error, refresh: fetchGlobalScores };
}
