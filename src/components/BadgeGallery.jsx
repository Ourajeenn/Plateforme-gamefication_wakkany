import React from 'react';
import { ACHIEVEMENTS } from '../data/achievements';

export default function BadgeGallery({ unlockedAchievements }) {
    return (
        <div className="mt-12 bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center">Galerie des Succès</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    
                    return (
                        <div 
                            key={achievement.id} 
                            className={`group relative flex flex-col items-center transition-all duration-500 ${isUnlocked ? 'scale-100' : 'opacity-40 grayscale blur-[1px] hover:blur-0 hover:opacity-100 hover:grayscale-0'}`}
                        >
                            {/* Glow Effect */}
                            {isUnlocked && (
                                <div 
                                    className="absolute inset-0 blur-2xl opacity-20 scale-150 animate-pulse pointer-events-none"
                                    style={{ backgroundColor: achievement.color }}
                                ></div>
                            )}

                            <div 
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 mb-3
                                    ${isUnlocked ? 'bg-zinc-800 border-white/10 shadow-2xl shadow-black' : 'bg-transparent border-white/5'}`}
                                style={{ borderColor: isUnlocked ? `${achievement.color}40` : undefined }}
                            >
                                <iconify-icon 
                                    icon={achievement.icon} 
                                    width="28" 
                                    style={{ color: isUnlocked ? achievement.color : '#52525b' }}
                                ></iconify-icon>
                            </div>

                            <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight transition-colors ${isUnlocked ? 'text-white' : 'text-zinc-600'}`}>
                                {achievement.title}
                            </span>

                            {/* Tooltip */}
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
        </div>
    );
}
