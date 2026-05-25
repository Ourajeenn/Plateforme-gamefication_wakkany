import React, { useState, useEffect } from 'react';

const INITIAL_QUESTS = [
  { id: 1, type: 'project', title: 'Forge the React Core', desc: 'Architect an interactive web application', xp: 50, completed: false, icon: 'lucide:code-2' },
  { id: 2, type: 'project', title: 'Awaken the Tailwind', desc: 'Master responsive utility styling patterns', xp: 50, completed: false, icon: 'lucide:layout' },
  { id: 3, type: 'formation', title: 'Path of the Ancients', desc: 'Complete advanced state management training', xp: 100, completed: false, icon: 'lucide:book-open' },
  { id: 4, type: 'certification', title: 'Mark of the Cloud', desc: 'Acquire AWS Solutions Architect certification', xp: 150, completed: false, icon: 'lucide:cloud-lightning' },
  { id: 5, type: 'project', title: 'Slay the Bug King', desc: 'Implement full End-to-End testing suite', xp: 50, completed: false, icon: 'lucide:bug' },
];

const LEVEL_DATA = {
  1: {
    title: "Novice Scrapper",
    image: "file:///C:/Users/jenra/.gemini/antigravity/brain/2d7135a0-e432-499a-b574-9b2e2fc536fc/clan_fox_warrior_1775124144548.png",
    border: "border-zinc-700",
    aura: "",
    text: "text-gray-400"
  },
  2: {
    title: "Veteran Hunter",
    image: "file:///C:/Users/jenra/.gemini/antigravity/brain/2d7135a0-e432-499a-b574-9b2e2fc536fc/clan_tiger_warrior_1775124161110.png",
    border: "border-[#c28e3a]",
    aura: "shadow-[0_0_20px_rgba(194,142,58,0.3)]",
    text: "text-[#c28e3a]"
  },
  3: {
    title: "Ascended Champion",
    image: "file:///C:/Users/jenra/.gemini/antigravity/brain/2d7135a0-e432-499a-b574-9b2e2fc536fc/ascended_champion_aura_1775124470086.png",
    border: "border-[#fce5a1]",
    aura: "aura-gold",
    text: "text-white text-shadow-strong"
  }
};

