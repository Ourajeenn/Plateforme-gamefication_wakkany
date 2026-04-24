import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { BRANCHES } from '../data/branches';

export default function StatsPanel({ xp, unlockedSkills, xpHistory }) {
    // Calcul de la répartition des branches pour le Radar Chart
    const getSkillDistribution = () => {
        const stats = { warriors: 0, heroes: 0, dinos: 0, cars: 0 };
        unlockedSkills.forEach(skillId => {
            Object.keys(BRANCHES).forEach(branchId => {
                if (BRANCHES[branchId].nodes.some(n => n.id === skillId)) {
                    stats[branchId] += 20;
                }
            });
        });

        return [
            { subject: 'Force', A: stats.warriors, fullMark: 100 },
            { subject: 'Arcane', A: stats.heroes, fullMark: 100 },
            { subject: 'Instinct', A: stats.dinos, fullMark: 100 },
            { subject: 'Technique', A: stats.cars, fullMark: 100 },
        ];
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{payload[0].payload.day}</p>
                    <p className="text-white font-heading font-bold italic text-xl">{payload[0].value} <span className="text-xs not-italic text-[#c28e3a]">XP</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* XP Progression Chart */}
            <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] overflow-hidden relative group">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Historique</h3>
                        <h2 className="text-white text-2xl font-heading font-black italic uppercase tracking-tighter">PROGRESSION XP</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-white italic leading-none">{xp}</div>
                        <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Total Actuel</div>
                    </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={xpHistory}>
                            <defs>
                                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#c28e3a" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#c28e3a" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} 
                                dy={10}
                            />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c28e3a', strokeWidth: 1 }} />
                            <Area 
                                type="monotone" 
                                dataKey="xp" 
                                stroke="#c28e3a" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorXp)" 
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Radar Chart for Skills */}
            <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] overflow-hidden relative group flex flex-col items-center">
                 <div className="w-full text-left mb-4">
                    <h3 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Alignement</h3>
                    <h2 className="text-white text-2xl font-heading font-black italic uppercase tracking-tighter">MAÎTRISE DES VOIES</h2>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getSkillDistribution()}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900, textAnchor: 'middle' }} 
                            />
                            <Radar
                                name="Compétences"
                                dataKey="A"
                                stroke="#c28e3a"
                                fill="#c28e3a"
                                fillOpacity={0.4}
                                animationDuration={1500}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-auto">
                    {Object.keys(BRANCHES).map(bKey => (
                        <div key={bKey} className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: BRANCHES[bKey]?.color }}>
                                {BRANCHES[bKey]?.label}
                            </div>
                            <div className="text-white font-heading font-bold italic text-lg uppercase tracking-tighter">
                                {unlockedSkills.filter(s => BRANCHES[bKey].nodes.some(n => n.id === s)).length * 20}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
