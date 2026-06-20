import React, { useEffect } from 'react';
import { useSoundFX, bgMusic } from '../hooks/useSoundFX';

export default function Preloader({ onComplete }) {
  const { playPreloaderLightning } = useSoundFX();

  useEffect(() => {
    // Tente de lancer la musique immédiatement (souvent bloqué par le navigateur)
    bgMusic.play().catch(() => console.log("Autoplay bloqué, attente d'une interaction..."));

    // Lancer la musique au tout premier clic n'importe où sur la page
    const playOnInteraction = () => {
      bgMusic.play().catch(e => console.log(e));
      document.removeEventListener('click', playOnInteraction);
    };

    document.addEventListener('click', playOnInteraction);

    return () => {
      document.removeEventListener('click', playOnInteraction);
    };
  }, [onComplete]);

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
  }, []);

  const handleStart = () => {
    // Jouer la musique de fond s'il y a eu un clic sur START
    if (bgMusic) {
      bgMusic.play().catch(e => console.log(e));
    }
    // Play lightning sound and finish preloader
    playPreloaderLightning();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black select-none font-heading">
      {/* CSS d'animation forcé pour garantir son exécution */}
      <style>{`
        @keyframes autoZoom {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.15); filter: brightness(1.2); }
        }
        .animate-auto-zoom {
          animation: autoZoom 1.5s ease-in-out infinite;
        }
      `}</style>
      
      {/* Conteneur de l'image de fond */}
      <img src={`${import.meta.env.BASE_URL}assets/wakkany_1.png`} className="absolute inset-0 w-full h-full object-cover" alt="Preloader background" />
      
      {/* Effet d'éclairs (Lightning) */}
      <div ref={lightningRef} className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none animate-lightning"></div>
      
      {/* Voile sombre pour faire ressortir le bouton sans flouter l'image */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Conteneur de positionnement du bouton */}
      <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2">
        {/* Bouton START avec animation de respiration (breathe) */}
        <button 
          onClick={handleStart}
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
