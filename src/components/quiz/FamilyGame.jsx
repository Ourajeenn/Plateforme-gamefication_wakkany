import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFamilyGame } from '../../hooks/useFamilyGame';

export default function FamilyGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state?.config || { mode: 'coop', players: [], theme: 'general' };
  
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
    isTimerRunning
  } = useFamilyGame();

  useEffect(() => {
    // Start the game with passed config
    if (gameState === 'home') {
      startGame(config);
    }
  }, [gameState, startGame, config]);

  const currentPlayer = config.mode === 'party' && config.players.length > 0 
    ? config.players[currentQuestionIndex % config.players.length] 
    : 'La Meute';

  if (gameState === 'starting') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-monda text-white">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-[#c28e3a] mb-8 animate-pulse">Préparez-vous</h2>
        <div className="text-[150px] font-heading font-black italic text-white drop-shadow-[0_0_50px_rgba(194,142,58,0.8)] animate-scale-up">
          {startCountdown}
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col p-6 md:p-12 font-monda text-white relative">
        {/* Header */}
        <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 uppercase font-bold tracking-widest text-xs">Question {currentQuestionIndex + 1}/{totalQuestions}</span>
            <div className="h-4 w-px bg-white/20"></div>
            <span className="text-[#c28e3a] font-black uppercase text-sm">Série x{streak}</span>
          </div>

          <div className="flex flex-col items-center">
            {config.mode === 'party' ? (
              <span className="text-xl md:text-3xl font-heading font-black italic uppercase text-[#c28e3a] animate-pulse">
                Tour de {currentPlayer}
              </span>
            ) : (
              <span className="text-xl md:text-3xl font-heading font-black italic uppercase text-white">
                Coop Meute
              </span>
            )}
          </div>

          <div className="text-right flex flex-col">
            <span className="text-3xl font-black italic font-heading">{score}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Points Global</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-2 bg-zinc-900 rounded-full mt-6 overflow-hidden relative">
           <div 
             className="absolute top-0 left-0 h-full bg-[#c28e3a] transition-all duration-1000 ease-linear"
             style={{ width: `${(timeLeft / 8) * 100}%` }}
           ></div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col items-center justify-center mt-8">
           <h2 className="text-3xl md:text-5xl font-black italic text-center mb-16 max-w-4xl drop-shadow-xl font-heading">
             {currentQuestion.question}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
             {currentQuestion.options.map((opt, idx) => (
               <button 
                 key={idx}
                 onClick={() => isTimerRunning && handleAnswer(opt)}
                 disabled={!isTimerRunning}
                 className="bg-zinc-900/80 border-2 border-white/10 p-8 rounded-[30px] hover:border-[#c28e3a] hover:bg-[#c28e3a]/10 transition-all text-xl md:text-2xl font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
               >
                 {opt}
               </button>
             ))}
           </div>
        </div>

        {/* Party Scores overlay if applicable */}
        {config.mode === 'party' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
             {Object.entries(playerScores).map(([p, s]) => (
               <div key={p} className="flex gap-2 items-center text-sm">
                 <span className={`font-bold ${p === currentPlayer ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>{p}</span>
                 <span className="text-white font-black">{s} pts</span>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 font-monda text-white">
        <div className="bg-zinc-900 border border-[#c28e3a]/30 p-12 rounded-[40px] max-w-2xl w-full text-center relative overflow-hidden animate-scale-up">
           <div className="absolute inset-0 bg-[#c28e3a]/5 animate-pulse pointer-events-none"></div>
           <iconify-icon icon="lucide:award" width="80" className="text-[#c28e3a] mb-6 drop-shadow-[0_0_20px_#c28e3a]"></iconify-icon>
           
           <h1 className="text-5xl font-heading font-black italic uppercase mb-2 text-white">Terminé !</h1>
           <p className="text-zinc-400 mb-10">Vous avez rapporté de l'expérience à la Meute.</p>

           <div className="flex justify-center items-center gap-8 mb-12">
             <div className="flex flex-col items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <span className="text-4xl font-black italic text-[#c28e3a] mb-1">{score}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Score Global</span>
             </div>
             <div className="flex flex-col items-center bg-black/50 p-6 rounded-2xl border border-white/5">
                <span className="text-4xl font-black italic text-green-500 mb-1">+{score + 10}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">XP GAGNÉE</span>
             </div>
           </div>

           {config.mode === 'party' && (
             <div className="mb-12">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-4">Classement Individuel</h3>
               <div className="space-y-3">
                 {Object.entries(playerScores).sort((a, b) => b[1] - a[1]).map(([p, s], idx) => (
                   <div key={p} className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
                     <div className="flex items-center gap-4">
                       <span className="text-[#c28e3a] font-black text-xl w-6">{idx + 1}.</span>
                       <span className="font-bold text-lg">{p}</span>
                     </div>
                     <span className="font-black italic">{s} pts</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           <div className="flex gap-4 justify-center">
             <button onClick={() => navigate('/quiz')} className="px-8 py-4 bg-zinc-800 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors">
               Quitter
             </button>
             <button onClick={() => startGame(config)} className="px-8 py-4 bg-[#c28e3a] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(194,142,58,0.3)]">
               Rejouer
             </button>
           </div>
        </div>
      </div>
    );
  }

  return null;
}
