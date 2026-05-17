import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PackProfile() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ xp: 0, games: 0, wins: 0 });

  useEffect(() => {
    // Simuler le chargement depuis le local storage (plus tard Supabase)
    const xp = parseInt(localStorage.getItem('wakkany_family_xp') || '0', 10);
    const games = parseInt(localStorage.getItem('wakkany_family_games') || '0', 10);
    const wins = parseInt(localStorage.getItem('wakkany_family_wins') || '0', 10);
    setStats({ xp, games, wins });
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
            <iconify-icon icon="lucide:arrow-left"></iconify-icon> Retour
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
               <iconify-icon icon="lucide:gamepad-2" width="32"></iconify-icon>
             </div>
             <div>
               <p className="text-4xl font-heading font-black italic">{stats.games}</p>
               <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Parties Jouées</p>
             </div>
          </div>
          
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
               <iconify-icon icon="lucide:trophy" width="32"></iconify-icon>
             </div>
             <div>
               <p className="text-4xl font-heading font-black italic">{stats.wins}</p>
               <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Victoires Parfaites</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
