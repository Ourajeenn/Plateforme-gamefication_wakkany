import React from 'react';
import { LEVELS, getLevel } from '../data/levels';

export default function LevelEvolutionMap({ xp }) {
  const currentLevel = getLevel(xp).level;

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h2 className="text-white text-4xl font-heading italic font-bold uppercase mb-4">
          Carte d'Évolution
        </h2>
        <p className="text-zinc-400 font-monda">
          Votre chemin vers l'éternité du multivers.
        </p>
      </div>

      <div className="relative">
        {/* Ligne de progression globale (le chemin sinueux) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-zinc-800 -translate-x-1/2 rounded-full hidden md:block">
          <div 
            className="w-full bg-[#c28e3a] transition-all duration-1000"
            style={{ height: `${(currentLevel / (LEVELS.length - 1)) * 100}%` }}
          ></div>
        </div>

        <div className="flex flex-col gap-12 relative z-10">
          {LEVELS.map((lvl, index) => {
            const isUnlocked = currentLevel >= lvl.level;
            const isCurrent = currentLevel === lvl.level;
            const isEven = index % 2 === 0;

            return (
              <div 
                key={lvl.level} 
                className={`flex flex-col md:flex-row items-center justify-between gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Espace vide d'un côté */}
                <div className="w-full md:w-5/12"></div>

                {/* Nœud central */}
                <div className="relative flex justify-center w-full md:w-2/12 shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${isUnlocked ? 'border-[#c28e3a] bg-zinc-900' : 'border-zinc-800 bg-zinc-950'} z-10 relative transition-colors duration-500`}>
                    <span className={`text-xl font-black ${isUnlocked ? 'text-[#c28e3a]' : 'text-zinc-600'}`}>
                      {lvl.level}
                    </span>
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-[#c28e3a] animate-ping opacity-50"></div>
                    )}
                  </div>
                </div>

                {/* Carte d'information */}
                <div className="w-full md:w-5/12">
                  <div 
                    className={`p-6 rounded-2xl border transition-all duration-500 ${isCurrent ? 'bg-[#c28e3a]/10 border-[#c28e3a] shadow-[0_0_30px_rgba(194,142,58,0.2)] scale-105' : isUnlocked ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-zinc-800 opacity-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-heading font-bold italic uppercase text-2xl ${lvl.color}`}>
                        {lvl.name}
                      </h3>
                      <span className="text-zinc-500 font-black text-xs uppercase tracking-widest">{lvl.xp} XP</span>
                    </div>
                    <p className="text-zinc-400 text-sm font-monda">
                      {lvl.desc}
                    </p>
                    
                    {/* Icône de bâtiment imagée */}
                    <div className="mt-4 flex justify-end">
                      <iconify-icon 
                        icon={isUnlocked ? 'lucide:castle' : 'lucide:lock'} 
                        width="32" 
                        className={isUnlocked ? 'text-[#c28e3a]' : 'text-zinc-700'}
                      ></iconify-icon>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
