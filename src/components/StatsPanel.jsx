import React, { useState, useEffect } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar 
} from 'recharts';
import { motion } from 'framer-motion';
import { BRANCHES } from '../data/branches';
import { getLevel } from '../data/levels';

export default function StatsPanel({ xp = 0, unlockedSkills = [], xpHistory = [] }) {
    const [gameStats, setGameStats] = useState({
        quizGames: 0,
        quizWins: 0,
        bluffGames: 0,
        bluffWins: 0,
        bluffSweeps: 0,
        bluffBestScore: 0,
        bluffTotalScore: 0,
        bossDefeated: 0,
    });

    useEffect(() => {
        try {
            const quizGames = parseInt(localStorage.getItem('wakkany_family_games') || '0', 10);
            const quizWins = parseInt(localStorage.getItem('wakkany_family_wins') || '0', 10);
            const bluffGames = parseInt(localStorage.getItem('wakkany_bluff_games') || '0', 10);
            const bluffWins = parseInt(localStorage.getItem('wakkany_bluff_wins') || '0', 10);
            const bluffSweeps = parseInt(localStorage.getItem('wakkany_bluff_sweeps') || '0', 10);
            const bluffBestScore = parseInt(localStorage.getItem('wakkany_bluff_best_score') || '0', 10);
            const bluffTotalScore = parseInt(localStorage.getItem('wakkany_bluff_total_score') || '0', 10);
            const bossData = JSON.parse(localStorage.getItem('wakkany_boss_progress') || '{"defeated":[]}');
            const bossDefeated = bossData.defeated ? bossData.defeated.length : 0;

            setGameStats({
                quizGames,
                quizWins,
                bluffGames,
                bluffWins,
                bluffSweeps,
                bluffBestScore,
                bluffTotalScore,
                bossDefeated,
            });
        } catch (e) {
            console.warn('[StatsPanel] Erreur lecture stats locales:', e);
        }
    }, []);

    const currentLevel = getLevel(xp);
    const totalGames = (gameStats.quizGames || 0) + (gameStats.bluffGames || 0);

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
        <div className="space-y-8 font-monda">
            {/* Header KPI Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* XP & Level */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Progression</span>
                        <div className="w-8 h-8 rounded-xl bg-[#c28e3a]/15 text-[#c28e3a] flex items-center justify-center">
                            <iconify-icon icon="mdi:flash" width="18" />
                        </div>
                    </div>
                    <div className="text-3xl font-heading font-black italic text-white mb-1">
                        {xp} <span className="text-xs font-normal not-italic text-[#c28e3a]">XP</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                        Niveau {currentLevel.level} · {currentLevel.name}
                    </p>
                </motion.div>

                {/* Unlocked Skills */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Talents Acquis</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                            <iconify-icon icon="mdi:sword-cross" width="18" />
                        </div>
                    </div>
                    <div className="text-3xl font-heading font-black italic text-white mb-1">
                        {unlockedSkills.length} <span className="text-xs font-normal not-italic text-zinc-500">/ 24</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                        {Math.round((unlockedSkills.length / 24) * 100)}% de l&apos;arbre débloqué
                    </p>
                </motion.div>

                {/* Total Games */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Parties Globales</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                            <iconify-icon icon="mdi:gamepad-variant" width="18" />
                        </div>
                    </div>
                    <div className="text-3xl font-heading font-black italic text-white mb-1">
                        {totalGames}
                    </div>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                        {gameStats.quizGames} Quiz · {gameStats.bluffGames} Bluff
                    </p>
                </motion.div>

                {/* Bluff Royal Specific Highlight */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="bg-gradient-to-br from-[#c28e3a]/20 via-zinc-900/80 to-black border-2 border-[#c28e3a]/40 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_20px_rgba(194,142,58,0.15)]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Parties Bluff</span>
                        <div className="w-8 h-8 rounded-xl bg-[#c28e3a] text-black flex items-center justify-center font-bold">
                            <iconify-icon icon="mdi:theater" width="18" />
                        </div>
                    </div>
                    <div className="text-3xl font-heading font-black italic text-[#fcd34d] mb-1">
                        {gameStats.bluffGames} <span className="text-xs font-normal not-italic text-zinc-400">jouée{gameStats.bluffGames > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">
                        Record : <span className="text-[#c28e3a]">{gameStats.bluffBestScore} pts</span> {gameStats.bluffSweeps > 0 ? `· ${gameStats.bluffSweeps} sweep(s)` : ''}
                    </p>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* XP Progression Chart */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] overflow-hidden relative group backdrop-blur-sm">
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
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] overflow-hidden relative group flex flex-col items-center backdrop-blur-sm">
                    <div className="w-full text-left mb-4">
                        <h3 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Alignement</h3>
                        <h2 className="text-white text-2xl font-heading font-black italic uppercase tracking-tighter">MAÎTRISE DES VOIES</h2>
                    </div>

                    <div className="h-[260px] w-full">
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-auto pt-4 border-t border-white/5">
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

            {/* Detailed Game Modes Performance Section */}
            <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] relative overflow-hidden backdrop-blur-sm">
                <div className="mb-6">
                    <p className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Détail des Épreuves</p>
                    <h2 className="text-white text-xl sm:text-2xl font-heading font-black italic uppercase tracking-tight">
                        STATISTIQUES DES MODES DE JEU
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mode Bluff Royal */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-[#c28e3a]/30 relative group hover:border-[#c28e3a] transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#c28e3a]/20 border border-[#c28e3a]/40 text-[#c28e3a] flex items-center justify-center">
                                <iconify-icon icon="mdi:theater" width="22" />
                            </div>
                            <div>
                                <h3 className="text-white font-heading font-bold italic uppercase text-sm">Bluff Royal</h3>
                                <span className="text-[9px] text-[#c28e3a] font-bold uppercase tracking-wider">Tromperie & Déduction</span>
                            </div>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Parties jouées</span>
                                <span className="font-bold text-white">{gameStats.bluffGames}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Victoires</span>
                                <span className="font-bold text-emerald-400">{gameStats.bluffWins}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Sweeps parfaits (5/5)</span>
                                <span className="font-bold text-[#fcd34d]">{gameStats.bluffSweeps}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-zinc-400">Meilleur score</span>
                                <span className="font-bold text-[#c28e3a]">{gameStats.bluffBestScore} pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Mode Quiz Salon */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 relative group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                                <iconify-icon icon="mdi:school" width="22" />
                            </div>
                            <div>
                                <h3 className="text-white font-heading font-bold italic uppercase text-sm">Quiz de la Meute</h3>
                                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Culture & Savoir</span>
                            </div>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Parties jouées</span>
                                <span className="font-bold text-white">{gameStats.quizGames}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Victoires parfaites</span>
                                <span className="font-bold text-emerald-400">{gameStats.quizWins}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Mode Salon</span>
                                <span className="font-bold text-zinc-300">Actif</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-zinc-400">Questions avec conséquences</span>
                                <span className="font-bold text-[#c28e3a]">Incluses</span>
                            </div>
                        </div>
                    </div>

                    {/* Mode Raid de Boss */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 relative group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                                <iconify-icon icon="mdi:skull" width="22" />
                            </div>
                            <div>
                                <h3 className="text-white font-heading font-bold italic uppercase text-sm">Raid de Boss</h3>
                                <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Épreuves Épiques</span>
                            </div>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Boss terrassés</span>
                                <span className="font-bold text-red-400">{gameStats.bossDefeated}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Statut Boss</span>
                                <span className="font-bold text-zinc-300">{gameStats.bossDefeated > 0 ? 'Conquérant' : 'En attente'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span className="text-zinc-400">Défis coopératifs</span>
                                <span className="font-bold text-white">Disponibles</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-zinc-400">Récompenses d&apos;Aura</span>
                                <span className="font-bold text-[#c28e3a]">Déblocables</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
