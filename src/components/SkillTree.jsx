import React, { useState, useMemo, useRef, useEffect } from 'react';
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
      style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 10 }}
      onMouseEnter={() => onHover(node, branch)}
      onMouseLeave={() => onHover(null, null)}
      onClick={() => isAvailable && onUnlock(node)}
    >
      {/* Outer Ring Effect */}
      <div className={`absolute inset-0 rounded-full border border-dashed transition-all duration-[2s] ${status === 'unlocked' ? 'border-white/40 rotate-180 scale-[1.3]' : status === 'available' ? 'border-white/20 animate-[spin_10s_linear_infinite] scale-125' : 'border-transparent scale-100'}`}></div>

      {/* Glow Effect */}
      {(isUnlocked || isAvailable) && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isAvailable ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        ></div>
      )}

      {/* Main Node */}
      <div 
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 relative z-10 
          ${status === 'unlocked' ? 'bg-zinc-900 border-opacity-100 shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(0,0,0,0.8)] scale-110' : 
            status === 'available' ? 'bg-zinc-950 border-opacity-80 border-dashed animate-pulse scale-100' : 
            'bg-zinc-950 border-opacity-20 grayscale opacity-50 scale-90'}`}
        style={{ borderColor: color }}
      >
        {/* Inner dark circle for depth */}
        <div className="absolute inset-1 rounded-full bg-black/60 pointer-events-none"></div>

        <span className="text-xl md:text-2xl relative z-10" style={{ filter: isUnlocked ? `drop-shadow(0 0 5px ${color})` : 'none' }}>
          {node.ultimate ? '⭐' : branch.icon}
        </span>
        
        {/* Tier Indicator */}
        <div className="absolute -bottom-2 right-0 bg-black border border-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white/70 shadow-xl">
          {node.tier}
        </div>
      </div>
    </div>
  );
};export default function SkillTree({ xp, unlockedSkills, onUnlock, onReset }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  // Panning State
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Zoom State
  const [zoom, setZoom] = useState(1); // Range: 0.5 to 2.0

  const checkUnlocked = (id) => unlockedSkills.includes(id);
  const checkAvailable = (node) => {
    if (checkUnlocked(node.id)) return false;
    if (xp < node.xp) return false;
    if (node.req.length === 0) return true;
    return node.req.every(r => checkUnlocked(r));
  };

  const handleHover = (node, branch) => {
    if (!node) setHoveredSkill(null);
    else setHoveredSkill({ ...node, branchColor: branch.color, branchLabel: branch.label });
  };

  const centerTree = () => {
    if (scrollRef.current) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = scrollRef.current;
      scrollRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
      scrollRef.current.scrollTop = (scrollHeight - clientHeight) / 2;
    }
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
    }
  };

  useEffect(() => {
    centerTree();
  }, []);

  // Panning Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const y = e.pageY - scrollRef.current.offsetTop;
    const walkX = (x - startX) * 1.5; 
    const walkY = (y - startY) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walkX;
    scrollRef.current.scrollTop = scrollTop - walkY;
  };

  return (
    <div className="relative w-full h-[700px] md:h-[850px] bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl group/tree" onWheel={handleWheel}>
      {/* Zoom / Stats Overlay */}
      <div className="absolute top-6 left-6 z-[80] flex flex-col gap-3">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
           <div className="flex flex-col">
             <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Grossissement</span>
             <span className="text-white font-heading font-bold italic">{(zoom * 100).toFixed(0)}%</span>
           </div>
           <div className="flex gap-2">
             <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))} className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
               <iconify-icon icon="lucide:minus" width="14"></iconify-icon>
             </button>
             <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))} className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors">
               <iconify-icon icon="lucide:plus" width="14"></iconify-icon>
             </button>
           </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-6 right-6 z-[80] flex gap-3">
        <button 
          onClick={centerTree}
          className="bg-black/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#c28e3a] hover:text-black transition-all flex items-center gap-2"
        >
          <iconify-icon icon="lucide:target" width="16"></iconify-icon>
          Recentrer
        </button>
        <button 
          onClick={() => { if(window.confirm('Réinitialiser tous vos talents ?')) onReset(); }}
          className="bg-black/80 backdrop-blur-md border border-red-500/20 px-6 py-3 rounded-xl text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <iconify-icon icon="lucide:refresh-cw" width="16"></iconify-icon>
          Reset
        </button>
      </div>

      {/* Scrollable Panning Container */}
      <div 
        ref={scrollRef}
        className={`w-full h-full overflow-hidden relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        
        {/* Absolute Coordinate Grid */}
        <div 
          className="relative min-w-[2000px] min-h-[2000px] bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Animated Background Grids */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          {/* Central Nexus Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center z-0">
             <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800 animate-[spin_30s_linear_infinite]"></div>
             <div className="absolute inset-6 rounded-full border border-zinc-900 border-t-[#c28e3a]/40 animate-spin-slow"></div>
             <div className="absolute inset-12 rounded-full bg-zinc-950 flex flex-col items-center justify-center border border-white/5 shadow-[0_0_100px_rgba(194,142,58,0.1)]">
                <span className="text-5xl animate-pulse filter drop-shadow-[0_0_15px_rgba(194,142,58,0.5)]">🌌</span>
                <span className="text-[9px] font-heading font-black text-zinc-600 uppercase mt-2 tracking-[0.5em]">Nexus Core</span>
             </div>
          </div>

          {/* SVG Connection Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
               <filter id="glow">
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
                      stroke={isLinkActive ? branch.color : isLinkAvailable ? `${branch.color}` : '#3f3f46'}
                      strokeWidth={isLinkActive ? 6 : 3}
                      strokeDasharray={isLinkAvailable && !isLinkActive ? '10,10' : 'none'}
                      opacity={isLinkActive ? 1 : isLinkAvailable ? 0.8 : 0.2}
                      filter={isLinkActive ? "url(#glow)" : "none"}
                      className={isLinkAvailable && !isLinkActive ? 'animate-[dash_3s_linear_infinite]' : ''}
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
                    stroke={isLinkActive ? branch.color : isLinkAvailable ? `${branch.color}` : '#3f3f46'}
                    strokeWidth={isLinkActive ? 6 : 3}
                    strokeDasharray={isLinkAvailable && !isLinkActive ? '10,10' : 'none'}
                    opacity={isLinkActive ? 1 : isLinkAvailable ? 0.8 : 0.2}
                    filter={isLinkActive ? "url(#glow)" : "none"}
                    className={isLinkAvailable && !isLinkActive ? 'animate-[dash_3s_linear_infinite]' : ''}
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
          <div className="bg-black/95 border border-white/20 p-6 rounded-3xl backdrop-blur-2xl shadow-2xl min-w-[340px] max-w-md" style={{ boxShadow: `0 20px 50px ${hoveredSkill.branchColor}20` }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-black uppercase text-xl tracking-tighter" style={{ textShadow: `0 0 10px ${hoveredSkill.branchColor}50` }}>{hoveredSkill.name}</h4>
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
                     <span key={r} className={`text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 ${checkUnlocked(r) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                       {rNode ? rNode.name.toUpperCase() : r.toUpperCase()}
                     </span>
                   )
                 })}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              {checkUnlocked(hoveredSkill.id) ? (
                <span className="text-green-500 font-black text-[10px] uppercase tracking-[0.3em]">Synchronisé ✓</span>
              ) : checkAvailable(hoveredSkill) ? (
                <span className="text-[#c28e3a] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Prêt à l'extraction →</span>
              ) : (
                <span className="text-red-500/50 font-black text-[10px] uppercase tracking-[0.3em]">Données Verrouillées 🔒</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
