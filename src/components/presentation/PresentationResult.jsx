import React from 'react';
import Button from '../common/Button';

export default function PresentationResult({ score, topic, onReset }) {
  return (
    <div className="max-w-md mx-auto text-center bg-black/40 border border-white/10 p-8 rounded-3xl animate-scale-up">
      <iconify-icon icon="lucide:party-popper" width="64" className="text-[#c28e3a] mb-6"></iconify-icon>
      
      <h2 className="text-white text-3xl font-heading font-bold italic uppercase mb-2">Exposé Terminé</h2>
      <p className="text-zinc-400 font-monda mb-8">Vous avez présenté : <strong className="text-white">{topic.title}</strong></p>
      
      <div className="bg-zinc-900 rounded-2xl p-6 mb-8 border border-white/5">
        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Score de présentation</h3>
        <div className="text-5xl font-heading font-black text-white italic">
          {Math.round(score)} <span className="text-lg text-zinc-600 not-italic uppercase tracking-widest">PTS</span>
        </div>
      </div>
      
      <Button onClick={onReset} className="w-full">Faire un autre exposé</Button>
    </div>
  );
}
