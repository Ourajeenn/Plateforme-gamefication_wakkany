import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../../utils/isSupabaseConfigured';
import { ThemeContext } from '../../context/ThemeContext';

const MODES = [
  {
    id: 'local',
    title: 'Réseau local',
    badge: 'Sans connexion',
    description: 'Jouez sur le même Wi-Fi en toute fluidité, sans compte ni service en ligne.',
    icon: 'mdi:lan',
    actions: [
      { label: 'Créer un salon', path: '/quiz/host?network=local' },
      { label: 'Rejoindre un salon', path: '/quiz/join?network=local' },
    ],
  },
  {
    id: 'online',
    title: 'En ligne',
    badge: 'Multi-joueurs',
    description: 'Invitez vos proches et affrontez d\'autres tribus à distance avec un code de salon.',
    icon: 'mdi:web',
    actions: [
      { label: 'Créer un salon', path: '/quiz/host?network=online' },
      { label: 'Rejoindre un salon', path: '/quiz/join?network=online' },
    ],
  },
  {
    id: 'solo',
    title: 'Solo',
    badge: 'Entraînement',
    description: 'Lancez une épreuve individuelle, débloquez des talents et jouez à votre propre rythme.',
    icon: 'mdi:account',
    actions: [{ label: 'Choisir une épreuve', path: '/quiz/config?session=solo' }],
  },
];

export default function QuizModes() {
  const navigate = useNavigate();
  const onlineAvailable = isSupabaseConfigured();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isLight = theme === 'claire';

  return (
    <main className={`min-h-[100dvh] relative transition-colors duration-300 px-5 py-8 md:px-10 font-monda ${
      isLight ? 'bg-[#f4efe9] text-zinc-900' : 'bg-zinc-950 text-white'
    }`}>
      {/* Background radial gold glow */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
          isLight ? 'bg-[radial-gradient(ellipse_at_top,_#c28e3a20_0%,_transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_top,_#c28e3a30_0%,_transparent_75%)]'
        }`} 
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Navigation bar: Retour au quiz + Toggle Mode Clair/Sombre */}
        <div className="mb-10 flex items-center justify-between">
          <motion.button
            type="button"
            onClick={() => navigate('/quiz')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 text-sm font-bold transition-all ${
              isLight 
                ? 'text-zinc-700 hover:text-black bg-white/70 px-4 py-2 rounded-full border border-zinc-300 shadow-sm' 
                : 'text-zinc-300 hover:text-white bg-zinc-900/80 px-4 py-2 rounded-full border border-white/10'
            }`}
          >
            <iconify-icon icon="mdi:arrow-left" width="18" />
            <span>Retour au quiz</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md ${
              isLight
                ? 'border-zinc-300 bg-white text-zinc-800 hover:border-[#c28e3a]'
                : 'border-white/10 bg-zinc-900/90 text-white hover:border-[#c28e3a]'
            }`}
            title={isLight ? 'Basculer en mode sombre' : 'Basculer en mode clair'}
          >
            <span>{isLight ? '☀️ Mode Clair' : '🌙 Mode Sombre'}</span>
          </motion.button>
        </div>

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-12 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c28e3a]/60 bg-[#c28e3a]/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#d97706] dark:text-[#fcd34d]">
            <iconify-icon icon="mdi:shield-crown" width="14" />
            <span>L’Arène du Savoir</span>
          </div>
          <h1 className={`text-4xl font-black uppercase tracking-tight md:text-5xl drop-shadow-sm ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}>
            Comment jouez-vous ?
          </h1>
          <p className={`mt-3 text-base leading-relaxed ${
            isLight ? 'text-zinc-700 font-medium' : 'text-zinc-400'
          }`}>
            Sélectionnez votre format de jeu pour démarrer la session de quiz.
          </p>
        </motion.header>

        {/* Mode cards with golden neon glow & border radius */}
        <section aria-label="Modes de jeu" className="grid gap-6 md:grid-cols-3">
          {MODES.map((mode, idx) => {
            const isOnlineUnavailable = mode.id === 'online' && !onlineAvailable;
            return (
              <motion.article
                key={mode.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.12, ease: 'easeOut' }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className={`group relative flex min-h-[360px] flex-col rounded-3xl p-7 transition-all duration-300 border-2 backdrop-blur-xl ${
                  isLight
                    ? 'bg-white/95 border-[#c28e3a] shadow-[0_10px_25px_rgba(194,142,58,0.22)] hover:shadow-[0_15px_40px_rgba(194,142,58,0.45)] hover:border-[#d97706]'
                    : 'bg-zinc-900/90 border-[#c28e3a]/80 shadow-[0_0_25px_rgba(194,142,58,0.35)] hover:shadow-[0_0_45px_rgba(194,142,58,0.7)] hover:border-[#fcd34d]'
                }`}
              >
                {/* Glow pill badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#c28e3a]/15 text-[#c28e3a] border border-[#c28e3a]/40 shadow-[0_0_15px_rgba(194,142,58,0.35)] group-hover:scale-110 transition-transform duration-300">
                    <iconify-icon icon={mode.icon} width="30" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isLight 
                      ? 'border-[#c28e3a]/40 bg-[#c28e3a]/10 text-[#b45309]' 
                      : 'border-[#c28e3a]/60 bg-[#c28e3a]/20 text-[#fcd34d]'
                  }`}>
                    {mode.badge}
                  </span>
                </div>

                <h2 className={`text-2xl font-black uppercase tracking-wide ${
                  isLight ? 'text-zinc-950' : 'text-white'
                }`}>
                  {mode.title}
                </h2>

                <p className={`mt-3 min-h-[50px] text-sm leading-relaxed ${
                  isLight ? 'text-zinc-700 font-medium' : 'text-zinc-300'
                }`}>
                  {mode.description}
                </p>

                {isOnlineUnavailable && (
                  <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Le service en ligne n’est pas configuré sur cette installation.
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-3 pt-6">
                  {mode.actions.map((action, index) => {
                    const isPrimary = index === 0 && mode.id !== 'solo';
                    return (
                      <motion.button
                        key={action.path}
                        type="button"
                        disabled={isOnlineUnavailable}
                        onClick={() => navigate(action.path)}
                        whileHover={isOnlineUnavailable ? undefined : { scale: 1.02 }}
                        whileTap={isOnlineUnavailable ? undefined : { scale: 0.97 }}
                        className={`flex min-h-[48px] items-center justify-between px-5 text-sm font-black uppercase tracking-wider rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                          isPrimary
                            ? 'bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] text-zinc-950 shadow-[0_4px_18px_rgba(217,119,6,0.45)] hover:shadow-[0_6px_25px_rgba(217,119,6,0.65)] hover:scale-[1.02] active:scale-95'
                            : isLight
                              ? 'border-2 border-zinc-300 bg-zinc-100/90 text-zinc-900 hover:border-[#c28e3a] hover:text-[#b45309] hover:bg-[#c28e3a]/10 active:scale-95'
                              : 'border border-zinc-700 bg-zinc-800/80 text-zinc-100 hover:border-[#c28e3a] hover:text-white hover:bg-[#c28e3a]/20 active:scale-95'
                        }`}
                      >
                        <span>{action.label}</span>
                        <iconify-icon icon="mdi:arrow-top-right" width="18" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
