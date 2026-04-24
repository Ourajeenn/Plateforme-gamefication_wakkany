import { useCallback } from 'react';

export const useSoundFX = () => {
  const playSound = useCallback((freq, type, duration, volume = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      // Enveloppe ADSR simple
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context not supported or blocked", e);
    }
  }, []);

  const playClick = () => playSound(800, 'sine', 0.1, 0.05);
  
  const playUnlock = () => {
    playSound(400, 'triangle', 0.2, 0.1);
    setTimeout(() => playSound(600, 'triangle', 0.3, 0.1), 100);
    setTimeout(() => playSound(800, 'triangle', 0.5, 0.1), 200);
  };

  const playLevelUp = () => {
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(() => playSound(f, 'sine', 0.6, 0.15), i * 150);
    });
  };

  const playError = () => {
    playSound(150, 'sawtooth', 0.3, 0.1);
  };

  return { playClick, playUnlock, playLevelUp, playError };
};
