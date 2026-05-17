import React, { useEffect, useState } from 'react';

const TIPS = [
  "Le Mode Meute permet de jouer en famille et d'accumuler de l'XP collective.",
  "Touchez l'Artelion pour dévoiler les secrets de la chronologie Wakkany.",
  "Chaque talent débloqué modifie l'apparence de votre avatar.",
  "La Faille Temporelle offre des récompenses d'XP doublées une fois par jour."
];

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Masquer la scrollbar globale pendant le préchargement
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Rotation des astuces
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 2000);

    // Animation de la barre de progression (3 secondes = 3000ms)
    // On met à jour toutes les 30ms (100 étapes)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 3500); // Laisse 0.5s à 100% avant de fermer

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black overflow-hidden font-monda">
      {/* Background Image with Zoom and Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-[pulse_10s_ease-in-out_infinite] scale-110"
        style={{ backgroundImage: "url('/loading_bg.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-8">
        
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-serif font-black tracking-[0.2em] mb-16 text-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#fce5a1] via-[#c28e3a] to-[#785317]">
            PLATEFORME WAKKANY
          </span>
        </h1>

        {/* Progress Bar Container */}
        <div className="w-full relative h-10 bg-black/60 border-2 border-[#785317] rounded-sm p-1 shadow-[0_0_30px_rgba(194,142,58,0.2)]">
          
          {/* Animated Fill */}
          <div 
            className="h-full bg-gradient-to-r from-[#785317] via-[#c28e3a] to-[#fce5a1] transition-all duration-75 ease-linear relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Striped Pattern Overlay */}
            <div className="absolute inset-0 opacity-30" style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.5) 10px, rgba(0,0,0,0.5) 20px)' 
            }}></div>
          </div>

          {/* Central Jewel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-black rotate-45 border-2 border-[#c28e3a] flex items-center justify-center shadow-[0_0_15px_#c28e3a]">
             <div className="w-8 h-8 bg-gradient-to-br from-[#fce5a1] to-[#785317] border border-[#fce5a1]/50 shadow-[inset_0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 mb-12 flex items-center gap-4 text-[#c28e3a] font-bold uppercase tracking-widest text-sm">
           <div className="w-2 h-2 bg-[#c28e3a] animate-ping rounded-full"></div>
           <span>Initialisation de la trame temporelle... {progress}%</span>
           <div className="w-2 h-2 bg-[#c28e3a] animate-ping rounded-full" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Tips Section */}
        <div className="text-center animate-fade-in transition-opacity duration-500">
           <div className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] mb-3">— ASTUCE —</div>
           <p className="text-zinc-300 italic text-sm max-w-md mx-auto leading-relaxed shadow-black drop-shadow-md">
             {TIPS[tipIndex]}
           </p>
        </div>
      </div>
    </div>
  );
}
