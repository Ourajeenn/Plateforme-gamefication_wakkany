import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSoundFX, getBgMusic } from '../hooks/useSoundFX';
import { ASSET_PATHS } from '../utils/assetPaths';

export default function Preloader({ onComplete }) {
  const { playPreloaderLightning } = useSoundFX();
  const bgMusic = getBgMusic();
  const [ready, setReady] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(ASSET_PATHS.images.wakkany.main);

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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.warn(`Failed to load image: ${imageSrc}`);
    if (imageSrc === ASSET_PATHS.images.wakkany.main) {
      setImageSrc(ASSET_PATHS.images.wakkany.heroes);
    } else {
      // Fallback: afficher le preloader sans image
      setImageLoaded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-[#111] select-none font-heading">
      {/* CSS d'animation forcé pour garantir son exécution */}
      <style>{`
        @keyframes autoZoom {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.15); filter: brightness(1.2); }
        }
        .animate-auto-zoom {
          animation: autoZoom 1.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-auto-zoom { animation: none; }
        }
        /* Écrans portrait (téléphones) : l'image 16:9 contient le logo WAKKANY.
           En object-cover, les bords du logo sont coupés. On l'affiche donc en
           entier (contain) sur un fond flouté de la même image. */
        .splash-backdrop { display: none; }
        @media (max-aspect-ratio: 4/5) {
          img.splash-main { position: relative; z-index: 1; object-fit: contain; object-position: center 30%; }
          img.splash-backdrop {
            display: block; position: absolute; inset: 0; width: 100%; height: 100%;
            object-fit: cover; filter: blur(28px) brightness(0.55); transform: scale(1.15);
          }
        }
      `}</style>

      {/* Fullscreen Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="splash-backdrop"
        />
        <img
          src={imageSrc}
          alt="Wakkany Background"
          decoding="async"
          fetchPriority="high"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`splash-main w-full h-full object-cover object-center transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Voile très léger uniquement au bas de l'écran pour détacher le bouton START */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        
        {/* Loading spinner overlay si pas encore chargé */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="w-16 h-16 border-4 border-[#c28e3a]/30 border-t-[#c28e3a] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Lightning effect overlay */}
      <div ref={lightningRef} className="pointer-events-none absolute inset-0 bg-white/5 mix-blend-screen animate-lightning" />

      {/* START Button at bottom */}
      <div className="absolute bottom-[15%] left-1/2 flex -translate-x-1/2 flex-col items-center z-20">
        <motion.button 
          onClick={handleStart}
          disabled={!ready}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{
            scale: ready ? [1, 1.05, 1] : 0.9,
            opacity: ready ? 1 : 0.5,
          }}
          whileHover={ready ? { scale: 1.1 } : undefined}
          whileTap={ready ? { scale: 0.95 } : undefined}
          transition={{
            scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
            opacity: { duration: 0.4 },
          }}
          className={`group relative px-20 py-5 text-3xl md:text-4xl 2xl:px-32 2xl:py-7 2xl:text-6xl min-[2400px]:px-44 min-[2400px]:py-9 min-[2400px]:text-7xl font-bold text-black uppercase tracking-[0.2em] bg-gradient-to-b from-[#fde68a] via-[#fcd34d] to-[#d97706] rounded-md shadow-[0_10px_30px_rgba(217,119,6,0.4)] overflow-hidden ${
            ready ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
          title={ready ? 'Cliquez pour commencer' : 'Préparation du jeu...'}
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
        </motion.button>
      </div>
    </div>
  );
}
