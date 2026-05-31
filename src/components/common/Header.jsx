import React from 'react';

export default function Header({ title, subtitle, onBack }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
      <div>
        <h2 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.3em] mb-1">{subtitle}</h2>
        <h1 className="text-white text-3xl font-heading font-bold italic uppercase">{title}</h1>
      </div>
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase font-bold text-[10px] tracking-widest"
        >
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Retour
        </button>
      )}
    </div>
  );
}
