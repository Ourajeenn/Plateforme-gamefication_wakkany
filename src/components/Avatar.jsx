import React from 'react';
import { getLevel } from '../data/levels';
import { getDominantBranch } from '../utils/xpHelpers';
import { BRANCHES } from '../data/branches';

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

        {/* --- BASE BODY (Always present) --- */}
        <g className="transition-all duration-700">
          {/* Main Body */}
          <path d="M60,180 Q100,110 140,180" fill="url(#bodyGradient)" stroke="#1a1a22" strokeWidth="2" />
          {/* Head */}
          <circle cx="100" cy="70" r="32" fill="url(#bodyGradient)" stroke="#1a1a22" strokeWidth="2" />
          
          {/* Eyes */}
          <g transform="translate(100, 70)">
             <circle cx="-12" cy="-2" r="3" fill={level >= 2 ? branchColor : "#fff"} opacity={level >= 2 ? 1 : 0.4} filter={level >= 3 ? "url(#glow)" : ""} />
             <circle cx="12" cy="-2" r="3" fill={level >= 2 ? branchColor : "#fff"} opacity={level >= 2 ? 1 : 0.4} filter={level >= 3 ? "url(#glow)" : ""} />
          </g>
        </g>

        {/* --- LEVEL 1 : CHASSEUR (Armor Pieces) --- */}
        {level >= 1 && (
          <g className="animate-fade-in transition-all">
            {/* Chest armor */}
            <path d="M85,115 L115,115 L108,145 L92,145 Z" fill="#242429" stroke={branchColor} strokeWidth="1" strokeOpacity="0.5" />
            {/* Arm guards */}
            <rect x="62" y="140" width="10" height="25" rx="2" fill="#242429" stroke={branchColor} strokeWidth="0.5" />
            <rect x="128" y="140" width="10" height="25" rx="2" fill="#242429" stroke={branchColor} strokeWidth="0.5" />
          </g>
        )}

        {/* --- LEVEL 2 : VÉTÉRAN (Helmet & Shoulders) --- */}
        {level >= 2 && (
          <g className="animate-fade-in">
            {/* Shoulder pads */}
            <path d="M50,110 Q40,90 65,95" fill="none" stroke={branchColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M150,110 Q160,90 135,95" fill="none" stroke={branchColor} strokeWidth="4" strokeLinecap="round" />
            {/* Helmet top */}
            <path d="M80,45 Q100,25 120,45" fill="none" stroke={branchColor} strokeWidth="2" />
          </g>
        )}

        {/* --- LEVEL 3 : CHAMPION (Full Set + Branch Weapon) --- */}
        {level >= 3 && (
          <g className="animate-fade-in">
            {/* Aura effects */}
            <circle cx="100" cy="70" r="40" fill="none" stroke={branchColor} strokeWidth="1" strokeDasharray="4 8" className="animate-spin-slow" opacity="0.3" />
            
            {/* Weapon based on branch */}
            {dominant === 'heroes' && (
              <g transform="translate(155, 120)">
                <circle cx="0" cy="0" r="15" fill="none" stroke={branchColor} strokeWidth="3" filter="url(#glow)" />
                <path d="M-8,-8 L8,8 M-8,8 L8,-8" stroke={branchColor} strokeWidth="2" filter="url(#glow)" />
              </g>
            )}
            {dominant === 'warriors' && (
              <g transform="translate(155, 120) rotate(-15)">
                <rect x="-3" y="0" width="6" height="60" fill="#242429" />
                <path d="M-12,0 L12,0 L0,-45 Z" fill={branchColor} filter="url(#glow)" />
              </g>
            )}
            {dominant === 'dinos' && (
              <g transform="translate(155, 120) rotate(20)">
                <path d="M-5,0 Q15,-30 25,0 Q15,10 -5,0" fill={branchColor} filter="url(#glow)" />
                <path d="M-10,15 Q10,-15 20,15 Q10,25 -10,15" fill={branchColor} filter="url(#glow)" />
                <path d="M0,30 Q20,0 30,30 Q20,40 0,30" fill={branchColor} filter="url(#glow)" />
              </g>
            )}
            {dominant === 'cars' && (
              <g transform="translate(155, 120)">
                <rect x="-4" y="-10" width="8" height="60" fill="#242429" />
                <circle cx="0" cy="-10" r="12" fill="none" stroke={branchColor} strokeWidth="4" filter="url(#glow)" className="animate-spin-slow" />
                <circle cx="0" cy="-10" r="4" fill={branchColor} />
              </g>
            )}
          </g>
        )}

        {/* --- LEVEL 4 : LÉGENDE (Ultimate form) --- */}
        {level >= 4 && (
          <g className="animate-float">
            {/* Crown */}
            <path d="M85,35 L92.5,20 L100,35 L107.5,20 L115,35" fill="none" stroke="#fce5a1" strokeWidth="4" filter="url(#glow)" strokeLinecap="round" />
            {/* Pulsing Aura */}
            <circle cx="100" cy="90" r="70" fill="none" stroke="#fce5a1" strokeWidth="0.5" opacity="0.2" className="animate-ping" />
          </g>
        )}
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
