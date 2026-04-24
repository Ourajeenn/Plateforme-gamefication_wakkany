import React, { useState } from 'react';
import { QUESTS } from '../../data/quests';
import { BRANCHES } from '../../data/branches';
import QuizModal from './QuizModal';

export default function QuestPanel({ xp, unlockedSkills, completedQuests, onCompleteQuest, flashQuests = [] }) {
    const [activeQuiz, setActiveQuiz] = useState(null);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const findNode = (nodeId) => {
        for (const branch of Object.values(BRANCHES)) {
            const node = branch.nodes.find(n => n.id === nodeId);
            if (node) return node;
        }
        return null;
    };

    const getReqName = (reqId) => {
        if (reqId === 'ultimate') return '2 Noyaux Ultimes';
        const node = findNode(reqId);
        return node ? node.name : reqId;
    };

    const isQuestLocked = (quest) => {
        if (quest.nodeReq === 'ultimate') {
            const ultimatesCount = unlockedSkills.filter(id => {
              const node = findNode(id);
              return node?.ultimate;
            }).length;
            return ultimatesCount < 2;
        }
        if (!quest.nodeReq) return false;
        return !unlockedSkills.includes(quest.nodeReq);
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <h2 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.3em] mb-2">Centre de Commande</h2>
                    <h1 className="text-white text-5xl font-heading font-bold italic uppercase tracking-tighter">CONTRATS & MISSIONS</h1>
                </div>
                <div className="bg-zinc-900 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Ratio de Complétion</span>
                    <div className="text-white text-2xl font-black italic">{Math.round((completedQuests.length / QUESTS.length) * 100)}%</div>
                </div>
            </div>

            {/* Flash Quests Section */}
            {flashQuests.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                        <h3 className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Alertes de Faille Temporelle</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {flashQuests.map(quest => (
                            <div key={quest.id} className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-red-500/10 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl animate-pulse">⚠️</div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xl italic font-heading tracking-tighter">{quest.title}</h4>
                                        <p className="text-red-200/50 text-xs italic mt-1 font-monda">"{quest.desc}"</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-red-500 font-heading font-black italic text-2xl">{formatTime(quest.timeLeft)}</p>
                                        <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest">Temps Restant</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveQuiz(quest)} 
                                        className="px-8 py-3 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-900/20"
                                    >
                                        Intervenir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {QUESTS.map(quest => {
                    const isLocked = isQuestLocked(quest);
                    const isCompleted = completedQuests.includes(quest.id);
                    const branchColor = quest.branch === 'all' ? '#c28e3a' : BRANCHES[quest.branch]?.color || '#fff';

                    return (
                        <div
                            key={quest.id}
                            className={`relative group bg-zinc-900/40 border transition-all duration-500 rounded-3xl p-8 overflow-hidden 
                              ${isCompleted ? 'border-green-500/20 bg-green-500/5' : 
                                isLocked ? 'border-white/5 opacity-40 backdrop-blur-sm' : 
                                'border-white/5 hover:border-white/20 hover:bg-zinc-900/60'}`}
                        >
                            {/* Branch Indicator Border */}
                            <div className="absolute top-0 left-0 w-1 h-full opacity-40" style={{ backgroundColor: branchColor }}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 
                                  ${quest.difficulty === 'Légendaire' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' : 
                                    quest.difficulty === 'Expert' ? 'bg-red-500/20 text-red-100 border-red-500/20' : 
                                    quest.difficulty === 'Difficile' ? 'bg-orange-500/20 text-orange-200 border-orange-500/20' : 
                                    'bg-zinc-800 text-zinc-400'}`}>
                                    {quest.difficulty}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-black text-lg">+{quest.xpReward}</span>
                                  <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">XP</span>
                                </div>
                            </div>

                            <h3 className="text-white font-black text-2xl mb-3 uppercase tracking-tighter italic font-heading group-hover:text-white transition-colors">
                              {quest.title}
                            </h3>
                            <p className="text-zinc-500 text-sm italic mb-8 leading-relaxed line-clamp-2">
                              "{quest.lore}"
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                {isLocked ? (
                                    <div className="flex items-center gap-3 text-zinc-600 bg-black/40 px-4 py-2 rounded-xl">
                                        <iconify-icon icon="lucide:lock" width="16"></iconify-icon>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Requis : <span className="text-zinc-400">{getReqName(quest.nodeReq)}</span></span>
                                    </div>
                                ) : isCompleted ? (
                                    <div className="flex items-center gap-3 text-green-500 bg-green-500/10 px-6 py-3 rounded-xl border border-green-500/20 w-full justify-center">
                                        <iconify-icon icon="lucide:check-circle" width="18"></iconify-icon>
                                        <span className="text-xs uppercase font-black tracking-[0.2em]">Mission Accomplie</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setActiveQuiz(quest)}
                                        className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.2em] transform active:scale-95 transition-all hover:bg-[#c28e3a] hover:text-white rounded-2xl shadow-xl"
                                    >
                                        DÉMARRER LA MISSION
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeQuiz && (
                <QuizModal
                    quest={activeQuiz}
                    onClose={() => setActiveQuiz(null)}
                    onSuccess={(q) => {
                        onCompleteQuest(q);
                        setActiveQuiz(null);
                    }}
                />
            )}
        </div>
    );
}
