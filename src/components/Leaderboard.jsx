import React, { useState } from 'react';
import useLeaderboard from '../hooks/useLeaderboard';
import { BRANCHES } from '../data/branches';

export default function Leaderboard({ currentUser }) {
  const [view, setView] = useState('champions'); // champions | academies | branches
  const { globalPlayers, loading, refresh } = useLeaderboard(currentUser);

  const getAcademyStats = () => {
    const academies = {};
    globalPlayers.forEach(p => {
      const school = p.school || 'Nomade';
      if (!academies[school]) academies[school] = { name: school, totalXp: 0, count: 0 };
      academies[school].totalXp += p.xp || 0;
      academies[school].count++;
    });
    return Object.values(academies).sort((a, b) => b.totalXp - a.totalXp);
  };

  const getBranchStats = () => {
    const stats = { warriors: 0, heroes: 0, dinos: 0, cars: 0 };
    globalPlayers.forEach(p => {
      const dom = (p.dominant || '').toLowerCase();
      if (stats[dom] !== undefined) stats[dom]++;
    });
    return stats;
  };

  return (
    <div className="bg-zinc-900/30 rounded-3xl border border-white/5 p-8 backdrop-blur-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c28e3a]/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 relative z-10">
        <div>
          <h2 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Hall des Légendes</h2>
          <h1 className="text-white text-4xl font-heading font-bold italic uppercase tracking-tighter">CLASSEMENT GLOBAL</h1>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {['champions', 'academies', 'branches'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                  ${view === v ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
              >
                {v}
              </button>
            ))}
          </div>

          <button 
            onClick={refresh}
            className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-xl hover:bg-white hover:text-black transition-all group"
          >
            <iconify-icon icon="lucide:refresh-cw" className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}></iconify-icon>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        {view === 'champions' && (
          <div className="space-y-12">
            {globalPlayers.map((player, index) => {
              const isMe = currentUser && player.name === currentUser.name;
              const branch = BRANCHES[player.dominant?.toLowerCase()];
              const branchColor = branch?.color || '#333';

              return (
                <div 
                  key={index}
                  className={`group flex items-center gap-6 p-5 rounded-3xl border transition-all duration-500
                    ${isMe ? 'bg-[#c28e3a]/10 border-[#c28e3a]/50 scale-[1.02] shadow-2xl shadow-orange-950/20' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                >
                  {/* Rank */}
                  <div className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl border border-white/5 font-heading text-2xl italic font-black">
                     {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-black uppercase tracking-tighter text-lg">{player.name}</span>
                      {isMe && <span className="text-[8px] bg-white text-black px-2 py-0.5 rounded-md font-black">VOUS</span>}
                      {branch && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: branchColor }}></div>
                           <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: branchColor }}>{branch.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
                       {player.school || 'Explorateur Nomade'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-black italic text-white flex items-center justify-end gap-1">
                       {player.xp}
                       <span className="text-[10px] text-zinc-600 not-italic tracking-widest uppercase">XP</span>
                    </div>
                    <div className="text-[#c28e3a] text-[9px] font-black uppercase tracking-[0.3em]">Score Total</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'academies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getAcademyStats().map((academy, index) => (
              <div key={index} className="bg-black/40 border border-white/5 p-8 rounded-3xl group hover:border-[#c28e3a]/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10">
                     <iconify-icon icon="lucide:school" width="24" className="text-zinc-500 group-hover:text-[#c28e3a] transition-colors"></iconify-icon>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white italic">{academy.totalXp} <span className="text-xs text-zinc-600 not-italic">XP</span></div>
                    <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Puissance Totale</div>
                  </div>
                </div>
                <h3 className="text-white font-black uppercase text-xl tracking-tighter mb-4 italic font-heading">{academy.name}</h3>
                <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-[#c28e3a]"
                    style={{ width: `${Math.min((academy.totalXp / 5000) * 100, 100)}%` }}
                   ></div>
                </div>
                <div className="mt-4 text-[9px] text-zinc-600 uppercase font-black tracking-widest">
                   {academy.count} Champions Actifs
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'branches' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(getBranchStats()).map(([branchId, count]) => {
              const branch = BRANCHES[branchId];
              return (
                <div key={branchId} className="bg-black/40 border border-white/5 p-10 rounded-3xl text-center relative group overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                    style={{ background: `radial-gradient(circle at center, ${branch?.color}, transparent)` }}
                  ></div>
                  
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/5 bg-zinc-900 shadow-2xl"
                    style={{ boxShadow: `0 0 30px ${branch?.color}20` }}
                  >
                     <span className="text-4xl">{branch?.icon}</span>
                  </div>
                  <h3 className="text-white font-black uppercase text-2xl tracking-tighter mb-2 italic font-heading" style={{ color: branch?.color }}>
                    {branch?.label}
                  </h3>
                  <div className="text-5xl font-black text-white italic mb-4">{count}</div>
                  <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em]">Adeptes de la Voie</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
