import { useState, useEffect } from 'react';

// Shared storage key prefix
const SCORE_PREFIX = 'score:';

export default function useLeaderboard(currentUser) {
  const [globalPlayers, setGlobalPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to push current user's score to shared storage
  const syncMyScore = async () => {
    if (!currentUser || !currentUser.name) return;

    const scoreData = {
      name: currentUser.name,
      xp: currentUser.xp,
      level: currentUser.level || 0,
      dominant: currentUser.dominant || 'Novice',
      school: currentUser.school || 'Nomade',
      updatedAt: Date.now()
    };

    try {
      if (window.storage?.setItem) {
        await window.storage.setItem(`${SCORE_PREFIX}${currentUser.name.toLowerCase()}`, scoreData, { shared: true });
      } else {
        // Fallback to local storage if shared is not available
        localStorage.setItem(`${SCORE_PREFIX}${currentUser.name.toLowerCase()}`, JSON.stringify(scoreData));
      }
    } catch (e) {
      console.error("Erreur de synchronisation du score", e);
    }
  };

  // Function to fetch all scores from shared storage
  const fetchGlobalScores = async () => {
    try {
      let allScores = [];
      
      if (window.storage?.listItems) {
        const items = await window.storage.listItems({ shared: true });
        allScores = items
          .filter(item => item.key.startsWith(SCORE_PREFIX))
          .map(item => item.value);
      } else {
        // Fallback: Read from localStorage and simulate some others
        const localScores = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(SCORE_PREFIX)) {
            localScores.push(JSON.parse(localStorage.getItem(key)));
          }
        }
        
        // Add some mock data if empty
        if (localScores.length === 0) {
          localScores.push(
            { name: 'SlayerX', xp: 2450, dominant: 'force', school: 'Tech Academy' },
            { name: 'CloudGhost', xp: 2200, dominant: 'arcane', school: 'MIT' },
            { name: 'CodeNinja', xp: 2100, dominant: 'ombre', school: 'Polytechnique' }
          );
        }
        allScores = localScores;
      }

      setGlobalPlayers(allScores.sort((a, b) => b.xp - a.xp));
    } catch (e) {
      console.error("Erreur de récupération du classement", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncMyScore();
    fetchGlobalScores();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchGlobalScores, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.xp]);

  return { globalPlayers, loading, refresh: fetchGlobalScores };
}
