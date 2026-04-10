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
        const saved = localStorage.getItem('beastborne_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('beastborne_xp');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [unlockedSkills, setUnlockedSkills] = useState(() => {
        const saved = localStorage.getItem('beastborne_skills');
        return saved ? JSON.parse(saved) : [];
    });

    const [completedQuests, setCompletedQuests] = useState(() => {
        const saved = localStorage.getItem('beastborne_quests');
        return saved ? JSON.parse(saved) : [];
    });

    const [xpHistory, setXpHistory] = useState(() => {
        const saved = localStorage.getItem('beastborne_history');
        if (saved) return JSON.parse(saved);
        // Initialisation avec historique cohérent basé sur l'XP actuelle
        return MOCK_HISTORY.map(h => ({ ...h, xp: Math.min(h.xp, xp) }));
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('beastborne_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('beastborne_user');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('beastborne_xp', xp.toString());
        // Mettre à jour le dernier jour de l'historique quand l'XP change
        setXpHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].xp = xp;
            return newHistory;
        });
    }, [xp]);

    useEffect(() => {
        localStorage.setItem('beastborne_history', JSON.stringify(xpHistory));
    }, [xpHistory]);

    useEffect(() => {
        localStorage.setItem('beastborne_skills', JSON.stringify(unlockedSkills));
    }, [unlockedSkills]);

    useEffect(() => {
        localStorage.setItem('beastborne_quests', JSON.stringify(completedQuests));
    }, [completedQuests]);

    return {
        user, setUser,
        xp, setXp,
        unlockedSkills, setUnlockedSkills,
        completedQuests, setCompletedQuests,
        xpHistory
    };
}

