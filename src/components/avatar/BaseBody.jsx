import React from 'react';
import { BRANCHES } from '../../data/branches';

export default function BaseBody({ level, branchColor, unlockedSkills }) {
  return (
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
  );
}
