import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBossRaid } from '../../hooks/useBossRaid';
import { BOSS_ENCOUNTERS, BOSS_LEVELS, getEncountersByLevel } from '../../data/bossEncounters';

/* ─── tiny synth SFX ─────────────────────────────────────── */
function sfx(type) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC(); const now = ctx.currentTime;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      g.gain.setValueAtTime(0.07, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    } else if (type === 'dmg') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(); osc.stop(now + 0.4);
    } else if (type === 'win') {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator(); const gg = ctx.createGain();
        o.connect(gg); gg.connect(ctx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(f, now + i * 0.1);
        gg.gain.setValueAtTime(0.06, now + i * 0.1);
        gg.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.4);
        o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.4);
      });
    }
  } catch {}
}

/* ─── HP Bar ─────────────────────────────────────────────── */
function HpBar({ current, max, color, label, icon }) {
  const pct = Math.max((current / max) * 100, 0);
  return (
    <div className="space-y-1 w-full">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span style={{ color }}>{icon} {label}</span>
        <span className="text-white">{current} / {max} HP</span>
      </div>
      <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
        <div className="h-full rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 12px ${color}66` }} />
      </div>
    </div>
  );
}

/* ─── Encounter Node (on the map) ───────────────────────── */
function EncounterNode({ enc, defeated, unlocked, onSelect, isNext }) {
  const done    = defeated.includes(enc.id);
  const locked  = !unlocked;
  return (
    <button
      onClick={() => !locked && !done && onSelect(enc)}
      disabled={locked || done}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 w-full text-center
        ${done   ? 'border-green-500/40 bg-green-500/5 opacity-70'
        : locked  ? 'border-white/5 bg-black/20 opacity-40 cursor-not-allowed'
        : isNext  ? 'border-current bg-current/10 cursor-pointer scale-105 shadow-2xl animate-pulse'
        :           'border-white/10 bg-black/30 cursor-pointer hover:border-white/30'}`}
      style={isNext ? { borderColor: enc.color, '--tw-shadow-color': enc.color } : {}}
    >
      {enc.type === 'final' && !done && !locked && (
        <div className="absolute -top-2 -right-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: enc.color, color: '#000' }}>BOSS FINAL</div>
      )}
      <span className="text-3xl">{done ? '✅' : locked ? '🔒' : enc.icon}</span>
      <div>
        <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: enc.color }}>{enc.title}</div>
        <div className="text-white font-black text-sm leading-tight">{enc.name}</div>
      </div>
      <div className="text-[9px] text-zinc-500 font-bold">
        {done ? 'VAINCU' : locked ? 'VERROUILLÉ' : `❤️ ${enc.hp} HP · 📝 ${enc.questionsCount} Q`}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function BossRaid() {
  const navigate = useNavigate();
  const {
    raidState, setRaidState,
    progress,
    startEncounter,
    isLevelAvailable,
    currentEncounter,
    currentQuestion, questionIndex, totalQuestions,
    bossHp, teamHp,
    score, streak, xpEarned,
    countdown, timeLeft, isTimerRunning,
    lastAnswerCorrect,
    handleAnswer,
    resetProgress,
    defeatedCount, totalEncounters,
  } = useBossRaid();

  const [shakeScreen, setShakeScreen] = useState(false);
  const [slashActive, setSlashActive] = useState(false);

  // Trigger visual FX on answer
  useEffect(() => {
    if (lastAnswerCorrect === true)  { sfx('hit');  setSlashActive(true);  setTimeout(() => setSlashActive(false), 700); }
    if (lastAnswerCorrect === false) { sfx('dmg');  setShakeScreen(true); setTimeout(() => setShakeScreen(false), 600); }
  }, [lastAnswerCorrect]);

  useEffect(() => {
    if (raidState === 'victory' || raidState === 'levelComplete' || raidState === 'allComplete') sfx('win');
  }, [raidState]);

  /* ── MAP ─────────────────────────────────────────────── */
  if (raidState === 'map') {
    const prog = Math.round((defeatedCount / totalEncounters) * 100);
    return (
      <div className="min-h-screen bg-zinc-950 font-monda text-white pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/quiz')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
            <iconify-icon icon="lucide:arrow-left" /> Retour
          </button>
          <div className="text-center">
            <div className="text-[9px] text-[#c28e3a] font-black uppercase tracking-[0.4em]">Progression</div>
            <div className="text-white font-black">{defeatedCount} / {totalEncounters} boss vaincus</div>
          </div>
          <button onClick={() => { if (window.confirm('Réinitialiser toute la progression Boss Raid ?')) resetProgress(); }}
            className="text-xs text-red-500/60 hover:text-red-400 transition-colors">Réinit.</button>
        </div>

        {/* Global progress bar */}
        <div className="h-1.5 bg-zinc-900">
          <div className="h-full bg-gradient-to-r from-[#c28e3a] to-purple-500 transition-all duration-700" style={{ width: `${prog}%` }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 pt-8 space-y-10">
          <div className="text-center space-y-2">
            <div className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.5em]">Mode Légendaire</div>
            <h1 className="text-4xl sm:text-5xl font-heading font-black italic uppercase tracking-tighter">Boss Raid</h1>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">Affrontez 3 semi-boss pour débloquer chaque Boss Final. 3 niveaux. 12 combats.</p>
          </div>

          {BOSS_LEVELS.map((lvl) => {
            const encounters = getEncountersByLevel(lvl.id);
            const unlocked   = isLevelAvailable(lvl.id);
            const lvlDone    = encounters.every(e => progress.defeated.includes(e.id));
            const nextEnc    = unlocked ? encounters.find(e => !progress.defeated.includes(e.id)) : null;

            return (
              <div key={lvl.id} className={`rounded-3xl border p-5 sm:p-8 space-y-6 transition-all
                ${!unlocked ? 'border-white/5 opacity-50' : lvlDone ? 'border-green-500/20' : 'border-white/10'}`}>

                {/* Level Header */}
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{lvl.icon}</div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: lvl.color }}>Niveau {lvl.id}</div>
                    <h2 className="text-xl sm:text-2xl font-heading font-black italic uppercase">{lvl.name}</h2>
                  </div>
                  {lvlDone && <span className="ml-auto text-green-400 font-black text-sm">✅ COMPLÉTÉ</span>}
                  {!unlocked && <span className="ml-auto text-zinc-600 font-black text-xs">🔒 VERROUILLÉ</span>}
                </div>

                {/* Encounter nodes: 3 semi + 1 final */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {encounters.map((enc) => (
                    <EncounterNode
                      key={enc.id}
                      enc={enc}
                      defeated={progress.defeated}
                      unlocked={unlocked}
                      onSelect={startEncounter}
                      isNext={nextEnc?.id === enc.id}
                    />
                  ))}
                </div>

                {/* Connector arrows */}
                {unlocked && !lvlDone && nextEnc && (
                  <div className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                    {nextEnc.type === 'final'
                      ? '⚠️ Prochain : Boss Final !'
                      : `➡️ Prochain : ${nextEnc.name}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── COUNTDOWN ───────────────────────────────────────── */
  if (raidState === 'countdown') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-monda text-white">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-6xl">{currentEncounter?.icon}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: currentEncounter?.color }}>
            {currentEncounter?.type === 'final' ? '⚠️ BOSS FINAL ⚠️' : 'SEMI-BOSS'}
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-black italic uppercase" style={{ color: currentEncounter?.color }}>
            {currentEncounter?.name}
          </h2>
          <p className="text-zinc-400 text-sm italic max-w-sm">"{currentEncounter?.taunt}"</p>
          <div className="text-[120px] sm:text-[180px] font-heading font-black italic leading-none animate-scale-up"
            style={{ color: currentEncounter?.color }}>
            {countdown > 0 ? countdown : '⚔️'}
          </div>
        </div>
      </div>
    );
  }

  /* ── PLAYING ─────────────────────────────────────────── */
  if (raidState === 'playing' && currentQuestion) {
    const enc       = currentEncounter;
    const timerPct  = (timeLeft / 10) * 100;
    const isFinal   = enc?.type === 'final';

    return (
      <div className={`min-h-screen bg-zinc-950 flex flex-col p-4 sm:p-8 font-monda text-white relative select-none overflow-y-auto
        ${shakeScreen ? 'animate-[shake_0.4s_ease]' : ''}`}>

        {/* BG glow per boss color */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at top, ${enc?.color}08 0%, transparent 70%)`
        }} />

        {/* Slash overlay */}
        {slashActive && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="absolute w-[200%] h-3 rotate-[35deg] animate-ping"
              style={{ background: `linear-gradient(90deg, transparent, ${enc?.color}, transparent)`, boxShadow: `0 0 30px ${enc?.color}` }} />
            <div className="absolute w-[200%] h-3 rotate-[-35deg] animate-ping"
              style={{ background: `linear-gradient(90deg, transparent, ${enc?.color}, transparent)`, boxShadow: `0 0 30px ${enc?.color}` }} />
            <span className="text-4xl sm:text-6xl font-heading font-black italic animate-bounce" style={{ color: enc?.color }}>
              💥 -{Math.ceil(enc?.hp / enc?.questionsCount)} HP!
            </span>
          </div>
        )}

        {/* Damage overlay */}
        {shakeScreen && (
          <div className="absolute inset-0 bg-red-600/25 z-50 pointer-events-none flex items-center justify-center">
            <span className="text-3xl sm:text-5xl font-heading font-black italic text-white">⚠️ -{enc?.damageDealt} HP MEUTE!</span>
          </div>
        )}

        {/* Boss panel */}
        <div className="relative z-10 rounded-2xl border p-4 mb-4 space-y-3"
          style={{ borderColor: `${enc?.color}40`, background: `${enc?.color}08` }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl">{enc?.icon}</span>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: enc?.color }}>
                {isFinal ? '💀 BOSS FINAL' : '⚔️ SEMI-BOSS'} · Niveau {enc?.level}
              </div>
              <div className="text-white font-black text-base sm:text-lg">{enc?.name}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-black text-xl italic" style={{ color: enc?.color }}>{score}</div>
              <div className="text-[9px] text-zinc-500 uppercase">pts · x{streak} série</div>
            </div>
          </div>
          <HpBar current={bossHp} max={enc?.hp} color={enc?.color} label="Boss HP" icon="💀" />
          <HpBar current={teamHp} max={100} color="#a855f7" label="Meute HP" icon="🛡️" />
        </div>

        {/* Timer + progress */}
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <span className="text-xs text-zinc-500 font-bold whitespace-nowrap">Q {questionIndex + 1}/{totalQuestions}</span>
          <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${timerPct}%`, background: timerPct > 40 ? '#a855f7' : timerPct > 20 ? '#f97316' : '#ef4444' }} />
          </div>
          <span className={`text-sm font-black w-6 text-right ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
        </div>

        {/* Question */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl sm:text-3xl font-black italic text-center mb-8 leading-tight max-w-3xl font-heading">
            {currentQuestion.question}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
            {currentQuestion.options.map((opt, i) => (
              <button key={i}
                onClick={() => isTimerRunning && handleAnswer(opt)}
                disabled={!isTimerRunning}
                className="p-5 sm:p-6 rounded-2xl border-2 border-white/10 bg-zinc-900/80 text-lg sm:text-xl font-bold
                  hover:border-current hover:bg-current/5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                style={{ '--tw-border-opacity': 1 }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── VICTORY / LEVEL COMPLETE / ALL COMPLETE ────────── */
  if (['victory', 'levelComplete', 'allComplete'].includes(raidState)) {
    const isAll   = raidState === 'allComplete';
    const isLevel = raidState === 'levelComplete';
    const enc     = currentEncounter;

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-monda text-white">
        <div className="max-w-lg w-full text-center space-y-6 animate-scale-up">
          <div className="text-7xl sm:text-9xl">{isAll ? '🏆' : isLevel ? '🎖️' : '✅'}</div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: enc?.color }}>
              {isAll ? 'VICTOIRE ABSOLUE' : isLevel ? `NIVEAU ${enc?.level} COMPLÉTÉ` : 'BOSS VAINCU'}
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black italic uppercase">
              {isAll ? 'Le Néant est Vaincu !' : isLevel ? 'Niveau Terminé !' : `${enc?.name} est vaincu !`}
            </h1>
            {isAll && <p className="text-zinc-400 mt-3 italic">Vous avez terrassé les 3 Boss Finaux et sauvé la Faille. La Meute est légendaire.</p>}
          </div>

          <div className="flex justify-center gap-6">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black italic" style={{ color: enc?.color }}>+{xpEarned}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">XP Gagnée</div>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black italic text-purple-400">{score}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Score Combat</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setRaidState('map')}
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#c28e3a] transition-all cursor-pointer">
              {isAll ? 'Voir la carte' : isLevel ? 'Niveau suivant →' : 'Prochain boss →'}
            </button>
            <button onClick={() => navigate('/quiz')}
              className="px-6 py-4 border border-white/10 text-zinc-400 font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all cursor-pointer">
              Quitter
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DEFEAT ──────────────────────────────────────────── */
  if (raidState === 'defeat') {
    const enc = currentEncounter;
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-monda text-white">
        <div className="max-w-lg w-full text-center space-y-6 animate-scale-up">
          <div className="text-8xl">💀</div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400 mb-2">DÉFAITE</div>
            <h1 className="text-4xl sm:text-5xl font-heading font-black italic uppercase text-red-400">La Meute est Tombée</h1>
            <p className="text-zinc-400 mt-3 italic text-sm">"{enc?.name}" : "{enc?.taunt}"</p>
          </div>

          <div className="bg-black/40 border border-red-500/20 rounded-2xl p-5">
            <div className="text-3xl font-black italic text-red-400">{bossHp} HP</div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold">PV restants du boss</div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => startEncounter(enc)}
              className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all cursor-pointer">
              Recommencer ce combat
            </button>
            <button onClick={() => setRaidState('map')}
              className="px-6 py-4 border border-white/10 text-zinc-400 font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all cursor-pointer">
              Carte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
