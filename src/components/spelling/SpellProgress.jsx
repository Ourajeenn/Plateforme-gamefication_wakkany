import React from 'react';

export default function SpellProgress({ score, attempts }) {
  return (
    <div className="flex justify-between items-center bg-zinc-900 border border-white/10 p-4 rounded-xl mb-8">
      <div className="flex flex-col">
        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Score Actuel</span>
        <span className="text-[#c28e3a] font-heading font-bold italic text-2xl">{Math.round(score)}</span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Erreurs Permises</span>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < (2 - attempts) ? 'bg-green-500' : 'bg-red-500/50'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
