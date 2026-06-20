import React, { useState, useEffect } from 'react';
import { bgMusic } from '../../hooks/useSoundFX';

export default function AudioController() {
  const [isPlaying, setIsPlaying] = useState(!bgMusic?.paused);
  const [isMuted, setIsMuted] = useState(!!bgMusic?.muted);
  const [volume, setVolume] = useState(bgMusic ? bgMusic.volume : 0.5);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!bgMusic) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => {
      setIsMuted(bgMusic.muted);
      setVolume(bgMusic.volume);
    };

    bgMusic.addEventListener('play', handlePlay);
    bgMusic.addEventListener('pause', handlePause);
    bgMusic.addEventListener('volumechange', handleVolume);

    // Sync initial state
    setIsPlaying(!bgMusic.paused);
    setIsMuted(bgMusic.muted);
    setVolume(bgMusic.volume);

    return () => {
      bgMusic.removeEventListener('play', handlePlay);
      bgMusic.removeEventListener('pause', handlePause);
      bgMusic.removeEventListener('volumechange', handleVolume);
    };
  }, []);

  if (!bgMusic) return null;

  const togglePlay = () => {
    if (bgMusic.paused) {
      bgMusic.play().catch((e) => console.log('Audio play blocked or failed:', e));
    } else {
      bgMusic.pause();
    }
  };

  const toggleMute = () => {
    bgMusic.muted = !bgMusic.muted;
  };

  const handleVolumeSlider = (e) => {
    const val = parseFloat(e.target.value);
    bgMusic.volume = val;
    if (val > 0 && bgMusic.muted) {
      bgMusic.muted = false;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-24 left-6 z-[250] flex items-center gap-3 p-2 rounded-2xl glass-panel border border-[#c28e3a]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#c28e3a]"
    >
      {/* Equalizer animation when playing */}
      {isPlaying && !isMuted && (
        <div className="flex items-end gap-[2px] h-3 px-1.5">
          <div className="w-[2px] bg-[#c28e3a] animate-[pulse_0.8s_infinite_alternate]" style={{ height: '60%' }}></div>
          <div className="w-[2px] bg-[#c28e3a] animate-[pulse_0.5s_infinite_alternate]" style={{ height: '100%' }}></div>
          <div className="w-[2px] bg-[#c28e3a] animate-[pulse_0.7s_infinite_alternate]" style={{ height: '40%' }}></div>
        </div>
      )}

      {/* Play/Pause Button (Couper la musique) */}
      <button
        onClick={togglePlay}
        title={isPlaying ? 'Mettre en pause' : 'Lancer la musique'}
        className="w-8 h-8 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-[#c28e3a] hover:bg-[#c28e3a] hover:text-black transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <iconify-icon
          icon={isPlaying ? 'lucide:pause' : 'lucide:play'}
          width="16"
        ></iconify-icon>
      </button>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        title={isMuted ? 'Activer le son' : 'Couper le son'}
        className="w-8 h-8 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center text-[#c28e3a] hover:bg-[#c28e3a] hover:text-black transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <iconify-icon
          icon={isMuted || volume === 0 ? 'lucide:volume-x' : volume < 0.4 ? 'lucide:volume-1' : 'lucide:volume-2'}
          width="16"
        ></iconify-icon>
      </button>

      {/* Volume Slider - shown on hover/focus */}
      <div
        className={`flex items-center transition-all duration-300 overflow-hidden ${
          isHovered ? 'w-20 opacity-100 pr-1' : 'w-0 opacity-0'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeSlider}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c28e3a]"
          style={{
            background: `linear-gradient(to right, #c28e3a 0%, #c28e3a ${
              (isMuted ? 0 : volume) * 100
            }%, #27272a ${(isMuted ? 0 : volume) * 100}%, #27272a 100%)`,
          }}
        />
      </div>
    </div>
  );
}
