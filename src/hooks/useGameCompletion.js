/**
 * useGameCompletion — Hook pour gérer la fin d'une partie
 * 
 * - Récupère les compétences à débloquer selon le mode
 * - Appelle increment_xp pour ajouter de l'XP
 * - Appelle unlock_skill_secure pour débloquer chaque compétence
 * - Déclenche callback onSkillUnlocked pour afficher notification
 */

import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getSkillUnlock } from '../data/gameToSkillMapping';

export function useGameCompletion({ userId, onSkillUnlocked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const completeGame = useCallback(
    async ({ mode, category, won, deviceId, score, duration }) => {
      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer le mapping (XP + skills)
        const unlock = getSkillUnlock(mode, won);
        if (!unlock) {
          console.warn(`No unlock mapping for mode: ${mode}`);
          return;
        }

        const { xp: xpGain, skills, description } = unlock;

        // 2. Enregistrer la session
        const { error: sessionErr } = await supabase.from('game_sessions').insert({
          user_id: userId,
          device_id: deviceId,
          mode,
          category,
          won,
          xp_gained: xpGain,
          score,
          duration_seconds: duration
        });

        if (sessionErr) {
          console.error('Session insert error:', sessionErr);
        }

        // 3. Ajouter XP
        const { data: xpData, error: xpErr } = await supabase.rpc('increment_xp', {
          user_id: userId,
          amount: xpGain
        });

        if (xpErr) {
          console.error('XP increment error:', xpErr);
          throw xpErr;
        }

        console.log('XP incremented:', xpGain, '→', xpData);

        // 4. Débloquer chaque compétence
        for (const skillId of skills) {
          const { error: unlockErr } = await supabase.rpc('unlock_skill_secure', {
            user_id: userId,
            skill_id: skillId
          });

          if (unlockErr) {
            console.error(`Failed to unlock skill ${skillId}:`, unlockErr);
          } else {
            console.log(`Skill unlocked: ${skillId}`);

            // Trigger callback pour chaque déblocage
            if (onSkillUnlocked) {
              onSkillUnlocked({
                skillId,
                xpGain,
                message: description
              });
            }
          }
        }
      } catch (err) {
        console.error('Game completion error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [userId, onSkillUnlocked]
  );

  return { completeGame, loading, error };
}
