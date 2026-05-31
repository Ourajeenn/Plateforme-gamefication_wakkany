import React from 'react';

export default function SubjectCard({ topic }) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl text-left relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c28e3a]/10 rounded-full blur-3xl group-hover:bg-[#c28e3a]/20 transition-all"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-[#c28e3a]/10 text-[#c28e3a] border border-[#c28e3a]/30 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
          {topic.category}
        </span>
        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          Difficulté: {topic.difficulty}
        </span>
      </div>
      
      <h3 className="text-white text-3xl font-heading font-bold italic uppercase mb-6">{topic.title}</h3>
      
      <div>
        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">Plan suggéré</h4>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-zinc-300 font-monda text-sm"><iconify-icon icon="lucide:check-circle" className="text-[#c28e3a]"></iconify-icon> Introduction (contexte)</li>
          <li className="flex items-center gap-2 text-zinc-300 font-monda text-sm"><iconify-icon icon="lucide:check-circle" className="text-[#c28e3a]"></iconify-icon> Développement (arguments)</li>
          <li className="flex items-center gap-2 text-zinc-300 font-monda text-sm"><iconify-icon icon="lucide:check-circle" className="text-[#c28e3a]"></iconify-icon> Conclusion (ouverture)</li>
        </ul>
      </div>

      <div>
        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">Mots-clés</h4>
        <div className="flex flex-wrap gap-2">
          {topic.keypoints.map((kp, idx) => (
            <span key={idx} className="bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg text-xs text-white">
              {kp}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
