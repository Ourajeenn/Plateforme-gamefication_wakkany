import React, { useState, useMemo, useEffect } from 'react';
import Avatar from './Avatar';
import BadgeGallery from './BadgeGallery';
import { getLevel } from '../data/levels';
import { getDominantBranch } from '../utils/xpHelpers';
import { BRANCHES } from '../data/branches';

export default function ProfileView({ user, xp, unlockedSkills, unlockedAchievements, setXp, setUnlockedAchievements }) {
  const [scanning, setScanning] = useState(false);
  const [scanApproved, setScanApproved] = useState(false);
  const [checkedDays, setCheckedDays] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  
  // Custom states for interactive Auras and Quest dashboard
  const [showAuraSelector, setShowAuraSelector] = useState(false);
  const [selectedAura, setSelectedAura] = useState(() => localStorage.getItem('wakkany_avatar_aura') || 'none');
  const [claimedQuests, setClaimedQuests] = useState(() => JSON.parse(localStorage.getItem('wakkany_claimed_quests') || '[]'));

  // Sync selected aura reactively
  useEffect(() => {
    localStorage.setItem('wakkany_avatar_aura', selectedAura);
  }, [selectedAura]);

  const selectAura = (auraId) => {
    setSelectedAura(auraId);
    playAuraSFX(auraId);
  };

  const playAuraSFX = (auraId) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      if (auraId === 'fire') {
        // Flame sweep sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.6);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.6);
      } else if (auraId === 'lightning') {
        // Electric zap sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.15);
      } else if (auraId === 'cosmic') {
        // Cosmic drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(110, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(112, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
      } else if (auraId === 'divine') {
        // Shimmering chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.exponentialRampToValueAtTime(1975.53, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 1.2);
      }
    } catch(e) {}
  };

  const claimQuest = (questId, xpReward) => {
    if (claimedQuests.includes(questId)) return;
    const newClaimed = [...claimedQuests, questId];
    setClaimedQuests(newClaimed);
    localStorage.setItem('wakkany_claimed_quests', JSON.stringify(newClaimed));
    
    // Play majestic golden chest fanfare sfx
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.04, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      }
    } catch(e) {}

    // Award XP
    if (setXp) {
      setXp(prev => prev + xpReward);
    }
  };

  // Tasks state for Task Management panel
  const [tasks, setTasks] = useState({
    quest: true,
    plan: false,
    meditate: true,
    read: false
  });

  const toggleTask = (key) => {
    setTasks(prev => ({ ...prev, [key]: !prev[key] }));
    playScanSFX();
  };

  const toggleDay = (day) => {
    if (checkedDays.includes(day)) {
      setCheckedDays(prev => prev.filter(d => d !== day));
    } else {
      setCheckedDays(prev => [...prev, day]);
      playScanSFX();
    }
  };

  const calendarProgressPercent = Math.round((checkedDays.length / 31) * 100);
  const currentLevel = getLevel(xp);
  const nextLevelXp = currentLevel.nextXp || (currentLevel.xp + 100);
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevel.xp) / (nextLevelXp - currentLevel.xp)) * 100)) || (xp % 100);
  
  const dominantBranchId = getDominantBranch(unlockedSkills);
  const dominantBranch = dominantBranchId ? BRANCHES[dominantBranchId] : null;

  // Synthesized Web Audio Sci-Fi Terminal Scanner sound
  const playScanSFX = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(120, now);
      osc1.frequency.exponentialRampToValueAtTime(750, now + 1.2);
      gain1.gain.setValueAtTime(0.03, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Approval double chirp
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587.33, now + 1.3);
      gain2.gain.setValueAtTime(0.04, now + 1.3);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 1.3);
      osc2.stop(now + 1.45);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(880.00, now + 1.45);
      gain3.gain.setValueAtTime(0.04, now + 1.45);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 1.45);
      osc3.stop(now + 1.65);
    } catch (e) {
      console.warn("Scan audio error:", e);
    }
  };

  const startScanning = () => {
    if (scanning) return;
    setScanning(true);
    setScanApproved(false);
    playScanSFX();
    setTimeout(() => {
      setScanning(false);
      setScanApproved(true);
    }, 1800);
  };

  // Calculate coordinates and paths for Spider Chart
  const branchProgress = useMemo(() => {
    const counts = { heroes: 0, warriors: 0, dinos: 0, cars: 0 };
    unlockedSkills.forEach(skillId => {
      Object.entries(BRANCHES).forEach(([branchId, branch]) => {
        if (branch.nodes.some(n => n.id === skillId)) {
          counts[branchId]++;
        }
      });
    });

    const maxVal = 6;
    return {
      heroes: Math.min(100, Math.max(15, (counts.heroes / maxVal) * 100)),
      warriors: Math.min(100, Math.max(15, (counts.warriors / maxVal) * 100)),
      dinos: Math.min(100, Math.max(15, (counts.dinos / maxVal) * 100)),
      cars: Math.min(100, Math.max(15, (counts.cars / maxVal) * 100)),
      raw: counts
    };
  }, [unlockedSkills]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.4em]">SYSTEM CHRONOS ACTIVE</span>
          </div>
          <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-heading font-black italic uppercase mt-2 tracking-wider sm:tracking-widest filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            SYSTEM LEVELING
          </h1>
          <p className="text-zinc-500 text-[10px] sm:text-xs mt-1 font-heading font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
            Identité numérique et statistiques de puissance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-[10px] font-black uppercase tracking-widest bg-zinc-900/80 border border-purple-500/20 px-6 py-3 rounded-2xl">
          <span className="text-zinc-500">Rang Actuel :</span>
          <span className="text-purple-400 filter drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
            {xp > 200 ? "S-RANK HUNTER" : xp > 100 ? "A-RANK HUNTER" : "E-RANK NOVICE"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Avatar Scan & Task Management */}
        <div className="lg:col-span-6 flex flex-col gap-8 w-full">
          
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-5 sm:p-8 relative overflow-hidden group shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-white text-3xl font-heading font-black italic uppercase tracking-wider">{user?.name || 'Nomade'}</h2>
                <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.25em] mt-1">{user?.academy || 'Sans Académie'}</p>
              </div>
              <button 
                onClick={startScanning}
                disabled={scanning}
                className={`w-12 h-12 rounded-2xl border transition-all duration-300 flex items-center justify-center cursor-pointer 
                  ${scanning ? 'bg-purple-500 border-purple-400 text-white animate-pulse' : 'bg-zinc-900 border-purple-500/25 text-purple-400 hover:border-purple-400'}`}
              >
                <iconify-icon icon="lucide:scan" width="22"></iconify-icon>
              </button>
            </div>

            {/* Avatar Frame with Rotating Cyber Rings */}
            <div className="py-10 flex justify-center items-center relative z-10">
              <div className="absolute w-[240px] h-[240px] flex items-center justify-center">
                <svg className="w-full h-full animate-[spin_25s_linear_infinite]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(168, 85, 247, 0.12)" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.5" />
                  <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.5" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="0.5" />
                  <path d="M 50 4 A 46 46 0 0 1 96 50" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" strokeDasharray="12,12" />
                  <path d="M 50 96 A 46 46 0 0 1 4 50" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" strokeDasharray="12,12" />
                </svg>
              </div>

              {scanning && (
                <div className="absolute w-[210px] h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#a855f7] animate-scan-line pointer-events-none z-30"></div>
              )}

              {/* Clickable Avatar custom aura trigger */}
              <div 
                onClick={() => setShowAuraSelector(true)}
                className="transform scale-110 relative z-20 cursor-pointer group/avatar relative flex justify-center w-full"
                title="Chambre de Fusion Élémentaire — Cliquez pour équiper une Aura !"
              >
                <div className="absolute -top-10 bg-black/90 border border-purple-500/30 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-purple-400 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 z-50 shadow-2xl">
                  🧬 ACTIVER UNE AURA
                </div>
                <Avatar xp={xp} unlockedSkills={unlockedSkills} />
              </div>
            </div>
            
            {/* Identity Status Widget */}
            <div className="mt-10 space-y-4 relative z-10">
              <div className="bg-black/50 border border-purple-500/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <iconify-icon icon="lucide:fingerprint" width="20"></iconify-icon>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">System Scan</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${scanning ? 'text-yellow-500 animate-pulse' : scanApproved ? 'text-purple-400' : 'text-zinc-400'}`}>
                      {scanning ? 'Analyse en cours...' : scanApproved ? 'Scan approuvé' : 'Attente du scan'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Intégrité</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">100% SECURE</span>
                </div>
              </div>

              {dominantBranch && (
                <div className="flex items-center gap-4 bg-black/50 p-4 rounded-2xl border border-purple-500/10">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center border font-bold"
                    style={{ backgroundColor: `${dominantBranch.color}15`, borderColor: `${dominantBranch.color}30`, color: dominantBranch.color }}
                  >
                    <span className="text-xl">{dominantBranch.icon}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Alignement Dominant</span>
                    <span className="text-xs font-heading font-black italic uppercase tracking-wider" style={{ color: dominantBranch.color }}>
                      {dominantBranch.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column - Status & Radial Radar Chart (col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-8 w-full">
          
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-5 sm:p-8 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                Informations du Système de Pouvoir
              </h3>
              
              <div className="space-y-4">
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Capacité Neuronale</span>
                  <span className="font-monda font-black text-purple-400">920 Gigaflops</span>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Niveau Global</span>
                  <span className="font-monda font-black text-[#c28e3a]">Lvl {currentLevel.level} ({currentLevel.name})</span>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">XP Cumulée</span>
                  <span className="font-monda font-black text-purple-400">{xp} / {nextLevelXp} XP</span>
                </div>
              </div>
            </div>

            {/* Radar Spider Chart with Faction Progress */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              <div className="flex justify-center">
                <svg viewBox="0 -10 120 120" className="w-40 h-40 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                  {/* Outer Grid Ring */}
                  <polygon points="50,0 100,50 50,100 0,50" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
                  <polygon points="50,12.5 87.5,50 50,87.5 12.5,50" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                  <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.8" />
                  <polygon points="50,37.5 62.5,50 50,62.5 37.5,50" fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.8" />
                  
                  {/* Axis lines */}
                  <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />

                  {/* Faction labels */}
                  <text x="50" y="-4" textAnchor="middle" fill="#ff3b30" fontSize="5" fontWeight="bold" className="font-heading italic">HÉROS</text>
                  <text x="104" y="52" textAnchor="start" fill="#c28e3a" fontSize="5" fontWeight="bold" className="font-heading italic">GUERRIERS</text>
                  <text x="50" y="106" textAnchor="middle" fill="#34c759" fontSize="5" fontWeight="bold" className="font-heading italic">PRIMITIFS</text>
                  <text x="-4" y="52" textAnchor="end" fill="#007aff" fontSize="5" fontWeight="bold" className="font-heading italic">SPEED</text>

                  {/* Polyline plotting actual progress */}
                  <polygon 
                    points={`
                      50,${50 - (branchProgress.heroes * 0.5)} 
                      ${50 + (branchProgress.warriors * 0.5)},50 
                      50,${50 + (branchProgress.dinos * 0.5)} 
                      ${50 - (branchProgress.cars * 0.5)},50
                    `} 
                    fill="rgba(168, 85, 247, 0.25)" 
                    stroke="#a855f7" 
                    strokeWidth="1.2" 
                    filter="url(#radarGlow)"
                  />

                  <defs>
                    <filter id="radarGlow">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
              </div>

              {/* Faction lists and bars */}
              <div className="space-y-4">
                {[
                  { name: 'Command (Héros)', val: branchProgress.raw.heroes, color: '#ff3b30' },
                  { name: 'Combat (Guerriers)', val: branchProgress.raw.warriors, color: '#c28e3a' },
                  { name: 'Cyber (Primitifs)', val: branchProgress.raw.dinos, color: '#34c759' },
                  { name: 'Speed (Mécanique)', val: branchProgress.raw.cars, color: '#007aff' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 bg-black/40 p-3 rounded-xl border border-white/5 hover:border-purple-500/10 transition-all">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-white">{item.name}</span>
                      <span style={{ color: item.color }}>{item.val} / 6</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]" 
                        style={{ width: `${(item.val / 6) * 100}%`, backgroundColor: item.color, color: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Habit Tracker Calendar & Aesthetic Elements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
        
        {/* Habit Tracker Calendar */}
        <div className="lg:col-span-8 bg-zinc-950 border border-purple-500/10 rounded-3xl p-4 sm:p-8 pt-8 sm:pt-10 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between group">
          
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
            <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">HABIT TRACKER</span>
          </div>

          <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="mt-4">
            <div className="text-center mb-6">
              <h2 className="text-white text-2xl sm:text-3xl font-heading font-black italic uppercase tracking-[0.25em] sm:tracking-[0.3em] filter drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                MARCH
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center border-b border-purple-500/10 pb-4 mb-4">
              {['W-09', 'W-10', 'W-11', 'W-12', 'W-13'].map((week, idx) => (
                <span key={idx} className="text-purple-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">
                  {week}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                <div className="flex justify-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-sm sm:text-lg">
                    ✓
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-sm sm:text-lg">
                    ✓
                  </div>
                </div>

                <div className="flex justify-center gap-1 sm:gap-2">
                  <div className="w-5 h-8 sm:w-8 sm:h-12 rounded-md sm:rounded-lg bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-xs sm:text-sm">✓</div>
                  <div className="w-5 h-8 sm:w-8 sm:h-12 rounded-md sm:rounded-lg bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-xs sm:text-sm">✓</div>
                </div>

                <div className="flex justify-center gap-1 sm:gap-1.5 items-center">
                  <div className="w-4 h-7 sm:w-6 sm:h-10 rounded-sm sm:rounded bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-[8px] sm:text-[10px]">✓</div>
                  <div className="w-4 h-7 sm:w-6 sm:h-10 rounded-sm sm:rounded bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-[8px] sm:text-[10px]">✓</div>
                  <button 
                    onClick={() => toggleDay(10)}
                    className={`w-5 h-7 sm:w-8 sm:h-10 rounded-sm sm:rounded border font-heading font-black italic text-[9px] sm:text-xs transition-all duration-300 cursor-pointer 
                      ${checkedDays.includes(10) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-900 border-purple-500/25 text-white/80 hover:border-purple-400'}`}
                  >
                    {checkedDays.includes(10) ? '✓' : '10'}
                  </button>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => toggleDay(11)}
                    className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border font-heading font-black italic text-xs sm:text-sm transition-all duration-300 cursor-pointer 
                      ${checkedDays.includes(11) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-900 border-purple-500/25 text-white/80 hover:border-purple-400'}`}
                  >
                    {checkedDays.includes(11) ? '✓' : '11'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-3 pt-4 border-t border-purple-500/5 text-center">
                {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-md sm:rounded-lg border font-monda font-bold text-[10px] sm:text-xs transition-all duration-300 cursor-pointer flex items-center justify-center
                      ${checkedDays.includes(day) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-950 border-purple-500/10 text-zinc-500 hover:border-purple-400/50 hover:text-white'}`}
                  >
                    {checkedDays.includes(day) ? '✓' : day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-500/10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">
              <div className="flex items-center gap-2">
                <iconify-icon icon="lucide:compass" className="text-purple-400 animate-spin-slow" width="14"></iconify-icon>
                <span>GOAL PROGRESS</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{calendarProgressPercent}% COMPLETE</span>
                <iconify-icon icon="lucide:scroll" className="text-purple-400 animate-pulse" width="14"></iconify-icon>
              </div>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-purple-500/15 relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-900 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168, 85, 247, 0.5)] transition-all duration-500 ease-out" 
                style={{ width: `${calendarProgressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Solo Leveling Aesthetic Inventory */}
        <div className="lg:col-span-4 bg-zinc-950 border border-purple-500/10 rounded-3xl p-5 sm:p-8 pt-8 sm:pt-10 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between group">
          
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
            <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">INVENTORY</span>
          </div>

          <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="mt-4">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-center">
              Aesthetic Elements
            </h3>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {['lucide:activity', 'lucide:swords', 'lucide:flame', 'lucide:gem'].map((icon, idx) => (
                <div key={idx} className="aspect-square rounded-full border border-purple-500/20 bg-zinc-900/50 flex items-center justify-center text-purple-400/80 hover:border-purple-400 hover:text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <iconify-icon icon={icon} width="16"></iconify-icon>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
              <span className="text-[10px] text-purple-500/60 font-black tracking-widest">❖</span>
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: 'game-icons:potion-ball', color: '#ff3b30', name: 'HP POTION' },
                { icon: 'game-icons:crystal-wand', color: '#a855f7', name: 'AETHER' },
                { icon: 'game-icons:dragon-shield', color: '#c28e3a', name: 'LEGION' }
              ].map((item, idx) => (
                <div key={idx} className="bg-black/50 border border-purple-500/10 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:border-purple-500/30 transition-all group">
                  <iconify-icon icon={item.icon} width="24" style={{ color: item.color }} className="group-hover:scale-110 transition-transform filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]"></iconify-icon>
                  <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
              <span className="text-[10px] text-purple-500/60 font-black tracking-widest">✦</span>
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: 'game-icons:crown', color: '#eab308' },
                { icon: 'game-icons:elixir', color: '#3b82f6' },
                { icon: 'game-icons:dinosaur-bones', color: '#34c759' },
                { icon: 'game-icons:crystal-growth', color: '#ec4899' }
              ].map((item, idx) => (
                <div key={idx} className="aspect-square rounded-xl bg-zinc-900/50 border border-purple-500/15 flex items-center justify-center hover:border-purple-400 transition-all">
                  <iconify-icon icon={item.icon} width="20" style={{ color: item.color }}></iconify-icon>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-[8px] text-zinc-600 font-bold tracking-[0.2em] mt-8 uppercase">
            Wakkany Gear Collection v2.0
          </div>
        </div>
      </div>

      {/* Proposition D: Tableau de Chasse aux Quêtes Actives */}
      <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-5 sm:p-8 pt-8 sm:pt-10 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden mt-10">
        
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
          <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">TABLEAU DE CHASSE AUX QUÊTES</span>
        </div>

        <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'quest_first_game', title: '🎯 Le Premier Pas', desc: 'Compléter votre première partie de Quiz de la Meute.', reward: 50, completed: unlockedAchievements.includes('first_game') || unlockedAchievements.includes('first_step') },
            { id: 'quest_boss_slayer', title: '🌋 Fléau des Failles', desc: 'Terrasser un Boss dans le nouveau mode Raid de Boss.', reward: 150, completed: unlockedAchievements.includes('boss_slayer') },
            { id: 'quest_elemental', title: '🧬 Maître Élémentaire', desc: 'Équiper une Aura Élémentaire active dans la Chambre de Fusion.', reward: 100, completed: selectedAura !== 'none' }
          ].map(q => {
            const isClaimed = claimedQuests.includes(q.id);
            const canClaim = q.completed && !isClaimed;
            
            return (
              <div 
                key={q.id}
                className={`bg-zinc-900/60 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all
                  ${isClaimed ? 'border-zinc-800/40 opacity-50' : q.completed ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(52,199,89,0.15)] scale-102' : 'border-white/5 hover:border-white/10'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-heading font-black italic uppercase text-xs text-white">{q.title}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded
                      ${isClaimed ? 'bg-zinc-850 text-zinc-500' : q.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400 animate-pulse'}`}>
                      {isClaimed ? 'Réclamée' : q.completed ? 'Terminée' : 'Active'}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed mt-2">{q.desc}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">Récompense : <span className="text-purple-400 font-black">+{q.reward} XP</span></span>
                  
                  {isClaimed ? (
                    <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">❖ ACCOMPLIE</span>
                  ) : canClaim ? (
                    <button
                      onClick={() => claimQuest(q.id, q.reward)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-heading font-black uppercase text-[8px] tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_rgba(52,199,89,0.3)] cursor-pointer"
                    >
                      🏆 Réclamer XP
                    </button>
                  ) : (
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">En cours...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Gallery */}
      <div className="mt-8">
        <BadgeGallery unlockedAchievements={unlockedAchievements} />
      </div>

      {/* Holographic Aura Selection Modal Overlay */}
      {showAuraSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-purple-500/30 p-8 rounded-[40px] max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)]">
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse pointer-events-none"></div>
            
            <button 
              onClick={() => setShowAuraSelector(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <iconify-icon icon="lucide:x" width="24"></iconify-icon>
            </button>

            <h3 className="text-2xl font-heading font-black italic uppercase text-center mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
              FUSION ÉLÉMENTAIRE
            </h3>
            <p className="text-zinc-500 text-[10px] text-center font-bold uppercase tracking-widest mb-8">
              Équipez votre Avatar d'une Aura Active
            </p>

            <div className="space-y-4">
              {[
                { id: 'none', name: 'Aucune Aura 🛡️', desc: 'Rendu par défaut de votre niveau.', icon: 'lucide:shield', color: 'text-zinc-500' },
                { id: 'fire', name: 'Aura de Feu 🔥', desc: 'Déchaînez les flammes éternelles du volcan.', icon: 'lucide:flame', color: 'text-red-500' },
                { id: 'lightning', name: 'Aura Électrique ⚡', desc: 'Frayez un chemin de foudre néon.', icon: 'lucide:zap', color: 'text-blue-400' },
                { id: 'cosmic', name: 'Aura Cosmique 🌌', desc: 'Invoquez les orbes de l\'abîme céleste.', icon: 'lucide:orbit', color: 'text-purple-400' },
                { id: 'divine', name: 'Aura Divine ✨', desc: 'Brillez de la lumière des monarques.', icon: 'lucide:sparkles', color: 'text-[#fce5a1]' }
              ].map(aura => (
                <button
                  key={aura.id}
                  onClick={() => selectAura(aura.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all hover:scale-102 active:scale-98 cursor-pointer
                    ${selectedAura === aura.id ? 'border-purple-500 bg-purple-900/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-102' : 'border-white/5 bg-zinc-900/40 hover:border-white/10'}`}
                >
                  <div>
                    <h4 className={`font-black uppercase tracking-wider text-xs ${aura.color}`}>{aura.name}</h4>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wide mt-1">{aura.desc}</p>
                  </div>
                  <iconify-icon icon={aura.icon} width="20" className={aura.color}></iconify-icon>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAuraSelector(false)}
              className="mt-8 w-full py-4 bg-purple-600 text-white font-heading font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white hover:text-black transition-all"
            >
              Fermer la Chambre
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
