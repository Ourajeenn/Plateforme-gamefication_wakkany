import React, { useState, useMemo } from 'react';
import { BRANCHES } from '../data/branches';

// Helper to flatten and index nodes for easy coordinate lookup
const allNodesMap = Object.values(BRANCHES).reduce((acc, branch) => {
  branch.nodes.forEach(node => {
    acc[node.id] = { ...node, branchColor: branch.color };
  });
  return acc;
}, {});

const SkillNode = ({ node, branch, isUnlocked, isAvailable, onUnlock, onHover }) => {
  const color = branch.color;
  const status = isUnlocked ? 'unlocked' : isAvailable ? 'available' : 'locked';

  return (
    <div 
      className="absolute flex flex-col items-center justify-center group cursor-pointer -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: isHovered => 10 }}
      onMouseEnter={() => onHover(node, branch)}
      onMouseLeave={() => onHover(null, null)}
      onClick={() => isAvailable && onUnlock(node)}
    >
      {/* Glow Effect for available/unlocked */}
      {(isUnlocked || isAvailable) && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isAvailable ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        ></div>
      )}

      {/* Main Node */}
      <div 
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10 
          ${status === 'unlocked' ? 'bg-zinc-900 border-opacity-100 shadow-[0_0_20px_rgba(0,0,0,0.8)] scale-110' : 
            status === 'available' ? 'bg-zinc-950 border-opacity-80 border-dashed animate-pulse scale-100' : 
            'bg-zinc-950 border-opacity-20 grayscale opacity-50 scale-90'}`}
        style={{ borderColor: color }}
      >
        <span className="text-xl md:text-2xl" style={{ filter: isUnlocked ? `drop-shadow(0 0 5px ${color})` : 'none' }}>
          {node.ultimate ? '⭐' : branch.icon}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -top-1 -right-1 bg-black border border-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white/70">
          T{node.tier}
        </div>
      </div>
    </div>
  );
};

export default function SkillTree({ xp, unlockedSkills, onUnlock }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const checkUnlocked = (id) => unlockedSkills.includes(id);
  const checkAvailable = (node) => {
    if (checkUnlocked(node.id)) return false;
    if (xp < node.xp) return false;
    if (node.req.length === 0) return true;
    return node.req.some(r => checkUnlocked(r)); // Changed to "some" to allow branching logic flexibility, but strict logic is "every"
  };

  const handleHover = (node, branch) => {
    if (!node) setHoveredSkill(null);
    else setHoveredSkill({ ...node, branchColor: branch.color, branchLabel: branch.label });
  };

  return (
    <div className="w-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-black rounded-3xl border border-white/5 py-10">
      
      {/* Scrollable Container for Mobile/Desktop */}
      <div className="w-full overflow-auto flex justify-center items-center min-h-[600px] md:min-h-[800px] scrollbar-hide">
        
        {/* Absolute Coordinate Grid */}
        <div className="relative w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] shrink-0">
          
          {/* Central Nexus Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10 bg-black flex flex-col items-center justify-center z-0 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
             <span className="text-3xl animate-pulse">🌌</span>
             <span className="text-[10px] font-heading font-black text-white/30 uppercase mt-2">NEXUS</span>
          </div>

          {/* SVG Connection Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
               <filter id="lineGlow">
                 <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                 <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
                 </feMerge>
               </filter>
            </defs>
            {Object.values(BRANCHES).flatMap(branch => 
              branch.nodes.flatMap(node => 
                node.req.map(reqId => {
                  const reqNode = allNodesMap[reqId];
                  if (!reqNode) return null;
                  
                  const isLinkActive = checkUnlocked(node.id) && checkUnlocked(reqId);
                  const isLinkAvailable = checkAvailable(node) && checkUnlocked(reqId);
                  
                  return (
                    <line 
                      key={`${reqId}-${node.id}`}
                      x1={`${reqNode.x}%`} 
                      y1={`${reqNode.y}%`} 
                      x2={`${node.x}%`} 
                      y2={`${node.y}%`} 
                      stroke={isLinkActive ? branch.color : isLinkAvailable ? `${branch.color}66` : '#3f3f46'}
                      strokeWidth={isLinkActive ? 4 : 2}
                      strokeDasharray={isLinkAvailable && !isLinkActive ? '5,5' : 'none'}
                      opacity={isLinkActive ? 0.8 : isLinkAvailable ? 0.6 : 0.2}
                      filter={isLinkActive ? "url(#lineGlow)" : "none"}
                      className={isLinkAvailable && !isLinkActive ? 'animate-pulse' : ''}
                    />
                  );
                })
              )
            )}
            
            {/* Draw lines from center to tier 0 nodes */}
            {Object.values(BRANCHES).map(branch => {
               const tier0Node = branch.nodes.find(n => n.tier === 0);
               if(!tier0Node) return null;
               const isLinkActive = checkUnlocked(tier0Node.id);
               const isLinkAvailable = checkAvailable(tier0Node);
               return (
                 <line 
                    key={`center-${tier0Node.id}`}
                    x1="50%" 
                    y1="50%" 
                    x2={`${tier0Node.x}%`} 
                    y2={`${tier0Node.y}%`} 
                    stroke={isLinkActive ? branch.color : isLinkAvailable ? `${branch.color}66` : '#3f3f46'}
                    strokeWidth={isLinkActive ? 4 : 2}
                    opacity={isLinkActive ? 0.8 : isLinkAvailable ? 0.6 : 0.2}
                    filter={isLinkActive ? "url(#lineGlow)" : "none"}
                 />
               );
            })}
          </svg>

          {/* Render All Nodes */}
          {Object.values(BRANCHES).map(branch => (
            <React.Fragment key={branch.id}>
              {branch.nodes.map(node => (
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
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredSkill && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-scale-up pointer-events-none">
          <div className="bg-black/90 border border-white/20 p-6 rounded-2xl backdrop-blur-xl shadow-2xl min-w-[320px] max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-black uppercase text-xl tracking-tighter">{hoveredSkill.name}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: hoveredSkill.branchColor }}>
                  {hoveredSkill.branchLabel} // TIER {hoveredSkill.tier}
                </p>
              </div>
              <div className="bg-zinc-900 border border-white/10 px-3 py-1 rounded-lg text-[#c28e3a] font-black text-xs shadow-inner">
                {hoveredSkill.xp} XP
              </div>
            </div>
            <p className="text-zinc-400 text-sm italic leading-relaxed mb-4 font-monda">
              "{hoveredSkill.desc}"
            </p>
            {hoveredSkill.req.length > 0 && (
              <div className="flex gap-2 items-center">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Lien Neural:</span>
                 {hoveredSkill.req.map(r => {
                   const rNode = allNodesMap[r];
                   return (
                     <span key={r} className={`text-[9px] font-bold px-2 py-0.5 rounded ${checkUnlocked(r) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                       {rNode ? rNode.name.toUpperCase() : r.toUpperCase()}
                     </span>
                   )
                 })}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              {checkUnlocked(hoveredSkill.id) ? (
                <span className="text-green-500 font-bold text-xs uppercase tracking-[0.2em]">Synchronisé ✓</span>
              ) : checkAvailable(hoveredSkill) ? (
                <span className="text-[#c28e3a] font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Prêt à l'extraction →</span>
              ) : (
                <span className="text-red-500/50 font-bold text-xs uppercase tracking-[0.2em]">Données Verrouillées 🔒</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
