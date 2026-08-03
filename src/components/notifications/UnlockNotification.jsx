/**
 * UnlockNotification — Affiche une notification épique lors du déblocage de compétence
 */

import React, { useEffect, useState } from 'react';

export default function UnlockNotification({ skillId, xpGain, message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    playUnlockSound();

    // Auto-close après 5s
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Attendre la fade-out
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const playUnlockSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Montée épique de notes
      const notes = [
        { freq: 523.25, time: now },        // C5
        { freq: 659.25, time: now + 0.15 }, // E5
        { freq: 783.99, time: now + 0.3 },  // G5
        { freq: 1046.5, time: now + 0.45 }  // C6
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch (e) {
      console.warn('Audio context error:', e);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{
          animation: isVisible ? 'fadeIn 0.6s ease-out' : 'fadeOut 0.4s ease-in'
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 max-w-md w-full mx-4 bg-zinc-950 border-2 border-[#c28e3a] rounded-2xl overflow-hidden pointer-events-auto"
        style={{
          animation: isVisible
            ? 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'slideDown 0.4s ease-in',
          boxShadow: isVisible
            ? '0 0 60px rgba(194, 142, 58, 0.8), inset 0 0 40px rgba(194, 142, 58, 0.1)'
            : 'none'
        }}
      >
        {/* Glow top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c28e3a] to-transparent opacity-80" />

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#c28e3a]/20 border-2 border-[#c28e3a] flex items-center justify-center animate-pulse">
              <iconify-icon icon="mdi:star" width="32" className="text-[#c28e3a]"></iconify-icon>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-heading font-black italic uppercase text-[#c28e3a] mb-2 tracking-wider">
            Compétence Déverrouillée!
          </h2>

          {/* Skill name */}
          <p className="text-4xl font-heading font-black text-white mb-4 uppercase tracking-tight">
            {skillId}
          </p>

          {/* Description */}
          <p className="text-zinc-300 text-sm mb-4 font-monda leading-relaxed">
            {message}
          </p>

          {/* XP Gain */}
          <div className="bg-[#c28e3a]/10 border border-[#c28e3a]/30 rounded-xl py-3 px-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <iconify-icon icon="mdi:lightning-bolt" width="20" className="text-[#c28e3a]"></iconify-icon>
              <span className="text-xl font-black text-[#c28e3a]">+{xpGain} XP</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 500);
            }}
            className="px-8 py-2.5 bg-[#c28e3a] hover:bg-[#e8b96a] text-black font-heading font-black uppercase tracking-widest text-sm rounded-lg transition-colors active:scale-95"
          >
            Continuer
          </button>
        </div>

        {/* Glow bottom */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c28e3a] to-transparent opacity-80" />
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(60px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(60px);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
