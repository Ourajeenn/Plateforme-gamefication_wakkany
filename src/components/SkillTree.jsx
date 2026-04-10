import React, { useState } from 'react';
import { BRANCHES } from '../data/branches';

const SkillNode = ({ node, branch, isUnlocked, isAvailable, onUnlock, onHover }) => {
  const color = branch.color;
  const status = isUnlocked ? 'unlocked' : isAvailable ? 'available' : 'locked';

  return (
    <div 
      className="relative flex flex-col items-center group cursor-pointer"
      onMouseEnter={() => onHover(node, branch)}
      onMouseLeave={() => onHover(null, null)}
      onClick={() => isAvailable && onUnlock(node)}
    >
      {/* Glow Effect for available/unlocked */}
      {(isUnlocked || isAvailable) && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-20 ${isAvailable ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        ></div>
      )}

      {/* Main Node */}
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10 
          ${status === 'unlocked' ? 'bg-zinc-900 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 
            status === 'available' ? 'bg-zinc-950 border-opacity-50 border-dashed animate-pulse' : 
            'bg-zinc-950 border-opacity-20 grayscale opacity-40'}`}
        style={{ borderColor: color }}
      >
        <span className="text-2xl" style={{ filter: isUnlocked ? `drop-shadow(0 0 5px ${color})` : 'none' }}>
          {node.ultimate ? '⭐' : branch.icon}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -top-1 -right-1 bg-zinc-900 border border-white/10 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white/40">
          T{node.tier}
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <p className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isUnlocked ? 'text-white' : 'text-zinc-600'}`}>
          {node.name}
        </p>
        <p className="text-[8px] font-bold text-[#c28e3a] opacity-60">
          {node.xp} XP
        </p>
      </div>

      {/* Connection Line (Downwards) */}
      {!node.ultimate && (
        <div className="h-12 w-[2px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent my-1">
           {isUnlocked && <div className="w-full h-full animate-progress-run" style={{ backgroundColor: color }}></div>}
        </div>
      )}
    </div>
  );
};

export default function SkillTree({ xp, unlockedSkills, onUnlock }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const checkUnlocked = (id) => unlockedSkills.includes(id);
  const checkAvailable = (node) => {
    if (checkUnlocked(node.id)) return false;
    if (xp < node.xp) return false;
    return node.req.every(r => checkUnlocked(r));
  };

  const handleHover = (node, branch) => {
    if (!node) setHoveredSkill(null);
    else setHoveredSkill({ ...node, branchColor: branch.color, branchLabel: branch.label });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-4 relative z-10">
        {Object.values(BRANCHES).map(branch => (
          <div key={branch.id} className="flex flex-col items-center space-y-0">
            {/* Branch Header */}
            <div className="mb-12 text-center">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5 bg-zinc-900/50"
                style={{ boxShadow: `0 0 20px ${branch.color}20` }}
              >
                <span className="text-2xl">{branch.icon}</span>
              </div>
              <h3 className="text-xl font-heading font-black italic tracking-widest uppercase" style={{ color: branch.color }}>
                {branch.label}
              </h3>
              <div className="h-px w-24 mx-auto mt-2 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Nodes */}
            <div className="flex flex-col items-center">
              {branch.nodes.map((node, idx) => (
                <SkillNode 
                  key={node.id}
                  node={node}
                  branch={branch}
                  isUnlocked={checkUnlocked(node.id)}
                  isAvailable={checkAvailable(node)}
                  onUnlock={onUnlock}
                  onHover={handleHover}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Tooltip */}
      {hoveredSkill && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-scale-up">
          <div className="bg-zinc-900/95 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-2xl min-w-[300px] max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-black uppercase text-lg tracking-tighter">{hoveredSkill.name}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: hoveredSkill.branchColor }}>
                  Branche {hoveredSkill.branchLabel} // Tier {hoveredSkill.tier}
                </p>
              </div>
              <div className="bg-zinc-800 px-3 py-1 rounded-lg text-[#c28e3a] font-bold text-xs">
                {hoveredSkill.xp} XP
              </div>
            </div>
            <p className="text-zinc-400 text-sm italic leading-relaxed mb-4">
              "{hoveredSkill.desc}"
            </p>
            {hoveredSkill.req.length > 0 && (
              <div className="flex gap-2 items-center">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase">Prérequis:</span>
                 {hoveredSkill.req.map(r => (
                   <span key={r} className={`text-[9px] font-bold px-2 py-0.5 rounded ${checkUnlocked(r) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                     {r.toUpperCase()}
                   </span>
                 ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-white/5 text-center">
              {checkUnlocked(hoveredSkill.id) ? (
                <span className="text-green-500 font-bold text-[10px] uppercase tracking-widest">Maîtrisé ✓</span>
              ) : checkAvailable(hoveredSkill) ? (
                <span className="text-[#c28e3a] font-bold text-[10px] uppercase tracking-widest animate-pulse">Prêt à être débloqué →</span>
              ) : (
                <span className="text-red-500/50 font-bold text-[10px] uppercase tracking-widest">Verrouillé 🔒</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background SVG Connectors (Refractive links) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
        {/* Placeholder for complex branch connections if needed */}
      </svg>
    </div>
  );
}
