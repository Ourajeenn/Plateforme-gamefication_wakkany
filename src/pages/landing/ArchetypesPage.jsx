export default function ArchetypesPage({ onBack, onJoin }) {
  return (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} type="button" className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-16 text-center">CORE ARCHETYPES</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Fighter', role: 'Iron Legion', icon: 'lucide:swords', desc: 'Masters of steel and physical dominance. High defense and brutal close-quarters combat.', color: '#ef4444' },
            { title: 'Mage', role: 'Arcane Order', icon: 'lucide:wand-2', desc: 'Wielders of Aether essence. Devastating area attacks and reality-bending utility.', color: '#3b82f6' },
            { title: 'Rogue', role: 'Silent Veils', icon: 'lucide:skull', desc: 'Ghosts in the machine. High critical damage, stealth, and lethal precision.', color: '#a855f7' },
          ].map((item, idx) => (
            <div key={idx} className="bg-zinc-900 border border-white/5 p-12 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `radial-gradient(circle at top right, ${item.color}, transparent)` }}></div>
              <iconify-icon icon={item.icon} width="64" style={{ color: item.color }} className="mb-8 block group-hover:scale-110 transition-transform"></iconify-icon>
              <h3 className="text-white text-3xl font-heading font-bold italic uppercase mb-2">{item.title}</h3>
              <p className="text-[#c28e3a] text-xs font-bold uppercase tracking-widest mb-6">{item.role}</p>
              <p className="text-zinc-500 font-monda leading-relaxed">{item.desc}</p>
              <button
                type="button"
                onClick={onJoin}
                className="mt-10 w-full py-4 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Select Path
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
