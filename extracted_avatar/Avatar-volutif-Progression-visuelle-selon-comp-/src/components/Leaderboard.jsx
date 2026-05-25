import React, { useState } from 'react';

const TOP_PLAYERS = [
    { id: 1, name: 'SlayerX', school: 'Tech Academy', xp: 2450, level: 12, avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'CloudGhost', school: 'MIT', xp: 2200, level: 11, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'CodeNinja', school: 'Polytechnique', xp: 2100, level: 10, avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'IronDev', school: 'Tech Academy', xp: 1950, level: 9, avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'BitMaster', school: 'Oxford IT', xp: 1800, level: 9, avatar: 'https://i.pravatar.cc/150?u=5' },
];

const SCHOOL_RANKING = [
    { name: 'Tech Academy', score: 15400, color: 'text-blue-400' },
    { name: 'MIT', score: 14200, color: 'text-red-400' },
    { name: 'Polytechnique', score: 12800, color: 'text-purple-400' },
    { name: 'Oxford IT', score: 11500, color: 'text-green-400' },
];

export default function Leaderboard() {
    const [view, setView] = useState('players'); // 'players' or 'schools'

    return (
        <section className="bg-zinc-950 py-32 border-t border-white/5 relative overflow-hidden">
            {/* Visual background details */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c28e3a]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h3 className="text-[#c28e3a] text-sm font-bold uppercase tracking-[0.2em] mb-3">The Pantheon</h3>
                    <h2 className="text-white text-5xl font-heading font-bold italic uppercase tracking-tight">COMPETITIVE ARENA</h2>
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => setView('players')}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${view === 'players' ? 'bg-[#c28e3a] text-black shadow-lg shadow-orange-950/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Champions
                        </button>
                        <button
                            onClick={() => setView('schools')}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${view === 'schools' ? 'bg-[#c28e3a] text-black shadow-lg shadow-orange-950/20' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Academies
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8">
                    {view === 'players' ? (
                        <div className="space-y-4 animate-fade-in">
                            {TOP_PLAYERS.map((player, idx) => (
                                <div key={player.id} className={`flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/5 group border border-transparent hover:border-white/5`}>
                                    <div className="flex items-center gap-6">
                                        <span className={`text-2xl font-bold font-heading italic w-8 ${idx < 3 ? 'text-[#c28e3a]' : 'text-zinc-600'}`}>0{idx + 1}</span>
                                        <div className="relative">
                                            <img src={player.avatar} className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-[#c28e3a] transition-all" />
                                            {idx === 0 && <iconify-icon icon="lucide:crown" className="absolute -top-3 -right-3 text-yellow-500 drop-shadow-md" width="20"></iconify-icon>}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{player.name}</h4>
                                            <p className="text-zinc-500 text-xs uppercase tracking-widest">{player.school}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[#c28e3a] font-heading font-bold text-xl">{player.xp} <span className="text-xs text-zinc-600">XP</span></div>
                                        <div className="text-gray-400 text-xs uppercase font-bold px-2 py-0.5 bg-black/30 rounded border border-white/5">lvl {player.level}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in p-2">
                            {SCHOOL_RANKING.map((school, idx) => (
                                <div key={school.name} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-3">
                                            <span className="text-zinc-600 font-heading italic">{idx + 1}.</span> {school.name}
                                        </span>
                                        <span className={`${school.color} font-heading font-bold text-xl`}>{school.score} <span className="text-xs opacity-60">PTS</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${school.color.replace('text', 'bg')} opacity-80`}
                                            style={{ width: `${(school.score / SCHOOL_RANKING[0].score) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            <p className="text-center text-zinc-600 text-xs mt-12 py-4 border-t border-white/5">Académie au sommet: Tech Academy (Domination des quêtes de code)</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
