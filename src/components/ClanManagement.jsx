import React, { useState } from 'react';

export default function ClanManagement({ user, onUpdateClan }) {
    const [clanName, setClanName] = useState(user?.clan?.name || '');
    const [selectedIcon, setSelectedIcon] = useState(user?.clan?.icon || 'lucide:shield');
    const [selectedColor, setSelectedColor] = useState(user?.clan?.color || '#c28e3a');

    const icons = ['lucide:shield', 'lucide:swords', 'lucide:zap', 'lucide:crown', 'lucide:flame', 'lucide:skull', 'lucide:eye', 'lucide:star'];
    const colors = ['#c28e3a', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#64748b'];

    const handleSave = () => {
        onUpdateClan({
            name: clanName,
            icon: selectedIcon,
            color: selectedColor
        });
    };

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="flex-1 space-y-8">
                    <div>
                        <h2 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.3em] mb-2">Quartier Général</h2>
                        <h1 className="text-white text-5xl font-heading font-bold italic uppercase tracking-tighter">GESTION DE CLAN</h1>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Nom de votre Faction</label>
                            <input 
                                type="text" 
                                value={clanName}
                                onChange={(e) => setClanName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-white font-heading font-bold italic text-xl outline-none focus:border-[#c28e3a] transition-all"
                                placeholder="EX: LES OMBRES D'AETHER"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Emblème Sacré</label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                {icons.map(icon => (
                                    <button 
                                        key={icon}
                                        onClick={() => setSelectedIcon(icon)}
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${selectedIcon === icon ? 'border-[#c28e3a] bg-[#c28e3a]/10 text-[#c28e3a]' : 'border-white/5 text-zinc-600 hover:border-white/20'}`}
                                    >
                                        <iconify-icon icon={icon} width="24"></iconify-icon>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Teinte de l'Aether</label>
                            <div className="flex flex-wrap gap-3">
                                {colors.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="mt-12 px-12 py-5 bg-[#c28e3a] text-black font-black uppercase text-sm tracking-[0.3em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-orange-950/20"
                    >
                        SCRELLER LE PACTE
                    </button>
                </div>

                {/* Clan Card Preview */}
                <div className="w-full md:w-80 shrink-0">
                    <div className="bg-black border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-20 transition-opacity" style={{ background: `radial-gradient(circle at top right, ${selectedColor}, transparent)` }}></div>
                        
                        <div className="flex flex-col items-center text-center py-6">
                            <div className="w-24 h-24 rounded-3xl border-2 mb-8 flex items-center justify-center shadow-2xl" style={{ borderColor: selectedColor, color: selectedColor, boxShadow: `0 0 30px ${selectedColor}30` }}>
                                <iconify-icon icon={selectedIcon} width="48"></iconify-icon>
                            </div>
                            <h3 className="text-white text-2xl font-heading font-black italic uppercase tracking-tighter mb-2">{clanName || 'Nom de Clan'}</h3>
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Clan Émanant</p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-white font-bold">1</p>
                                <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Membres</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold">Rang E</p>
                                <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Prestige</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
