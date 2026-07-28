import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storageHelpers';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';
import { enqueueOfflineOperation } from '../utils/offlineQueue';

const MOCK_HISTORY = [
    { day: 'Lun', xp: 20 },
    { day: 'Mar', xp: 45 },
    { day: 'Mer', xp: 30 },
    { day: 'Jeu', xp: 70 },
    { day: 'Ven', xp: 110 },
    { day: 'Sam', xp: 150 },
    { day: 'Dim', xp: 190 },
];

function applyPlayerData(playerData, setters) {
    if (!playerData) return false;

    if (playerData.spellingScore === undefined) {
        playerData.spellingScore = 0;
    }

    setters.setUser(playerData.user);
    setters.setXp(playerData.xp || 0);
    setters.setUnlockedSkills(playerData.unlockedSkills || []);
    setters.setCompletedQuests(playerData.completedQuests || []);
    setters.setUnlockedAchievements(playerData.unlockedAchievements || []);
    if (playerData.xpHistory) setters.setXpHistory(playerData.xpHistory);
    if (playerData.spellingScore !== undefined) setters.setSpellingScore(playerData.spellingScore);
    return true;
}

export default function usePlayerData() {
    const [user, setUser] = useState(null);
    const [xp, setXp] = useState(0);
    const [unlockedSkills, setUnlockedSkills] = useState([]);
    const [completedQuests, setCompletedQuests] = useState([]);
    const [spellingScore, setSpellingScore] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [xpHistory, setXpHistory] = useState(MOCK_HISTORY);
    const [isLoaded, setIsLoaded] = useState(false);
    const [authUserId, setAuthUserId] = useState(null);

    useEffect(() => {
        async function loadSession() {
            if (isSupabaseConfigured()) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    setIsLoaded(true);
                    return;
                }

                setAuthUserId(session.user.id);
                const playerData = await storage.getItem('player:current', { shared: false });
                applyPlayerData(playerData, {
                    setUser, setXp, setUnlockedSkills, setCompletedQuests,
                    setUnlockedAchievements, setXpHistory, setSpellingScore,
                });
                setIsLoaded(true);
                return;
            }

            const savedSession = localStorage.getItem('wakkany_active_session');
            const legacyUser = localStorage.getItem('wakkany_user');

            if (savedSession || legacyUser) {
                let username = savedSession;
                if (!username && legacyUser) {
                    const parsedUser = JSON.parse(legacyUser);
                    username = parsedUser.name;
                }

                if (username) {
                    const playerData = await storage.getItem(`player:${username.toLowerCase()}`, { shared: false });
                    const loaded = applyPlayerData(playerData, {
                        setUser, setXp, setUnlockedSkills, setCompletedQuests,
                        setUnlockedAchievements, setXpHistory, setSpellingScore,
                    });

                    if (!loaded && legacyUser) {
                        setUser(JSON.parse(legacyUser));
                        setXp(parseInt(localStorage.getItem('wakkany_xp') || '0', 10));
                        setUnlockedSkills(JSON.parse(localStorage.getItem('wakkany_skills') || '[]'));
                        setCompletedQuests(JSON.parse(localStorage.getItem('wakkany_quests') || '[]'));
                        setUnlockedAchievements(JSON.parse(localStorage.getItem('wakkany_achievements') || '[]'));
                    }
                }
            }

            setIsLoaded(true);
        }

        loadSession();

        if (!isSupabaseConfigured()) return undefined;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session?.user) {
                setAuthUserId(null);
                setUser(null);
                return;
            }

            setAuthUserId(session.user.id);
            const playerData = await storage.getItem('player:current', { shared: false });
            applyPlayerData(playerData, {
                setUser, setXp, setUnlockedSkills, setCompletedQuests,
                setUnlockedAchievements, setXpHistory, setSpellingScore,
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    // Persistance locale
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            if (!isSupabaseConfigured()) {
                localStorage.setItem('wakkany_active_session', user.name);
            }

            let newHistory = [...xpHistory];
            if (newHistory.length > 0 && newHistory[newHistory.length - 1].xp !== xp) {
                newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], xp };
                setXpHistory(newHistory);
            }

            const playerData = {
                user,
                xp,
                unlockedSkills,
                completedQuests,
                unlockedAchievements,
                xpHistory: newHistory,
                spellingScore,
            };

            const storageKey = isSupabaseConfigured()
                ? 'player:current'
                : `player:${user.name.toLowerCase()}`;
            storage.setItem(storageKey, playerData, { shared: false });
        } else if (!isSupabaseConfigured()) {
            localStorage.removeItem('wakkany_active_session');
        }
    }, [user, xp, unlockedSkills, completedQuests, unlockedAchievements, isLoaded]);

    // Abonnement Realtime aux changements de profil Supabase
    useEffect(() => {
        if (!user || !authUserId || !isSupabaseConfigured()) return;

        const channel = supabase
            .channel(`player-realtime-${authUserId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${authUserId}`,
            }, (payload) => {
                if (payload.new && payload.new.xp !== undefined && payload.new.xp !== xp) {
                    setXp(payload.new.xp);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, xp, authUserId]);

    /**
     * Crédite l'utilisateur de `amount` XP via la RPC `increment_xp`.
     * Maintient l'état local optimiste puis réconcilie avec l'XP retournée par le serveur
     * (qui applique le plafond de 500 XP par appel).
     */
    const grantXp = useCallback(async (amount) => {
        if (!amount || amount <= 0) return { success: false, error: 'Montant XP invalide' };

        // 1. Mise à jour optimiste
        setXp((prev) => prev + amount);

        if (!isSupabaseConfigured() || !authUserId) {
            return { success: true };
        }

        if (!navigator.onLine) {
            enqueueOfflineOperation('rpc', 'increment_xp', { amount });
            return { success: true, offline: true };
        }

        try {
            const { data, error } = await supabase.rpc('increment_xp', { amount });
            if (error) throw error;

            // 2. RÉCONCILIATION OBLIGATOIRE avec la valeur serveur (data.xp)
            if (data && typeof data.xp === 'number') {
                setXp(data.xp);
            }
            return { success: true, data };
        } catch (err) {
            console.error('[PlayerData] Échec RPC increment_xp, annulation optimiste:', err.message);
            // Rollback optimiste
            setXp((prev) => Math.max(0, prev - amount));
            enqueueOfflineOperation('rpc', 'increment_xp', { amount });
            return { success: false, error: err.message };
        }
    }, [authUserId]);

    /**
     * Débloque une compétence via la RPC `unlock_skill_secure`.
     * Effectue une mise à jour optimiste et réconcilie la valeur d'XP serveur après déduction.
     */
    const unlockSkill = useCallback(async (skillId, xpCost = 0) => {
        if (!skillId) return { success: false, error: 'SkillId manquant' };
        if (unlockedSkills.includes(skillId)) return { success: true };

        // 1. Mise à jour optimiste
        setUnlockedSkills((prev) => [...prev, skillId]);
        if (xpCost > 0) {
            setXp((prev) => Math.max(0, prev - xpCost));
        }

        if (!isSupabaseConfigured() || !authUserId) {
            return { success: true };
        }

        if (!navigator.onLine) {
            enqueueOfflineOperation('rpc', 'unlock_skill_secure', { p_skill_id: skillId });
            return { success: true, offline: true };
        }

        try {
            const { data, error } = await supabase.rpc('unlock_skill_secure', { p_skill_id: skillId });
            if (error) throw error;

            // Réconciliation de l'XP serveur après déduction du coût de compétence
            const { data: profile } = await supabase.from('profiles').select('xp').eq('id', authUserId).single();
            if (profile && typeof profile.xp === 'number') {
                setXp(profile.xp);
            }
            return { success: true, data };
        } catch (err) {
            console.error('[PlayerData] Échec RPC unlock_skill_secure, annulation optimiste:', err.message);
            // Rollback optimiste
            setUnlockedSkills((prev) => prev.filter((id) => id !== skillId));
            if (xpCost > 0) {
                setXp((prev) => prev + xpCost);
            }
            enqueueOfflineOperation('rpc', 'unlock_skill_secure', { p_skill_id: skillId });
            return { success: false, error: err.message };
        }
    }, [authUserId, unlockedSkills]);

    /**
     * Valide une quête via la RPC `complete_quest_secure`.
     * Effectue une mise à jour optimiste et réconcilie l'XP serveur.
     */
    const completeQuest = useCallback(async (questId, xpReward = 0) => {
        if (!questId) return { success: false, error: 'QuestId manquant' };
        if (completedQuests.includes(questId)) return { success: true };

        // 1. Mise à jour optimiste
        setCompletedQuests((prev) => [...prev, questId]);
        if (xpReward > 0) {
            setXp((prev) => prev + xpReward);
        }

        if (!isSupabaseConfigured() || !authUserId) {
            return { success: true };
        }

        if (!navigator.onLine) {
            enqueueOfflineOperation('rpc', 'complete_quest_secure', { p_quest_id: questId, p_xp_reward: xpReward });
            return { success: true, offline: true };
        }

        try {
            const { data, error } = await supabase.rpc('complete_quest_secure', {
                p_quest_id: questId,
                p_xp_reward: xpReward,
            });
            if (error) throw error;

            // Réconciliation de l'XP serveur après validation de quête
            const { data: profile } = await supabase.from('profiles').select('xp').eq('id', authUserId).single();
            if (profile && typeof profile.xp === 'number') {
                setXp(profile.xp);
            }
            return { success: true, data };
        } catch (err) {
            console.error('[PlayerData] Échec RPC complete_quest_secure, annulation optimiste:', err.message);
            // Rollback optimiste
            setCompletedQuests((prev) => prev.filter((id) => id !== questId));
            if (xpReward > 0) {
                setXp((prev) => Math.max(0, prev - xpReward));
            }
            enqueueOfflineOperation('rpc', 'complete_quest_secure', { p_quest_id: questId, p_xp_reward: xpReward });
            return { success: false, error: err.message };
        }
    }, [authUserId, completedQuests]);

    return {
        user, setUser,
        xp, setXp,
        unlockedSkills, setUnlockedSkills,
        completedQuests, setCompletedQuests,
        unlockedAchievements, setUnlockedAchievements,
        xpHistory,
        spellingScore, setSpellingScore,
        isLoaded,
        grantXp,
        unlockSkill,
        completeQuest,
    };
}
