import { useState, useEffect } from 'react';
import { storage } from '../utils/storageHelpers';
import { supabase } from '../utils/supabaseClient';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

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
                if (payload.new && payload.new.xp !== xp) {
                    setXp(payload.new.xp || 0);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, xp, authUserId]);

    return {
        user, setUser,
        xp, setXp,
        unlockedSkills, setUnlockedSkills,
        completedQuests, setCompletedQuests,
        unlockedAchievements, setUnlockedAchievements,
        xpHistory,
        spellingScore, setSpellingScore,
        isLoaded,
    };
}
