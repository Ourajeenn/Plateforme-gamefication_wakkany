import React, { useState, useEffect } from 'react';
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

  // Read selected custom element aura from local storage
  const [selectedAura, setSelectedAura] = useState(() => localStorage.getItem('wakkany_avatar_aura') || 'none');

  useEffect(() => {
    const checkAura = () => {
      const current = localStorage.getItem('wakkany_avatar_aura') || 'none';
      if (current !== selectedAura) {
        setSelectedAura(current);
      }
    };
    const interval = setInterval(checkAura, 300);
    return () => clearInterval(interval);
  }, [selectedAura]);

  return (
    <div className="relative w-64 h-64 mx-auto group">
      
      {/* Background Aura (Level 3+ or Custom Element Aura) */}
      {selectedAura !== 'none' ? (
        <div 
          className={`absolute inset-4 rounded-full blur-3xl opacity-35 animate-pulse transition-all duration-500
            ${selectedAura === 'fire' ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : ''}
            ${selectedAura === 'lightning' ? 'bg-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : ''}
            ${selectedAura === 'cosmic' ? 'bg-purple-600 shadow-[0_0_50px_rgba(168,85,247,0.5)]' : ''}
            ${selectedAura === 'divine' ? 'bg-[#fce5a1] shadow-[0_0_50px_rgba(252,229,161,0.5)]' : ''}
          `}
        ></div>
      ) : level >= 3 ? (
        <div 
          className="absolute inset-4 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ backgroundColor: branchColor }}
        ></div>
      ) : null}

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

        {/* Custom Elemental Aura Render Layers behind character body */}
        {selectedAura === 'fire' && (
          <g filter="url(#glow)" className="animate-pulse">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="15,10" className="animate-spin-slow" opacity="0.6" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5,20" className="animate-[spin_6s_linear_infinite_reverse]" opacity="0.5" />
            <path d="M100,10 L108,30 L92,30 Z" fill="#ef4444" className="animate-bounce" />
            <path d="M40,50 Q30,65 50,75" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M160,50 Q170,65 150,75" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {selectedAura === 'lightning' && (
          <g filter="url(#glow)">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="30,8" className="animate-spin-slow" opacity="0.7" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2,4" className="animate-[spin_4s_linear_infinite_reverse]" opacity="0.5" />
            {/* Lightning bolt tracks */}
            <path d="M90,15 L105,35 L95,45 L110,65" stroke="#60a5fa" strokeWidth="2" fill="none" className="animate-pulse" />
            <path d="M35,90 L20,100 L30,110" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="animate-ping" />
            <path d="M165,90 L180,100 L170,110" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="animate-ping" />
          </g>
        )}

        {selectedAura === 'cosmic' && (
          <g filter="url(#glow)">
            <circle cx="100" cy="100" r="92" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="1,15" className="animate-[spin_18s_linear_infinite]" opacity="0.9" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="40,15" className="animate-[spin_10s_linear_infinite_reverse]" opacity="0.5" />
            {/* Orbital node stars */}
            <circle cx="100" cy="8" r="4" fill="#a855f7" className="animate-ping" />
            <circle cx="100" cy="192" r="4" fill="#ec4899" className="animate-ping" />
          </g>
        )}

        {selectedAura === 'divine' && (
          <g filter="url(#glow)">
            <circle cx="100" cy="100" r="94" fill="none" stroke="#fce5a1" strokeWidth="3" strokeDasharray="6,40" className="animate-[spin_30s_linear_infinite]" />
            <circle cx="100" cy="100" r="86" fill="none" stroke="#c28e3a" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" className="animate-[spin_15s_linear_infinite_reverse]" />
            {/* Radiating sun rays */}
            <path d="M100,5 L100,20 M100,180 L100,195 M5,100 L20,100 M180,100 L195,100" stroke="#fce5a1" strokeWidth="2" opacity="0.8" />
          </g>
        )}

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
