import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BOSS_ENCOUNTERS } from '../../data/bossEncounters';

const STORAGE_KEY = 'wakkany_boss_progress';
function getBossProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"defeated":[]}'); }
  catch { return { defeated: [] }; }
}

export default function QuizHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden font-monda text-white">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#c28e3a20_0%,_#000_80%)]"></div>
      
      {/* Retour au QG - Top Left */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-zinc-600 uppercase font-bold tracking-widest text-sm hover:text-white transition-colors z-20"
      >
        Retour au QG
      </button>

      {/* Settings - Top Right */}
      <button 
        onClick={() => navigate('/quiz/config')}
        className="absolute top-8 right-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-white/20 hover:border-[#c28e3a] hover:bg-[#c28e3a]/20 transition-all text-sm font-bold uppercase tracking-wide text-[#c28e3a] z-20"
      >
        <iconify-icon icon="lucide:settings" width="16"></iconify-icon>
        Paramètres
      </button>
      
      <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
        <div className="animate-scale-up">
          <iconify-icon icon="lucide:swords" width="80" className="text-[#c28e3a] mb-6 drop-shadow-[0_0_20px_#c28e3a]"></iconify-icon>
          <h1 className="text-6xl md:text-8xl font-serif font-black italic tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#fce5a1] via-[#c28e3a] to-[#785317]">
              L'Arène du Savoir
            </span>
          </h1>
          <p className="text-zinc-400 mt-6 text-xl tracking-widest uppercase font-bold">Mode TV / Salon</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-3xl mx-auto">
          <button 
            onClick={() => navigate('/quiz/config')}
            className="group relative bg-zinc-900/80 border-2 border-[#c28e3a] p-10 rounded-[40px] hover:bg-[#c28e3a] transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <iconify-icon icon="lucide:play" width="60" className="text-[#c28e3a] group-hover:text-black mb-4 transition-colors"></iconify-icon>
            <h2 className="text-4xl font-heading font-black italic uppercase group-hover:text-black transition-colors">Jouer</h2>
            <p className="text-zinc-500 text-sm mt-2 group-hover:text-black/70">Lancer un défi en famille</p>
          </button>

          <button 
            onClick={() => navigate('/quiz/profile')}
            className="group relative bg-zinc-900/80 border-2 border-white/10 p-10 rounded-[40px] hover:border-white/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <iconify-icon icon="lucide:users" width="60" className="text-white mb-4"></iconify-icon>
            <h2 className="text-4xl font-heading font-black italic uppercase">La Meute</h2>
            <p className="text-zinc-500 text-sm mt-2">Niveau et Historique</p>
          </button>

          <button 
            onClick={() => navigate('/quiz/config')}
            className="group relative bg-zinc-900/80 border-2 border-white/10 p-10 rounded-[40px] hover:border-[#c28e3a] hover:bg-[#c28e3a]/5 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <iconify-icon icon="lucide:library" width="50" className="text-[#c28e3a] mb-4"></iconify-icon>
            <h2 className="text-3xl font-heading font-black italic uppercase">Thèmes</h2>
            <p className="text-zinc-500 text-sm mt-2">6 catégories de Chasseurs</p>
          </button>

          <button 
            onClick={() => navigate('/quiz/games')}
            className="group relative bg-zinc-900/80 border-2 border-[#c28e3a]/50 p-10 rounded-[40px] hover:border-[#c28e3a] hover:bg-[#c28e3a]/10 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <iconify-icon icon="lucide:gamepad2" width="50" className="text-[#c28e3a] mb-4"></iconify-icon>
            <h2 className="text-3xl font-heading font-black italic uppercase">Jeux Vocaux</h2>
            <p className="text-zinc-500 text-sm mt-2">Topic Roulette & Parle ou Perds</p>
          </button>
        </div>
      </div>
    </div>
  );
}
