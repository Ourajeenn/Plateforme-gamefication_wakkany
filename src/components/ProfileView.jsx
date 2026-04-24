import React from 'react';
import Avatar from './Avatar';
import BadgeGallery from './BadgeGallery';
import { getLevel } from '../data/levels';
import { getDominantBranch } from '../utils/xpHelpers';
import { BRANCHES } from '../data/branches';

export default function ProfileView({ user, xp, unlockedSkills, unlockedAchievements }) {
  const currentLevel = getLevel(xp);
  const nextLevelXp = currentLevel.nextXp || (currentLevel.xp + 100); // Fallback if nextXp is missing
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevel.xp) / (nextLevelXp - currentLevel.xp)) * 100)) || (xp % 100);
  
  const dominantBranchId = getDominantBranch(unlockedSkills);
  const dominantBranch = dominantBranchId ? BRANCHES[dominantBranchId] : null;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Avatar & Identity */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            {dominantBranch && (
              <div 
                className="absolute -top-20 -left-20 w-64 h-64 blur-[100px] opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-40"
                style={{ backgroundColor: dominantBranch.color }}
              ></div>
            )}
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h2 className="text-white text-3xl font-heading font-black italic uppercase">{user?.name || 'Nomade'}</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">{user?.academy || 'Sans Académie'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center p-2">
                {user?.clan?.icon ? (
                  <iconify-icon icon={user.clan.icon} width="24" className="text-zinc-400"></iconify-icon>
                ) : (
                   <iconify-icon icon="lucide:shield" width="24" className="text-zinc-400"></iconify-icon>
                )}
              </div>
            </div>

            <div className="py-8 flex justify-center relative z-10">
              <div className="transform scale-125">
                <Avatar xp={xp} unlockedSkills={unlockedSkills} />
              </div>
            </div>
            
            {dominantBranch && (
              <div className="mt-8 flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 relative z-10">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: `${dominantBranch.color}20`, borderColor: `${dominantBranch.color}40`, color: dominantBranch.color }}
                >
                  <span className="text-xl">{dominantBranch.icon}</span>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Voie Dominante</div>
                  <div className="text-white font-bold uppercase tracking-widest text-sm" style={{ color: dominantBranch.color }}>{dominantBranch.label}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Progression */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* XP & Level Card */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10">
              <div>
                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Niveau Actuel</h3>
                <div className="flex items-baseline gap-3">
                  <span className={`text-4xl font-heading font-black italic uppercase ${currentLevel.color}`}>{currentLevel.name}</span>
                  <span className="text-zinc-600 font-bold uppercase tracking-widest">LVL {currentLevel.level}</span>
                </div>
                <p className="text-zinc-400 text-sm font-monda italic mt-2">"{currentLevel.desc}"</p>
              </div>
              
              <div className="text-right">
                <div className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em] mb-1">XP Cumulée</div>
                <div className="text-5xl text-white font-monda">{xp}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <span>Progression vers {currentLevel.level >= 4 ? 'MAX' : `LVL ${currentLevel.level + 1}`}</span>
                <span className="text-white">{xp} / {currentLevel.level >= 4 ? '∞' : nextLevelXp} XP</span>
              </div>
              
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                {/* Background glow for the bar */}
                <div 
                  className="absolute top-0 left-0 h-full opacity-50 blur-sm transition-all duration-1000" 
                  style={{ width: `${progressPercent}%`, backgroundColor: currentLevel.level >= 4 ? '#fce5a1' : '#c28e3a' }}
                ></div>
                
                {/* Actual progress bar */}
                <div 
                  className="h-full relative z-10 transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${progressPercent}%`, backgroundColor: currentLevel.level >= 4 ? '#fce5a1' : '#c28e3a' }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full overflow-hidden">
                    <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-progress-shine"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-10 border-t border-white/5 pt-8">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <iconify-icon icon="lucide:git-branch" className="text-[#c28e3a] mb-2 text-xl"></iconify-icon>
                <div className="text-2xl text-white font-bold">{unlockedSkills.length}</div>
                <div className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">Talents Acquis</div>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <iconify-icon icon="lucide:award" className="text-[#c28e3a] mb-2 text-xl"></iconify-icon>
                <div className="text-2xl text-white font-bold">{unlockedAchievements.length}</div>
                <div className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">Succès Débloqués</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Badge Gallery takes full width at the bottom */}
      <div className="mt-8">
        <BadgeGallery unlockedAchievements={unlockedAchievements} />
      </div>
    </div>
  );
}
