import React from 'react';
import { getLevel } from '../data/levels';
import { getDominantBranch } from '../utils/xpHelpers';
import { BRANCHES } from '../data/branches';

export default function Avatar({ xp, unlockedSkills = [] }) {
    const levelData = getLevel(xp);
    const level = levelData.level;
    const dominant = getDominantBranch(unlockedSkills);
    const branchColor = dominant ? BRANCHES[dominant].color : '#c28e3a';

    // Dynamic glow based on level and branch
    const glowType = level >= 4 ? 'crown-glow' : level >= 3 ? 'full-aura' : '';

    return (
        <div className="relative w-48 h-48 mx-auto group">
            {/* Background Aura */}
            {level >= 3 && (
                <div
                    className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse`}
                    style={{ backgroundColor: branchColor }}
                ></div>
            )}

            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-2xl">
                <defs>
                    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={branchColor} stopOpacity="1" />
                        <stop offset="100%" stopColor={branchColor} stopOpacity="0" />
                    </radialGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* --- BASE BODY (Level 0+) --- */}
                <g className="transition-all duration-700">
                    {/* Head */}
                    <circle cx="100" cy="65" r="35" fill="#1a1a1a" stroke={level >= 2 ? branchColor : "#333"} strokeWidth="2" />

                    {/* Body */}
                    <path d="M60,180 Q100,100 140,180" fill="#1a1a1a" stroke={level >= 2 ? branchColor : "#333"} strokeWidth="2" />

                    {/* Eyes - Glow based on level */}
                    <g fill={level >= 2 ? branchColor : "white"} opacity={level >= 1 ? 1 : 0.4}>
                        <circle cx="85" cy="60" r="4" />
                        <circle cx="115" cy="60" r="4" />
                        {level >= 3 && (
                            <g filter="url(#glow)">
                                <circle cx="85" cy="60" r="6" fill={branchColor} fillOpacity="0.3" />
                                <circle cx="115" cy="60" r="6" fill={branchColor} fillOpacity="0.3" />
                            </g>
                        )}
                    </g>
                </g>

                {/* --- ARMOR (Level 1+) --- */}
                {level >= 1 && (
                    <g className="animate-fade-in">
                        {/* Shoulder Pads */}
                        <path d="M55,110 Q40,100 50,85 L70,95 Z" fill="#2a2a2a" stroke={branchColor} strokeWidth="1" />
                        <path d="M145,110 Q160,100 150,85 L130,95 Z" fill="#2a2a2a" stroke={branchColor} strokeWidth="1" />

                        {/* Chest Plate */}
                        <path d="M85,105 L115,105 L110,135 L90,135 Z" fill="#2a2a2a" stroke={branchColor} strokeWidth="1" />
                    </g>
                )}

                {/* --- VETERAN GEAR (Level 2+) --- */}
                {level >= 2 && (
                    <g className="animate-fade-in">
                        {/* Helmet Detail */}
                        <path d="M75,45 Q100,25 125,45" fill="none" stroke={branchColor} strokeWidth="3" />
                    </g>
                )}

                {/* --- CHAMPION EFFECTS (Level 3+) --- */}
                {level >= 3 && (
                    <g className="animate-fade-in">
                        {/* Dominant Branch Weapon/Tool */}
                        {dominant === 'sustain' && (
                            <path d="M150,140 L180,90" stroke={branchColor} strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
                        )}
                        {dominant === 'burst' && (
                            <circle cx="170" cy="100" r="12" fill="none" stroke={branchColor} strokeWidth="2" filter="url(#glow)" className="animate-pulse" />
                        )}
                        {dominant === 'control' && (
                            <path d="M150,140 Q170,140 180,180" fill="none" stroke={branchColor} strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
                        )}
                    </g>
                )}

                {/* --- LEGEND (Level 4) --- */}
                {level >= 4 && (
                    <g className="animate-bounce-slow">
                        {/* Crown */}
                        <path d="M80,30 L90,15 L100,30 L110,15 L120,30" fill="none" stroke="#fce5a1" strokeWidth="3" filter="url(#glow)" />
                    </g>
                )}
            </svg>

            {/* Level Badge Overlay */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 px-4 py-1 rounded-full backdrop-blur-md">
                <span className={`${levelData.color} text-[10px] font-bold uppercase tracking-widest`}>
                    {levelData.name} <span className="text-white opacity-40 ml-1">LVL {level}</span>
                </span>
            </div>
        </div>
    );
}
