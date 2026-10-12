import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../../utils/isSupabaseConfigured';

const MODES = [
  {
    id: 'local',
    title: 'Réseau local',
    description: 'Jouez sur le même Wi-Fi, sans compte ni service en ligne.',
    icon: 'mdi:lan',
    actions: [
      { label: 'Créer un salon', path: '/quiz/host?network=local' },
      { label: 'Rejoindre un salon', path: '/quiz/join?network=local' },
    ],
  },
  {
    id: 'online',
    title: 'En ligne',
    description: 'Invitez vos proches à distance avec un code de salon.',
    icon: 'mdi:web',
    actions: [
      { label: 'Créer un salon', path: '/quiz/host?network=online' },
      { label: 'Rejoindre un salon', path: '/quiz/join?network=online' },
    ],
  },
  {
    id: 'solo',
    title: 'Solo',
    description: 'Lancez une épreuve et jouez à votre rythme.',
    icon: 'mdi:account',
    actions: [{ label: 'Choisir une épreuve', path: '/quiz/config?session=solo' }],
  },
];

export default function QuizModes() {
  const navigate = useNavigate();
  const onlineAvailable = isSupabaseConfigured();

  return (
    <main className="min-h-[100dvh] bg-zinc-950 px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition-colors hover:text-white"
        >
          <iconify-icon icon="mdi:arrow-left" width="18" />
          Retour au quiz
        </button>

        <header className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#c28e3a]">L’Arène du Savoir</p>
          <h1 className="font-heading text-4xl font-black uppercase md:text-5xl">Comment jouez-vous ?</h1>
          <p className="mt-3 text-zinc-400">Choisissez votre façon de lancer une partie.</p>
        </header>

        <section aria-label="Modes de jeu" className="grid gap-4 md:grid-cols-3">
          {MODES.map((mode) => {
            const isOnlineUnavailable = mode.id === 'online' && !onlineAvailable;
            return (
              <article
                key={mode.id}
                className={`flex min-h-80 flex-col border p-6 ${
                  mode.id === 'solo'
                    ? 'border-zinc-700 bg-zinc-900/60'
                    : 'border-[#c28e3a]/35 bg-zinc-900/80'
                }`}
              >
                <iconify-icon icon={mode.icon} width="34" className="mb-5 text-[#c28e3a]" />
                <h2 className="font-heading text-2xl font-black uppercase">{mode.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">{mode.description}</p>

                {isOnlineUnavailable && (
                  <p className="mt-3 text-xs text-amber-200">
                    Le service en ligne n’est pas configuré sur cette installation.
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-6">
                  {mode.actions.map((action, index) => (
                    <button
                      key={action.path}
                      type="button"
                      disabled={isOnlineUnavailable}
                      onClick={() => navigate(action.path)}
                      className={`flex min-h-11 items-center justify-between px-4 text-left text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        index === 0 && mode.id !== 'solo'
                          ? 'bg-[#c28e3a] text-zinc-950 hover:bg-[#e8b96a]'
                          : 'border border-zinc-700 text-zinc-200 hover:border-[#c28e3a] hover:text-white'
                      }`}
                    >
                      {action.label}
                      <iconify-icon icon="mdi:arrow-top-right" width="18" />
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}