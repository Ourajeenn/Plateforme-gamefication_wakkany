import React, { useState } from 'react';

const CLANS = [
    { id: 'fox', name: 'Clan du Renard', icon: 'lucide:fox', desc: 'Agilité et Ruse', image: 'https://i.postimg.cc/qv918NDq/hippo1.png' },
    { id: 'tiger', name: 'Clan du Tigre', icon: 'lucide:cat', desc: 'Force et Puissance', image: 'https://i.postimg.cc/qv918NDq/hippo1.png' },
    { id: 'wolf', name: 'Clan du Loup', icon: 'lucide:dog', desc: 'Loyauté et Instinct', image: 'https://i.postimg.cc/qv918NDq/hippo1.png' },
];

export default function ProfileSetup({ onComplete }) {
    const [name, setName] = useState('');
    const [academy, setAcademy] = useState('');
    const [selectedClan, setSelectedClan] = useState(CLANS[0]);
    const [step, setStep] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && academy.trim()) {
            onComplete({ name, academy, clan: selectedClan });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-[#c28e3a] transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>

                <div className="p-10">
                    <div className="mb-10 text-center">
                        <h2 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Protocole d'Initialisation</h2>
                        <h1 className="text-white text-4xl font-heading font-bold italic uppercase tracking-tighter">FORGEZ VOTRE LÉGENDE</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 1 ? (
                            <div className="space-y-6 animate-scale-up">
                                <div>
                                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Nom de Guerre</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ENTREZ VOTRE NOM..."
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white text-xl focus:border-[#c28e3a] focus:ring-0 transition-all outline-none font-heading italic"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Académie / École d'Origine</label>
                                    <input
                                        type="text"
                                        value={academy}
                                        onChange={(e) => setAcademy(e.target.value)}
                                        placeholder="L'ÉCOLE DES OMBRES..."
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white text-xl focus:border-[#c28e3a] focus:ring-0 transition-all outline-none font-heading italic"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => (name && academy) && setStep(2)}
                                    className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-[#c28e3a] hover:text-white transition-all transform active:scale-95 rounded-2xl shadow-xl"
                                >
                                    Confirmer l'Identité
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-scale-up">
                                <div>
                                    <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6 text-center">Choisissez votre Alignement de Clan</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {CLANS.map((clan) => (
                                            <button
                                                key={clan.id}
                                                type="button"
                                                onClick={() => setSelectedClan(clan)}
                                                className={`relative group flex flex-col items-center p-6 rounded-2xl border transition-all duration-500 ${selectedClan.id === clan.id
                                                    ? 'bg-[#c28e3a]/10 border-[#c28e3a] scale-105 shadow-2xl shadow-orange-950/20'
                                                    : 'bg-black/20 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedClan.id === clan.id ? 'bg-[#c28e3a] text-black rotate-12 scale-110' : 'bg-zinc-800 text-gray-400 group-hover:text-white'
                                                    }`}>
                                                    <iconify-icon icon={clan.icon} width="32" height="32"></iconify-icon>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${selectedClan.id === clan.id ? 'text-white' : 'text-zinc-600'
                                                    }`}>{clan.name}</span>
                                                {selectedClan.id === clan.id && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#c28e3a] rounded-lg flex items-center justify-center shadow-lg animate-bounce-slow">
                                                        <iconify-icon icon="lucide:check" width="12" height="12" className="text-black"></iconify-icon>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex gap-6 items-center">
                                    <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                                        <iconify-icon icon={selectedClan.icon} width="40" className="text-zinc-600 opacity-40"></iconify-icon>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-widest text-sm italic">{selectedClan.name}</h3>
                                        <p className="text-zinc-500 text-xs italic font-monda mt-1">"{selectedClan.desc}"</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-5 border border-white/5 text-zinc-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5 hover:text-white transition-all"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-5 bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black font-black uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all font-heading italic shadow-2xl shadow-orange-950/20 rounded-2xl"
                                    >
                                        Finaliser l'Identité
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

