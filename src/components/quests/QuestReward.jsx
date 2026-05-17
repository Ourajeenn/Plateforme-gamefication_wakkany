import React, { useEffect, useState } from 'react';

export default function QuestReward({ quest, onClose }) {
  const [stage, setStage] = useState('initial'); // 'initial' -> 'expand' -> 'fadeout'

  useEffect(() => {
    // Sequence d'animation
    const expandTimer = setTimeout(() => setStage('expand'), 100);
    const fadeTimer = setTimeout(() => setStage('fadeout'), 2500);
    const closeTimer = setTimeout(() => onClose(), 3000);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${stage === 'fadeout' ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-1000 ${stage === 'expand' ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div className={`relative flex flex-col items-center transform transition-all duration-700 ease-out ${stage === 'expand' ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}`}>
        
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-[#c28e3a]/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-[#c28e3a]/30 rounded-full animate-ping"></div>

        {/* Central Icon */}
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#c28e3a] to-yellow-700 flex items-center justify-center shadow-[0_0_50px_rgba(194,142,58,0.5)] mb-8 border-2 border-white/20 transform rotate-12 animate-float">
          <iconify-icon icon="lucide:award" className="text-white text-6xl drop-shadow-md"></iconify-icon>
        </div>

        {/* Text */}
        <h2 className="text-[#c28e3a] font-black uppercase tracking-[0.5em] text-sm mb-2 text-center drop-shadow-lg">Mission Accomplie</h2>
        <h1 className="text-white text-5xl font-heading font-black italic uppercase tracking-tighter text-center drop-shadow-2xl mb-6">{quest.title}</h1>
        
        <div className="flex items-center gap-3 bg-black/50 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
          <iconify-icon icon="lucide:zap" className="text-[#c28e3a] text-xl"></iconify-icon>
          <span className="text-white text-3xl font-black italic">+{quest.xpReward} XP</span>
        </div>
        
      </div>
    </div>
  );
}
