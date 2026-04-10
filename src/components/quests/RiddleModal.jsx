import React, { useState, useEffect } from 'react';
import useRiddle from '../../hooks/useRiddle';

export default function RiddleModal({ quest, onClose, onSuccess }) {
  const { generateRiddle, currentRiddle, loading, error } = useRiddle();
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, correct, wrong
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    generateRiddle(quest.riddleTheme, quest.difficulty);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentRiddle) return;

    if (userAnswer.toLowerCase().trim() === currentRiddle.answer.toLowerCase()) {
      setStatus('correct');
      setTimeout(() => onSuccess(quest), 1500);
    } else {
      setStatus('wrong');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 2) setShowHint(true);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Progress Bar (Decoration) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
           <div className={`h-full transition-all duration-500 ${status === 'correct' ? 'bg-green-500 w-full' : 'bg-[#c28e3a] w-1/3'}`}></div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <h2 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em]">Épreuve de Quête</h2>
              <span className="text-white font-heading font-bold italic uppercase text-lg">{quest.title}</span>
            </div>
            <button onClick={onClose} className="text-zinc-700 hover:text-white transition-colors">
              <iconify-icon icon="lucide:x" width="24"></iconify-icon>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-[#c28e3a]/20 border-t-[#c28e3a] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <iconify-icon icon="lucide:brain" className="text-[#c28e3a] animate-pulse" width="24"></iconify-icon>
                </div>
              </div>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">Consultation des archives éthérées...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
               <p className="text-red-500 mb-4">{error}</p>
               <button onClick={onClose} className="px-6 py-2 bg-zinc-800 text-white rounded-lg">Fermer</button>
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              {/* Lore Context */}
              <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                <p className="text-zinc-400 text-sm italic leading-relaxed text-center">
                  "{quest.lore}"
                </p>
              </div>

              {/* Riddle Question */}
              <div className="text-center py-4">
                 <p className="text-white text-xl font-heading leading-relaxed">
                   {currentRiddle?.question}
                 </p>
              </div>

              {/* Hint */}
              {showHint && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center gap-3">
                  <iconify-icon icon="lucide:lightbulb" className="text-orange-500" width="20"></iconify-icon>
                  <p className="text-orange-200 text-xs">Indice: <span className="italic">{currentRiddle?.hint}</span></p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className={`w-full bg-black border ${status === 'correct' ? 'border-green-500' : status === 'wrong' ? 'border-red-500' : 'border-white/10'} px-6 py-4 rounded-2xl text-white text-center outline-none focus:border-[#c28e3a] transition-all font-monda text-lg`}
                />
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === 'correct'}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 flex items-center justify-center gap-3
                      ${status === 'correct' ? 'bg-green-500 text-white' : 'bg-[#c28e3a] text-black hover:brightness-110 shadow-lg shadow-orange-950/20'}`}
                  >
                    {status === 'correct' ? (
                      <>
                        <iconify-icon icon="lucide:check-circle" width="20"></iconify-icon>
                        RÉSOLU !
                      </>
                    ) : (
                      'VALIDER LA RÉPONSE'
                    )}
                  </button>
                </div>
              </form>

              <p className="text-zinc-600 text-[10px] text-center uppercase tracking-widest font-bold">
                 {attempts > 0 ? `${attempts} Tentative(s)` : 'Trouvez la réponse pour obtenir l\'XP'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
