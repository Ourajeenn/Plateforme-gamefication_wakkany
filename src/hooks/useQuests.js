/**
 * Hook pour gérer les quêtes du joueur
 */

import { useState, useCallback, useRef } from 'react';
import QuestManager, { QUESTS } from '../utils/questManager';

export function useQuests(playerId) {
  const [activeQuests, setActiveQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const questManagerRef = useRef(new QuestManager(playerId));

  const startQuest = useCallback((questId) => {
    const result = questManagerRef.current.startQuest(questId);
    if (result.success) {
      setActiveQuests([...questManagerRef.current.activeQuests]);
    }
    return result;
  }, []);

  const updateProgress = useCallback((questId, objectiveId, value) => {
    const result = questManagerRef.current.updateQuestProgress(questId, objectiveId, value);
    if (result.success) {
      setActiveQuests([...questManagerRef.current.activeQuests]);
      // Vérifier si complété
      const completed = questManagerRef.current.completedQuests.find(q => q.id === questId);
      if (completed) {
        setCompletedQuests([...questManagerRef.current.completedQuests]);
      }
    }
    return result;
  }, []);

  const getAvailableQuests = useCallback((playerStats) => {
    return questManagerRef.current.getAvailableQuests(playerStats);
  }, []);

  const getStats = useCallback(() => {
    return questManagerRef.current.getStats();
  }, []);

  // Initialize
  if (activeQuests.length === 0 && questManagerRef.current.activeQuests.length > 0) {
    setActiveQuests([...questManagerRef.current.activeQuests]);
  }

  return {
    activeQuests,
    completedQuests,
    allQuests: QUESTS,
    startQuest,
    updateProgress,
    getAvailableQuests,
    getStats,
    manager: questManagerRef.current
  };
}

export default useQuests;
