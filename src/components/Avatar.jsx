import React from 'react';
import { getLevel } from '../data/levels';
import { getDominantBranch } from '../utils/xpHelpers';
import { BRANCHES } from '../data/branches';
import BaseBody from './avatar/BaseBody';
import AvatarEffects from './avatar/AvatarEffects';

export default function Avatar({ xp, unlockedSkills = [] }) {
  const levelData = getLevel(xp);
  const level = levelData.level;
  const dominant = getDominantBranch(unlockedSkills);
  const branchColor = dominant ? BRANCHES[dominant].color : '#c28e3a';

  return (
    <div className="relative w-64 h-64 mx-auto group">
      {/* Background Aura (Level 3+) */}
      {level >= 3 && (
        <div 
          className="absolute inset-4 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ backgroundColor: branchColor }}
        ></div>
      )}

      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1f" />
            <stop offset="100%" stopColor="#0d0d0f" />
          </linearGradient>

          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={branchColor} stopOpacity="1" />
            <stop offset="100%" stopColor={branchColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <BaseBody level={level} branchColor={branchColor} unlockedSkills={unlockedSkills} />
        <AvatarEffects level={level} branchColor={branchColor} dominant={dominant} unlockedSkills={unlockedSkills} />
        
      </svg>

      {/* Level Banner */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full flex flex-col items-center">
        <div className="bg-zinc-900/90 border border-white/10 px-6 py-2 rounded-xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <span className={`text-xl font-black italic uppercase tracking-tighter ${levelData.color}`}>
              {levelData.name}
            </span>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <span className="text-white/60 font-bold text-xs uppercase tracking-widest">
              LVL {level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
