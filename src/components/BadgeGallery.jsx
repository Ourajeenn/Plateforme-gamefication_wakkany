import React, { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { getLevel } from '../data/levels';
import morokhImg from '../assets/histoire/morokh_v2.png';
import anyaImg from '../assets/histoire/anya_v2.png';
import factionsImg from '../assets/histoire/factions_v2.png';
import badgesImg from '../assets/histoire/badges_v2.png';

export default function BadgeGallery({ unlockedAchievements, xp }) {
    const [activeTab, setActiveTab] = useState('achievements');
    
    const userLevel = getLevel(xp || 0).level;
    const TOTAL_BADGES = 18;
    const unlockedCount = Math.min(userLevel || 1, TOTAL_BADGES);

    const levelBadgeData = [
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
        <div className="mt-12 bg-zinc-900/50 border border-white/5 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col items-center mb-8">
                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Trophées & Badges</h3>
                
                <div className="flex bg-zinc-950 border border-white/10 rounded-xl p-1">
                    <button 
                        onClick={() => setActiveTab('achievements')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'achievements' ? 'bg-[#c28e3a] text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Hauts Faits
                    </button>
                    <button 
                        onClick={() => setActiveTab('levels')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'levels' ? 'bg-[#c28e3a] text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Niveaux
                    </button>
                </div>
            </div>
            
            {activeTab === 'achievements' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {ACHIEVEMENTS.map((achievement) => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id);
                        return (
                            <div key={achievement.id} className={`group relative flex flex-col items-center transition-all duration-500 ${isUnlocked ? 'scale-100' : 'opacity-40 grayscale blur-[1px] hover:blur-0 hover:opacity-100 hover:grayscale-0'}`}>
                                {isUnlocked && (
                                    <div className="absolute inset-0 blur-2xl opacity-20 scale-150 animate-pulse pointer-events-none" style={{ backgroundColor: achievement.color }}></div>
                                )}
                                <div 
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 mb-3 ${isUnlocked ? 'bg-zinc-800 shadow-2xl shadow-black' : 'bg-transparent border-white/5'}`}
                                    style={{ borderColor: isUnlocked ? `${achievement.color}40` : undefined }}
                                >
                                    <iconify-icon icon={achievement.icon} width="28" style={{ color: isUnlocked ? achievement.color : '#52525b' }}></iconify-icon>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight transition-colors ${isUnlocked ? 'text-white' : 'text-zinc-600'}`}>
                                    {achievement.title}
                                </span>
                                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 p-4 bg-zinc-950 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl text-center">
                                    <p className="text-white font-heading font-bold italic uppercase text-xs mb-1" style={{ color: achievement.color }}>{achievement.title}</p>
                                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                        {isUnlocked ? achievement.desc : "Succès verrouillé"}
                                    </p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-950"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'levels' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-4">
                    {levelBadgeData.map((badge, i) => {
                        const isUnlocked = i < unlockedCount;
                        return (
                            <div key={i} className="flex flex-col items-center gap-4 group">
                                <div 
                                    className={`relative w-full aspect-square rounded-[30%] overflow-hidden flex items-center justify-center transition-all duration-700 ${isUnlocked ? 'border-2 cursor-pointer hover:-translate-y-2 hover:rotate-3' : 'border border-zinc-800 opacity-50 grayscale cursor-not-allowed transform scale-95 bg-zinc-950'}`}
                                    style={{ borderColor: isUnlocked ? badge.color : 'transparent', boxShadow: isUnlocked ? `0 10px 30px ${badge.color}40, inset 0 0 20px ${badge.color}40` : 'none' }}
                                >
                                    <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-110 group-hover:opacity-50" style={{ backgroundImage: `url(${badge.img})` }}></div>
                                    <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at center, ${badge.color}20 0%, ${badge.color}80 150%)` }}></div>
                                    {isUnlocked && <div className="absolute inset-2 rounded-[25%] border border-white/20 z-10 pointer-events-none"></div>}
                                    <div className="relative z-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                                        {isUnlocked ? (
                                            <iconify-icon icon={badge.icon} width="40" style={{ color: badge.color, filter: `drop-shadow(0 0 10px ${badge.color})` }}></iconify-icon>
                                        ) : (
                                            <iconify-icon icon="lucide:lock" width="24" className="text-zinc-600"></iconify-icon>
                                        )}
                                    </div>
                                    {isUnlocked && <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 group-hover:animate-shine pointer-events-none z-30"></div>}
                                </div>
                                <div className="text-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest block mb-1" style={{ color: isUnlocked ? badge.color : '#52525b' }}>
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
            )}
        </div>
    );
}
