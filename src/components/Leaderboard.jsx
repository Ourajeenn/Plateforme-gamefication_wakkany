import React, { useState, useEffect } from 'react';

const MOCK_PLAYERS = [
    { name: 'SlayerX', school: 'Tech Academy Paris', xp: 2450, level: 12, dominant: 'sustain' },
    { name: 'CloudGhost', school: 'MIT', xp: 2200, level: 11, dominant: 'burst' },
    { name: 'CodeNinja', school: 'Polytechnique', xp: 2100, level: 10, dominant: 'control' },
    { name: 'ZenMaster', school: 'Tech Academy Paris', xp: 1800, level: 8, dominant: 'burst' },
    { name: 'IronHulk', school: 'MIT', xp: 1500, level: 7, dominant: 'sustain' },
];

export default function Leaderboard({ currentUser }) {
    const [view, setView] = useState('champions'); // champions | academies | branches
    const [players, setPlayers] = useState(MOCK_PLAYERS);
    const [recentGains, setRecentGains] = useState({});

    useEffect(() => {
        // Real-time leaderboard simulation
        const interval = setInterval(() => {
            setPlayers(prevPlayers => {
                const newPlayers = prevPlayers.map(p => ({ ...p }));
                const numToUpdate = Math.floor(Math.random() * 2) + 1;
                const newGains = {};
                
                for(let i=0; i<numToUpdate; i++) {
                    const idx = Math.floor(Math.random() * newPlayers.length);
                    const gain = Math.floor(Math.random() * 30) + 10;
                    newPlayers[idx].xp += gain;
                    newGains[newPlayers[idx].name] = { amount: gain, id: Date.now() + i };
                }
                
                setRecentGains(newGains);
                return newPlayers;
            });

            // Clear gains after 2s
            setTimeout(() => setRecentGains({}), 2000);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const allPlayers = currentUser ? [...players, currentUser] : players;
    const sortedPlayers = [...allPlayers].sort((a, b) => b.xp - a.xp);

    const getAcademyStats = () => {
        const academies = {};
        allPlayers.forEach(p => {
            if (!academies[p.school]) academies[p.school] = { name: p.school, totalXp: 0, count: 0 };
            academies[p.school].totalXp += p.xp;
            academies[p.school].count++;
        });
        return Object.values(academies).sort((a, b) => b.totalXp - a.totalXp);
    };

    const getBranchStats = () => {
        const branches = { sustain: 0, burst: 0, control: 0 };
        allPlayers.forEach(p => {
            if (p.dominant) branches[p.dominant]++;
        });
        return branches;
    };

    return (
        <div className="bg-zinc-950/50 rounded-3xl border border-white/5 p-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <h2 className="text-white text-2xl font-heading font-bold italic uppercase tracking-tight">Global Rankings</h2>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    {['champions', 'academies', 'branches'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === v ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {view === 'champions' && (
                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => {
                            const isMe = currentUser && player.name === currentUser.name;
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isMe ? 'bg-[#c28e3a]/10 border-[#c28e3a] scale-[1.02]' : 'bg-black/20 border-white/5'
                                        }`}
                                >
                                    <div className="w-8 text-zinc-600 font-monda font-bold">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold">{player.name}</span>
                                            <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded text-zinc-500 uppercase">{player.dominant || 'Novice'}</span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{player.school}</div>
                                    </div>
                                    <div className="text-right flex items-center justify-end gap-3 min-w-[100px]">
                                        {recentGains[player.name] && !isMe && (
                                            <span key={recentGains[player.name].id} className="text-green-400 text-xs font-bold animate-pulse">
                                                +{recentGains[player.name].amount}
                                            </span>
                                        )}
                                        <div>
                                            <div className="text-white font-monda text-lg">{player.xp}</div>
                                            <div className="text-[#c28e3a] text-[8px] font-bold uppercase">XP TOTAL</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {view === 'academies' && (
                    <div className="space-y-3">
                        {getAcademyStats().map((academy, index) => (
                            <div key={index} className="bg-black/20 border border-white/5 p-5 rounded-xl">
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-white font-bold uppercase tracking-wider">{academy.name}</h3>
                                    <span className="text-[#c28e3a] font-monda">{academy.totalXp} XP</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-[#c28e3a]"
                                        style={{ width: `${(academy.totalXp / 10000) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 text-[8px] text-zinc-500 uppercase tracking-widest">{academy.count} Active Champions</div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'branches' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(getBranchStats()).map(([branch, count]) => (
                            <div key={branch} className="bg-black/20 border border-white/5 p-6 rounded-2xl text-center">
                                <div className="text-4xl mb-4">
                                    {branch === 'sustain' ? '🛡️' : branch === 'burst' ? '🔥' : '🧲'}
                                </div>
                                <h3 className="text-white font-bold uppercase mb-1">{branch}</h3>
                                <div className="text-3xl text-[#c28e3a] font-monda mb-2">{count}</div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Followers</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
