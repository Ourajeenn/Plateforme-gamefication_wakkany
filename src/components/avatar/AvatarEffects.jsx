import React from 'react';
import { BRANCHES } from '../../data/branches';

export default function AvatarEffects({ level, branchColor, dominant, unlockedSkills }) {
  return (
    <>
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
    </>
  );
}
