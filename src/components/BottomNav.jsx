import React from 'react';

export default function BottomNav({ activeTab, setActiveTab, hasNotifications }) {
    const tabs = [
        { id: 'profile', label: 'Profil', icon: 'lucide:user' },
        { id: 'quests', label: 'Quêtes', icon: 'lucide:scroll', special: true },
        { id: 'skills', label: 'Skills', icon: 'lucide:git-branch' },
        { id: 'rankings', label: 'Hall', icon: 'lucide:trophy' },
        { id: 'quiz', label: 'Quiz', icon: 'lucide:gamepad-2' },
    ];

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-zinc-950/90 backdrop-blur-3xl border-t border-white/10"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex justify-around items-end h-16 px-2 relative">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    if (tab.special) {
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative -top-4 flex flex-col items-center group"
                            >
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300
                                    ${isActive
                                        ? 'bg-[#c28e3a] text-black rotate-12 scale-110 shadow-orange-900/40'
                                        : 'bg-zinc-800 text-white group-hover:bg-[#c28e3a]/20 group-hover:text-[#c28e3a]'}
                                `}>
                                    <iconify-icon icon={tab.icon} width="28"></iconify-icon>
                                </div>
                                <span className={`text-[7px] font-black uppercase tracking-widest mt-1 transition-colors ${isActive ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex flex-col items-center justify-center py-2 px-1 flex-1 gap-1"
                        >
                            <div className="relative">
                                <iconify-icon
                                    icon={tab.icon}
                                    width="22"
                                    className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-zinc-600'}`}
                                ></iconify-icon>
                                {tab.id === 'profile' && hasNotifications && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-900/50"></div>
                                )}
                            </div>
                            <span className={`text-[7px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
