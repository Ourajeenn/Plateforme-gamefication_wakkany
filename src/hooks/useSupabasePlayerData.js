import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function useSupabasePlayerData(userId) {
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        async function fetchPlayerData() {
            setLoading(true);
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
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

    const updateXp = async (newXp) => {
        if (!userId) return;
        const { error } = await supabase
            .from('profiles')
            .update({ xp: newXp })
            .eq('id', userId);
        
        if (error) console.error("Error updating XP", error);
    };

    const unlockSkill = async (skillId) => {
        if (!userId) return;
        const { error } = await supabase
            .from('unlocked_skills')
            .insert({ user_id: userId, skill_id: skillId });
        
        if (error) console.error("Error unlocking skill", error);
    };

    return { playerData, loading, updateXp, unlockSkill };
}
