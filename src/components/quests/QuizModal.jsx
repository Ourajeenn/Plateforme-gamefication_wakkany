import React, { useState, useEffect } from 'react';
import { QUIZZES } from '../../data/quizzes';

export default function QuizModal({ quest, onClose, onSuccess, onPenalty }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, checking, correct, wrong, timeout
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [startingCountdown, setStartingCountdown] = useState(3);
  const [isStarting, setIsStarting] = useState(true);

  // Initialize Quiz
  useEffect(() => {
    const branchQuizzes = QUIZZES[quest.branch] || QUIZZES["all"];
    const shuffled = [...branchQuizzes].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
  }, [quest]);

  // Starting Countdown Logic
  useEffect(() => {
    if (!isStarting) return;
    if (startingCountdown === 0) {
      setIsStarting(false);
      return;
    }
    const timer = setInterval(() => {
      setStartingCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarting, startingCountdown]);

  // Timer Logic
  useEffect(() => {
    if (isStarting || status !== 'idle' || isFinished) return;
    
    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status, isFinished, isStarting]);

  const handleTimeout = () => {
    handleWrong();
  };

  const handleWrong = () => {
    const newWrongCount = wrongCount + 1;
    setWrongCount(newWrongCount);
    setStatus('wrong');
    setShowExplanation(true);
    
    // XP Penalty
    if (newWrongCount === 1) {
      onPenalty(1);
    } else {
      onPenalty(3);
    }
    
    autoAdvance();
  };

  const handleOptionClick = (option) => {
    if (status !== 'idle') return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || status !== 'idle') return;

    setStatus('checking');
    
    setTimeout(() => {
      if (selectedOption === currentQuestion.answer) {
        setStatus('correct');
        setScore(prev => prev + 1);
        setShowExplanation(true);
        autoAdvance();
      } else {
        handleWrong();
      }
    }, 1000);
  };

  const autoAdvance = () => {
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setStatus('idle');
        setShowExplanation(false);
        setTimeLeft(15);
      } else {
        setIsFinished(true);
      }
    }, 3000);
  };

  const currentQuestion = questions[currentIndex];

  if (isStarting) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl">
        <div className="text-center animate-scale-up">
           <h2 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.5em] mb-8">Initialisation du Nexus</h2>
           <div className="text-[120px] font-heading font-black italic text-white animate-pulse">
             {startingCountdown === 0 ? 'GO !' : startingCountdown}
           </div>
           <p className="text-zinc-600 mt-8 font-monda text-sm uppercase tracking-widest italic">
             Préparez-vous à l'extraction de données...
           </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion && !isFinished) return null;

  if (isFinished) {
    const passed = score >= 3; 
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
         <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[40px] p-12 text-center animate-scale-up">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8 border-2 ${passed ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
               <iconify-icon icon={passed ? "lucide:trophy" : "lucide:alert-triangle"} width="48"></iconify-icon>
            </div>
            <h2 className="text-white text-3xl font-heading font-black italic uppercase mb-2">
               {passed ? 'DÉBRIEFING POSITIF' : 'ÉCHEC DE LA MISSION'}
            </h2>
            <p className="text-zinc-500 uppercase text-[10px] font-black tracking-widest mb-8">
               SCORE FINAL : {score} / {questions.length}
            </p>
            
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm font-monda italic leading-relaxed">
                {passed 
                  ? "Votre maîtrise du savoir est impressionnante. L'expérience a été transférée vers votre noyau central." 
                  : "Votre manque de connaissances a compromis l'extraction. Retentez l'épreuve pour obtenir l'XP."}
              </p>
              
              <div className="pt-8 flex flex-col gap-3">
                 {passed ? (
                    <button 
                      onClick={() => onSuccess(quest)}
                      className="w-full py-5 bg-green-500 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-green-900/20"
                    >
                      RÉCUPÉRER {quest.xpReward} XP
                    </button>
                 ) : (
                    <button 
                      onClick={onClose}
                      className="w-full py-5 bg-zinc-800 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-zinc-700 transition-all"
                    >
                      RETOURNER AU HUB
                    </button>
                 )}
              </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 overflow-y-auto selection:bg-[#c28e3a] selection:text-black">
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden">
        {/* Progress Bar Timer */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900">
           <div 
             className={`h-full transition-all duration-1000 linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-[#c28e3a]'}`}
             style={{ width: `${(timeLeft / 15) * 100}%` }}
           ></div>
        </div>

        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#c28e3a]/10 text-[#c28e3a] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#c28e3a]/20">
                   QUESTION {currentIndex + 1} / {questions.length}
                </span>
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`}>
                   <iconify-icon icon="lucide:clock" width="12"></iconify-icon>
                   00:{timeLeft.toString().padStart(2, '0')}
                </div>
                {wrongCount > 0 && (
                   <div className="flex items-center gap-1 text-red-500 text-[8px] font-black uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                      <iconify-icon icon="lucide:minus" width="8"></iconify-icon>
                      {wrongCount === 1 ? '1 XP' : '3 XP'}
                   </div>
                )}
              </div>
              <h2 className="text-white text-2xl font-heading font-black italic uppercase tracking-tighter">
                {quest.title}
              </h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
              <iconify-icon icon="lucide:x" width="20"></iconify-icon>
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl relative group">
              <iconify-icon icon="lucide:quote-left" width="24" className="absolute -top-3 -left-3 text-zinc-800"></iconify-icon>
              <p className="text-white text-xl font-monda text-center leading-relaxed italic">
                {currentQuestion.question}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = (status === 'correct' || status === 'wrong') && option === currentQuestion.answer;
                const isWrong = status === 'wrong' && isSelected && option !== currentQuestion.answer;
                
                return (
                  <button
                    key={idx}
                    disabled={status !== 'idle'}
                    onClick={() => handleOptionClick(option)}
                    className={`
                      relative p-6 rounded-2xl border transition-all duration-300 text-left group
                      ${isSelected ? 'bg-[#c28e3a]/10 border-[#c28e3a] shadow-lg shadow-[#c28e3a]/10' : 'bg-black/40 border-white/5 hover:border-white/20'}
                      ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-500' : ''}
                      ${isWrong ? 'bg-red-500/20 border-red-500 text-red-500' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border
                        ${isSelected ? 'bg-[#c28e3a] text-black border-[#c28e3a]' : 'bg-zinc-900 text-zinc-500 border-white/5'}
                        ${isCorrect ? 'bg-green-500 text-white border-green-500' : ''}
                        ${isWrong ? 'bg-red-500 text-white border-red-500' : ''}
                      `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className={`p-6 rounded-2xl border animate-scale-up ${status === 'correct' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="flex items-center gap-3 mb-2">
                   <iconify-icon icon={status === 'correct' ? "lucide:check-circle" : "lucide:alert-circle"} width="20" className={status === 'correct' ? 'text-green-500' : 'text-red-500'}></iconify-icon>
                   <span className={`text-xs font-black uppercase tracking-widest ${status === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                     {status === 'correct' ? 'ANALYSE CORRECTE' : 'ERREUR DÉTECTÉE'}
                   </span>
                </div>
                <p className="text-zinc-300 text-xs font-monda leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || status !== 'idle'}
                className={`
                  w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all transform active:scale-95 shadow-2xl
                  ${!selectedOption ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 
                    status === 'correct' ? 'bg-green-500 text-white' :
                    status === 'wrong' ? 'bg-red-500 text-white' :
                    'bg-[#c28e3a] text-black hover:brightness-110 shadow-lg shadow-orange-950/20'}
                `}
              >
                {status === 'checking' ? (
                  <iconify-icon icon="lucide:loader-2" className="animate-spin" width="24"></iconify-icon>
                ) : status === 'correct' ? (
                  'RÉPONSE VALIDÉE'
                ) : status === 'wrong' ? (
                  'PRÉPARATION DU PROCHAIN ROUND...'
                ) : (
                  'VALIDER LA RÉPONSE'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
