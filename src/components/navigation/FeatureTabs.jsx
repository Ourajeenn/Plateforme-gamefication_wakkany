import React from 'react';

export default function FeatureTabs({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'presentation', label: 'Mode Présentation', icon: 'lucide:mic' },
    { id: 'spelling', label: 'Jeu d\'Orthographe', icon: 'lucide:spell-check' }
  ];

  return (
    <div className="flex gap-4 p-2 bg-black/40 border border-white/5 rounded-2xl mb-8 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap
            ${currentTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <iconify-icon icon={tab.icon}></iconify-icon>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
