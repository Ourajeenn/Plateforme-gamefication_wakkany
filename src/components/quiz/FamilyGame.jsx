import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFamilyGame } from '../../hooks/useFamilyGame';

export default function FamilyGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state?.config || { mode: 'coop', players: [], theme: 'general', difficulty: 'hunter', timerLimit: 8 };
  
  const {
    gameState,
    gameConfig,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    score,
    streak,
    playerScores,
    startCountdown,
    timeLeft,
    startGame,
    handleAnswer,
    isTimerRunning,
    bossHp,
    teamHp,
    bossName,
    answersHistory,
    speedBonus
  } = useFamilyGame();

  // local states for Jokers and Help System
  const [jokers, setJokers] = useState(() => {
    const saved = localStorage.getItem('wakkany_jokers');
    return saved !== null ? parseInt(saved, 10) : 2;
  });
  const [activeHelp, setActiveHelp] = useState(false);
  const [helpCountdown, setHelpCountdown] = useState(3);
  const [helpSender, setHelpSender] = useState('');
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  // Sword Slashes & Boss Damage overlays
  const [activeSlash, setActiveSlash] = useState(false);
  const [activeHit, setActiveHit] = useState(false);

  useEffect(() => {
    localStorage.setItem('wakkany_jokers', jokers);
  }, [jokers]);

  useEffect(() => {
    // Reset helper states for each new question
    setActiveHelp(false);
    setRevealedAnswer(false);
  }, [currentQuestionIndex]);

  const playQuizSFX = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      if (type === 'joker') {
        // High magic chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
      } else if (type === 'help') {
        // Sci fi telemetry sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.5);
      } else if (type === 'slash') {
        // Blade slash sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.25);
      } else if (type === 'hit') {
        // Impact thump sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
      }
    } catch(e) {}
  };

  // Continuous synthesized heartbeat soundtrack
  useEffect(() => {
    if (!isTimerRunning || gameState !== 'playing') return;

    let intervalMs = 1300;
    if (timeLeft <= 5 && timeLeft > 2) intervalMs = 750;
    if (timeLeft <= 2) intervalMs = 450;

    const playHeartbeat = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        // Lub (Beat 1)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65, now);
        osc1.frequency.exponentialRampToValueAtTime(10, now + 0.12);
        gain1.gain.setValueAtTime(timeLeft <= 3 ? 0.14 : 0.07, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(now + 0.12);

        // Dub (Beat 2 - 0.15s later)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(55, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(10, now + 0.15 + 0.15);
        gain2.gain.setValueAtTime(timeLeft <= 3 ? 0.14 : 0.07, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15 + 0.15);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.15 + 0.15);

      } catch (e) {}
    };

    playHeartbeat();
    const timer = setInterval(playHeartbeat, intervalMs);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning, gameState]);

  useEffect(() => {
    if (gameState === 'home') {
      startGame(config);
    }
  }, [gameState, startGame, config]);

  const currentPlayer = config.mode === 'party' && config.players.length > 0 
    ? config.players[currentQuestionIndex % config.players.length] 
    : 'La Meute';

  // Wrapper around handleAnswer to trigger visual overlays
  const onAnswerSelect = (opt) => {
    if (opt === currentQuestion.answer) {
      setActiveSlash(true);
      playQuizSFX('slash');
      setTimeout(() => setActiveSlash(false), 900);
    } else {
      setActiveHit(true);
      playQuizSFX('hit');
      setTimeout(() => setActiveHit(false), 900);
    }
    handleAnswer(opt);
  };

  // Use Joker logic during game
  const triggerJoker = () => {
    if (jokers <= 0 || !isTimerRunning || revealedAnswer || activeHelp) return;
    
    setJokers(prev => prev - 1);
    playQuizSFX('joker');
    onAnswerSelect(currentQuestion.answer);
  };

  // Demande d'aide logic during game
  const triggerHelp = () => {
    if (activeHelp || !isTimerRunning || revealedAnswer) return;
    
    setActiveHelp(true);
    setHelpCountdown(3);
    
    const senders = ["Papa", "Maman", "Grand-Frère", "Grande-Sœur"];
    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    setHelpSender(randomSender);
    playQuizSFX('help');

    const interval = setInterval(() => {
      setHelpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          playQuizSFX('joker'); // Play chime
          setRevealedAnswer(true);
          setActiveHelp(false);
          
          // Trigger family helper achievement
          try {
            const unlocked = JSON.parse(localStorage.getItem('wakkany_achievements') || '[]');
            if (!unlocked.includes('family_assist')) {
              unlocked.push('family_assist');
              localStorage.setItem('wakkany_achievements', JSON.stringify(unlocked));
            }
          } catch(e) {}

          return 0;
        }
        playQuizSFX('help');
        return prev - 1;
      });
    }, 1000);
  };

  if (gameState === 'starting') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-monda text-white">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-[#c28e3a] mb-8 animate-pulse">Préparez-vous</h2>
        <div className="text-[150px] font-heading font-black italic text-white drop-shadow-[0_0_5px_rgba(194,142,58,0.8)] animate-scale-up">
          {startCountdown}
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col p-6 md:p-12 font-monda text-white relative select-none overflow-y-auto">
        
        {/* Full-screen Slash Overlay for Boss Hits */}
        {activeSlash && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            {/* Double Diagonal Red Neon Slashes */}
            <div className="absolute w-[150%] h-4 bg-gradient-to-r from-transparent via-red-500 to-transparent rotate-[35deg] shadow-[0_0_40px_#ef4444] animate-[ping_0.3s_ease-out_infinite]"></div>
            <div className="absolute w-[150%] h-4 bg-gradient-to-r from-transparent via-red-500 to-transparent rotate-[-35deg] shadow-[0_0_40px_#ef4444] animate-[ping_0.3s_ease-out_infinite]"></div>
            <span className="absolute text-5xl md:text-7xl font-heading font-black italic text-red-500 drop-shadow-[0_0_20px_#ef4444] tracking-wider animate-bounce">
              💥 -25 HP!
            </span>
          </div>
        )}

        {/* Full-screen Flash hit on Team HP loss */}
        {activeHit && (
          <div className="absolute inset-0 bg-red-600/30 z-50 pointer-events-none transition-opacity duration-300 flex items-center justify-center">
            <span className="text-5xl md:text-7xl font-heading font-black italic text-white drop-shadow-[0_0_20px_#ef4444] tracking-widest uppercase">
              ⚠️ DÉGÂTS REÇUS!
            </span>
          </div>
        )}

        {/* Holographic scanning background line */}
        <div className="absolute inset-x-0 h-0.5 bg-[#c28e3a]/10 shadow-[0_0_10px_rgba(194,142,58,0.1)] animate-[scanLine_8s_linear_infinite] pointer-events-none"></div>

        {/* Boss HP panel if Boss Mode */}
        {gameConfig.mode === 'boss' && (
          <div className="w-full bg-zinc-900 border border-red-500/20 rounded-[30px] p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md z-10">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
            
            {/* Boss Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                <iconify-icon icon="mdi:skull" width="36"></iconify-icon>
              </div>
              <div>
                <h3 className="text-xl font-heading font-black italic uppercase text-red-500 tracking-wider">{bossName}</h3>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Boss de Faille Chronos</span>
              </div>
            </div>

            {/* Boss Health Bar */}
            <div className="flex-1 max-w-lg w-full space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-red-400">Points de Vie du Boss</span>
                <span className="text-red-400 font-black">{bossHp} / 100 HP</span>
              </div>
              <div className="h-4 bg-black rounded-full overflow-hidden border border-red-500/20 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-red-950 via-red-600 to-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-500"
                  style={{ width: `${bossHp}%` }}
                ></div>
              </div>
            </div>

            {/* Team HP (The Meute) */}
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-[#c28e3a]">🛡️ PV de la Meute</span>
                <span className="text-[#e8b96a] font-black">{teamHp} / 100 HP</span>
              </div>
              <div className="h-3 bg-black rounded-full overflow-hidden border border-[#c28e3a]/20 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#a1752b] to-[#c28e3a] rounded-full shadow-[0_0_10px_rgba(194,142,58,0.4)] transition-all duration-500"
                  style={{ width: `${teamHp}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-3xl border border-white/10 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 uppercase font-bold tracking-widest text-xs">Question {currentQuestionIndex + 1}/{totalQuestions}</span>
            <div className="h-4 w-px bg-white/20"></div>
            <span className="text-purple-400 font-black uppercase text-sm">Série x{streak}</span>
          </div>

          <div className="flex flex-col items-center">
            {gameConfig.mode === 'party' ? (
              <span className="text-xl md:text-3xl font-heading font-black italic uppercase text-[#c28e3a] animate-pulse">
                Tour de {currentPlayer}
              </span>
            ) : gameConfig.mode === 'boss' ? (
              <span className="text-xl md:text-3xl font-heading font-black italic uppercase text-red-500 animate-pulse">
                Raid de Boss
              </span>
            ) : (
              <span className="text-xl md:text-3xl font-heading font-black italic uppercase text-white">
                Coop Meute
              </span>
            )}
          </div>

          <div className="text-right flex flex-col">
            <span className="text-3xl font-black italic font-heading text-purple-400">{score}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Points Global</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-2 bg-zinc-900 rounded-full mt-6 overflow-hidden relative z-10 border border-white/5">
           <div 
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-800 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-linear"
             style={{ width: `${(timeLeft / (gameConfig.timerLimit || 8)) * 100}%` }}
           ></div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col items-center justify-center mt-8 relative z-10">
           
           {/* Active Help Request overlay */}
           {activeHelp && (
             <div className="mb-8 bg-purple-900/10 border border-purple-500/30 rounded-2xl px-8 py-4 text-center animate-scale-up shadow-[0_0_20px_rgba(168,85,247,0.15)] max-w-md w-full">
               <div className="flex items-center justify-center gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-t-purple-400 border-r-transparent animate-spin"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 animate-pulse">LIAISON DE MEUTE EN COURS...</span>
               </div>
               <p className="text-zinc-400 text-xs mt-2 font-monda">
                 {helpSender} cherche la bonne réponse dans sa banque neuronale... ({helpCountdown}s)
               </p>
             </div>
           )}

           {/* Revealed Answer Message from family */}
           {revealedAnswer && (
             <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-8 py-4 text-center animate-scale-up shadow-[0_0_20px_rgba(52,199,89,0.15)] max-w-lg w-full">
               <div className="flex items-center justify-center gap-2">
                 <span className="text-xl">👥</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">RÉVÉLATION DE LA MEUTE !</span>
               </div>
               <p className="text-zinc-300 text-sm mt-2 font-bold font-monda">
                 🔑 <span className="text-emerald-400 font-black">{helpSender}</span> : "C'est la réponse en <span className="text-emerald-400 font-black font-heading italic text-lg">{currentQuestion.answer}</span>, j'en suis absolument certain !"
               </p>
             </div>
           )}

           <h2 className="text-3xl md:text-5xl font-black italic text-center mb-12 max-w-4xl drop-shadow-xl font-heading leading-tight">
             {currentQuestion.question}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
             {currentQuestion.options.map((opt, idx) => {
               const isCorrect = opt === currentQuestion.answer;
               const highlightClass = revealedAnswer && isCorrect
                 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-[0_0_25px_rgba(52,199,89,0.25)] animate-pulse scale-105'
                 : 'border-white/10 bg-zinc-900/80 hover:border-purple-500 hover:bg-purple-500/5 hover:scale-102';
                 
               return (
                 <button 
                   key={idx}
                   onClick={() => isTimerRunning && onAnswerSelect(opt)}
                   disabled={!isTimerRunning || activeHelp}
                   className={`p-8 rounded-[30px] border-2 transition-all text-xl md:text-2xl font-bold cursor-pointer active:scale-98 disabled:opacity-50 disabled:hover:scale-100 ${highlightClass}`}
                 >
                   {opt}
                 </button>
               );
             })}
           </div>
        </div>

        {/* Action Panel for Jokers & Help in gameplay */}
        <div className="relative z-10 flex justify-center gap-6 mt-8 max-w-2xl mx-auto w-full">
          
          {/* Joker Button */}
          <button
            onClick={triggerJoker}
            disabled={jokers <= 0 || !isTimerRunning || revealedAnswer || activeHelp}
            className={`flex-1 py-4 rounded-2xl border flex items-center justify-center gap-3 font-heading font-black text-xs uppercase tracking-widest transition-all duration-300
              ${jokers > 0 && isTimerRunning && !revealedAnswer && !activeHelp
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-500 hover:text-black cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
          >
            <span>🃏 Joker (SKIP CORRECT)</span>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">{jokers} restant{jokers > 1 ? 's' : ''}</span>
          </button>

          {/* Help Button */}
          <button
            onClick={triggerHelp}
            disabled={activeHelp || !isTimerRunning || revealedAnswer}
            className={`flex-1 py-4 rounded-2xl border flex items-center justify-center gap-3 font-heading font-black text-xs uppercase tracking-widest transition-all duration-300
              ${!activeHelp && isTimerRunning && !revealedAnswer
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black cursor-pointer shadow-[0_0_15px_rgba(52,199,89,0.2)]'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
          >
            <span>👥 Demander à la Meute</span>
          </button>

        </div>

        {/* Party Scores Overlay */}
        {gameConfig.mode === 'party' && (
          <div className="absolute bottom-6 left-6 flex gap-4 bg-black/80 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md z-10">
             {Object.entries(playerScores).map(([p, s]) => (
               <div key={p} className="flex gap-2 items-center text-xs">
                 <span className={`font-bold ${p === currentPlayer ? 'text-purple-400' : 'text-zinc-500'}`}>{p}</span>
                 <span className="text-white font-black">{s} pts</span>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'results') {
    const isBossVictory = gameConfig.mode === 'boss' && bossHp <= 0;
    const isBossDefeat = gameConfig.mode === 'boss' && teamHp <= 0;
    const correctCount = answersHistory.filter(a => a.correct).length;
    const totalCount = answersHistory.length || totalQuestions;
    const avgTime = answersHistory.length > 0
      ? Math.round(answersHistory.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / answersHistory.length)
      : 0;
    const basePoints = correctCount * 100;
    const totalScore = basePoints + speedBonus;
    const maxScore = totalCount * 100 + totalCount * 50; // max base + max speed bonus
    const scorePercent = Math.min(100, Math.round((totalScore / Math.max(maxScore, 1)) * 100));
    
    // mode label
    const modeLabel = gameConfig.mode === 'coop' ? 'Mode Coop Meute' 
      : gameConfig.mode === 'party' ? `Party Salon (${gameConfig.players?.length || 0} joueurs)`
      : 'Raid de Boss';

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start overflow-y-auto text-white pb-36 font-monda">

        {/* Gold radial glow at top */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(194,142,58,0.08)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 w-full max-w-xl px-4 pt-14 flex flex-col items-center gap-5">

          {/* Trophy + Title */}
          <div className="flex flex-col items-center gap-3">
            {isBossVictory ? (
              <iconify-icon icon="mdi:trophy" width="60" class="text-[#c28e3a] drop-shadow-[0_0_24px_rgba(194,142,58,0.6)]"></iconify-icon>
            ) : isBossDefeat ? (
              <iconify-icon icon="mdi:skull" width="60" class="text-red-500 drop-shadow-[0_0_24px_rgba(239,68,68,0.5)]"></iconify-icon>
            ) : (
              <iconify-icon icon="mdi:trophy" width="60" class="text-[#c28e3a] drop-shadow-[0_0_24px_rgba(194,142,58,0.6)]"></iconify-icon>
            )}
            <h1 className="text-3xl font-heading font-black italic uppercase text-white tracking-tight text-center">
              {isBossVictory ? 'Raid Réussi !' : isBossDefeat ? 'Raid Échoué...' : 'Quiz Terminé !'}
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">{modeLabel}</p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c28e3a]/60 to-transparent" />
          </div>

          {/* Score Total Card */}
          <div className="w-full bg-zinc-900 border border-[#c28e3a]/20 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
            <span className="text-[9px] text-[#c28e3a] uppercase tracking-[0.35em] font-black">Score Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl font-heading font-black text-[#c28e3a]">{totalScore}</span>
              <span className="text-xl text-[#c28e3a]/50 font-bold">pts</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {correctCount} bonne{correctCount !== 1 ? 's' : ''} réponse{correctCount !== 1 ? 's' : ''} sur {totalCount} · Temps moyen : {avgTime}s
            </p>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${scorePercent}%`, background: 'linear-gradient(90deg, #c28e3a, #e8b96a)' }}
              />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="w-full bg-zinc-900 border border-white/8 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-[9px] text-zinc-500 uppercase tracking-[0.35em] font-black block">Détail du score</span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <iconify-icon icon="mdi:check" class="text-[#c28e3a]" width="16"></iconify-icon>
                <span className="text-sm text-zinc-300 font-monda">Bonnes réponses × 100 pts</span>
              </div>
              <span className="text-sm font-black text-white font-heading">{basePoints}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <iconify-icon icon="mdi:lightning-bolt" class="text-[#c28e3a]" width="16"></iconify-icon>
                <span className="text-sm text-zinc-300 font-monda">Bonus vitesse</span>
              </div>
              <span className="text-sm font-black text-[#c28e3a] font-heading">+{speedBonus}</span>
            </div>

            {/* Final Score */}
            <div className="mt-2 bg-[#c28e3a]/8 border border-[#c28e3a]/20 rounded-xl p-4 flex flex-col items-center gap-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-[0.35em] font-black">Score Final</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-heading font-black text-[#c28e3a]">{totalScore}</span>
                <span className="text-zinc-600 text-xl font-bold">/{maxScore}</span>
              </div>
              <p className="text-[10px] text-zinc-600 text-center mt-1">100 pts par bonne réponse + bonus vitesse</p>
            </div>

            {/* CTA inline */}
            <button
              onClick={() => navigate('/quiz')}
              className="w-full mt-2 py-3 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-700 hover:text-white hover:border-[#c28e3a]/30 transition-all cursor-pointer"
            >
              🎯 Continue à t&apos;entraîner !
            </button>
          </div>

          {/* Party Mode Leaderboard */}
          {gameConfig.mode === 'party' && Object.keys(playerScores).length > 0 && (
            <div className="w-full bg-zinc-900 border border-white/8 rounded-2xl p-5 shadow-xl space-y-3">
              <span className="text-[9px] text-zinc-500 uppercase tracking-[0.35em] font-black block">Classement des Chasseurs</span>
              <div className="space-y-2">
                {Object.entries(playerScores).sort((a, b) => b[1] - a[1]).map(([p, s], idx) => (
                  <div key={p} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[#c28e3a] font-black text-sm w-5 font-heading">{idx + 1}.</span>
                      <span className="font-bold text-zinc-300 font-monda">{p}</span>
                    </div>
                    <span className="font-black italic text-white text-sm font-heading">{s} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recap */}
          {answersHistory.length > 0 && (
            <div className="w-full bg-zinc-900 border border-white/8 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-white/8">
                <span className="text-[9px] text-zinc-500 uppercase tracking-[0.35em] font-black">Récapitulatif</span>
              </div>
              <div className="divide-y divide-white/5">
                {answersHistory.map((item, idx) => (
                  <div key={idx} className="px-5 py-4 flex flex-col gap-1.5">
                    <div className="flex items-start gap-2">
                      {item.correct ? (
                        <iconify-icon icon="mdi:check-circle" class="text-[#c28e3a] flex-shrink-0 mt-0.5" width="16"></iconify-icon>
                      ) : (
                        <iconify-icon icon="mdi:close-circle" class="text-red-500 flex-shrink-0 mt-0.5" width="16"></iconify-icon>
                      )}
                      <p className="text-xs font-bold text-zinc-200 leading-tight line-clamp-2 font-monda">
                        {item.question}
                      </p>
                    </div>
                    <div className="ml-6 flex flex-col gap-0.5">
                      <p className="text-[11px] text-zinc-500 font-monda">
                        Ta réponse : <span className={item.correct ? 'text-[#c28e3a]' : 'text-red-400'}>
                          {item.userAnswer || 'Sans réponse'}
                        </span>
                        {!item.correct && (
                          <>
                            {' · '}Bonne réponse : <span className="text-[#c28e3a]">{item.correctAnswer}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 inset-x-0 z-20 bg-zinc-950/95 backdrop-blur-md border-t border-white/8 flex items-center justify-center gap-3 p-4">
          <button
            onClick={() => startGame(config)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#c28e3a] text-black font-black uppercase tracking-widest text-[11px] hover:bg-[#e8b96a] active:scale-95 transition-all shadow-[0_0_24px_rgba(194,142,58,0.3)] cursor-pointer"
          >
            <iconify-icon icon="mdi:refresh" width="18"></iconify-icon>
            Recommencer
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 font-bold uppercase tracking-widest text-[11px] hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          >
            <iconify-icon icon="mdi:arrow-left" width="18"></iconify-icon>
            Autres quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
}


