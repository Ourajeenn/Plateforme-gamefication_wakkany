import { useCallback } from 'react';

// Create a single shared AudioContext outside the hook to avoid the 6-context limit in Chrome
let sharedAudioCtx = null;

// Create audio instances globally so they aren't garbage collected immediately when components unmount
const assetBase = import.meta.env.BASE_URL || '/';
const createAudio = (fileName) => {
  try {
    return new Audio(`${assetBase}assets/${fileName}`);
  } catch {
    return null;
  }
};

const clickAudio = createAudio('click1.mp3');
const thunderAudio = createAudio('thunder.mp3');
export const bgMusic = createAudio('epic_music.mp3');
if (bgMusic) {
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
}

export const useSoundFX = () => {
  const playSound = useCallback((freq, type, duration, volume = 0.1) => {
    try {
      if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume context if suspended (browser autoplay policy)
      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }

      const oscillator = sharedAudioCtx.createOscillator();
      const gainNode = sharedAudioCtx.createGain();

      oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
      oscillator.frequency.setValueAtTime(freq, sharedAudioCtx.currentTime);
      
      // Enveloppe ADSR simple
      gainNode.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, sharedAudioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, sharedAudioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(sharedAudioCtx.destination);

      oscillator.start();
      oscillator.stop(sharedAudioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context not supported or blocked", e);
    }
  }, []);

  const playClick = () => {
    if (clickAudio) {
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
      return;
    }
    playSound(450, 'triangle', 0.05, 0.1);
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
    
    if (thunderAudio) {
      thunderAudio.currentTime = 0;
      thunderAudio.play().catch(() => {});
    }
  };

  // Timer tick sound for spelling game countdown
  const playTimerTick = () => {
    playSound(800, 'sine', 0.05, 0.08);
  };
  
  const playPreloaderLightning = () => {
    // Ajouter les effets synthétiques pour être sûr qu'un son joue instantanément
    playSound(2500, 'sawtooth', 0.09, 0.25);
    setTimeout(() => playSound(3000, 'square', 0.07, 0.22), 30);
    
    if (thunderAudio) {
      thunderAudio.currentTime = 0;
      thunderAudio.play().catch(() => {});
    }
  };
  
  const stopBgMusic = () => {
    if (bgMusic) {
      bgMusic.pause();
    }
  };

  const playCountdownBeep = () => {
    playSound(600, 'sine', 0.1, 0.2);
  };

  const playCountdownGo = () => {
    playSound(1200, 'triangle', 0.4, 0.3);
  };
  
  return { playClick, playUnlock, playLevelUp, playError, playLightning, playPreloaderLightning, playTimerTick, playCorrect, playJoker, stopBgMusic, playCountdownBeep, playCountdownGo };
};
