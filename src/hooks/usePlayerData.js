import { useState, useEffect } from 'react';

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

    useEffect(() => {
        if (user) {
            localStorage.setItem('beastborne_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('beastborne_user');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('beastborne_xp', xp.toString());
    }, [xp]);

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
        completedQuests, setCompletedQuests
    };
}
