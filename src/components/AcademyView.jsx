import React, { useState } from 'react';
import FeatureTabs from './navigation/FeatureTabs';
import usePresentation from '../hooks/usePresentation';
import useSpelling from '../hooks/useSpelling';

import PresentationTopic from './presentation/PresentationTopic';
import PresentationMode from './presentation/PresentationMode';
import PresentationResult from './presentation/PresentationResult';

import SpellingGame from './spelling/SpellingGame';
import SpellResult from './spelling/SpellResult';
import SpellProgress from './spelling/SpellProgress';
import Button from './common/Button';
import GameCountdown from './common/GameCountdown';

import { useNavigate } from 'react-router-dom';

export default function AcademyView() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('presentation'); // 'presentation' | 'spelling'
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownAction, setCountdownAction] = useState(null);

  const { 
    topic, 
    status: presStatus, 
    timeRemaining, 
    score: presScore, 
    selectRandomTopic, 
    startPresentation, 
    finishPresentation, 
    reset: resetPres 
  } = usePresentation();

  const {
    currentWord,
    status: spellStatus,
    score: spellScore,
    attempts,
    lastResult,
    startNewWord,
    submitSpelling,
    reset: resetSpell
  } = useSpelling();

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    resetPres();
    resetSpell();
  };

  const triggerCountdown = (action) => {
    setCountdownAction(() => action);
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    if (countdownAction) countdownAction();
  };

  return (
    <div className="bg-zinc-900/30 rounded-3xl border border-white/5 p-4 sm:p-8 backdrop-blur-xl relative overflow-hidden min-h-[600px] mt-8 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate('/quiz')}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 text-zinc-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest text-xs font-bold"
      >
        <iconify-icon icon="lucide:arrow-left"></iconify-icon> Retour au Salon
      </button>

      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c28e3a]/5 blur-[100px] pointer-events-none"></div>

      <div className="mb-8 mt-12 sm:mt-0 text-center sm:text-left">
         <h2 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Centre de formation</h2>
         <h1 className="text-white text-4xl font-heading font-bold italic uppercase tracking-tighter mb-8">ARÈNE DU SAVOIR</h1>
         
         <FeatureTabs currentTab={currentTab} onTabChange={handleTabChange} />
      </div>

      <div className="relative z-10">
        {showCountdown && <GameCountdown onComplete={handleCountdownComplete} />}

        {currentTab === 'presentation' && (
          <div>
            {presStatus === 'idle' && (
              <div className="text-center py-12">
                <h3 className="text-white text-2xl font-heading italic uppercase mb-6">Prêt pour un exposé ?</h3>
                <Button onClick={selectRandomTopic}>Générer un sujet</Button>
              </div>
            )}
            {presStatus === 'prep' && (
              <PresentationTopic topic={topic} onStartPrep={() => triggerCountdown(() => startPresentation(60))} onReroll={selectRandomTopic} />
            )}
            {presStatus === 'presenting' && (
              <PresentationMode topic={topic} timeRemaining={timeRemaining} onFinish={finishPresentation} />
            )}
            {presStatus === 'result' && (
              <PresentationResult score={presScore} topic={topic} onReset={resetPres} />
            )}
          </div>
        )}

        {currentTab === 'spelling' && (
          <div>
            <SpellProgress score={spellScore} attempts={attempts} />
            
            {spellStatus === 'idle' && (
              <div className="text-center py-12">
                <h3 className="text-white text-2xl font-heading italic uppercase mb-6">Concours d'orthographe</h3>
                <Button onClick={() => triggerCountdown(startNewWord)}>Démarrer une session</Button>
              </div>
            )}
            
            {spellStatus === 'playing' && (
              <SpellingGame 
                word={currentWord} 
                attempts={attempts}
                onCorrect={(input) => submitSpelling(input)}
                onFail={(input) => submitSpelling(input)}
              />
            )}
            
            {spellStatus === 'result' && (
              <SpellResult 
                success={lastResult} 
                expectedWord={currentWord?.word} 
                onNext={() => triggerCountdown(startNewWord)} 
                onReset={resetSpell} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
