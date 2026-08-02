import { useCallback } from 'react';

// Create a single shared AudioContext outside the hook to avoid the 6-context limit in Chrome
let sharedAudioCtx = null;
const assetBase = import.meta.env.BASE_URL || '/';
const audioCache = new Map();

const normalizeAssetPath = (fileName) => {
  const base = assetBase.endsWith('/') ? assetBase.slice(0, -1) : assetBase;
  const path = `${base}/assets/${fileName}`.replace(/\/\/+/g, '/');
  if (typeof window === 'undefined') return path;
  return path.startsWith('http') ? path : `${window.location.origin}${path}`;
};

const createAudio = (fileName) => {
  try {
    const fullUrl = normalizeAssetPath(fileName);
    const audio = new Audio(fullUrl);
    audio.preload = 'auto';
    audio.fallbackAttempted = false;

    audio.addEventListener('canplaythrough', () => {
      console.log(`[Audio] Fichier ${fileName} prêt à être joué (${fullUrl})`);
    });

    audio.addEventListener('error', (e) => {
      const errCode = e.target?.error?.code;
      const errMsg = e.target?.error?.message;
      console.error(`[Audio] Erreur de chargement pour ${fileName} (${fullUrl}): Code ${errCode} - ${errMsg || 'Fichier introuvable ou bloqué'}`);

      if (!audio.fallbackAttempted) {
        audio.fallbackAttempted = true;
        const fallbackUrl = `${window.location.origin}/assets/${fileName}`;
        if (fallbackUrl !== fullUrl) {
          console.warn(`[Audio] Tentative de fallback pour ${fileName} via ${fallbackUrl}`);
          audio.src = fallbackUrl;
          audio.load();
        }
      }
    });

    return audio;
  } catch (err) {
    console.error(`[Audio] Exception lors de la création de l'objet Audio pour ${fileName}:`, err);
    return null;
  }
};

const getAudioAsset = (fileName) => {
  if (!audioCache.has(fileName)) {
    audioCache.set(fileName, createAudio(fileName));
  }
  return audioCache.get(fileName);
};

export let bgMusic = null;

export const getBgMusic = () => {
  if (!bgMusic) {
    bgMusic = createAudio('epic_music.mp3');
    if (bgMusic) {
      bgMusic.loop = true;
      bgMusic.volume = 0.5;
    }
  }
  return bgMusic;
};

const getClickAudio = () => getAudioAsset('click1.mp3');
const getThunderAudio = () => getAudioAsset('thunder.mp3');

export const useSoundFX = () => {
  const playSound = useCallback((freq, type, duration, volume = 0.1) => {
    try {
      if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }

      const oscillator = sharedAudioCtx.createOscillator();
      const gainNode = sharedAudioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, sharedAudioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, sharedAudioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, sharedAudioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(sharedAudioCtx.destination);

      oscillator.start();
      oscillator.stop(sharedAudioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio Context not supported or blocked', e);
    }
  }, []);

  const playClick = () => {
    const clickAudio = getClickAudio();
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

  const playCorrect = () => {
    [440, 660, 880].forEach((f, i) => {
      setTimeout(() => playSound(f, 'sine', 0.15, 0.2), i * 100);
    });
  };

  const playJoker = () => {
    playSound(300, 'triangle', 0.4, 0.2);
  };

  const playLightning = () => {
    playSound(2500, 'sawtooth', 0.09, 0.25);
    setTimeout(() => playSound(3000, 'square', 0.07, 0.22), 30);
    setTimeout(() => playSound(2000, 'sawtooth', 0.12, 0.2), 60);

    const thunderAudio = getThunderAudio();
    if (thunderAudio) {
      thunderAudio.currentTime = 0;
      thunderAudio.play().catch(() => {});
    }
  };

  const playTimerTick = () => {
    playSound(800, 'sine', 0.05, 0.08);
  };

  const playPreloaderLightning = () => {
    playSound(2500, 'sawtooth', 0.09, 0.25);
    setTimeout(() => playSound(3000, 'square', 0.07, 0.22), 30);

    const thunderAudio = getThunderAudio();
    if (thunderAudio) {
      thunderAudio.currentTime = 0;
      thunderAudio.play().catch(() => {});
    }
  };

  const stopBgMusic = () => {
    const music = getBgMusic();
    if (music) {
      music.pause();
    }
  };

  const playCountdownBeep = () => {
    playSound(600, 'sine', 0.1, 0.2);
  };

  const playCountdownGo = () => {
    playSound(1200, 'triangle', 0.4, 0.3);
  };

  return {
    playClick,
    playUnlock,
    playLevelUp,
    playError,
    playLightning,
    playPreloaderLightning,
    playTimerTick,
    playCorrect,
    playJoker,
    stopBgMusic,
    playCountdownBeep,
    playCountdownGo,
  };
};

