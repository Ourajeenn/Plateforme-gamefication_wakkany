import { useState, useCallback, useEffect, useRef } from 'react';
import { BOSS_ENCOUNTERS, isLevelUnlocked, getNextEncounter } from '../data/bossEncounters';
import { FAMILY_QUESTIONS } from '../data/familyQuizzes';

const STORAGE_KEY = 'wakkany_boss_progress';

const defaultProgress = { defeated: [], currentLevel: 1 };

const loadProgress = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : defaultProgress;
  } catch { return defaultProgress; }
};

export function useBossRaid() {
  const [progress, setProgress] = useState(loadProgress);
  const [raidState, setRaidState] = useState('map');
  // 'map' | 'countdown' | 'playing' | 'victory' | 'defeat' | 'levelComplete' | 'allComplete'

  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [bossHp, setBossHp]     = useState(100);
  const [teamHp, setTeamHp]     = useState(100);
  const [score, setScore]       = useState(0);
  const [streak, setStreak]     = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const [countdown, setCountdown]       = useState(3);
  const [timeLeft, setTimeLeft]         = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Feedback overlay
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  // Persist progress
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }, [progress]);

  // ── Start an encounter ──────────────────────────────────
  const startEncounter = useCallback((encounter) => {
    const shuffled = [...FAMILY_QUESTIONS].sort(() => 0.5 - Math.random());
    setCurrentEncounter(encounter);
    setQuestions(shuffled.slice(0, encounter.questionsCount));
    setQuestionIndex(0);
    setBossHp(encounter.hp);
    setTeamHp(100);
    setScore(0);
    setStreak(0);
    setXpEarned(0);
    setCountdown(3);
    setTimeLeft(10);
    setIsTimerRunning(false);
    setLastAnswerCorrect(null);
    setRaidState('countdown');
  }, []);

  // ── Countdown ──────────────────────────────────────────
  useEffect(() => {
    if (raidState !== 'countdown') return;
    if (countdown === 0) { setRaidState('playing'); setIsTimerRunning(true); return; }
    const t = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [raidState, countdown]);

  // ── Per-question timer ──────────────────────────────────
  useEffect(() => {
    if (!isTimerRunning || raidState !== 'playing') return;
    if (timeLeft === 0) { handleAnswer(null); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isTimerRunning, timeLeft, raidState]); // eslint-disable-line

  // ── Handle answer ───────────────────────────────────────
  const handleAnswer = useCallback((selected) => {
    if (!currentEncounter || raidState !== 'playing') return;
    setIsTimerRunning(false);

    const q = questions[questionIndex];
    const isCorrect = q && selected === q.answer;
    setLastAnswerCorrect(isCorrect);

    // Damage calculation
    const hitDmg   = Math.ceil(currentEncounter.hp / currentEncounter.questionsCount);
    const newStreak = isCorrect ? streak + 1 : 0;
    const earned    = isCorrect ? 10 + newStreak * 2 : 0;

    const newBossHp = isCorrect ? Math.max(bossHp - hitDmg, 0) : bossHp;
    const newTeamHp = isCorrect ? teamHp : Math.max(teamHp - currentEncounter.damageDealt, 0);
    const newScore  = score + earned;

    setBossHp(newBossHp);
    setTeamHp(newTeamHp);
    setScore(newScore);
    setStreak(newStreak);
    setXpEarned(p => p + earned);

    setTimeout(() => {
      setLastAnswerCorrect(null);

      const bossDown = newBossHp <= 0;
      const teamDown = newTeamHp <= 0;
      const lastQ    = questionIndex >= questions.length - 1;

      if (bossDown) {
        // ✅ Victory
        const totalXp = currentEncounter.xpReward + newScore;
        setXpEarned(totalXp);
        try {
          const cur = parseInt(localStorage.getItem('wakkany_family_xp') || '0', 10);
          localStorage.setItem('wakkany_family_xp', (cur + totalXp).toString());
        } catch {}

        const newDefeated = [...progress.defeated, currentEncounter.id];
        const levelDone   = BOSS_ENCOUNTERS
          .filter(b => b.level === currentEncounter.level)
          .every(b => newDefeated.includes(b.id));
        const allDone     = BOSS_ENCOUNTERS.every(b => newDefeated.includes(b.id));
        const nextLevel   = (levelDone && currentEncounter.level < 3)
          ? currentEncounter.level + 1
          : currentEncounter.level;

        setProgress({ defeated: newDefeated, currentLevel: nextLevel });

        if (allDone)       setRaidState('allComplete');
        else if (levelDone) setRaidState('levelComplete');
        else               setRaidState('victory');

      } else if (teamDown || lastQ) {
        setRaidState('defeat');
      } else {
        setQuestionIndex(p => p + 1);
        setTimeLeft(10);
        setIsTimerRunning(true);
      }
    }, 1600);
  }, [currentEncounter, raidState, questions, questionIndex, bossHp, teamHp, streak, score, progress]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    setRaidState('map');
    setCurrentEncounter(null);
  }, []);

  const getNextForLevel = useCallback((level) =>
    getNextEncounter(level, progress.defeated), [progress]);

  const isLevelAvailable = useCallback((level) =>
    isLevelUnlocked(level, progress.defeated), [progress]);

  return {
    raidState, setRaidState,
    progress,
    currentEncounter,
    startEncounter,
    getNextForLevel,
    isLevelAvailable,
    currentQuestion: questions[questionIndex],
    questionIndex,
    totalQuestions: questions.length,
    bossHp, teamHp,
    score, streak, xpEarned,
    countdown,
    timeLeft, isTimerRunning,
    lastAnswerCorrect,
    handleAnswer,
    resetProgress,
    defeatedCount: progress.defeated.length,
    totalEncounters: BOSS_ENCOUNTERS.length,
  };
}
