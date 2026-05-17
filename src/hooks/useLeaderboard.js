import { useState, useEffect } from 'react';
import { storage } from '../utils/storageHelpers';

const SCORE_PREFIX = 'score:';

export default function useLeaderboard(currentUser) {
  const [globalPlayers, setGlobalPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

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

    await storage.setItem(`${SCORE_PREFIX}${currentUser.name.toLowerCase()}`, scoreData, { shared: true });
  };

  const fetchGlobalScores = async () => {
    try {
      const items = await storage.listItems({ shared: true });
      let allScores = items
        .filter(item => item.key.startsWith(SCORE_PREFIX))
        .map(item => item.value);

      // Add some mock data if empty (useful for local fallback)
      if (allScores.length === 0) {
        allScores = [
          { name: 'SlayerX', xp: 2450, dominant: 'force', school: 'Tech Academy' },
          { name: 'CloudGhost', xp: 2200, dominant: 'arcane', school: 'MIT' },
          { name: 'CodeNinja', xp: 2100, dominant: 'ombre', school: 'Polytechnique' }
        ];
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

    const interval = setInterval(fetchGlobalScores, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.xp]);

  return { globalPlayers, loading, refresh: fetchGlobalScores };
}
