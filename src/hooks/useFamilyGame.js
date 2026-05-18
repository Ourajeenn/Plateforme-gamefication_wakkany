import { useState, useCallback, useEffect } from 'react';
import { FAMILY_QUESTIONS } from '../data/familyQuizzes';

export function useFamilyGame() {
  const [gameState, setGameState] = useState('home'); // 'home', 'profile', 'setup', 'starting', 'playing', 'results'
  const [gameConfig, setGameConfig] = useState({ theme: null, mode: 'coop', players: [], difficulty: 'hunter', timerLimit: 8 });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [playerScores, setPlayerScores] = useState({});
  
  // Boss Raid Mode states
  const [bossHp, setBossHp] = useState(100);
  const [teamHp, setTeamHp] = useState(100);
  const [bossName, setBossName] = useState("Golem de Faille");

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
    // Shuffle and pick 5 questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    
    // Initialize player scores if party mode
    const initialScores = {};
    if (config.players) {
      config.players.forEach(p => initialScores[p] = 0);
    }
    setPlayerScores(initialScores);

    // Initialize Boss HP & Name
    const bossNames = ["Golem de Faille d'Aéther", "Loup Légendaire des Ombres", "Monarque de Croc Cosmique", "Kargas le Destructeur"];
    setBossName(bossNames[Math.floor(Math.random() * bossNames.length)]);
    setBossHp(100);
    setTeamHp(100);

    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setStartCountdown(3);
    setGameState('starting');
    setTimeLeft(config.timerLimit || 8);
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
    
    let nextBossHp = bossHp;
    let nextTeamHp = teamHp;

    if (selectedAnswer === currentQ.answer) {
      // Deal damage to Boss
      if (gameConfig.mode === 'boss') {
        nextBossHp = Math.max(bossHp - 25, 0);
        setBossHp(nextBossHp);
      }

      let multiplier = 1.0;
      if (gameConfig.difficulty === 'rookie') multiplier = 0.7;
      if (gameConfig.difficulty === 'monarch') multiplier = 1.5;
      
      const pointsEarned = Math.round((10 + (streak * 2)) * multiplier);
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
      // Receive damage from Boss
      if (gameConfig.mode === 'boss') {
        nextTeamHp = Math.max(teamHp - 25, 0);
        setTeamHp(nextTeamHp);
      }
      setStreak(0);
    }

    // Wait a bit to show feedback before moving to next question or ending
    setTimeout(() => {
      if (nextBossHp <= 0 || nextTeamHp <= 0 || currentQuestionIndex >= questions.length - 1) {
        setGameState('results');
        
        // Save XP, stats, and achievements to profile
        try {
          const currentXP = parseInt(localStorage.getItem('wakkany_family_xp') || '0', 10);
          const gamesPlayed = parseInt(localStorage.getItem('wakkany_family_games') || '0', 10);
          const wins = parseInt(localStorage.getItem('wakkany_family_wins') || '0', 10);
          
          localStorage.setItem('wakkany_family_xp', (currentXP + score + 15).toString());
          localStorage.setItem('wakkany_family_games', (gamesPlayed + 1).toString());
          
          if (score >= 30 || nextBossHp <= 0) {
            localStorage.setItem('wakkany_family_wins', (wins + 1).toString());
          }

          // Trigger achievement trackers
          const unlocked = JSON.parse(localStorage.getItem('wakkany_achievements') || '[]');
          
          // Achievement 1: Premier Sang (First quiz game finished)
          if (!unlocked.includes('first_game')) {
            unlocked.push('first_game');
          }
          // Achievement 2: Maître du Temps (Quick timer 5s)
          if (gameConfig.timerLimit === 5 && !unlocked.includes('speedrun')) {
            unlocked.push('speedrun');
          }
          // Achievement 3: Monarque Suprême (Monarch difficulty victory)
          if (gameConfig.difficulty === 'monarch' && (score >= 30 || nextBossHp <= 0) && !unlocked.includes('monarch')) {
            unlocked.push('monarch');
          }
          // Achievement 4: Fléau des Failles (Defeated Boss in Boss Mode)
          if (gameConfig.mode === 'boss' && nextBossHp <= 0 && !unlocked.includes('boss_slayer')) {
            unlocked.push('boss_slayer');
          }

          localStorage.setItem('wakkany_achievements', JSON.stringify(unlocked));

        } catch (e) {
          console.error("Failed to update family stats", e);
        }
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(gameConfig.timerLimit || 8);
        setIsTimerRunning(true);
      }
    }, 2000);
  }, [currentQuestionIndex, questions, streak, score, gameConfig, bossHp, teamHp]);

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
    setGameConfig({ theme: null, mode: 'coop', players: [], difficulty: 'hunter', timerLimit: 8 });
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
    setGameState,
    bossHp,
    teamHp,
    bossName
  };
}
