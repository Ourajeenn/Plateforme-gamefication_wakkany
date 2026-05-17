import { useState, useCallback, useEffect } from 'react';
import { FAMILY_QUESTIONS } from '../data/familyQuizzes';

export function useFamilyGame() {
  const [gameState, setGameState] = useState('home'); // 'home', 'profile', 'setup', 'starting', 'playing', 'results'
  const [gameConfig, setGameConfig] = useState({ theme: null, mode: 'coop', players: [] });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [playerScores, setPlayerScores] = useState({});
  
  // Timer state
  const [startCountdown, setStartCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Load questions based on config
  const startGame = useCallback((config) => {
    setGameConfig(config);
    let availableQuestions = FAMILY_QUESTIONS;
    if (config.theme && config.theme !== 'general') {
      availableQuestions = availableQuestions.filter(q => q.theme === config.theme);
    }
    // Shuffle and pick 5 questions (or whatever available)
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    
    // Initialize player scores if party mode
    const initialScores = {};
    if (config.players) {
      config.players.forEach(p => initialScores[p] = 0);
    }
    setPlayerScores(initialScores);

    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setStartCountdown(3);
    setGameState('starting');
    setTimeLeft(8);
    setIsTimerRunning(false);
  }, []);

  // Start countdown logic
  useEffect(() => {
    let timer;
    if (gameState === 'starting' && startCountdown > 0) {
      timer = setInterval(() => {
        setStartCountdown(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'starting' && startCountdown === 0) {
      setGameState('playing');
      setIsTimerRunning(true);
    }
    return () => clearInterval(timer);
  }, [gameState, startCountdown]);

  const handleAnswer = useCallback((selectedAnswer) => {
    setIsTimerRunning(false);
    const currentQ = questions[currentQuestionIndex];
    
    if (selectedAnswer === currentQ.answer) {
      const pointsEarned = 10 + (streak * 2);
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);

      if (gameConfig.mode === 'party' && gameConfig.players.length > 0) {
        const currentPlayer = gameConfig.players[currentQuestionIndex % gameConfig.players.length];
        setPlayerScores(prev => ({
          ...prev,
          [currentPlayer]: (prev[currentPlayer] || 0) + pointsEarned
        }));
      }
    } else {
      setStreak(0);
    }

    // Wait a bit to show feedback before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(8);
        setIsTimerRunning(true);
      } else {
        setGameState('results');
        // Save XP and stats to profile (with safety checks)
        try {
          const currentXP = parseInt(localStorage.getItem('wakkany_family_xp') || '0', 10);
          const gamesPlayed = parseInt(localStorage.getItem('wakkany_family_games') || '0', 10);
          const wins = parseInt(localStorage.getItem('wakkany_family_wins') || '0', 10);
          
          localStorage.setItem('wakkany_family_xp', (currentXP + score + 10).toString());
          localStorage.setItem('wakkany_family_games', (gamesPlayed + 1).toString());
          if (score >= 30) {
            localStorage.setItem('wakkany_family_wins', (wins + 1).toString());
          }
        } catch (e) {
          console.error("Failed to update family stats", e);
        }
      }
    }, 2000);
  }, [currentQuestionIndex, questions, streak, score, gameConfig]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0 && gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      handleAnswer(null); // Time out
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, gameState, handleAnswer]);

  const resetGame = useCallback(() => {
    setGameState('home');
    setGameConfig({ theme: null, mode: 'coop', players: [] });
  }, []);

  return {
    gameState,
    gameConfig,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    totalQuestions: questions.length,
    score,
    streak,
    playerScores,
    startCountdown,
    timeLeft,
    startGame,
    handleAnswer,
    resetGame,
    isTimerRunning,
    setGameState
  };
}
