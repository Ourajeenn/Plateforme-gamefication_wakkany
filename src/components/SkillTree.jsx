import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BRANCHES } from '../data/branches';
import SkillNode from './SkillTree/SkillNode';
import SkillTooltip from './SkillTree/SkillTooltip';

// Helper to flatten and index nodes for easy coordinate lookup
const allNodesMap = Object.values(BRANCHES).reduce((acc, branch) => {
  branch.nodes.forEach(node => {
    acc[node.id] = { ...node, branchColor: branch.color };
  });
  return acc;
}, {});

export default function SkillTree({ xp, unlockedSkills, onUnlock, onReset }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [particles, setParticles] = useState([]);
  
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

  // Synthesized Web Audio API sound generator (Futuristic gaming-grade sounds)
  const playSynthSFX = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.012, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'unlock') {
        // Futuristic RPG celestial arpeggio chime
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major chord
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.05 + 0.2);
          gain.gain.setValueAtTime(0.08, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        });
      } else if (type === 'error') {
        // Retro low pitch warning buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'reset') {
        // Wind sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Synth audio error:", e);
    }
  };

  // Particle Physics Animation Loop
  useEffect(() => {
    if (particles.length === 0) return;
    
    let frameId;
    const update = () => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx * 0.1,
          y: p.y + p.vy * 0.1,
          life: p.life - 0.035
        }))
        .filter(p => p.life > 0)
      );
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  const handleHover = (node, branch) => {
    if (!node) setHoveredSkill(null);
    else {
      playSynthSFX('hover');
      setHoveredSkill({ ...node, branchColor: branch.color, branchLabel: branch.label });
    }
  };

  const handleUnlock = (node, branch) => {
    if (!node) {
      playSynthSFX('error');
      return;
    }
    
    playSynthSFX('unlock');
    
    // Spawn 16 high-speed exploding particles
    const newParticles = Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 16 + (Math.random() - 0.5) * 0.2;
      const speed = 1.5 + Math.random() * 3.5;
      return {
        id: Math.random(),
        x: node.x,
        y: node.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: branch.color
      };
    });
    setParticles(prev => [...prev, ...newParticles]);
    onUnlock(node);
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
          onClick={() => { if(window.confirm('Réinitialiser tous vos talents ?')) { playSynthSFX('reset'); onReset(); } }}
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
                  const isLineHovered = hoveredSkill && (node.id === hoveredSkill.id || reqId === hoveredSkill.id);
                  
                  return (
                    <React.Fragment key={`${reqId}-${node.id}`}>
                      {/* Connection Line */}
                      <line 
                        x1={`${reqNode.x}%`} 
                        y1={`${reqNode.y}%`} 
                        x2={`${node.x}%`} 
                        y2={`${node.y}%`} 
                        stroke={isLineHovered ? '#fff' : isLinkActive ? branch.color : isLinkAvailable ? `${branch.color}` : '#3f3f46'}
                        strokeWidth={isLineHovered ? 8 : isLinkActive ? 5 : 3}
                        strokeDasharray={isLinkAvailable && !isLinkActive ? '10,10' : 'none'}
                        opacity={isLineHovered ? 1 : isLinkActive ? 0.9 : isLinkAvailable ? 0.7 : 0.15}
                        filter={isLinkActive || isLineHovered ? "url(#glow)" : "none"}
                        className={`transition-all duration-300 ${isLinkAvailable && !isLinkActive ? 'animate-[dash_3s_linear_infinite]' : ''}`}
                      />
                      {/* Interactive Energy Flow Orb */}
                      {isLinkActive && (
                        <circle r="4" fill="#fff" filter="url(#glow)" opacity="0.8">
                          <animate attributeName="cx" from={`${reqNode.x}%`} to={`${node.x}%`} dur="4s" repeatCount="indefinite" />
                          <animate attributeName="cy" from={`${reqNode.y}%`} to={`${node.y}%`} dur="4s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </React.Fragment>
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
               const isLineHovered = hoveredSkill && (tier0Node.id === hoveredSkill.id);
               
               return (
                 <React.Fragment key={`center-${tier0Node.id}`}>
                   {/* Center Link Line */}
                   <line 
                      x1="50%" 
                      y1="50%" 
                      x2={`${tier0Node.x}%`} 
                      y2={`${tier0Node.y}%`} 
                      stroke={isLineHovered ? '#fff' : isLinkActive ? branch.color : isLinkAvailable ? `${branch.color}` : '#3f3f46'}
                      strokeWidth={isLineHovered ? 8 : isLinkActive ? 5 : 3}
                      strokeDasharray={isLinkAvailable && !isLinkActive ? '10,10' : 'none'}
                      opacity={isLineHovered ? 1 : isLinkActive ? 0.9 : isLinkAvailable ? 0.7 : 0.15}
                      filter={isLinkActive || isLineHovered ? "url(#glow)" : "none"}
                      className={`transition-all duration-300 ${isLinkAvailable && !isLinkActive ? 'animate-[dash_3s_linear_infinite]' : ''}`}
                   />
                   {/* Interactive Energy Flow Orb from Nexus */}
                   {isLinkActive && (
                      <circle r="4" fill="#fff" filter="url(#glow)" opacity="0.8">
                        <animate attributeName="cx" from="50%" to={`${tier0Node.x}%`} dur="4s" repeatCount="indefinite" />
                        <animate attributeName="cy" from="50%" to={`${tier0Node.y}%`} dur="4s" repeatCount="indefinite" />
                      </circle>
                   )}
                 </React.Fragment>
               );
            })}

            {/* Draw active particles */}
            {particles.map(p => (
              <circle 
                key={p.id}
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r={3 * p.life + 1}
                fill={p.color}
                filter="url(#glow)"
                opacity={p.life}
              />
            ))}
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
                  onUnlock={handleUnlock}
                  onHover={handleHover}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <SkillTooltip 
        hoveredSkill={hoveredSkill} 
        checkUnlocked={checkUnlocked} 
        checkAvailable={checkAvailable} 
        allNodesMap={allNodesMap} 
      />
    </div>
  );
}
