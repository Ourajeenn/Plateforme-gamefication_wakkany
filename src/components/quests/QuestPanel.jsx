import React, { useState } from 'react';
import { QUESTS } from '../../data/quests';
import RiddleModal from './RiddleModal';

export default function QuestPanel({ xp, unlockedSkills, completedQuests, onCompleteQuest }) {
    const [activeRiddle, setActiveRiddle] = useState(null);

    const isQuestLocked = (quest) => {
        if (quest.nodeReq === 'ultimate') {
            // Check if any ultimate skill is unlocked
            const ultimates = ['spec_duelist', 'spec_saboteur', 'spec_veilranger'];
            const unlockedUltimates = unlockedSkills.filter(id => ultimates.includes(id));
            return unlockedUltimates.length < 2; // Req says 2 ultimates for legendary
        }
        if (!quest.nodeReq) return false;
        return !unlockedSkills.includes(quest.nodeReq);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
                <div>
                    <h2 className="text-[#c28e3a] text-xs font-bold uppercase tracking-[0.2em] mb-2">Défis Disponibles</h2>
                    <h1 className="text-white text-3xl font-heading font-bold italic uppercase tracking-tight">HABITUDES & PRODUCTIVITÉ</h1>
                </div>
                <div className="text-right">
                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Validés</span>
                    <div className="text-white text-2xl font-monda">{completedQuests.length} / {QUESTS.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {QUESTS.map(quest => {
                    const isLocked = isQuestLocked(quest);
                    const isCompleted = completedQuests.includes(quest.id);

                    return (
                        <div
                            key={quest.id}
                            className={`relative group bg-zinc-900 border transition-all duration-500 rounded-2xl p-6 ${isCompleted
                                    ? 'border-green-500/20 bg-green-500/5'
                                    : isLocked
                                        ? 'border-white/5 opacity-50'
                                        : 'border-white/10 hover:border-[#c28e3a]/40 hover:shadow-2xl hover:shadow-orange-950/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${quest.difficulty === 'Légendaire' ? 'bg-yellow-500/20 text-yellow-500' :
                                        quest.difficulty === 'Expert' ? 'bg-red-500/20 text-red-500' :
                                            quest.difficulty === 'Difficile' ? 'bg-orange-500/20 text-orange-500' :
                                                'bg-white/10 text-gray-400'
                                    }`}>
                                    {quest.difficulty}
                                </div>
                                <div className="text-[#c28e3a] font-monda text-sm">+{quest.xpReward} XP</div>
                            </div>

                            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#c28e3a] transition-colors uppercase tracking-tight italic">{quest.title}</h3>
                            <p className="text-zinc-500 text-xs italic mb-6 line-clamp-2">"{quest.lore}"</p>

                            <div className="flex items-center justify-between mt-auto">
                                {isLocked ? (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                        <iconify-icon icon="lucide:lock" width="14"></iconify-icon>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Bloqué : {quest.nodeReq} requis</span>
                                    </div>
                                ) : isCompleted ? (
                                    <div className="flex items-center gap-2 text-green-500">
                                        <iconify-icon icon="lucide:check-circle" width="14"></iconify-icon>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Accompli</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setActiveRiddle(quest)}
                                        className="flex-1 py-3 bg-[#c28e3a] text-black font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all font-monda rounded-lg"
                                    >
                                        Réaliser l'action
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeRiddle && (
                <RiddleModal
                    quest={activeRiddle}
                    onClose={() => setActiveRiddle(null)}
                    onSuccess={(q) => {
                        onCompleteQuest(q);
                        setActiveRiddle(null);
                    }}
                />
            )}
        </div>
    );
}
