import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from './AuthForm';
import { isSupabaseConfigured } from '../utils/isSupabaseConfigured';

const FACTIONS = [
  { id: 'heroes', name: 'Légion Héroïque', icon: 'mdi:shield-flash', desc: 'Justice & Pouvoirs Cosmiques', image: '/assets/wakkany_heroes.webp' },
  { id: 'warriors', name: 'Ordre Antique', icon: 'mdi:swords', desc: 'Mythes & Force Brute', image: '/assets/wakkany_warriors.webp' },
  { id: 'dinos', name: 'Ère Primaire', icon: 'mdi:bone', desc: 'Instinct de Survie Jurassique', image: '/assets/wakkany_dinos.webp' },
  { id: 'cars', name: 'Syndicat Mécanique', icon: 'mdi:car-front', desc: 'Vitesse & Ingénierie Future', image: '/assets/wakkany_cars.webp' },
];

export default function ProfileSetup({ onComplete, isAuthenticated = true }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [academy, setAcademy] = useState('');
  const [selectedClan, setSelectedClan] = useState(FACTIONS[0]);
  const authRequired = isSupabaseConfigured();
  const [step, setStep] = useState(authRequired && !isAuthenticated ? 0 : 1);

  const handleBackClick = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1 && authRequired && !isAuthenticated) {
      setStep(0);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && academy.trim()) {
      onComplete({ name: name.trim(), academy: academy.trim(), clan: selectedClan });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 font-monda">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-y-auto max-h-[95vh] shadow-2xl relative flex flex-col">
        {/* Progress Bar */}
        <div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#d97706] to-[#fcd34d] transition-all duration-500 shadow-[0_0_10px_rgba(217,119,6,0.6)]"
          style={{ width: step === 0 ? '33%' : step === 1 ? '66%' : '100%' }}
        />

        <div className="p-6 sm:p-10 flex-1 relative">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBackClick}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 text-zinc-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest bg-black/40 hover:bg-black/60 border border-white/5 px-3 py-2 rounded-xl cursor-pointer z-50 hover:border-[#c28e3a]/40"
          >
            <iconify-icon icon="mdi:arrow-left" width="14" />
            <span>Retour</span>
          </button>

          {/* Stepper info badge */}
          <div className="text-right text-[10px] font-black uppercase tracking-widest text-[#c28e3a] mb-2 sm:mb-4">
            {step === 0 ? 'Étape 1 / 3 · Compte' : step === 1 ? 'Étape 2 / 3 · Identité' : 'Étape 3 / 3 · Faction'}
          </div>

          <div className="mb-8 text-center pt-2 sm:pt-0">
            <h2 className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.4em] mb-2">
              Protocole d&apos;Initialisation
            </h2>
            <h1 className="text-white text-3xl sm:text-4xl font-heading font-bold italic uppercase tracking-tighter">
              FORGEZ VOTRE LÉGENDE
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step-auth"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <AuthForm defaultMode="signup" onAuthenticated={() => setStep(1)} />

                {/* Option Invité / Hors-ligne */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                      Ou explorez sans attendre
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-3.5 px-4 rounded-2xl border border-white/10 bg-zinc-800/60 hover:bg-zinc-800 hover:border-[#c28e3a]/50 text-zinc-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                  >
                    <iconify-icon icon="mdi:account-arrow-right" width="18" className="text-[#c28e3a]" />
                    <span>Continuer en tant qu&apos;invité (Mode Local / Hors-ligne)</span>
                  </button>
                  <p className="text-center text-[10px] text-zinc-500">
                    Vous pourrez toujours lier un compte plus tard dans les paramètres pour synchroniser vos trophées.
                  </p>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step-identity"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3">
                    Nom de Guerre (Pseudonyme du Chasseur)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ENTREZ VOTRE NOM..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 text-white text-lg sm:text-xl focus:border-[#c28e3a] focus:ring-1 focus:ring-[#c28e3a] transition-all outline-none font-heading italic uppercase placeholder-zinc-600"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3">
                    Académie / Origine
                  </label>
                  <input
                    type="text"
                    value={academy}
                    onChange={(e) => setAcademy(e.target.value)}
                    placeholder="L'ÉCOLE DES OMBRES..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 text-white text-lg sm:text-xl focus:border-[#c28e3a] focus:ring-1 focus:ring-[#c28e3a] transition-all outline-none font-heading italic uppercase placeholder-zinc-600"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => name.trim() && academy.trim() && setStep(2)}
                  disabled={!name.trim() || !academy.trim()}
                  className="w-full py-5 bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-zinc-950 font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all active:scale-95 rounded-2xl shadow-xl disabled:opacity-40 disabled:cursor-not-allowed border border-[#fcd34d]/50 cursor-pointer"
                >
                  Confirmer l&apos;Identité & Choisir un Clan
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="step-faction"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6 text-center">
                    Choisissez votre Faction Multiverselle
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FACTIONS.map((clan) => (
                      <button
                        key={clan.id}
                        type="button"
                        onClick={() => setSelectedClan(clan)}
                        className={`relative group flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          selectedClan.id === clan.id
                            ? 'bg-[#c28e3a]/15 border-[#c28e3a] scale-102 shadow-[0_0_25px_rgba(194,142,58,0.35)]'
                            : 'bg-black/30 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                            selectedClan.id === clan.id
                              ? 'bg-[#c28e3a] text-black rotate-6 scale-105'
                              : 'bg-zinc-800 text-gray-400 group-hover:text-white'
                          }`}
                        >
                          <iconify-icon icon={clan.icon} width="32" height="32" />
                        </div>
                        <span
                          className={`text-xs font-black uppercase tracking-tight transition-colors ${
                            selectedClan.id === clan.id ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {clan.name}
                        </span>
                        {selectedClan.id === clan.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#c28e3a] rounded-lg flex items-center justify-center shadow-lg">
                            <iconify-icon icon="mdi:check" width="14" height="14" className="text-black" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
                  <div className="w-14 h-14 shrink-0 rounded-xl bg-[#c28e3a]/20 border border-[#c28e3a]/40 flex items-center justify-center text-[#c28e3a]">
                    <iconify-icon icon={selectedClan.icon} width="32" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-widest text-sm italic">
                      {selectedClan.name}
                    </h3>
                    <p className="text-zinc-400 text-xs italic font-monda mt-0.5">
                      &quot;{selectedClan.desc}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] text-zinc-950 font-black uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all font-heading italic shadow-2xl shadow-orange-950/20 rounded-2xl cursor-pointer border border-[#fcd34d]/50"
                  >
                    Finaliser l&apos;Identité
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
