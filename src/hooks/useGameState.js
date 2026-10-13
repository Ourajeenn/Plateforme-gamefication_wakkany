/**
 * Hook pour gérer l'état du jeu avec conséquences
 */

import { useState, useCallback, useRef } from 'react';
import GameStateManager from '../utils/gameStateManager';
import QUESTIONS_WITH_CONSEQUENCES from '../data/questionsWithConsequences';
import { getNextQuestionBasedOnConsequences } from '../data/questionsWithConsequences';

export function useGameState(gameId) {
  const [question, setQuestion] = useState(null);
  const [consequence, setConsequence] = useState(null);
  const [worldMemory, setWorldMemory] = useState({});
  const [round, setRound] = useState(0);
  const gameStateRef = useRef(new GameStateManager(gameId));

  const loadQuestion = useCallback(() => {
    if (round < QUESTIONS_WITH_CONSEQUENCES.length) {
      const q = QUESTIONS_WITH_CONSEQUENCES[round];
      setQuestion(q);
    } else {
      const nextQ = getNextQuestionBasedOnConsequences(
        gameStateRef.current.state,
        round
      );
      setQuestion(nextQ);
    }
  }, [round]);

  const answerQuestion = useCallback((questionId, answer, consequence) => {
    gameStateRef.current.recordDecision(questionId, answer, consequence);
    setConsequence(consequence);
    setWorldMemory(gameStateRef.current.getWorldMemory());
  }, []);

  const nextRound = useCallback(() => {
    const nextRound = gameStateRef.current.advanceRound();
    setRound(nextRound);
    loadQuestion();
  }, [loadQuestion]);

  const getGameContext = useCallback(() => {
    return gameStateRef.current.generateGameMasterContext();
  }, []);

  return {
    question,
    consequence,
    worldMemory,
    round,
    loadQuestion,
    answerQuestion,
    nextRound,
    getGameContext,
    gameState: gameStateRef.current
  };
}

export default useGameState;
