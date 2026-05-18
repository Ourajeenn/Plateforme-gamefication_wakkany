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
    bossName
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

  useEffect(() => {
    // Global body scroll lock
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
      <div className="min-h-screen bg-zinc-950 flex flex-col p-6 md:p-12 font-monda text-white relative select-none overflow-hidden">
        
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
        <div className="absolute inset-x-0 h-0.5 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.1)] animate-[scanLine_8s_linear_infinite] pointer-events-none"></div>

        {/* Boss HP panel if Boss Mode */}
        {gameConfig.mode === 'boss' && (
          <div className="w-full bg-zinc-900 border border-red-500/20 rounded-[30px] p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md z-10">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
            
            {/* Boss Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse">
                <iconify-icon icon="lucide:skull" width="36"></iconify-icon>
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
                <span className="text-purple-400">🛡️ PV de la Meute</span>
                <span className="text-purple-300 font-black">{teamHp} / 100 HP</span>
              </div>
              <div className="h-3 bg-black rounded-full overflow-hidden border border-purple-500/20 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-800 to-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-500"
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

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 font-monda text-white">
        <div className={`bg-zinc-900 border p-12 rounded-[40px] max-w-2xl w-full text-center relative overflow-hidden animate-scale-up shadow-[0_0_30px_rgba(168,85,247,0.1)]
          ${isBossVictory ? 'border-green-500/30' : isBossDefeat ? 'border-red-500/30' : 'border-purple-500/30'}`}>
           
           <div className={`absolute inset-0 pointer-events-none animate-pulse
             ${isBossVictory ? 'bg-green-500/5' : isBossDefeat ? 'bg-red-500/5' : 'bg-purple-500/5'}`}></div>
           
           {isBossVictory ? (
             <iconify-icon icon="lucide:trophy" width="80" className="text-green-400 mb-6 drop-shadow-[0_0_20px_rgba(52,199,89,0.7)] animate-bounce"></iconify-icon>
           ) : isBossDefeat ? (
             <iconify-icon icon="lucide:skull" width="80" className="text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse"></iconify-icon>
           ) : (
             <iconify-icon icon="lucide:award" width="80" className="text-purple-400 mb-6 drop-shadow-[0_0_20px_#a855f7]"></iconify-icon>
           )}
           
           <h1 className="text-5xl font-heading font-black italic uppercase mb-2 text-white">
             {isBossVictory ? "RAID RÉUSSI !" : isBossDefeat ? "RAID ÉCHOUÉ..." : "ÉPREUVE TERMINÉE !"}
           </h1>
           
           <p className="text-zinc-400 mb-10">
             {isBossVictory ? `Vous avez terrassé le ${bossName} avec honneur !` : isBossDefeat ? `Le ${bossName} a décimé la meute...` : "Vous avez combattu avec honneur et rapporté de l'XP à la Meute."}
           </p>

           <div className="flex justify-center items-center gap-8 mb-12">
             <div className="flex flex-col items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <span className="text-4xl font-black italic text-purple-400 mb-1">{score}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Score Global</span>
             </div>
             <div className="flex flex-col items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <span className={`text-4xl font-black italic mb-1 ${isBossVictory ? 'text-green-400' : 'text-green-500'}`}>
                  +{isBossVictory ? score + 30 : score + 10}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">XP GAGNÉE</span>
             </div>
           </div>

           {gameConfig.mode === 'party' && (
             <div className="mb-12">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4">Classement des Chasseurs</h3>
               <div className="space-y-3">
                 {Object.entries(playerScores).sort((a, b) => b[1] - a[1]).map(([p, s], idx) => (
                   <div key={p} className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
                     <div className="flex items-center gap-4">
                       <span className="text-purple-400 font-black text-xl w-6">{idx + 1}.</span>
                       <span className="font-bold text-lg text-zinc-300">{p}</span>
                     </div>
                     <span className="font-black italic text-white">{s} pts</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           <div className="flex gap-4 justify-center">
             <button onClick={() => navigate('/quiz')} className="px-8 py-4 bg-zinc-850 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors cursor-pointer">
               Quitter
             </button>
             <button onClick={() => startGame(config)} className="px-8 py-4 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer">
               Recommencer
             </button>
           </div>
        </div>
      </div>
    );
  }

  return null;
}
