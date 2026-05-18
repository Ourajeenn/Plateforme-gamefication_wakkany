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
  
  // Jokers & Help state for family gaming
  const [jokers, setJokers] = useState(() => {
    const saved = localStorage.getItem('wakkany_jokers');
    return saved !== null ? parseInt(saved, 10) : 2;
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [activeHelpRequest, setActiveHelpRequest] = useState(false);
  const [helpCountdown, setHelpCountdown] = useState(3);
  const [helpSender, setHelpSender] = useState('');

  useEffect(() => {
    localStorage.setItem('wakkany_jokers', jokers);
  }, [jokers]);

  // Panning State
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Zoom State
  const [zoom, setZoom] = useState(1); // Range: 0.5 to 2.0

  const checkUnlocked = (id) => id === 'root' || unlockedSkills.includes(id);
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
    
    // Check if available normally
    if (checkAvailable(node)) {
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
    } else {
      // Locked click - Open Help & Joker Modal!
      playSynthSFX('hover');
      setSelectedNode(node);
      setSelectedBranch(branch);
    }
  };

  const handleUseJoker = () => {
    if (jokers <= 0 || !selectedNode || !selectedBranch) {
      playSynthSFX('error');
      return;
    }
    
    // Consume Joker
    setJokers(prev => prev - 1);
    playSynthSFX('unlock');
    
    // Spawn epic purple particles at the node
    const newParticles = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 24 + (Math.random() - 0.5) * 0.2;
      const speed = 2.0 + Math.random() * 5.0;
      return {
        id: Math.random(),
        x: selectedNode.x,
        y: selectedNode.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.2,
        color: '#a855f7' // Intense purple joker color!
      };
    });
    setParticles(prev => [...prev, ...newParticles]);
    
    // Unlock and close
    onUnlock(selectedNode); 
    setSelectedNode(null);
    setSelectedBranch(null);
  };

  const handleDemandeAide = () => {
    if (activeHelpRequest || !selectedNode || !selectedBranch) return;
    
    setActiveHelpRequest(true);
    setHelpCountdown(3);
    
    const senders = ["Papa", "Maman", "Grand-Frère", "Grande-Sœur"];
    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    setHelpSender(randomSender);
    
    playSynthSFX('hover');
    
    // Count down interval
    const interval = setInterval(() => {
      setHelpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          
          // Complete the unlock!
          playSynthSFX('unlock');
          const newParticles = Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 24 + (Math.random() - 0.5) * 0.2;
            const speed = 2.0 + Math.random() * 4.5;
            return {
              id: Math.random(),
              x: selectedNode.x,
              y: selectedNode.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.2,
              color: '#34c759' // Family green color!
            };
          });
          setParticles(prev => [...prev, ...newParticles]);
          
          onUnlock(selectedNode);
          
          // Show completion state for 1.5 seconds, then close modal
          setTimeout(() => {
            setActiveHelpRequest(false);
            setSelectedNode(null);
            setSelectedBranch(null);
          }, 1500);
          
          return 0;
        }
        playSynthSFX('hover');
        return prev - 1;
      });
    }, 1000);
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
    <div className="relative w-full h-[700px] md:h-[800px] group/tree">
      {/* Top Header Indicators (Borderless, Sleek glassmorphism) */}
      <div className="absolute top-6 left-6 right-6 z-[80] flex justify-between items-center pointer-events-none">
        
        {/* Left Side: Clan Info & Jokers */}
        <div className="flex gap-4 items-center pointer-events-auto">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5">
            <span className="text-xl">🃏</span>
            <div className="flex flex-col">
              <span className="text-[8px] text-purple-400 font-black uppercase tracking-widest">JOKERS DISPONIBLES</span>
              <span className="text-white font-heading font-black text-xs">{jokers} RESTANT{jokers > 1 ? 'S' : ''}</span>
            </div>
            {jokers < 2 && (
              <button 
                onClick={() => { setJokers(2); playSynthSFX('unlock'); }}
                className="text-[8px] text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded hover:bg-purple-500/20 transition-all font-bold cursor-pointer ml-2"
              >
                RECHARGER
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Sleek Reset Link */}
        <div className="pointer-events-auto">
          <button 
            onClick={() => { if(window.confirm('Réinitialiser tous vos talents ?')) { playSynthSFX('reset'); onReset(); } }}
            className="bg-black/50 backdrop-blur-md border border-red-500/10 px-5 py-2.5 rounded-xl text-red-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 font-black uppercase text-[9px] tracking-[0.2em] transition-all flex items-center gap-2"
          >
            <iconify-icon icon="lucide:refresh-cw" width="12"></iconify-icon>
            Réinitialiser l'Arbre
          </button>
        </div>
      </div>

      {/* Main Coordinate Grid (Fully transparent, floating on the page) */}
      <div className="w-full h-full relative transition-all duration-500 animate-fade-in">
        {/* Animated Grid Dots Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Branch Section Title Labels */}
        <div className="absolute left-[12%] top-[20%] -translate-y-1/2 pointer-events-none select-none z-10">
           <span className="text-[10px] font-heading font-black tracking-[0.3em] text-[#ff5a1f] filter drop-shadow-[0_0_8px_rgba(255,90,31,0.5)]">CLAN DES HÉROS</span>
        </div>
        <div className="absolute left-[12%] top-[50%] -translate-y-1/2 pointer-events-none select-none z-10">
           <span className="text-[10px] font-heading font-black tracking-[0.3em] text-[#c28e3a] filter drop-shadow-[0_0_8px_rgba(194,142,58,0.5)]">CLAN DES GUERRIERS</span>
        </div>
        <div className="absolute left-[12%] top-[80%] -translate-y-1/2 pointer-events-none select-none z-10">
           <span className="text-[10px] font-heading font-black tracking-[0.3em] text-[#34c759] filter drop-shadow-[0_0_8px_rgba(52,199,89,0.5)]">CLAN DES PRIMITIFS</span>
        </div>

        {/* SVG Connection Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
             <filter id="glow">
               <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
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
                const lineColor = node.isSpecialColor || branch.color;

                const x1 = reqNode.x;
                const y1 = reqNode.y;
                const x2 = node.x;
                const y2 = node.y;

                // Draw elegant cubic bezier curves for curved organic linkages
                const pathData = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

                return (
                  <React.Fragment key={`${reqId}-${node.id}`}>
                    {/* Connection Curved Path */}
                    <path 
                      d={pathData}
                      fill="none"
                      stroke={isLineHovered ? '#fff' : isLinkActive ? lineColor : isLinkAvailable ? `${lineColor}` : '#27272a'}
                      strokeWidth={isLineHovered ? 0.6 : isLinkActive ? 0.4 : 0.2}
                      strokeDasharray={isLinkAvailable && !isLinkActive ? '1,1' : 'none'}
                      opacity={isLineHovered ? 1 : isLinkActive ? 0.95 : isLinkAvailable ? 0.7 : 0.1}
                      filter={isLinkActive || isLineHovered ? "url(#glow)" : "none"}
                      className="transition-all duration-300"
                    />
                    {/* Interactive Energy Flow Orb along the bezier path */}
                    {isLinkActive && (
                      <circle r="0.3" fill="#fff" filter="url(#glow)" opacity="0.9">
                        <animateMotion 
                          path={pathData} 
                          dur="4s" 
                          repeatCount="indefinite" 
                        />
                      </circle>
                    )}
                  </React.Fragment>
                );
              })
            )
          )}

          {/* Draw active particles */}
          {particles.map(p => (
            <circle 
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={(3 * p.life + 1) * 0.08}
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

      <SkillTooltip 
        hoveredSkill={hoveredSkill} 
        checkUnlocked={checkUnlocked} 
        checkAvailable={checkAvailable} 
        allNodesMap={allNodesMap} 
      />

      {/* Holographic Family / Joker Action Modal */}
      {selectedNode && selectedBranch && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-[90] flex items-center justify-center animate-fade-in p-6">
          <div className="bg-zinc-950 border border-purple-500/30 rounded-[32px] p-8 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)]">
            
            {/* Holographic scanner line inside modal */}
            <div className="absolute inset-x-0 h-0.5 bg-purple-500/30 shadow-[0_0_10px_#a855f7] animate-[scanLine_4s_linear_infinite] pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] text-purple-400 font-black uppercase tracking-[0.3em] block">🛡️ SYSTEM MULTI-COGNITIF</span>
                <h3 className="text-white text-2xl font-heading font-black uppercase tracking-wide mt-1">
                  TALENT VERROUILLÉ
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedNode(null); setSelectedBranch(null); }}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                disabled={activeHelpRequest}
              >
                <iconify-icon icon="lucide:x" width="24"></iconify-icon>
              </button>
            </div>

            {/* Node Info Box */}
            <div className="bg-black/50 border border-purple-500/10 p-5 rounded-2xl mb-6 relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-xl" style={{ backgroundColor: `${selectedBranch.color}15`, borderColor: `${selectedBranch.color}30`, color: selectedBranch.color }}>
                  {selectedBranch.icon}
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-wider text-sm">{selectedNode.name}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500" style={{ color: selectedBranch.color }}>
                    {selectedBranch.label} // TIER {selectedNode.tier}
                  </span>
                </div>
              </div>
              <p className="text-zinc-400 text-xs italic font-monda leading-relaxed">
                "{selectedNode.desc}"
              </p>
              <div className="mt-4 flex gap-3 text-[10px] font-bold text-zinc-500">
                <span>REQUIS: {selectedNode.xp} XP</span>
                {selectedNode.req.length > 0 && (
                  <span className="text-red-400">🔒 LIEN NEURAL REQUIS</span>
                )}
              </div>
            </div>

            {/* Help Request Loader Overlay */}
            {activeHelpRequest ? (
              <div className="py-6 flex flex-col items-center justify-center text-center animate-fade-in">
                {helpCountdown > 0 ? (
                  <>
                    <div className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400 animate-pulse">TRANSMISSION DU SIGNAL MEUTE...</span>
                    <p className="text-zinc-500 text-xs mt-2 font-monda">
                      Demande d'aide envoyée. Attente de validation familiale dans <span className="text-purple-400 font-bold">{helpCountdown}s</span>...
                    </p>
                  </>
                ) : (
                  <div className="animate-scale-up">
                    <iconify-icon icon="lucide:check-circle-2" width="48" className="text-green-400 mb-4 animate-bounce"></iconify-icon>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400">SIGNAL APPROUVÉ PAR LA MEUTE !</span>
                    <p className="text-zinc-300 text-xs mt-2 font-bold font-monda">
                      🔑 <span className="text-green-400 font-black">{helpSender}</span> a validé votre accès au talent !
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-zinc-500 text-[11px] leading-relaxed text-center font-monda italic mb-2">
                  "Dans le jeu en famille, contournez les exigences en utilisant un Joker ou en appelant la Meute à l'aide."
                </p>

                {/* Button 1: Joker */}
                <button
                  onClick={handleUseJoker}
                  disabled={jokers <= 0}
                  className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 font-heading font-black text-xs uppercase tracking-widest transition-all duration-300
                    ${jokers > 0 
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-500 hover:text-black cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                >
                  <span>🃏</span>
                  <span>Utiliser un Joker (Jokers : {jokers})</span>
                </button>

                {/* Button 2: Ask Family for Help */}
                <button
                  onClick={handleDemandeAide}
                  className="w-full py-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded-xl flex items-center justify-center gap-3 font-heading font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(52,199,89,0.2)]"
                >
                  <span>👥</span>
                  <span>Demander de l'aide à la Famille</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
