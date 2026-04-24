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
          
          {/* Base Circuitry (Level 0+) */}
          <g opacity="0.2" stroke="#fff" strokeWidth="0.5" fill="none">
             <path d="M100,80 L100,110 M85,130 L115,130" />
             <circle cx="100" cy="130" r="15" strokeDasharray="2,4" />
          </g>

          {/* Central Core (Pulsing) */}
          <circle cx="100" cy="130" r="4" fill={branchColor} filter="url(#glow)" className="animate-pulse" />

          {/* SKILL: d2 (Peau Écailleuse) - Scale pattern overlay */}
          {unlockedSkills.includes('d2') && (
            <path d="M70,170 Q100,120 130,170" fill="none" stroke={BRANCHES.dinos.color} strokeWidth="2" strokeDasharray="2,4" opacity="0.3" />
          )}

          {/* Head */}
          <circle cx="100" cy="70" r="32" fill="url(#bodyGradient)" stroke="#1a1a22" strokeWidth="2" />
          
          {/* SKILL: w2 (Rage de Kratos) - War paint */}
          {unlockedSkills.includes('w2') && (
            <path d="M85,50 Q100,60 115,50" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          )}

          {/* Eyes */}
          <g transform="translate(100, 70)">
             <circle cx="-12" cy="-2" r="3" fill={level >= 2 ? branchColor : "#fff"} opacity={level >= 2 ? 1 : 0.4} filter={level >= 3 ? "url(#glow)" : ""} />
             <circle cx="12" cy="-2" r="3" fill={level >= 2 ? branchColor : "#fff"} opacity={level >= 2 ? 1 : 0.4} filter={level >= 3 ? "url(#glow)" : ""} />
          </g>
        </g>

        {/* --- LEVEL 1 : CHASSEUR (Armor Pieces & Simple Shield) --- */}
        {level >= 1 && (
          <g className="animate-fade-in transition-all">
            {/* Chest armor */}
            <path d="M85,115 L115,115 L108,145 L92,145 Z" fill="#242429" stroke={branchColor} strokeWidth="1" strokeOpacity="0.5" />
            {/* Arm guards */}
            <rect x="62" y="140" width="10" height="25" rx="2" fill="#242429" stroke={branchColor} strokeWidth="0.5" />
            <rect x="128" y="140" width="10" height="25" rx="2" fill="#242429" stroke={branchColor} strokeWidth="0.5" />
            
            {/* Shield Level 1: Simple Buckler */}
            <g transform="translate(45, 150)">
               <circle r="12" fill="#1a1a22" stroke={branchColor} strokeWidth="2" />
               <circle r="4" fill="none" stroke={branchColor} strokeWidth="1" opacity="0.4" />
            </g>
          </g>
        )}

        {/* --- SKILL EFFECTS : h2 (Speed) & c2 (Jets) --- */}
        {unlockedSkills.includes('h2') && (
           <g stroke="#3b82f6" strokeWidth="2" fill="none" className="animate-pulse">
             <path d="M60,185 L50,195 M140,185 L150,195" />
             <path d="M70,188 L65,198 M130,188 L135,198" />
           </g>
        )}
        {unlockedSkills.includes('c2') && (
           <g stroke="#007aff" strokeWidth="2" fill="none" opacity="0.6">
             <path d="M50,110 L30,100 M150,110 L170,100" className="animate-ping" />
           </g>
        )}

        {/* --- LEVEL 2 : VÉTÉRAN (Helmet, Shoulders & Reinforced Shield) --- */}
        {level >= 2 && (
          <g className="animate-fade-in">
            {/* Shoulder pads */}
            <path d="M50,110 Q40,90 65,95" fill="none" stroke={branchColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M150,110 Q160,90 135,95" fill="none" stroke={branchColor} strokeWidth="4" strokeLinecap="round" />
            {/* Helmet top */}
            <path d="M80,45 Q100,25 120,45" fill="none" stroke={branchColor} strokeWidth="2" />
            
            {/* Shield Level 2: Reinforced Hex Shield */}
            <g transform="translate(45, 150)">
               <path d="M0,-18 L15.5,-9 L15.5,9 L0,18 L-15.5,9 L-15.5,-9 Z" fill="#242429" stroke={branchColor} strokeWidth="2" />
               <path d="M0,-10 L8.6,-5 L8.6,5 L0,10 L-8.6,5 L-8.6,-5 Z" fill="none" stroke={branchColor} strokeWidth="1" opacity="0.3" />
            </g>
          </g>
        )}

        {/* --- LEVEL 3 : CHAMPION (Full Set + Branch Weapon & Heavy Shield) --- */}
        {level >= 3 && (
          <g className="animate-fade-in">
            {/* Aura effects */}
            <circle cx="100" cy="70" r="40" fill="none" stroke={branchColor} strokeWidth="1" strokeDasharray="4 8" className="animate-spin-slow" opacity="0.3" />
            
            {/* Shield Level 3: Large Kite Shield with Pattern */}
            <g transform="translate(45, 150)">
               <path d="M-20,-20 L20,-20 L20,5 Q20,25 0,40 Q-20,25 -20,5 Z" fill="#1a1a22" stroke={branchColor} strokeWidth="2" filter="url(#glow)" />
               {/* Pattern */}
               <path d="M0,-10 L0,20 M-10,0 L10,0" stroke={branchColor} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
            </g>

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

        {/* --- LEVEL 4 : LÉGENDE (Ultimate form & Divine Shield) --- */}
        {level >= 4 && (
          <g className="animate-float">
            {/* Crown */}
            <path d="M85,35 L92.5,20 L100,35 L107.5,20 L115,35" fill="none" stroke="#fce5a1" strokeWidth="4" filter="url(#glow)" strokeLinecap="round" />
            
            {/* Shield Level 4: Divine Radiating Shield */}
            <g transform="translate(45, 150)">
               <circle r="25" fill="none" stroke="#fce5a1" strokeWidth="1" opacity="0.3" className="animate-pulse" />
               <path d="M0,-25 L21.6,-12.5 L21.6,12.5 L0,25 L-21.6,12.5 L-21.6,-12.5 Z" fill="#242429" stroke="#fce5a1" strokeWidth="3" filter="url(#glow)" />
               <circle r="8" fill="#fce5a1" filter="url(#glow)" className="animate-pulse" />
            </g>

            {/* Pulsing Aura */}
            <circle cx="100" cy="90" r="70" fill="none" stroke="#fce5a1" strokeWidth="0.5" opacity="0.2" className="animate-ping" />
          </g>
        )}

        {/* --- SKILL: Ultimate Glow --- */}
        {unlockedSkills.some(id => BRANCHES.heroes.nodes.find(n => n.id === id)?.ultimate) && (
           <circle cx="100" cy="90" r="85" fill="none" stroke="#fff" strokeWidth="1" opacity="0.1" className="animate-pulse" />
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
