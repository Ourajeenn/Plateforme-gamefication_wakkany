import React from 'react';

export default function SkillTooltip({ hoveredSkill, checkUnlocked, checkAvailable, allNodesMap }) {
  if (!hoveredSkill) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-scale-up pointer-events-none">
      <div className="bg-black/95 border border-white/20 p-6 rounded-3xl backdrop-blur-2xl shadow-2xl min-w-[340px] max-w-md" style={{ boxShadow: `0 20px 50px ${hoveredSkill.branchColor}20` }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-white font-black uppercase text-xl tracking-tighter" style={{ textShadow: `0 0 10px ${hoveredSkill.branchColor}50` }}>{hoveredSkill.name}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: hoveredSkill.branchColor }}>
              {hoveredSkill.branchLabel} // TIER {hoveredSkill.tier}
            </p>
          </div>
          <div className="bg-zinc-900 border border-white/10 px-3 py-1 rounded-lg text-[#c28e3a] font-black text-xs shadow-inner">
            {hoveredSkill.xp} XP
          </div>
        </div>
        <p className="text-zinc-400 text-sm italic leading-relaxed mb-4 font-monda">
          "{hoveredSkill.desc}"
        </p>
        {hoveredSkill.req.length > 0 && (
          <div className="flex gap-2 items-center">
             <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Lien Neural:</span>
             {hoveredSkill.req.map(r => {
               const rNode = allNodesMap[r];
               return (
                 <span key={r} className={`text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 ${checkUnlocked(r) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                   {rNode ? rNode.name.toUpperCase() : r.toUpperCase()}
                 </span>
               )
             })}
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          {checkUnlocked(hoveredSkill.id) ? (
            <span className="text-green-500 font-black text-[10px] uppercase tracking-[0.3em]">Synchronisé ✓</span>
          ) : checkAvailable(hoveredSkill) ? (
            <span className="text-[#c28e3a] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Prêt à l'extraction →</span>
          ) : (
            <span className="text-red-500/50 font-black text-[10px] uppercase tracking-[0.3em]">Données Verrouillées 🔒</span>
          )}
        </div>
      </div>
    </div>
  );
}
