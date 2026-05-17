import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuizConfig() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('coop'); // 'coop', 'party'
  const [players, setPlayers] = useState(['', '']);
  const [theme, setTheme] = useState('general');

  const handleAddPlayer = () => {
    if (players.length < 8) setPlayers([...players, '']);
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleRemovePlayer = (index) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handleStart = () => {
    // Save config and navigate to game
    // Filter empty player names
    const validPlayers = mode === 'party' ? players.filter(p => p.trim() !== '') : [];
    if (mode === 'party' && validPlayers.length < 2) {
      alert("Il faut au moins 2 joueurs pour le mode Party Salon !");
      return;
    }
    
    // Pour l'instant on passe l'état par le router ou un store global.
    // On simulera le passage via React Router state
    navigate('/quiz/play', { state: { config: { mode, players: validPlayers, theme } } });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 font-monda text-white">
      <div className="w-full max-w-4xl space-y-12 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/quiz')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
            <iconify-icon icon="lucide:arrow-left"></iconify-icon> Retour
          </button>
          <h1 className="text-3xl font-heading font-black italic uppercase tracking-tighter text-[#c28e3a]">Configuration</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* Mode Selection */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-center">1. Choisissez votre Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setMode('coop')}
              className={`p-8 rounded-[30px] border-2 transition-all flex flex-col items-center gap-4 ${mode === 'coop' ? 'bg-[#c28e3a]/20 border-[#c28e3a]' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
            >
              <iconify-icon icon="lucide:users" width="48" className={mode === 'coop' ? 'text-[#c28e3a]' : 'text-zinc-500'}></iconify-icon>
              <h3 className="text-2xl font-black italic uppercase">Coop Meute</h3>
              <p className="text-sm text-center text-zinc-400">Jouez tous ensemble pour faire grimper le score global de la famille.</p>
            </button>
            <button 
              onClick={() => setMode('party')}
              className={`p-8 rounded-[30px] border-2 transition-all flex flex-col items-center gap-4 ${mode === 'party' ? 'bg-[#c28e3a]/20 border-[#c28e3a]' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
            >
              <iconify-icon icon="lucide:swords" width="48" className={mode === 'party' ? 'text-[#c28e3a]' : 'text-zinc-500'}></iconify-icon>
              <h3 className="text-2xl font-black italic uppercase">Party Salon</h3>
              <p className="text-sm text-center text-zinc-400">Chacun son tour ! Affrontez-vous pour voir qui a le meilleur score individuel.</p>
            </button>
          </div>
        </div>

        {/* Player Configuration (only for party mode) */}
        {mode === 'party' && (
          <div className="space-y-6 animate-scale-up">
            <h2 className="text-xl font-bold uppercase tracking-widest text-center">2. Les Combattants</h2>
            <div className="bg-zinc-900 border border-white/10 rounded-[30px] p-8 max-w-2xl mx-auto">
               <div className="space-y-4">
                 {players.map((p, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-black border border-[#c28e3a]/30 flex items-center justify-center text-[#c28e3a] font-black">
                       {idx + 1}
                     </div>
                     <input 
                       type="text" 
                       placeholder={`Prénom du joueur ${idx + 1}`}
                       value={p}
                       onChange={(e) => handlePlayerChange(idx, e.target.value)}
                       className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-[#c28e3a] transition-colors"
                     />
                     {players.length > 2 && (
                       <button onClick={() => handleRemovePlayer(idx)} className="text-red-500 hover:bg-red-500/20 p-3 rounded-xl transition-colors">
                         <iconify-icon icon="lucide:trash-2" width="24"></iconify-icon>
                       </button>
                     )}
                   </div>
                 ))}
               </div>
               {players.length < 8 && (
                 <button onClick={handleAddPlayer} className="mt-6 w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-zinc-400 font-bold uppercase tracking-widest hover:border-[#c28e3a] hover:text-[#c28e3a] transition-colors">
                   + Ajouter un joueur
                 </button>
               )}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="flex justify-center pt-8">
          <button 
            onClick={handleStart}
            className="bg-[#c28e3a] text-black font-black uppercase text-2xl tracking-[0.3em] px-16 py-6 rounded-full hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(194,142,58,0.4)]"
          >
            Lancer l'Épreuve
          </button>
        </div>

      </div>
    </div>
  );
}
