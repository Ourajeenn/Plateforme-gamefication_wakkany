import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Hook de persistance Supabase pour les données joueur.
 *
 * CHANGEMENT DE SÉCURITÉ (voir migration 20260618000000_secure_profile_updates.sql) :
 *  - updateXp() ne fait plus `update({ xp: newXp })` (valeur absolue imposée
 *    par le client) mais appelle la RPC `increment_xp(amount)` qui calcule
 *    la nouvelle valeur côté serveur et plafonne le gain.
 *    => Le composant appelant doit désormais passer le DELTA d'XP gagné
 *       (ex: +50), pas le nouveau total.
 *  - unlockSkill() appelle `unlock_skill_secure` qui revalide côté serveur
 *    le coût en XP et les prérequis avant d'insérer la ligne.
 */
export default function useSupabasePlayerData(userId) {
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;

        async function fetchPlayerData() {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError) {
                setError(fetchError);
            } else if (data) {
                setPlayerData(data);
            }
            setLoading(false);
        }

        fetchPlayerData();

        // Realtime subscription for live updates (Leaderboard, XP changes)
        const channel = supabase
            .channel(`player-${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${userId}`
            }, (payload) => {
                setPlayerData(payload.new);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    /**
     * Crédite l'utilisateur de `amount` XP (delta, pas un total absolu).
     * La validation et le plafonnement (max 500/appel) sont faits côté
     * serveur par la fonction RPC increment_xp — impossible à contourner
     * depuis le client.
     */
    const updateXp = async (amount) => {
        if (!userId) return { error: new Error('Utilisateur non authentifié') };
        if (!Number.isFinite(amount) || amount <= 0) {
            return { error: new Error('Montant XP invalide') };
        }

        const { data, error: rpcError } = await supabase.rpc('increment_xp', { amount });
        if (rpcError) {
            console.error('Erreur lors du crédit XP', rpcError);
            return { error: rpcError };
        }
        setPlayerData(data);
        return { data };
    };

    /**
     * Débloque une compétence. La vérification XP suffisant + prérequis
     * est refaite côté serveur (table skill_definitions) : la vérification
     * React (checkAvailable dans SkillTree.jsx) reste utile pour l'UX
     * (griser les nœuds) mais n'est plus la seule ligne de défense.
     */
    const unlockSkill = async (skillId) => {
        if (!userId) return { error: new Error('Utilisateur non authentifié') };

        const { data, error: rpcError } = await supabase.rpc('unlock_skill_secure', {
            p_skill_id: skillId,
        });

        if (rpcError) {
            console.error('Erreur lors du déblocage de compétence', rpcError);
            return { error: rpcError };
        }
        return { data };
    };

    return { playerData, loading, error, updateXp, unlockSkill };
}
