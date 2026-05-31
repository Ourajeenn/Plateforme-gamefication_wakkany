import { useState, useEffect, useRef } from 'react';
import { TOPICS } from '../data/topics';

export default function usePresentation() {
  const [topic, setTopic] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | prep | presenting | result
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  const selectRandomTopic = () => {
    const random = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    setTopic(random);
    setStatus('prep');
  };

  const startPresentation = (duration = 60) => {
    setStatus('presenting');
    setTimeRemaining(duration);
  };

  const finishPresentation = (manualScore = null) => {
    clearInterval(timerRef.current);
    setStatus('result');
    if (manualScore !== null) {
      setScore(manualScore);
    } else {
      // Basic scoring for now if automatic
      setScore(85);
    }
  };

  useEffect(() => {
    if (status === 'presenting' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishPresentation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status, timeRemaining]);

  const reset = () => {
    setStatus('idle');
    setTopic(null);
    setScore(0);
    setTimeRemaining(0);
    clearInterval(timerRef.current);
  };

  return { topic, status, timeRemaining, score, selectRandomTopic, startPresentation, finishPresentation, reset };
}
