import React, { useState, useMemo } from 'react';
import Avatar from './Avatar';
import BadgeGallery from './BadgeGallery';
import { getLevel } from '../data/levels';
import { getDominantBranch } from '../utils/xpHelpers';
import { BRANCHES } from '../data/branches';

export default function ProfileView({ user, xp, unlockedSkills, unlockedAchievements }) {
  const [scanning, setScanning] = useState(false);
  const [scanApproved, setScanApproved] = useState(false);
  const [checkedDays, setCheckedDays] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  
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
      
      // Sci-fi pitch sweep (Scanner)
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

      // System approval double chirp
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587.33, now + 1.3); // D5
      gain2.gain.setValueAtTime(0.04, now + 1.3);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 1.3);
      osc2.stop(now + 1.45);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(880.00, now + 1.45); // A5
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

  // Dynamically calculate the active stats per branch for the Solo Leveling Spider Chart
  const branchProgress = useMemo(() => {
    const counts = { heroes: 0, warriors: 0, dinos: 0, cars: 0 };
    unlockedSkills.forEach(skillId => {
      Object.entries(BRANCHES).forEach(([branchId, branch]) => {
        if (branch.nodes.some(n => n.id === skillId)) {
          counts[branchId]++;
        }
      });
    });

    const maxVal = 6; // Max 6 nodes in each branch
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
      
      {/* Title block matching Image 3 (SOLO LEVELING SYSTEM / HABIT TRACKER) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.4em]">SYSTEM CHRONOS ACTIVE</span>
          </div>
          <h1 className="text-white text-4xl md:text-5xl font-heading font-black italic uppercase mt-2 tracking-widest filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            SYSTEM LEVELING
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-heading font-bold uppercase tracking-[0.25em]">
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
        
        {/* Left Column - Avatar Scan & Task Management (col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          
          {/* Holographic Target Scanning Panel */}
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 relative overflow-hidden group shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)]">
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

              <div className="transform scale-110 relative z-20">
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
                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Affinité Cosmique</div>
                    <div className="text-white font-heading font-black uppercase tracking-wider text-sm" style={{ color: dominantBranch.color }}>{dominantBranch.label}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TASK MANAGEMENT Panel matching Image 1 */}
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 pt-10 relative overflow-hidden shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] group">
            
            {/* Trapezoid title tab */}
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
              <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">TASK MANAGEMENT</span>
            </div>

            {/* Glowing neon chain effect decoration (matching screenshot) */}
            <div className="absolute top-4 right-4 opacity-25 pointer-events-none text-purple-400 flex flex-col items-center">
              <iconify-icon icon="lucide:link-2" width="24" className="rotate-45"></iconify-icon>
            </div>
            <div className="absolute bottom-4 left-4 opacity-25 pointer-events-none text-purple-400 flex flex-col items-center">
              <iconify-icon icon="lucide:link-2" width="24" className="rotate-45"></iconify-icon>
            </div>

            {/* Task list */}
            <div className="space-y-4 mt-4 relative z-10">
              {[
                { label: 'Complete Daily Quests', key: 'quest' },
                { label: 'Plan Week', key: 'plan' },
                { label: 'Meditate (15 min)', key: 'meditate' },
                { label: 'Read 10 Pages', key: 'read' }
              ].map((task) => (
                <button
                  key={task.key}
                  onClick={() => toggleTask(task.key)}
                  className="w-full flex items-center justify-between p-4 bg-black/40 border border-purple-500/5 hover:border-purple-500/20 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Glowing Neon Purple Checkbox */}
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                      ${tasks[task.key] ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] text-purple-300' : 'bg-transparent border-zinc-700 text-transparent'}`}>
                      <span className="text-sm font-black">✓</span>
                    </div>
                    <span className={`text-xs font-bold transition-all ${tasks[task.key] ? 'text-zinc-300 line-through' : 'text-white'}`}>
                      {task.label}
                    </span>
                  </div>

                  {/* Secondary checked indicator circle on the right side */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300
                    ${tasks[task.key] ? 'bg-purple-500/10 border-purple-400/40 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]' : 'bg-transparent border-zinc-800 text-transparent'}`}>
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Daily Quests, Level Up, Goal Tracking (col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          
          {/* DAILY QUESTS Panel matching Image 2 */}
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 pt-10 relative overflow-hidden shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)]">
            
            {/* Trapezoid title tab */}
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
              <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">DAILY QUESTS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-4">
              
              {/* Crossed Swords Shield Emblem (Left) */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center bg-purple-500/5 border border-purple-500/20 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  {/* Glowing Shield Ring */}
                  <div className="absolute inset-2 rounded-full border border-dashed border-purple-500/10 animate-[spin_40s_linear_infinite]"></div>
                  
                  {/* Emblem */}
                  <iconify-icon icon="game-icons:crossed-swords" width="48" style={{ color: '#a855f7' }} className="filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse"></iconify-icon>
                </div>
              </div>

              {/* Progress bars (Right) */}
              <div className="md:col-span-7 space-y-4">
                {[
                  { name: 'Morning Training', progress: 80 },
                  { name: 'Focus Session (2 hrs)', progress: 60 },
                  { name: 'Skill Practice', progress: 40 }
                ].map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <iconify-icon icon="lucide:swords" width="10" className="text-purple-400"></iconify-icon>
                        {q.name}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-purple-500/10 relative">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-purple-800 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-1000" 
                        style={{ width: `${q.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* LEVEL UP PROGRESSION Panel matching Image 2 */}
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 pt-10 relative overflow-hidden shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)]">
            
            {/* Trapezoid title tab */}
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
              <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">LEVEL UP PROGRESSION</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-4">
              
              {/* Glowing SVG Silhouette Portal Gateway (Left) */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden border border-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
                  {/* Ambient aura inside gateway */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.18)_0%,_transparent_70%)] animate-pulse"></div>
                  
                  {/* High-end SVG arch & walking hero silhouette */}
                  <svg className="h-[90%] w-auto aspect-square drop-shadow-[0_0_15px_#a855f7]" viewBox="0 0 100 100">
                    <defs>
                      <filter id="portalGlow">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Arch */}
                    <path d="M15,90 C15,15 85,15 85,90" fill="none" stroke="#a855f7" strokeWidth="3" filter="url(#portalGlow)" />
                    <path d="M22,90 C22,22 78,22 78,90" fill="none" stroke="#e9d5ff" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6" />
                    
                    {/* Hero Silhouette */}
                    <path d="M47,56 Q50,56 53,56 L55,62 Q59,82 56,90 L44,90 Q41,82 45,62 Z" fill="#030712" />
                    <circle cx="50" cy="51" r="3" fill="#030712" />
                    <circle cx="49" cy="51" r="0.5" fill="#c084fc" />
                    <circle cx="51" cy="51" r="0.5" fill="#c084fc" />
                    
                    <line x1="5" y1="90" x2="95" y2="90" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Progress and Level status (Right) */}
              <div className="md:col-span-7 flex flex-col justify-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-white text-3xl font-heading font-black italic uppercase filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
                    LEVEL {currentLevel.level}
                  </span>
                  
                  {/* Upward Rank Arrow Badge */}
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 animate-bounce">
                    <span className="text-sm font-black">↑</span>
                  </div>
                </div>

                {/* Level Up progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                    <span>PROGRESSION</span>
                    <span>{xp} / {nextLevelXp} XP</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-purple-500/10 relative">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-800 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* GOAL TRACKING Panel matching Image 2 */}
          <div className="bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 pt-10 relative overflow-hidden shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)]">
            
            {/* Trapezoid title tab */}
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
              <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">GOAL TRACKING</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
              
              {/* Dynamic SVG Radar Chart */}
              <div className="flex justify-center relative py-2">
                <svg viewBox="0 0 200 200" className="w-full max-w-[170px] mx-auto filter drop-shadow-[0_0_15px_rgba(168,85,247,0.15)] pointer-events-none">
                  {/* Background grid concentric octagons */}
                  <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="rgba(168, 85, 247, 0.12)" strokeWidth="0.75" />
                  <polygon points="100,40 160,100 100,160 40,100" fill="none" stroke="rgba(168, 85, 247, 0.18)" strokeWidth="0.75" />
                  <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="0.75" />
                  <polygon points="100,80 120,100 100,120 80,100" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="0.75" strokeDasharray="2,2" />

                  {/* Diagonal and Axis Lines */}
                  <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.75" strokeDasharray="3,3" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.75" strokeDasharray="3,3" />

                  {/* Core axis text labels */}
                  <text x="100" y="13" textAnchor="middle" fill="#ff3b30" className="text-[8px] font-black uppercase tracking-wider">COMMAND</text>
                  <text x="190" y="103" textAnchor="start" fill="#c28e3a" className="text-[8px] font-black uppercase tracking-wider">COMBAT</text>
                  <text x="100" y="196" textAnchor="middle" fill="#34c759" className="text-[8px] font-black uppercase tracking-wider">CYBER</text>
                  <text x="10" y="103" textAnchor="end" fill="#007aff" className="text-[8px] font-black uppercase tracking-wider">SPEED</text>

                  {/* Dynamic Radar Area Polygon */}
                  <polygon 
                    points={`100,${100 - branchProgress.heroes * 0.8} ${100 + branchProgress.warriors * 0.8},100 100,${100 + branchProgress.dinos * 0.8} ${100 - branchProgress.cars * 0.8},100`} 
                    fill="rgba(168, 85, 247, 0.25)" 
                    stroke="#a855f7" 
                    strokeWidth="2" 
                    filter="url(#radarGlow)" 
                  />

                  {/* Point Markers */}
                  <circle cx="100" cy={100 - branchProgress.heroes * 0.8} r="3" fill="#fff" filter="url(#radarGlow)" />
                  <circle cx={100 + branchProgress.warriors * 0.8} cy="100" r="3" fill="#fff" filter="url(#radarGlow)" />
                  <circle cx="100" cy={100 + branchProgress.dinos * 0.8} r="3" fill="#fff" filter="url(#radarGlow)" />
                  <circle cx={100 - branchProgress.cars * 0.8} cy="100" r="3" fill="#fff" filter="url(#radarGlow)" />

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
        <div className="lg:col-span-8 bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <div>
            {/* Calendar Header matching Image 3 */}
            <div className="text-center mb-6">
              <h2 className="text-white text-3xl font-heading font-black italic uppercase tracking-[0.3em] filter drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                MARCH
              </h2>
            </div>

            {/* Weeks Subheader */}
            <div className="grid grid-cols-5 gap-4 text-center border-b border-purple-500/10 pb-4 mb-4">
              {['W-09', 'W-10', 'W-11', 'W-12', 'W-13'].map((week, idx) => (
                <span key={idx} className="text-purple-400 text-[10px] font-black uppercase tracking-widest">
                  {week}
                </span>
              ))}
            </div>

            {/* Calendar Grid matching Image 3 */}
            <div className="space-y-4 relative z-10">
              {/* Row 1 (Checkboxes & days 10, 11) */}
              <div className="grid grid-cols-5 gap-4">
                {/* W-09 Day 1 */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-lg">
                    ✓
                  </div>
                </div>

                {/* W-10 Day 2 */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-lg">
                    ✓
                  </div>
                </div>

                {/* W-11 Days 3 & 4 (side by side in column) */}
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-12 rounded-lg bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-sm">✓</div>
                  <div className="w-8 h-12 rounded-lg bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-sm">✓</div>
                </div>

                {/* W-12 Days 5, 6 & Day 10 */}
                <div className="flex justify-center gap-1.5 items-center">
                  <div className="w-6 h-10 rounded bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-[10px]">✓</div>
                  <div className="w-6 h-10 rounded bg-purple-500/20 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center text-purple-300 font-bold text-[10px]">✓</div>
                  <button 
                    onClick={() => toggleDay(10)}
                    className={`w-8 h-10 rounded border font-heading font-black italic text-xs transition-all duration-300 cursor-pointer 
                      ${checkedDays.includes(10) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-900 border-purple-500/25 text-white/80 hover:border-purple-400'}`}
                  >
                    {checkedDays.includes(10) ? '✓' : '10'}
                  </button>
                </div>

                {/* W-13 Day 11 */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => toggleDay(11)}
                    className={`w-12 h-12 rounded-xl border font-heading font-black italic text-sm transition-all duration-300 cursor-pointer 
                      ${checkedDays.includes(11) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-900 border-purple-500/25 text-white/80 hover:border-purple-400'}`}
                  >
                    {checkedDays.includes(11) ? '✓' : '11'}
                  </button>
                </div>
              </div>

              {/* Rows of dates (12 to 31) */}
              <div className="grid grid-cols-7 gap-3 pt-4 border-t border-purple-500/5 text-center">
                {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-9 h-9 mx-auto rounded-lg border font-monda font-bold text-xs transition-all duration-300 cursor-pointer flex items-center justify-center
                      ${checkedDays.includes(day) ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-950 border-purple-500/10 text-zinc-500 hover:border-purple-400/50 hover:text-white'}`}
                  >
                    {checkedDays.includes(day) ? '✓' : day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GOAL PROGRESS bar at bottom of calendar */}
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
                className="h-full rounded-full bg-gradient-to-r from-purple-900 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-500 ease-out" 
                style={{ width: `${calendarProgressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Solo Leveling Aesthetic Elements & Item Inventory */}
        <div className="lg:col-span-4 bg-zinc-950 border border-purple-500/10 rounded-3xl p-8 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          
          <div>
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-center">
              Aesthetic Elements
            </h3>

            {/* Top row of 4 circular RPG runes */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {['lucide:activity', 'lucide:swords', 'lucide:flame', 'lucide:gem'].map((icon, idx) => (
                <div key={idx} className="aspect-square rounded-full border border-purple-500/20 bg-zinc-900/50 flex items-center justify-center text-purple-400/80 hover:border-purple-400 hover:text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <iconify-icon icon={icon} width="16"></iconify-icon>
                </div>
              ))}
            </div>

            {/* Divider 1 */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
              <span className="text-[10px] text-purple-500/60 font-black tracking-widest">❖</span>
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
            </div>

            {/* Faction Runes Grid / Cute game items matching Image 3 */}
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

            {/* Divider 2 */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
              <span className="text-[10px] text-purple-500/60 font-black tracking-widest">✦</span>
              <div className="h-[1px] bg-purple-500/20 flex-1"></div>
            </div>

            {/* Cute Pixel RPG Monsters/Items row */}
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

      {/* Badge Gallery */}
      <div className="mt-8">
        <BadgeGallery unlockedAchievements={unlockedAchievements} />
      </div>
    </div>
  );
}
