import { useState } from 'react';
import { WORDS } from '../data/words';
import { checkWordMatch } from '../utils/textHelpers';
import { calculateSpellingScore } from '../utils/scoring';

export default function useSpelling() {
  const [currentWord, setCurrentWord] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | playing | result
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastResult, setLastResult] = useState(null); // true = success, false = fail

  const startNewWord = () => {
    const random = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(random);
    setStatus('playing');
    setAttempts(0);
    setLastResult(null);
  };

  const submitSpelling = (input) => {
    if (!currentWord) return;

    setAttempts(prev => prev + 1);
    const isCorrect = checkWordMatch(input, currentWord.word);
    setLastResult(isCorrect);

    if (isCorrect) {
      const difficultyMultiplier = currentWord.difficulty === 'Difficile' ? 3 : currentWord.difficulty === 'Moyen' ? 2 : 1;
      const points = calculateSpellingScore(currentWord.word.length, 10, difficultyMultiplier); // arbitrary 10s left for now
      setScore(prev => prev + points);
      setStatus('result');
    } else if (attempts >= 2) {
      setStatus('result'); // failed after 3 attempts (since it increments before this block)
    }
  };

  const reset = () => {
    setStatus('idle');
    setCurrentWord(null);
    setScore(0);
    setAttempts(0);
    setLastResult(null);
  };

  return { currentWord, status, score, attempts, lastResult, startNewWord, submitSpelling, reset };
}
