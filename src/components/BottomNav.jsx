import React from 'react';

export default function BottomNav({ activeTab, setActiveTab, hasNotifications }) {
    const tabs = [
        { id: 'profile', label: 'Profil', icon: 'lucide:user' },
        { id: 'stats', label: 'Stats', icon: 'lucide:bar-chart-3' },
        { id: 'quests', label: 'Quêtes', icon: 'lucide:scroll', special: true },
        { id: 'skills', label: 'Skills', icon: 'lucide:git-branch' },
        { id: 'rankings', label: 'Hall', icon: 'lucide:trophy' }
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-zinc-950/80 backdrop-blur-3xl border-t border-white/5 pb-safe">
            <div className="flex justify-around items-end h-20 px-4 relative">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    
                    if (tab.special) {
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative -top-6 flex flex-col items-center group"
                            >
                                <div className={`
                                    w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300
                                    ${isActive 
                                        ? 'bg-[#c28e3a] text-black rotate-12 scale-110 shadow-orange-900/40' 
                                        : 'bg-zinc-800 text-white group-hover:bg-[#c28e3a]/20 group-hover:text-[#c28e3a]'}
                                `}>
                                    <iconify-icon icon={tab.icon} width="32"></iconify-icon>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest mt-2 transition-colors ${isActive ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex flex-col items-center py-4 px-2"
                        >
                            <div className="relative">
                                <iconify-icon 
                                    icon={tab.icon} 
                                    width="24" 
                                    className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-zinc-600'}`}
                                ></iconify-icon>
                                {tab.id === 'profile' && hasNotifications && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-900/50"></div>
                                )}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-colors ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Floating Quick Actions (Search/Notifs) pour Mobile */}
            <div className="absolute -top-16 right-6 flex flex-col gap-4">
                <button className="w-10 h-10 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/5 flex items-center justify-center text-zinc-400 active:bg-white active:text-black transition-all">
                    <iconify-icon icon="lucide:search" width="18"></iconify-icon>
                </button>
                <button className="w-10 h-10 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/5 flex items-center justify-center text-zinc-400 active:bg-[#c28e3a] active:text-black transition-all">
                    <iconify-icon icon="lucide:bell" width="18"></iconify-icon>
                </button>
            </div>
        </nav>
    );
}
