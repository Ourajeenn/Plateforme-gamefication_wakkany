import React from 'react';
import Button from '../common/Button';
import SpellingInput from './SpellingInput';

export default function SpellingGame({ word, onCorrect, onFail, attempts }) {
  if (!word) return null;

  return (
    <div className="max-w-xl mx-auto text-center bg-black/40 border border-white/10 p-8 rounded-3xl animate-fade-in">
      <div className="mb-8">
        <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">Définition</h3>
        <p className="text-white text-xl font-monda italic">"{word.meaning}"</p>
      </div>

      <div className="mb-4">
        <h4 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-widest mb-2">Difficulté</h4>
        <span className="bg-[#c28e3a]/10 text-[#c28e3a] px-3 py-1 rounded-md text-xs font-bold">{word.difficulty}</span>
      </div>

      <div className="mb-8">
        <SpellingInput 
          onSubmit={(input) => {
             // Let the parent / hook handle the result via submitSpelling
          }} 
          onCorrect={onCorrect}
          onFail={onFail}
          expectedWord={word.word}
          attempts={attempts}
        />
      </div>

      {attempts > 0 && (
        <p className="text-red-400 text-sm font-bold animate-shake">
          Oups ! Il vous reste {3 - attempts} tentative(s).
        </p>
      )}
    </div>
  );
}
