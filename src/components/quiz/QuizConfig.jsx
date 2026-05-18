import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FAMILY_THEMES } from '../../data/familyQuizzes';

export default function QuizConfig() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('coop'); // 'coop', 'party', 'boss'
  const [players, setPlayers] = useState(['', '']);
  const [theme, setTheme] = useState('general');
  const [difficulty, setDifficulty] = useState('hunter'); // 'rookie', 'hunter', 'monarch'
  const [timerLimit, setTimerLimit] = useState(8); // 5, 8, 15

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
    const validPlayers = mode === 'party' ? players.filter(p => p.trim() !== '') : [];
    if (mode === 'party' && validPlayers.length < 2) {
      alert("Il faut au moins 2 joueurs pour le mode Party Salon !");
      return;
    }
    
    // Play synth boot sfx
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
      }
    } catch(e) {}

    // Navigate to play screen passing all parameters
    navigate('/quiz/play', { 
      state: { 
        config: { 
          mode, 
          players: validPlayers, 
          theme,
          difficulty,
          timerLimit
        } 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 font-monda text-white">
      <div className="w-full max-w-4xl space-y-12 animate-fade-in pb-16">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/quiz')} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
            <iconify-icon icon="lucide:arrow-left"></iconify-icon> Retour
          </button>
          <h1 className="text-3xl font-heading font-black italic uppercase tracking-tighter text-[#c28e3a] drop-shadow-[0_0_10px_rgba(194,142,58,0.2)]">
            CONFIGURATION DE L'ÉPREUVE
          </h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* 1. Mode Selection (3 columns now!) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-center text-purple-400">1. Choisissez votre Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => setMode('coop')}
              className={`p-8 rounded-[30px] border-2 transition-all flex flex-col items-center gap-4 cursor-pointer relative overflow-hidden group
                ${mode === 'coop' ? 'bg-purple-900/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
            >
              <iconify-icon icon="lucide:users" width="48" className={mode === 'coop' ? 'text-purple-400' : 'text-zinc-500'}></iconify-icon>
              <h3 className="text-2xl font-black italic uppercase">Coop Meute</h3>
              <p className="text-[10px] text-center text-zinc-400 leading-relaxed">Jouez tous ensemble pour faire grimper le score global de la famille.</p>
            </button>

            <button 
              onClick={() => setMode('party')}
              className={`p-8 rounded-[30px] border-2 transition-all flex flex-col items-center gap-4 cursor-pointer relative overflow-hidden group
                ${mode === 'party' ? 'bg-[#c28e3a]/10 border-[#c28e3a] shadow-[0_0_20px_rgba(194,142,58,0.15)]' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
            >
              <iconify-icon icon="lucide:swords" width="48" className={mode === 'party' ? 'text-[#c28e3a]' : 'text-zinc-500'}></iconify-icon>
              <h3 className="text-2xl font-black italic uppercase">Party Salon</h3>
              <p className="text-[10px] text-center text-zinc-400 leading-relaxed">Chacun son tour ! Affrontez-vous pour voir qui de la meute a le meilleur score individuel.</p>
            </button>

            <button 
              onClick={() => setMode('boss')}
              className={`p-8 rounded-[30px] border-2 transition-all flex flex-col items-center gap-4 cursor-pointer relative overflow-hidden group
                ${mode === 'boss' ? 'bg-red-950/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
            >
              <iconify-icon icon="lucide:skull" width="48" className={mode === 'boss' ? 'text-red-500' : 'text-zinc-500'}></iconify-icon>
              <h3 className="text-2xl font-black italic uppercase">Raid de Boss</h3>
              <p className="text-[10px] text-center text-zinc-400 leading-relaxed">Combattez ensemble un monstre géant de la faille Chronos sous une seule barre de PV !</p>
            </button>
          </div>
        </div>

        {/* 2. Theme Selection */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-center text-purple-400">2. Sélectionnez le Thème</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('general')}
              className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer
                ${theme === 'general' ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-zinc-900/60 border-white/5 hover:border-white/15 text-zinc-400 hover:text-white'}`}
            >
              <iconify-icon icon="lucide:layout-grid" width="28"></iconify-icon>
              <span className="font-heading font-black text-xs uppercase tracking-wider">Multi-Thèmes</span>
            </button>

            {FAMILY_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer
                  ${theme === t.id ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-zinc-900/60 border-white/5 hover:border-white/15 text-zinc-400 hover:text-white'}`}
              >
                <iconify-icon icon={t.icon} width="28"></iconify-icon>
                <span className="font-heading font-black text-xs uppercase tracking-wider">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Settings & Parameters */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-center text-purple-400">3. Paramètres de l'Épreuve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 space-y-4">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Difficulté</span>
              <div className="flex gap-2">
                {[
                  { id: 'rookie', label: 'Rookie (Débutant)' },
                  { id: 'hunter', label: 'Hunter (Normal)' },
                  { id: 'monarch', label: 'Monarque (Difficile)' }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-heading font-black uppercase tracking-wider transition-all cursor-pointer
                      ${difficulty === d.id ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 space-y-4">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Temps de Réponse</span>
              <div className="flex gap-2">
                {[
                  { value: 5, label: '5s (Rapide)' },
                  { value: 8, label: '8s (Standard)' },
                  { value: 15, label: '15s (Tactique)' }
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimerLimit(t.value)}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-heading font-black uppercase tracking-wider transition-all cursor-pointer
                      ${timerLimit === t.value ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 4. Player Configuration */}
        {mode === 'party' && (
          <div className="space-y-6 animate-scale-up">
            <h2 className="text-xl font-bold uppercase tracking-widest text-center text-purple-400">4. Les Chasseurs de la Meute</h2>
            <div className="bg-zinc-900 border border-white/10 rounded-[30px] p-8 max-w-2xl mx-auto">
               <div className="space-y-4">
                 {players.map((p, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-black border border-purple-500/30 flex items-center justify-center text-purple-400 font-black">
                       {idx + 1}
                     </div>
                     <input 
                       type="text" 
                       placeholder={`Prénom du joueur ${idx + 1}`}
                       value={p}
                       onChange={(e) => handlePlayerChange(idx, e.target.value)}
                       className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-purple-500 transition-colors"
                     />
                     {players.length > 2 && (
                       <button onClick={() => handleRemovePlayer(idx)} className="text-red-500 hover:bg-red-500/20 p-3 rounded-xl transition-colors cursor-pointer">
                         <iconify-icon icon="lucide:trash-2" width="24"></iconify-icon>
                       </button>
                     )}
                   </div>
                 ))}
               </div>
               {players.length < 8 && (
                 <button onClick={handleAddPlayer} className="mt-6 w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-zinc-400 font-bold uppercase tracking-widest hover:border-purple-500 hover:text-purple-400 transition-colors cursor-pointer">
                   + Ajouter un joueur
                 </button>
               )}
            </div>
          </div>
        )}

        {/* 5. Start Button */}
        <div className="flex justify-center pt-8">
          <button 
            onClick={handleStart}
            className="bg-purple-600 text-white font-heading font-black uppercase text-2xl tracking-[0.3em] px-16 py-6 rounded-full hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            Lancer l'Épreuve
          </button>
        </div>

      </div>
    </div>
  );
}
