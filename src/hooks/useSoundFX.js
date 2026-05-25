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

  const playClick = () => {
    const clickAudio = new Audio(`${import.meta.env.BASE_URL}assets/click1.mp3`);
    clickAudio.play().catch(() => {});
  };
  
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

  // Correct answer sound – pleasant chime
  const playCorrect = () => {
    // quick ascending tones
    [440, 660, 880].forEach((f, i) => {
      setTimeout(() => playSound(f, 'sine', 0.15, 0.2), i * 100);
    });
  };

  // Joker sound – distinct tone
  const playJoker = () => {
    // low soft tone
    playSound(300, 'triangle', 0.4, 0.2);
  };

  const playLightning = () => {
    // Aggressive crackle – high‑frequency bursts
    playSound(2500, 'sawtooth', 0.09, 0.25);
    setTimeout(() => playSound(3000, 'square', 0.07, 0.22), 30);
    setTimeout(() => playSound(2000, 'sawtooth', 0.12, 0.20), 60);
    // Play thunder audio sample
    const thunderAudio = new Audio(`${import.meta.env.BASE_URL}assets/thunder.mp3`);
    thunderAudio.play().catch(() => {});
  };

  // Timer tick sound for spelling game countdown
  const playTimerTick = () => {
    // short subtle beep
    playSound(800, 'sine', 0.05, 0.08);
  };
  const playPreloaderLightning = () => {
    const thunderAudio = new Audio(`${import.meta.env.BASE_URL}assets/thunder.mp3`);
    thunderAudio.play().catch(() => {});
  };
  return { playClick, playUnlock, playLevelUp, playError, playLightning, playPreloaderLightning, playTimerTick, playCorrect, playJoker };
};
