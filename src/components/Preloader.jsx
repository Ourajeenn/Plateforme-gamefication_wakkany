import React, { useEffect, useState } from 'react';
import { useSoundFX, getBgMusic } from '../hooks/useSoundFX';

export default function Preloader({ onComplete }) {
  const { playPreloaderLightning } = useSoundFX();
  const bgMusic = getBgMusic();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Tente de lancer la musique immédiatement (souvent bloqué par le navigateur)
    bgMusic?.play().catch(() => console.log("Autoplay bloqué, attente d'une interaction..."));

    // Lancer la musique au tout premier clic n'importe où sur la page
    const playOnInteraction = () => {
      bgMusic?.play().catch((e) => console.log(e));
      document.removeEventListener('click', playOnInteraction);
    };

    document.addEventListener('click', playOnInteraction);

    return () => {
      document.removeEventListener('click', playOnInteraction);
    };
  }, [bgMusic, onComplete]);

  const lightningRef = React.useRef(null);

  // Trigger thunder sound when lightning animation starts
  useEffect(() => {
    const el = lightningRef.current;
    if (!el) return;
    const handleAnimationStart = () => {
      playPreloaderLightning();
    };
    el.addEventListener('animationstart', handleAnimationStart);
    return () => {
      el.removeEventListener('animationstart', handleAnimationStart);
    };
  }, [playPreloaderLightning]);

  const handleStart = () => {
    // Jouer la musique de fond s'il y a eu un clic sur START
    if (bgMusic) {
      bgMusic.play().catch(e => console.log(e));
    }
    // Play lightning sound and finish preloader
    playPreloaderLightning();
    onComplete();
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 350);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden bg-[#111] select-none font-heading">
      {/* CSS d'animation forcé pour garantir son exécution */}
      <style>{`
        @keyframes autoZoom {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.15); filter: brightness(1.2); }
        }
        .animate-auto-zoom {
          animation: autoZoom 1.5s ease-in-out infinite;
        }
        @keyframes preloaderSweep {
          from { transform: translateX(-110%); }
          to { transform: translateX(110%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-auto-zoom { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(194,142,58,0.12),_transparent_55%)]" />
      <div ref={lightningRef} className="pointer-events-none absolute inset-0 bg-white/5 mix-blend-screen animate-lightning" />
      <div className="absolute left-1/2 top-1/2 h-px w-48 -translate-x-1/2 overflow-hidden bg-white/10">
        <div className="h-full w-1/2 animate-[preloaderSweep_1.4s_ease-in-out_infinite] bg-[#c28e3a]" />
      </div>

      <div className="absolute bottom-[15%] left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
        <button 
          onClick={handleStart}
          disabled={!ready}
          className="group px-20 py-5 text-3xl md:text-4xl font-bold text-black uppercase tracking-[0.2em] bg-gradient-to-b from-[#fde68a] via-[#fcd34d] to-[#d97706] rounded-md hover:scale-110 transition-all duration-300 shadow-[0_10px_30px_rgba(217,119,6,0.4)] overflow-hidden animate-auto-zoom"
        >
          {/* Griffures gauche (SVG) */}
          <svg className="absolute left-0 bottom-0 h-[120%] w-24 text-[#1c1917] -translate-y-[10%] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,60 Q15,80 25,100 L10,100 Q5,85 0,75 Z" fill="currentColor"/>
            <path d="M15,40 Q30,65 40,100 L25,100 Q15,75 5,50 Z" fill="currentColor"/>
            <path d="M40,20 Q55,55 65,100 L50,100 Q35,65 25,35 Z" fill="currentColor"/>
          </svg>

          {/* Griffures droite (SVG) */}
          <svg className="absolute right-0 top-0 h-[120%] w-24 text-[#1c1917] -translate-y-[10%] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100,40 Q85,20 75,0 L90,0 Q95,15 100,25 Z" fill="currentColor"/>
            <path d="M85,60 Q70,35 60,0 L75,0 Q85,25 95,50 Z" fill="currentColor"/>
            <path d="M60,80 Q45,45 35,0 L50,0 Q65,35 75,65 Z" fill="currentColor"/>
          </svg>

          <span className="relative z-10 font-monda">START</span>
        </button>
      </div>
    </div>
  );
}

