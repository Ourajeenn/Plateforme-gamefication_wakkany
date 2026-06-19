import React from 'react';

export default function AestheticInventory() {
  return (
    <div className="lg:col-span-4 bg-zinc-950 border border-purple-500/10 rounded-3xl p-5 sm:p-8 pt-8 sm:pt-10 shadow-[inset_0_0_30px_rgba(168,85,247,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between group">
      
      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-zinc-950 border-x border-b border-purple-500/30 px-8 py-2 rounded-b-2xl shadow-lg z-20">
        <span className="text-[10px] font-heading font-black tracking-[0.25em] text-white uppercase">INVENTORY</span>
      </div>

      <div className="absolute inset-0 bg-radial-gradient from-purple-900/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      <div className="mt-4">
        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-center">
          Aesthetic Elements
        </h3>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {['lucide:activity', 'lucide:swords', 'lucide:flame', 'lucide:gem'].map((icon, idx) => (
            <div key={idx} className="aspect-square rounded-full border border-purple-500/20 bg-zinc-900/50 flex items-center justify-center text-purple-400/80 hover:border-purple-400 hover:text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <iconify-icon icon={icon} width="16"></iconify-icon>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-[1px] bg-purple-500/20 flex-1"></div>
          <span className="text-[10px] text-purple-500/60 font-black tracking-widest">❖</span>
          <div className="h-[1px] bg-purple-500/20 flex-1"></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: 'game-icons:potion-ball', color: '#ff3b30', name: 'HP POTION' },
            { icon: 'game-icons:crystal-wand', color: '#a855f7', name: 'AETHER' },
            { icon: 'game-icons:dragon-shield', color: '#c28e3a', name: 'LEGION' }
          ].map((item, idx) => (
            <div key={idx} className="bg-black/50 border border-purple-500/10 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:border-purple-500/30 transition-all group">
              <iconify-icon icon={item.icon} width="24" style={{ color: item.color }} className="group-hover:scale-110 transition-transform filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]"></iconify-icon>
              <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-[1px] bg-purple-500/20 flex-1"></div>
          <span className="text-[10px] text-purple-500/60 font-black tracking-widest">✦</span>
          <div className="h-[1px] bg-purple-500/20 flex-1"></div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: 'game-icons:crown', color: '#eab308' },
            { icon: 'game-icons:elixir', color: '#3b82f6' },
            { icon: 'game-icons:dinosaur-bones', color: '#34c759' },
            { icon: 'game-icons:crystal-growth', color: '#ec4899' }
          ].map((item, idx) => (
            <div key={idx} className="aspect-square rounded-xl bg-zinc-900/50 border border-purple-500/15 flex items-center justify-center hover:border-purple-400 transition-all">
              <iconify-icon icon={item.icon} width="20" style={{ color: item.color }}></iconify-icon>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[8px] text-zinc-600 font-bold tracking-[0.2em] mt-8 uppercase">
        Wakkany Gear Collection v2.0
      </div>
    </div>
  );
}
