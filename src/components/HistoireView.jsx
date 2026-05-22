import React, { useState } from 'react';
import morokhImg from '../assets/histoire/morokh_v2.png';
import anyaImg from '../assets/histoire/anya_v2.png';
import factionsImg from '../assets/histoire/factions_v2.png';

export default function HistoireView() {
  const [activeTab, setActiveTab] = useState('personnages');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-24 animate-fade-in pt-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black font-heading tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#c28e3a] via-white to-[#c28e3a]">
          Lore & Histoire
        </h1>
        <p className="text-zinc-400 font-monda max-w-2xl mx-auto text-sm md:text-base">
          Plongez dans les origines de Wakkany, découvrez les légendes des héros et les sombres desseins des factions qui dominent ce monde.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setActiveTab('personnages')}
          className={`px-6 py-3 md:px-8 rounded-xl font-bold uppercase tracking-widest transition-all text-xs md:text-sm ${
            activeTab === 'personnages' 
              ? 'bg-[#c28e3a] text-black shadow-[0_0_20px_rgba(194,142,58,0.4)]' 
              : 'bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Personnages Légendaires
        </button>
        <button
          onClick={() => setActiveTab('factions')}
          className={`px-6 py-3 md:px-8 rounded-xl font-bold uppercase tracking-widest transition-all text-xs md:text-sm ${
            activeTab === 'factions' 
              ? 'bg-[#c28e3a] text-black shadow-[0_0_20px_rgba(194,142,58,0.4)]' 
              : 'bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Factions du Monde
        </button>
        <button
          onClick={() => setActiveTab('archives')}
          className={`px-6 py-3 md:px-8 rounded-xl font-bold uppercase tracking-widest transition-all text-xs md:text-sm ${
            activeTab === 'archives' 
              ? 'bg-[#c28e3a] text-black shadow-[0_0_20px_rgba(194,142,58,0.4)]' 
              : 'bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Archives
        </button>
      </div>

      {/* Content */}
      <div className="mt-8 px-4 md:px-8">
        {activeTab === 'personnages' && (
          <div className="flex flex-col gap-12 max-w-6xl mx-auto">
            
            {/* Morokh - Authentic Card */}
            <div className="w-full rounded-[2rem] border border-white/10 bg-zinc-950/80 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Portrait Side */}
              <div className="w-full md:w-[45%] h-64 md:h-auto relative overflow-hidden shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent z-10"></div>
                 <img 
                   src={morokhImg} 
                   alt="Morokh Portrait" 
                   className="absolute top-0 left-0 w-full h-[150%] md:h-[200%] object-cover" 
                   style={{ objectPosition: 'center 5%' }} 
                 />
              </div>
              
              {/* Info Side */}
              <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center space-y-8 z-20 relative">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <iconify-icon icon="lucide:swords" className="text-purple-500 text-xl"></iconify-icon>
                     <p className="text-purple-400 font-bold tracking-[0.2em] uppercase text-xs">The Dark Sentinel</p>
                   </div>
                   <h2 className="text-5xl font-black uppercase text-white font-heading tracking-wider">Morokh</h2>
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                     <iconify-icon icon="lucide:book-open" className="text-[#c28e3a]"></iconify-icon>
                     Lore
                   </h3>
                   <div className="h-px w-12 bg-[#c28e3a]/50"></div>
                   <p className="text-zinc-400 text-sm leading-relaxed font-monda">
                     Morokh stood as a gatekeeper at the Soul Gate for an eternity, preserving balance and order. Every soul seeking passage to the realm of the dead had to face his fair and just judgment first. One fateful day, the precious balance of souls was shattered... incensed and more than a little curious, the Dark Sentinel travelled back to the world of the living.
                   </p>
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                     <iconify-icon icon="lucide:flame" className="text-[#c28e3a]"></iconify-icon>
                     Combat & Abilities
                   </h3>
                   <div className="h-px w-12 bg-[#c28e3a]/50"></div>
                   <p className="text-zinc-400 text-sm leading-relaxed font-monda mb-4">
                     A melee caster who cripples enemy defenses to deal massive amounts of damage. With every enemy hit, a fraction of their soul is stored in his Soul Essence container.
                   </p>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {["Curse of Morokh", "Sinister Cleave", "The Great Cleave", "Shadow Step", "Harvest", "Horrible Visage", "Reaping", "Soul Drain"].map(skill => (
                       <span key={skill} className="px-4 py-2 bg-purple-950/30 border border-purple-500/30 rounded-lg text-[10px] text-purple-200 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                         {skill}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Anya - Authentic Card */}
            <div className="w-full rounded-[2rem] border border-white/10 bg-zinc-950/80 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row-reverse shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Portrait Side */}
              <div className="w-full md:w-[45%] h-64 md:h-auto relative overflow-hidden shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-zinc-950 via-zinc-950/20 to-transparent z-10"></div>
                 <img 
                   src={anyaImg} 
                   alt="Anya Portrait" 
                   className="absolute top-0 left-0 w-full h-[150%] md:h-[200%] object-cover" 
                   style={{ objectPosition: 'center 10%' }} 
                 />
              </div>
              
              {/* Info Side */}
              <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center space-y-8 z-20 relative">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <iconify-icon icon="lucide:droplet" className="text-red-500 text-xl"></iconify-icon>
                     <p className="text-red-400 font-bold tracking-[0.2em] uppercase text-xs">The Blood Ritualist</p>
                   </div>
                   <h2 className="text-5xl font-black uppercase text-white font-heading tracking-wider">Anya</h2>
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                     <iconify-icon icon="lucide:book-open" className="text-[#c28e3a]"></iconify-icon>
                     Lore
                   </h3>
                   <div className="h-px w-12 bg-[#c28e3a]/50"></div>
                   <p className="text-zinc-400 text-sm leading-relaxed font-monda">
                     Left for dead as a small child, Anya clawed onto survival against all odds. She was raised and trained against her will to serve their twisted agendas by practicing blood magic. After years of servitude, Anya grew strong enough to turn their own methods against them and sever her bonds.
                   </p>
                </div>
                
                <div className="space-y-3">
                   <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                     <iconify-icon icon="lucide:flame" className="text-[#c28e3a]"></iconify-icon>
                     Combat & Abilities
                   </h3>
                   <div className="h-px w-12 bg-[#c28e3a]/50"></div>
                   <p className="text-zinc-400 text-sm leading-relaxed font-monda mb-4">
                     To ward off the negative effects of her corrupted blood, Anya uses a whip to relentlessly lash her victims and consume their blood fragments to use powerful life-leeching abilities.
                   </p>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {["Blood Rite", "Whipslash", "Spinning Slash", "Vitality Rush", "Blood Sucker", "Swarm", "Heartbeat", "Bloodbolt"].map(skill => (
                       <span key={skill} className="px-4 py-2 bg-red-950/30 border border-red-500/30 rounded-lg text-[10px] text-red-200 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                         {skill}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'factions' && (
          <div className="flex flex-col items-center gap-12 animate-fade-in">
            <p className="text-center text-zinc-400 font-monda max-w-3xl text-sm md:text-base italic bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
              "Sept grandes nations s'affrontent pour le contrôle des ressources magiques. Leurs emblèmes sont le reflet de leur pouvoir absolu et de leur héritage ancestral."
            </p>
            <div className="w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative group max-w-4xl mx-auto bg-zinc-950">
              <img src={factionsImg} alt="Duelyst Factions" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}

        {activeTab === 'archives' && (
          <div className="flex flex-col gap-12 max-w-5xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/10 pb-6 gap-4">
              <h2 className="text-white text-5xl font-heading font-black italic uppercase">CHRONICLES</h2>
              <span className="text-[#c28e3a] text-xs font-bold uppercase tracking-widest">v2.0 Update Logs</span>
            </div>

            <div className="space-y-12">
              {[
                { date: 'APR 03, 2026', title: 'The Multiverse Update', desc: 'L\'univers s\'agrandit ! Les arbres de compétences incluent désormais Héros, Guerriers, Dinosaures et Voitures.' },
                { date: 'MAR 28, 2026', title: 'Nouvelles Quêtes Interdimensionnelles', desc: 'Résolvez les énigmes du continuum espace-temps pour débloquer des artefacts cosmiques.' },
                { date: 'MAR 15, 2026', title: 'L\'Éveil d\'Apex', desc: 'La vérité sur la faille originelle : comment un T-Rex cybernétique a déclenché le croisement des univers.' }
              ].map((post, idx) => (
                <article key={idx} className="group cursor-pointer bg-zinc-950/50 p-8 rounded-3xl border border-white/5 hover:border-[#c28e3a]/30 transition-all shadow-xl">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <time className="text-[#c28e3a] font-monda font-bold text-sm min-w-[120px] pt-1">{post.date}</time>
                    <div className="flex-1 md:border-l border-white/5 md:pl-8 group-hover:border-[#c28e3a] transition-all">
                      <h3 className="text-white text-3xl font-heading font-bold italic uppercase mb-4 group-hover:text-[#c28e3a] transition-colors">{post.title}</h3>
                      <p className="text-zinc-500 font-monda leading-relaxed text-lg italic mb-6">"{post.desc}"</p>
                      <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-[#c28e3a] transition-all">Lire l'Archive →</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
