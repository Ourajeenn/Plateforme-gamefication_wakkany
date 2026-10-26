import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PackProfile() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ xp: 0, games: 0, wins: 0 });

  useEffect(() => {
    const xp = parseInt(localStorage.getItem('wakkany_family_xp') || '0', 10);
    const games = parseInt(localStorage.getItem('wakkany_family_games') || '0', 10);
    const wins = parseInt(localStorage.getItem('wakkany_family_wins') || '0', 10);
    const bluffGames = parseInt(localStorage.getItem('wakkany_bluff_games') || '0', 10);
    const bluffWins = parseInt(localStorage.getItem('wakkany_bluff_wins') || '0', 10);
    const bluffBest = parseInt(localStorage.getItem('wakkany_bluff_best_score') || '0', 10);
    setStats({ xp, games, wins, bluffGames, bluffWins, bluffBest });
  }, []);

  const familyLevel = Math.floor(stats.xp / 500) + 1;
  const nextLevelXp = familyLevel * 500;
  const progressPercent = ((stats.xp % 500) / 500) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 font-monda text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#c28e3a15_0%,_#000_70%)] pointer-events-none"></div>
      
      <div className="w-full max-w-4xl space-y-12 animate-fade-in relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/quiz')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
            <iconify-icon icon="mdi:arrow-left"></iconify-icon> Retour
          </button>
          <h1 className="text-3xl font-heading font-black italic uppercase tracking-tighter text-[#c28e3a]">La Meute</h1>
          <div className="w-20"></div>
        </div>

        {/* Global Level Banner */}
        <div className="bg-zinc-900/80 border border-[#c28e3a]/30 rounded-[40px] p-10 flex flex-col items-center text-center backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c28e3a] to-transparent"></div>
          
          <div className="w-32 h-32 rounded-full bg-black border-4 border-[#c28e3a] flex items-center justify-center shadow-[0_0_50px_rgba(194,142,58,0.4)] mb-6">
            <span className="text-5xl font-heading font-black italic">{familyLevel}</span>
          </div>
          
          <h2 className="text-3xl font-bold uppercase tracking-widest text-[#c28e3a] mb-2">Niveau Global</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">Jouez ensemble ou affrontez-vous pour faire grimper le niveau de votre Meute et débloquer de nouveaux thèmes.</p>
          
          <div className="w-full max-w-lg bg-black rounded-full h-4 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#785317] to-[#c28e3a]" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="flex justify-between w-full max-w-lg mt-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
            <span>{stats.xp} XP</span>
            <span>{nextLevelXp} XP</span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
               <iconify-icon icon="mdi:gamepad-2" width="28"></iconify-icon>
             </div>
             <div>
               <p className="text-3xl font-heading font-black italic">{stats.games || 0}</p>
               <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Parties Globales</p>
             </div>
          </div>
          
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
               <iconify-icon icon="mdi:trophy" width="28"></iconify-icon>
             </div>
             <div>
               <p className="text-3xl font-heading font-black italic">{stats.wins || 0}</p>
               <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Victoires Quiz</p>
             </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#c28e3a] shrink-0">
               <iconify-icon icon="mdi:theater" width="28"></iconify-icon>
             </div>
             <div>
               <p className="text-3xl font-heading font-black italic">{stats.bluffGames || 0}</p>
               <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Parties Bluff</p>
             </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
               <iconify-icon icon="mdi:crown" width="28"></iconify-icon>
             </div>
             <div>
               <p className="text-3xl font-heading font-black italic">{stats.bluffBest || 0}</p>
               <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Record Bluff (Pts)</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

