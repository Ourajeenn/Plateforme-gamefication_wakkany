export default function AboutPage({ onBack }) {
  return (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} type="button" className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-16 text-center">LE MULTIVERS WAKKANY</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'La Grande Faille',
              subtitle: "L'Événement Fondateur",
              desc: 'Une anomalie temporelle cataclysmique a brisé les barrières de la réalité, provoquant la fusion brutale de quatre dimensions distinctes.',
              points: ['Légion Héroïque (Guerriers de Lumière)', 'Ordre Antique (Mages et Érudits)', 'Ère Primaire (Bêtes et Dinosaures)', 'Syndicat Mécanique (Cyborgs)'],
              icon: 'lucide:shield-check',
              color: '#3b82f6',
            },
            {
              title: "L'Aether",
              subtitle: 'Source de Pouvoir',
              desc: 'Le flux quantique, ou Aether, irrigue désormais toutes les entités du multivers. Il est la source de toute magie et de la technologie avancée.',
              points: ['Modification de l\'ADN', 'Alimentation des Noyaux Mécaniques', 'Contrôle des Éléments', 'Évolution par l\'Expérience (XP)'],
              icon: 'lucide:sparkles',
              color: '#a855f7',
            },
            {
              title: "L'Arène Éternelle",
              subtitle: 'Le Choc des Mondes',
              desc: 'Pour éviter une guerre totale destructrice, les conflits se règlent désormais dans l\'Arène, un cycle infini de combats titanesques.',
              points: ['Combats Inter-dimensionnels', 'Forges de Nouvelles Légendes', 'Système de Rangs et Badges', 'Conquête de Territoires'],
              icon: 'lucide:swords',
              color: '#f43f5e',
            },
          ].map((item, idx) => (
            <div key={idx} className="relative glass-panel p-10 rounded-[32px] hover:border-[#c28e3a]/40 transition-all duration-500 group overflow-hidden flex flex-col h-full">
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: item.color }}
              ></div>
              <iconify-icon icon={item.icon} width="56" style={{ color: item.color }} className="mb-6 block group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"></iconify-icon>
              <div className="mb-6 flex-grow">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] block mb-2">{item.subtitle}</span>
                <h3 className="text-white text-3xl font-bold uppercase mb-4 italic font-heading tracking-tight">{item.title}</h3>
                <div className="h-px w-12 bg-white/20 mb-6 group-hover:w-full transition-all duration-700"></div>
                <p className="text-zinc-400 font-monda leading-relaxed text-sm">{item.desc}</p>
              </div>
              <ul className="space-y-3 mt-auto">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm font-monda">
                    <iconify-icon icon="lucide:check" width="16" className="text-[#c28e3a] mt-0.5 shrink-0"></iconify-icon>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 p-[1px] bg-gradient-to-r from-transparent via-[#c28e3a]/30 to-transparent">
          <div className="glass-panel p-16 text-center rounded-3xl">
            <h2 className="text-white text-3xl font-heading italic uppercase mb-6">&quot;History is written in blood, but the future is forged in XP.&quot;</h2>
            <p className="text-zinc-200 max-w-2xl mx-auto font-monda">Plateforme Wakkany est un écosystème RPG unique où votre identité visuelle évolue avec vos compétences. Chaque choix dans l&apos;arbre de talents se reflète sur votre avatar, rendant chaque champion unique.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
