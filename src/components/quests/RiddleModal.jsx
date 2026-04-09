import React, { useState, useEffect } from 'react';

export default function RiddleModal({ quest, onClose, onSuccess }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleConfirm = () => {
        onSuccess(quest);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-[#c28e3a] text-xs font-bold uppercase tracking-widest">Validation du Défi</h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                            <iconify-icon icon="lucide:x" width="20"></iconify-icon>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-12 gap-4">
                            <div className="w-12 h-12 border-2 border-[#c28e3a] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em]">Vérification de la blockchain d'actions...</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-black/40 border border-white/5 p-6 rounded-xl relative overflow-hidden text-center">
                                <iconify-icon icon="lucide:check-circle" className="text-[#c28e3a] mb-4" width="48"></iconify-icon>
                                <p className="text-white text-lg font-monda leading-relaxed italic">
                                    "{quest.title}"
                                </p>
                                <p className="text-zinc-500 text-xs mt-2">
                                    Confirmez-vous avoir complété cette action aujourd'hui sur l'honneur ?
                                </p>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-[#c28e3a] hover:text-white transition-all transform active:scale-95 rounded-xl"
                            >
                                J'ai complété ce défi
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-zinc-500 text-xs uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
