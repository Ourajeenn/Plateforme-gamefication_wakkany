import React, { useState } from 'react';

const CLANS = [
    { id: 'fox', name: 'Clan of the Fox', icon: 'lucide:fox', desc: 'Agility and Cunning', image: 'assets/clan_fox_warrior.png' },
    { id: 'tiger', name: 'Clan of the Tiger', icon: 'lucide:cat', desc: 'Strength and Power', image: 'assets/clan_tiger_warrior.png' },
    { id: 'wolf', name: 'Clan of the Wolf', icon: 'lucide:dog', desc: 'Loyalty and Instinct', image: 'assets/clan_wolf_warrior.png' },
];

export default function ProfileSetup({ onComplete }) {
    const [name, setName] = useState('');
    const [selectedClan, setSelectedClan] = useState(CLANS[0]);
    const [step, setStep] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onComplete({ name, clan: selectedClan });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-[#c28e3a] transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>

                <div className="p-10">
                    <div className="mb-10 text-center">
                        <h2 className="text-[#c28e3a] text-sm font-bold uppercase tracking-[0.2em] mb-2">Initialize Protocol</h2>
                        <h1 className="text-white text-4xl font-heading font-bold italic uppercase tracking-tight">CREATE YOUR LEGACY</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 1 ? (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Player Callsign</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ENTER NAME..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-6 py-4 text-white text-xl focus:border-[#c28e3a] focus:ring-0 transition-colors outline-none font-monda"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => name && setStep(2)}
                                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-[#c28e3a] hover:text-white transition-all transform active:scale-95"
                                >
                                    Confirm Callsign
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 text-center">Choose Your Clan Alignment</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {CLANS.map((clan) => (
                                            <button
                                                key={clan.id}
                                                type="button"
                                                onClick={() => setSelectedClan(clan)}
                                                className={`relative group flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${selectedClan.id === clan.id
                                                    ? 'bg-[#c28e3a]/10 border-[#c28e3a] scale-105'
                                                    : 'bg-black/20 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${selectedClan.id === clan.id ? 'bg-[#c28e3a] text-black' : 'bg-zinc-800 text-gray-400'
                                                    }`}>
                                                    <iconify-icon icon={clan.icon} width="32" height="32"></iconify-icon>
                                                </div>
                                                <span className={`text-xs font-bold uppercase transition-colors ${selectedClan.id === clan.id ? 'text-white' : 'text-gray-500'
                                                    }`}>{clan.name}</span>
                                                {selectedClan.id === clan.id && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c28e3a] rounded-full flex items-center justify-center">
                                                        <iconify-icon icon="lucide:check" width="10" height="10" className="text-black"></iconify-icon>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex gap-6 items-center">
                                    <img src={selectedClan.image} className="w-20 h-20 rounded-lg object-cover grayscale opacity-60" />
                                    <div>
                                        <h3 className="text-white font-bold uppercase tracking-wider">{selectedClan.name}</h3>
                                        <p className="text-gray-400 text-sm italic">"{selectedClan.desc}"</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all font-heading italic shadow-xl shadow-orange-950/20"
                                    >
                                        Finalize Identity
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
