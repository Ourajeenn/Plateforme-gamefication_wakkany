import React from 'react';
import morokhImg from '../assets/histoire/morokh_v2.png';
import anyaImg from '../assets/histoire/anya_v2.png';
import factionsImg from '../assets/histoire/factions_v2.png';
import badgesImg from '../assets/histoire/badges_v2.png';

export default function BadgesView({ userLevel }) {
  const TOTAL_BADGES = 18;
  const unlockedCount = Math.min(userLevel || 1, TOTAL_BADGES);

  // We map different textures, colors and icons to create 18 UNIQUE, completely authentic badges
  const badgeData = [
    { name: "Éveil", icon: "lucide:sparkles", color: "#38bdf8", img: factionsImg },
    { name: "Novice", icon: "lucide:shield", color: "#4ade80", img: badgesImg },
    { name: "Initiation", icon: "lucide:sword", color: "#facc15", img: morokhImg },
    { name: "Sang-Mêlé", icon: "lucide:droplets", color: "#ef4444", img: anyaImg },
    { name: "Gardien", icon: "lucide:shield-half", color: "#a855f7", img: morokhImg },
    { name: "Protecteur", icon: "lucide:shield-check", color: "#3b82f6", img: factionsImg },
    { name: "Traqueur", icon: "lucide:compass", color: "#14b8a6", img: badgesImg },
    { name: "Assassin", icon: "lucide:skull", color: "#dc2626", img: anyaImg },
    { name: "Sentinelle", icon: "lucide:eye", color: "#8b5cf6", img: morokhImg },
    { name: "Guerrier", icon: "lucide:swords", color: "#f97316", img: factionsImg },
    { name: "Vétéran", icon: "lucide:medal", color: "#eab308", img: badgesImg },
    { name: "Maître", icon: "lucide:crown", color: "#f59e0b", img: anyaImg },
    { name: "Fléau", icon: "lucide:flame", color: "#f43f5e", img: morokhImg },
    { name: "Sanguinaire", icon: "lucide:heart-crack", color: "#be123c", img: anyaImg },
    { name: "Champion", icon: "lucide:trophy", color: "#fbbf24", img: factionsImg },
    { name: "Héros", icon: "lucide:star", color: "#60a5fa", img: badgesImg },
    { name: "Légende", icon: "lucide:gem", color: "#c084fc", img: morokhImg },
    { name: "Mythe", icon: "lucide:sun", color: "#fb923c", img: factionsImg }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-24 animate-fade-in pt-8">
      {/* Header Premium */}
      <div className="text-center space-y-6 px-4">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-zinc-900 border border-white/10 shadow-2xl mb-2">
          <iconify-icon icon="lucide:award" width="32" className="text-[#c28e3a]"></iconify-icon>
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-heading tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#c28e3a] via-white to-[#c28e3a]">
          Insignes de Gloire
        </h1>
        <p className="text-zinc-400 font-monda max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Forgez votre propre mythe. Chaque insigne est imprégné de l'essence de nos légendes et certifie vos hauts faits dans l'arène.
        </p>
        
        <div className="inline-flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-[#c28e3a]/20 px-8 py-4 rounded-2xl mt-8 shadow-[0_0_30px_rgba(194,142,58,0.15)]">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Insignes Débloqués</span>
            <span className="text-white font-bold tracking-widest text-lg">{unlockedCount} <span className="text-zinc-600">/ {TOTAL_BADGES}</span></span>
          </div>
        </div>
      </div>

      {/* Hexagonal / Gem Gallery Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4 lg:px-8 pt-12">
        {badgeData.map((badge, i) => {
          const isUnlocked = i < unlockedCount;

          return (
            <div key={i} className="flex flex-col items-center gap-4 group">
              {/* Badge Container */}
              <div 
                className={`relative w-full aspect-square rounded-[30%] overflow-hidden flex items-center justify-center transition-all duration-700 ${
                  isUnlocked 
                    ? 'border-2 cursor-pointer hover:-translate-y-2 hover:rotate-3' 
                    : 'border border-zinc-800 opacity-50 grayscale cursor-not-allowed transform scale-95 bg-zinc-950'
                }`}
                style={{
                  borderColor: isUnlocked ? badge.color : 'transparent',
                  boxShadow: isUnlocked ? `0 10px 30px ${badge.color}40, inset 0 0 20px ${badge.color}40` : 'none'
                }}
              >
                {/* Image Texture Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-110 group-hover:opacity-50"
                  style={{ backgroundImage: `url(${badge.img})` }}
                ></div>

                {/* Gradient Fill */}
                <div 
                  className="absolute inset-0 opacity-80"
                  style={{ background: `radial-gradient(circle at center, ${badge.color}20 0%, ${badge.color}80 150%)` }}
                ></div>

                {/* Inner Bevel / Reflection */}
                {isUnlocked && (
                  <div className="absolute inset-2 rounded-[25%] border border-white/20 z-10 pointer-events-none"></div>
                )}

                {/* Icon */}
                <div className="relative z-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                  {isUnlocked ? (
                    <iconify-icon 
                      icon={badge.icon} 
                      width="40" 
                      style={{ color: badge.color, filter: `drop-shadow(0 0 10px ${badge.color})` }}
                    ></iconify-icon>
                  ) : (
                    <iconify-icon icon="lucide:lock" width="24" className="text-zinc-600"></iconify-icon>
                  )}
                </div>

                {/* Shine effect */}
                {isUnlocked && (
                  <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-shine pointer-events-none z-30"></div>
                )}
              </div>

              {/* Plaque / Label */}
              <div className="text-center">
                <span 
                  className="text-[11px] font-black uppercase tracking-widest block mb-1"
                  style={{ color: isUnlocked ? badge.color : '#52525b' }}
                >
                  {isUnlocked ? badge.name : `Niveau ${i + 1}`}
                </span>
                <span className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">
                  {isUnlocked ? 'Débloqué' : 'Verrouillé'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
