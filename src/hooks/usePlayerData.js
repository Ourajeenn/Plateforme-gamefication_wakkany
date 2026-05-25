import { useState, useEffect } from 'react';
import { storage } from '../utils/storageHelpers';
import { supabase } from '../utils/supabaseClient';

const MOCK_HISTORY = [
    { day: 'Lun', xp: 20 },
    { day: 'Mar', xp: 45 },
    { day: 'Mer', xp: 30 },
    { day: 'Jeu', xp: 70 },
    { day: 'Ven', xp: 110 },
    { day: 'Sam', xp: 150 },
    { day: 'Dim', xp: 190 },
];

export default function usePlayerData() {
    const [user, setUser] = useState(null);
    const [xp, setXp] = useState(0);
    const [unlockedSkills, setUnlockedSkills] = useState([]);
    const [completedQuests, setCompletedQuests] = useState([]);
    const [spellingScore, setSpellingScore] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [xpHistory, setXpHistory] = useState(MOCK_HISTORY);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load
    useEffect(() => {
        async function loadSession() {
            const savedSession = localStorage.getItem('wakkany_active_session');
            
            // Fallback for previous data format migration
            const legacyUser = localStorage.getItem('wakkany_user');
            
            if (savedSession || legacyUser) {

                let username = savedSession;
                if (!username && legacyUser) {
                    const parsedUser = JSON.parse(legacyUser);
                    username = parsedUser.name;
                }

                if (username) {
                    const playerData = await storage.getItem(`player:${username.toLowerCase()}`, { shared: false });
            // Initialize spellingScore if missing
            if (playerData && playerData.spellingScore === undefined) {
              playerData.spellingScore = 0;
            }
                    
                    if (playerData) {
                        setUser(playerData.user);
                        setXp(playerData.xp || 0);
                        setUnlockedSkills(playerData.unlockedSkills || []);
                        setCompletedQuests(playerData.completedQuests || []);
                        setUnlockedAchievements(playerData.unlockedAchievements || []);
                        if (playerData.xpHistory) setXpHistory(playerData.xpHistory);
                    } else if (legacyUser) {
                        // Migration from old storage structure
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
    }, []);

    // Save on changes
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            localStorage.setItem('wakkany_active_session', user.name);
            
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
                spellingScore
            };
            
            storage.setItem(`player:${user.name.toLowerCase()}`, playerData, { shared: false });
        } else {
            localStorage.removeItem('wakkany_active_session');
        }
    }, [user, xp, unlockedSkills, completedQuests, unlockedAchievements, isLoaded]);

    // Supabase Realtime synchronization for profile and XP updates
    useEffect(() => {
        if (!user) return;

        const isSupabaseConfigured = 
            import.meta.env.VITE_SUPABASE_URL && 
            import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

        if (!isSupabaseConfigured) return;

        const channel = supabase
            .channel(`player-realtime-${user.name.toLowerCase()}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'profiles',
                filter: `pseudo=eq.${user.name}` 
            }, (payload) => {
                if (payload.new && payload.new.xp !== xp) {
                    setXp(payload.new.xp || 0);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, xp]);

    return {
        user, setUser,
        xp, setXp,
        unlockedSkills, setUnlockedSkills,
        completedQuests, setCompletedQuests,
        unlockedAchievements, setUnlockedAchievements,
        xpHistory,
        spellingScore, setSpellingScore
    };
}
