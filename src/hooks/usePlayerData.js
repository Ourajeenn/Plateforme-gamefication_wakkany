import { useState, useEffect } from 'react';

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
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('wakkany_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('wakkany_xp');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [unlockedSkills, setUnlockedSkills] = useState(() => {
        const saved = localStorage.getItem('wakkany_skills');
        return saved ? JSON.parse(saved) : [];
    });

    const [completedQuests, setCompletedQuests] = useState(() => {
        const saved = localStorage.getItem('wakkany_quests');
        return saved ? JSON.parse(saved) : [];
    });

    const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
        const saved = localStorage.getItem('wakkany_achievements');
        return saved ? JSON.parse(saved) : [];
    });

    const [xpHistory, setXpHistory] = useState(() => {
        const saved = localStorage.getItem('wakkany_history');
        if (saved) return JSON.parse(saved);
        // Initialisation avec historique cohérent basé sur l'XP actuelle
        return MOCK_HISTORY.map(h => ({ ...h, xp: Math.min(h.xp, xp) }));
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('wakkany_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('wakkany_user');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('wakkany_xp', xp.toString());
        // Mettre à jour le dernier jour de l'historique quand l'XP change
        setXpHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].xp = xp;
            return newHistory;
        });
    }, [xp]);

    useEffect(() => {
        localStorage.setItem('wakkany_history', JSON.stringify(xpHistory));
    }, [xpHistory]);

    useEffect(() => {
        localStorage.setItem('wakkany_skills', JSON.stringify(unlockedSkills));
    }, [unlockedSkills]);

    useEffect(() => {
        localStorage.setItem('wakkany_quests', JSON.stringify(completedQuests));
    }, [completedQuests]);

    useEffect(() => {
        localStorage.setItem('wakkany_achievements', JSON.stringify(unlockedAchievements));
    }, [unlockedAchievements]);

    return {
        user, setUser,
        xp, setXp,
        unlockedSkills, setUnlockedSkills,
        completedQuests, setCompletedQuests,
        unlockedAchievements, setUnlockedAchievements,
        xpHistory
    };
}