export default function ChampionPath({ userClan }) {
  const [xp, setXp] = useState(0);
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [level, setLevel] = useState(1);
  const [xpPopups, setXpPopups] = useState([]);
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  const MAX_XP = 400; // Sum of all quests

  useEffect(() => {
    let newLevel = 1;
    if (xp >= 250) newLevel = 3;
    else if (xp >= 100) newLevel = 2;

    if (newLevel > level) {
      setLevel(newLevel);
      setJustLeveledUp(true);
      setTimeout(() => setJustLeveledUp(false), 3000);
    }
  }, [xp, level]);

  const handleCompleteQuest = (quest, e) => {
    if (quest.completed) return;

    // Spawn floating XP text
    const rect = e.currentTarget.getBoundingClientRect();
    const newPopup = {
      id: Date.now(),
      xp: quest.xp,
      x: rect.left + rect.width / 2,
      y: rect.top
    };

    setXpPopups(prev => [...prev, newPopup]);
    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== newPopup.id));
    }, 1000);

    setQuests(quests.map(q => q.id === quest.id ? { ...q, completed: true } : q));
    setXp(prev => Math.min(prev + quest.xp, MAX_XP));
  };

  const getProgressPercentage = () => {
    let nextThreshold = level === 1 ? 100 : level === 2 ? 250 : MAX_XP;
    let prevThreshold = level === 1 ? 0 : level === 2 ? 100 : 250;

    if (level === 3) return 100;

    const currentLevelXp = xp - prevThreshold;
    const requiredXp = nextThreshold - prevThreshold;
    return (currentLevelXp / requiredXp) * 100;
  };

  const currentLevelInfo = LEVEL_DATA[level];
  const avatarImage = level === 1 && userClan ? userClan.image : currentLevelInfo.image;

  return (
    <section className="bg-zinc-950 py-32 relative z-10 border-t border-b border-white/5 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1510] via-zinc-950 to-zinc-950 opacity-80 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h3 className="text-zinc-500 text-2xl font-medium tracking-widest font-heading uppercase mb-2">Build Your Legacy</h3>
          <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight font-heading italic uppercase mb-6">THE CHAMPION'S PATH</h2>
          <div className="w-12 h-1 bg-[#c28e3a] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left Column: Avatar & Stats */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group perspective-1000">
              {justLeveledUp && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <span className="text-4xl font-heading font-bold text-white text-shadow-strong animate-float-xp whitespace-nowrap">LEVEL UP!</span>
                </div>
              )}

              {/* Evolving Avatar Container */}
              <div className={`w-64 h-80 md:w-80 md:h-96 relative overflow-hidden transition-all duration-1000 border-2 ${currentLevelInfo.border} ${currentLevelInfo.aura} bg-zinc-900 clip-card-btn`}>
                <img
                  src={avatarImage}
                  alt="Champion Avatar"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100 mix-blend-luminosity"
                  style={{ filter: level === 1 ? 'grayscale(80%)' : level === 2 ? 'grayscale(20%)' : 'grayscale(0%) brightness(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>

                {/* Level Badge inside Avatar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full">
                  <span className={`font-heading text-2xl uppercase tracking-widest font-bold transition-colors duration-500 ${currentLevelInfo.text}`}>
                    {currentLevelInfo.title}
                  </span>
                  <div className="text-zinc-400 font-monda text-sm mt-1 uppercase tracking-wider">Level {level}</div>
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full max-w-sm mt-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-zinc-400 font-medium uppercase tracking-wider text-sm">Experience</span>
                <span className="text-[#c28e3a] font-bold font-heading">{xp} / {level === 3 ? MAX_XP : (level === 1 ? 100 : 250)}</span>
              </div>
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] transition-all duration-1000 ease-out relative"
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
              <p className="text-center text-zinc-500 text-xs mt-3">
                {level === 3 ? 'Maximum Power Achieved' : 'Complete quests to evolve your form'}
              </p>
            </div>
          </div>

          {/* Right Column: Quest Board */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h4 className="text-xl font-heading text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <iconify-icon icon="lucide:scroll" className="text-[#c28e3a]"></iconify-icon>
              Active Bounties
            </h4>

            <div className="space-y-4">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`relative overflow-hidden group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-lg border transition-all duration-300 ${quest.completed
                    ? 'bg-zinc-900/50 border-[#c28e3a]/30 opacity-70'
                    : 'bg-zinc-900 border-white/10 hover:border-[#c28e3a]/70 hover:bg-zinc-800/80 shadow-lg'
                    }`}
                >
                  {/* Quest Info */}
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-md shrink-0 flex ${quest.completed ? 'bg-zinc-800 text-[#c28e3a]/50' : 'bg-zinc-800 text-[#c28e3a]'}`}>
                      <iconify-icon icon={quest.icon} width="24" height="24"></iconify-icon>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${quest.type === 'project' ? 'border-blue-500/30 text-blue-400' :
                          quest.type === 'formation' ? 'border-purple-500/30 text-purple-400' :
                            'border-green-500/30 text-green-400'
                          }`}>
                          {quest.type}
                        </span>
                        {quest.completed && (
                          <span className="text-xs font-bold uppercase text-[#c28e3a] flex items-center gap-1">
                            <iconify-icon icon="lucide:check-circle-2"></iconify-icon> Completed
                          </span>
                        )}
                      </div>
                      <h5 className={`text-lg font-medium tracking-tight ${quest.completed ? 'text-zinc-400 line-through decoration-zinc-600' : 'text-white'}`}>
                        {quest.title}
                      </h5>
                      <p className="text-sm text-zinc-500 mt-1">{quest.desc}</p>
                    </div>
                  </div>

                  {/* Quest Action */}
                  <div className="mt-4 sm:mt-0 flex items-center gap-4 shrink-0 sm:ml-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                    <div className="text-center font-heading font-bold text-[#c28e3a]">
                      +{quest.xp} <span className="text-xs text-zinc-500">XP</span>
                    </div>
                    <button
                      onClick={(e) => handleCompleteQuest(quest, e)}
                      disabled={quest.completed}
                      className={`clip-card-btn px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${quest.completed
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-[#c28e3a] hover:text-white hover:scale-105'
                        }`}
                    >
                      {quest.completed ? 'Claimed' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating XP Popups Rendering */}
      {xpPopups.map(popup => (
        <div
          key={popup.id}
          className="fixed pointer-events-none z-50 text-[#c28e3a] font-bold text-3xl font-heading animate-float-xp text-shadow-strong"
          style={{ left: popup.x, top: popup.y, transform: 'translate(-50%, -50%)' }}
        >
          +{popup.xp} XP
        </div>
      ))}
    </section>
  );
}