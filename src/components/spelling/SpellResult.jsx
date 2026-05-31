import React from 'react';
import Button from '../common/Button';

export default function SpellResult({ success, expectedWord, onNext, onReset }) {
  return (
    <div className="max-w-md mx-auto text-center bg-black/40 border border-white/10 p-8 rounded-3xl animate-scale-up">
      {success ? (
        <iconify-icon icon="lucide:check-circle" width="64" className="text-green-500 mb-6"></iconify-icon>
      ) : (
        <iconify-icon icon="lucide:x-circle" width="64" className="text-red-500 mb-6"></iconify-icon>
      )}
      
      <h2 className="text-white text-3xl font-heading font-bold italic uppercase mb-2">
        {success ? "Parfait !" : "Raté !"}
      </h2>
      
      <p className="text-zinc-400 font-monda mb-8">
        Le mot correct était : <strong className="text-white text-xl tracking-widest">{expectedWord}</strong>
      </p>
      
      <div className="flex gap-4 justify-center">
        {!success && <Button variant="secondary" onClick={onReset}>Recommencer</Button>}
        <Button onClick={onNext}>Mot suivant</Button>
      </div>
    </div>
  );
}
