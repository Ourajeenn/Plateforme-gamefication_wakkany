import React, { useState } from 'react';
import { QUESTS } from '../../data/quests';
import { BRANCHES } from '../../data/branches';
import RiddleModal from './RiddleModal';
import QuestCard from './QuestCard';
import QuestReward from './QuestReward';

export default function QuestPanel({ xp, unlockedSkills, completedQuests, onCompleteQuest, flashQuests = [] }) {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [rewardedQuest, setRewardedQuest] = useState(null);

    const handleQuestSuccess = (quest) => {
        if (!quest || completedQuests.includes(quest.id)) {
            setActiveQuiz(null);
            return;
        }

        setActiveQuiz(null);
        setRewardedQuest(quest);
        onCompleteQuest(quest);
    };

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
                {QUESTS.map(quest => (
                    <QuestCard
                        key={quest.id}
                        quest={quest}
                        isLocked={isQuestLocked(quest)}
                        isCompleted={completedQuests.includes(quest.id)}
                        branchColor={quest.branch === 'all' ? '#c28e3a' : BRANCHES[quest.branch]?.color || '#fff'}
                        getReqName={getReqName}
                        onStart={setActiveQuiz}
                    />
                ))}
            </div>

            {activeQuiz && (
                <RiddleModal
                    quest={activeQuiz}
                    onClose={() => setActiveQuiz(null)}
                    onSuccess={handleQuestSuccess}
                />
            )}

            {rewardedQuest && (
                <QuestReward quest={rewardedQuest} onClose={() => setRewardedQuest(null)} />
            )}
        </div>
    );
}
