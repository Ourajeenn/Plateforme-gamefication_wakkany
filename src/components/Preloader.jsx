import React, { useEffect, useState } from 'react';

const TIPS = [
  "Le Mode Meute permet de jouer en famille et d'accumuler de l'XP collective.",
  "Demandez de l'aide à la famille pour déverrouiller instantanément des talents.",
  "Utilisez un Joker pour contourner n'importe quel verrouillage d'arbre !",
  "La Faille Temporelle offre des récompenses d'XP doublées une fois par jour."
];

const SYSTEM_LOGS = [
  "[SYSTEM] INITIALIZING CHRONOS COGNITIVE LINK...",
  "[SYSTEM] ESTABLISHING MULTIVERSE SECURE CHANNEL...",
  "[SYSTEM] VERIFYING HUNTER SIGNATURE: SECURE (100%)",
  "[SYSTEM] SYNCING ACADEMY LEARNING BRANCHES...",
  "[SYSTEM] LOADING SKILL TREE NEURAL INTERFACE...",
  "[SYSTEM] ALL CORES ONLINE. CHRONOS PORTAL STABLE."
];

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [activeLogs, setActiveLogs] = useState([]);

  useEffect(() => {
    // Masquer la scrollbar globale pendant le préchargement
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Web Audio cyber startup hum sequence
  useEffect(() => {
    const playBootSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        // Startup cyber hum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 1.5);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 2.0);

        // High sweep ping
        const pingOsc = ctx.createOscillator();
        const pingGain = ctx.createGain();
        pingOsc.type = 'sine';
        pingOsc.frequency.setValueAtTime(880, now + 0.2);
        pingOsc.frequency.exponentialRampToValueAtTime(1760, now + 0.6);
        pingGain.gain.setValueAtTime(0.03, now + 0.2);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        pingOsc.connect(pingGain);
        pingGain.connect(ctx.destination);
        pingOsc.start(now + 0.2);
        pingOsc.stop(now + 0.6);
      } catch (e) {
        // Autoplay bypass
      }
    };

    // Attempt sound on render
    playBootSound();
  }, []);

  useEffect(() => {
    // Rotation des astuces
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 2000);

    // Progression de 0 à 100
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    // Diagnostic System Logs scroll
    const logInterval = setInterval(() => {
      setLogIndex(prev => {
        const next = prev + 1;
        if (next < SYSTEM_LOGS.length) {
          setActiveLogs(logs => [...logs, SYSTEM_LOGS[next]]);
          return next;
        }
        return prev;
      });
    }, 450);

    setActiveLogs([SYSTEM_LOGS[0]]);

    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black overflow-hidden font-monda select-none">
      
      {/* Background Matrix Mesh Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f0a05_0%,_#000000_100%)]"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle, #c28e3a 1px, transparent 1px)', 
        backgroundSize: '30px 30px' 
      }}></div>

      {/* Cyber Grid Scanning Line */}
      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[#c28e3a] to-transparent shadow-[0_0_20px_#c28e3a] animate-scan-line pointer-events-none z-10"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-8">
        
        {/* Solo Leveling System Header */}
        <div className="flex items-center gap-2 mb-2 text-[#c28e3a] filter drop-shadow-[0_0_5px_#c28e3a] animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c28e3a]"></span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">SYSTEM CHRONOS BOOTING</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-heading font-black tracking-[0.2em] mb-12 text-center text-white drop-shadow-[0_0_15px_rgba(194,142,58,0.4)] uppercase">
          PLATEFORME WAKKANY
        </h1>

        {/* Rotating SVG Chronos Gate Rune Emblem in Gold */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-12">
          {/* Inner pulsating node */}
          <div className="absolute w-12 h-12 rounded-full bg-[#c28e3a]/10 border border-[#c28e3a]/30 flex items-center justify-center shadow-[0_0_30px_#c28e3a]">
            <span className="text-2xl animate-ping opacity-30 text-[#c28e3a]">❖</span>
          </div>

          {/* Outer runic rings */}
          <svg className="w-full h-full animate-[spin_15s_linear_infinite] drop-shadow-[0_0_12px_#c28e3a]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#c28e3a" strokeWidth="1.5" strokeDasharray="5,15" opacity="0.6" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#fce5a1" strokeWidth="0.75" opacity="0.4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#c28e3a" strokeWidth="2.5" strokeDasharray="30,8" opacity="0.7" />
          </svg>

          {/* Inverse rotating ring */}
          <svg className="absolute w-[80%] h-[80%] animate-[spin_10s_linear_infinite_reverse] drop-shadow-[0_0_8px_#fce5a1]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#fce5a1" strokeWidth="1" strokeDasharray="15,40" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#c28e3a" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
          </svg>
        </div>

        {/* Loading Progress Bar in Gold */}
        <div className="w-full relative h-3 bg-zinc-950/80 border border-[#c28e3a]/20 rounded-full p-0.5 overflow-hidden shadow-[0_0_15px_rgba(194,142,58,0.1)]">
          <div 
            className="h-full bg-gradient-to-r from-amber-950 via-[#c28e3a] to-[#fce5a1] rounded-full shadow-[0_0_10px_rgba(194,142,58,0.5)] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Status Text */}
        <div className="mt-4 mb-10 text-[10px] text-[#c28e3a] font-bold uppercase tracking-[0.25em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c28e3a] animate-ping"></span>
          <span>INIT CHRONOS PROCESSUS... {progress}%</span>
        </div>

        {/* Bottom grid (Diagnostics vs Tip) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-t border-[#c28e3a]/10 pt-6 mt-2">
          
          {/* Cyber Diagnostics (Left) */}
          <div className="space-y-1.5 font-mono text-[9px] text-zinc-500">
            {activeLogs.map((log, idx) => (
              <div key={idx} className="truncate animate-fade-in flex items-center gap-2">
                <span className="text-[#c28e3a] font-black">&gt;</span>
                <span className={idx === activeLogs.length - 1 ? 'text-zinc-300' : ''}>{log}</span>
              </div>
            ))}
          </div>

          {/* System Tip (Right) */}
          <div className="border-l border-[#c28e3a]/10 pl-6 flex flex-col justify-center">
            <span className="text-[#c28e3a] text-[8px] font-black uppercase tracking-[0.3em] mb-2">❖ TRANSMISSION ASTUCE</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed italic">
              "{TIPS[tipIndex]}"
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
