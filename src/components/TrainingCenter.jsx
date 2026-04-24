import React, { useState } from 'react';
import { QUIZZES } from '../data/quizzes';
import { QUESTS } from '../data/quests';
import { BRANCHES } from '../data/branches';
import QuizModal from './quests/QuizModal';

export default function TrainingCenter({ xp, unlockedSkills, completedQuests, onCompleteQuest, onPenalty, flashQuests = [] }) {
  const [activeTab, setActiveTab] = useState('categories'); // categories | story
  const [activeQuiz, setActiveQuiz] = useState(null);

  const categories = [
    { id: 'heroes', label: 'Super-Héros', icon: '🦸‍♂️', color: '#ef4444', desc: 'Marvel, DC & au-delà' },
    { id: 'warriors', label: 'Guerriers & Mythes', icon: '⚔️', color: '#f59e0b', desc: 'Spartacus, Odin, Kratos...' },
    { id: 'dinos', label: 'Dinosaures', icon: '🦖', color: '#10b981', desc: 'Jurassique & Crétacé' },
    { id: 'cars', label: 'Automobile', icon: '🏎️', color: '#3b82f6', desc: 'Monstres de puissance' },
    { id: 'culture', label: 'Culture Générale', icon: '🌍', color: '#8b5cf6', desc: 'Art, Histoire & Savoir' },
    { id: 'geography', label: 'Géographie', icon: '🗺️', color: '#06b6d4', desc: 'Fleuves, Montagnes & Pays' },
    { id: 'math', label: 'Mathématiques', icon: '🧮', color: '#ec4899', desc: 'Nombres & Géométrie' },
    { id: 'flags', label: 'Drapeaux', icon: '🚩', color: '#f43f5e', desc: 'Couleurs du Monde' }
  ];

  const handleStartQuiz = (category) => {
    const mockQuest = {
      id: `training-${category.id}-${Date.now()}`,
      title: `Défi: ${category.label}`,
      branch: category.id,
      difficulty: 'Expert',
      xpReward: 25,
      lore: `Entraînement intensif dans la catégorie ${category.label}. Prouvez votre maîtrise.`
    };
    setActiveQuiz(mockQuest);
  };

  const isQuestLocked = (quest) => {
    if (quest.nodeReq === 'ultimate') {
      const ultimatesCount = unlockedSkills.filter(id => {
        for (const branch of Object.values(BRANCHES)) {
          const node = branch.nodes.find(n => n.id === id);
          if (node?.ultimate) return true;
        }
        return false;
      }).length;
      return ultimatesCount < 2;
    }
    if (!quest.nodeReq) return false;
    return !unlockedSkills.includes(quest.nodeReq);
  };

  const getReqName = (reqId) => {
    if (reqId === 'ultimate') return '2 Noyaux Ultimes';
    for (const branch of Object.values(BRANCHES)) {
      const node = branch.nodes.find(n => n.id === reqId);
      if (node) return node.name;
    }
    return reqId;
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div>
          <h2 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.4em] mb-3">Centre de Commandement</h2>
          <h1 className="text-white text-5xl font-heading font-bold italic uppercase tracking-tighter">PROTOCOLES DE QUÊTES</h1>
        </div>
        
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === 'categories' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
          >
            Savoir & Quizz
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === 'story' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
          >
            Missions d'Histoire
          </button>
        </div>
      </div>

      {activeTab === 'categories' && (
        <div className="animate-scale-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleStartQuiz(cat)}
                className="group relative bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] text-left transition-all hover:bg-zinc-900/60 hover:border-white/20 hover:scale-[1.02] overflow-hidden"
              >
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: cat.color }}
                ></div>

                <div 
                  className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-4xl mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500"
                  style={{ boxShadow: `0 0 30px ${cat.color}20` }}
                >
                  {cat.icon}
                </div>

                <h3 className="text-white font-black uppercase text-xl tracking-tighter mb-2 italic font-heading" style={{ color: cat.color }}>
                  {cat.label}
                </h3>
                <p className="text-zinc-500 text-xs font-monda italic leading-relaxed">
                  {cat.desc}
                </p>

                <div className="mt-8 flex items-center justify-between">
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">+25 XP</span>
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                     <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>
                   </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'story' && (
        <div className="animate-scale-up space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {QUESTS.map(quest => {
                const isLocked = isQuestLocked(quest);
                const isCompleted = completedQuests.includes(quest.id);
                const branchColor = quest.branch === 'all' ? '#c28e3a' : BRANCHES[quest.branch]?.color || '#fff';

                return (
                  <div
                    key={quest.id}
                    className={`relative group bg-zinc-900/40 border transition-all duration-500 rounded-[40px] p-8 overflow-hidden 
                      ${isCompleted ? 'border-green-500/20 bg-green-500/5' : 
                        isLocked ? 'border-white/5 opacity-40 backdrop-blur-sm' : 
                        'border-white/5 hover:border-white/20 hover:bg-zinc-900/60'}`}
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full opacity-40" style={{ backgroundColor: branchColor }}></div>

                    <div className="flex justify-between items-start mb-8">
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 
                          ${quest.difficulty === 'Légendaire' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' : 
                            quest.difficulty === 'Expert' ? 'bg-red-500/20 text-red-100 border-red-500/20' : 
                            'bg-zinc-800 text-zinc-400'}`}>
                            {quest.difficulty}
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl border border-white/5">
                          <span className="text-white font-black text-lg">+{quest.xpReward}</span>
                          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">XP</span>
                        </div>
                    </div>

                    <h3 className="text-white font-black text-2xl mb-4 uppercase tracking-tighter italic font-heading group-hover:text-white transition-colors">
                      {quest.title}
                    </h3>
                    <p className="text-zinc-500 text-sm italic mb-10 leading-relaxed font-monda">
                      "{quest.lore}"
                    </p>

                    <div className="mt-auto">
                        {isLocked ? (
                            <div className="flex items-center gap-3 text-zinc-600 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                                <iconify-icon icon="lucide:lock" width="16"></iconify-icon>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Requis : <span className="text-zinc-400">{getReqName(quest.nodeReq)}</span></span>
                            </div>
                        ) : isCompleted ? (
                            <div className="flex items-center gap-3 text-green-500 bg-green-500/10 px-8 py-4 rounded-2xl border border-green-500/20 w-full justify-center">
                                <iconify-icon icon="lucide:check-circle" width="20"></iconify-icon>
                                <span className="text-xs uppercase font-black tracking-[0.3em]">Mission Accomplie</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveQuiz(quest)}
                                className="w-full py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-[#c28e3a] hover:text-white transition-all shadow-2xl"
                            >
                                LANCER L'EXTRACTION
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* Daily Challenge Footer Card */}
      <div className="bg-zinc-950/50 border border-white/5 p-12 rounded-[60px] flex flex-col items-center text-center gap-8 relative overflow-hidden group">
         <div className="absolute inset-0 bg-[#c28e3a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <div className="w-24 h-24 rounded-[30px] bg-[#c28e3a]/10 flex items-center justify-center border border-[#c28e3a]/20 shadow-2xl relative z-10">
            <iconify-icon icon="lucide:zap" width="48" className="text-[#c28e3a]"></iconify-icon>
         </div>
         <div className="relative z-10">
           <h3 className="text-white text-4xl font-heading font-bold italic uppercase mb-4 tracking-tighter">FAILLE TEMPORELLE</h3>
           <p className="text-zinc-500 max-w-xl mx-auto italic text-sm font-monda leading-relaxed">
             Une anomalie détectée dans le Nexus. Relevez le défi aléatoire quotidien pour obtenir des récompenses exclusives et doubler vos gains d'expérience.
           </p>
         </div>
         <button 
           onClick={() => handleStartQuiz({ id: 'all', label: 'Faille Temporelle', color: '#c28e3a' })}
           className="px-16 py-5 bg-[#c28e3a] text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-[20px] hover:bg-white hover:scale-105 transition-all shadow-2xl relative z-10"
         >
            STABILISER LA FAILLE
         </button>
      </div>

      {activeQuiz && (
        <QuizModal
          quest={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onSuccess={(q) => {
            onCompleteQuest(q);
            setActiveQuiz(null);
          }}
          onPenalty={onPenalty}
        />
      )}
    </div>
  );
}
