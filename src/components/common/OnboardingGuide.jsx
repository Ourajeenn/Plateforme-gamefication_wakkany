import React from 'react';

const tutorialSteps = [
  {
    title: '1. Choisissez un mode',
    text: 'Commencez par choisir un mode de jeu : Coop Meute, Party Salon, Raid de Boss ou Bluff Royal.',
  },
  {
    title: '2. Sélectionnez un thème',
    text: 'Ouvrez l’un des thèmes disponibles : Univers RPG, Histoire, Science ou Culture générale.',
  },
  {
    title: '3. Répondez à l’épreuve',
    text: 'Chaque réponse juste rapporte des points. Lisez la consigne, répondez puis laissez la plaque de score afficher votre progression.',
  },
  {
    title: '4. Débloquez la progression',
    text: 'Gagnez des niveaux, ouvrez les quêtes et débloquez badges, récits et récompenses dans la meute.',
  },
];

export default function OnboardingGuide({ onClose }) {
  return (
    <div className="flex flex-col gap-4 px-3 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c28e3a]">Didacticiel</div>
          <h3 className="text-lg font-heading font-black uppercase tracking-wide mt-1">Premiers pas</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] uppercase tracking-wide hover:bg-zinc-700"
        >
          Fermer
        </button>
      </div>

      <div className="rounded-2xl border border-[#c28e3a]/50 bg-[#c28e3a]/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d38a]">Fonctionnement du jeu</div>
            <p className="text-xs text-zinc-200 mt-2 leading-relaxed">
              Choisissez un mode, ouvrez un thème, répondez aux questions et gagnez des points pour déverrouiller les quêtes.
            </p>
          </div>
          <span className="inline-flex items-center justify-center rounded-full border border-[#c28e3a] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f6d38a]">
            01 · Flux
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {tutorialSteps.map((step, idx) => (
          <div key={step.title} className="rounded-xl border border-white/10 bg-zinc-900/60 p-3">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c28e3a]">{step.title}</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#c28e3a]/30 bg-[#c28e3a]/10 p-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d38a]">Conseil</div>
        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
          Posez une question à l’assistant, ouvrez un thème et commencez la partie depuis le bouton Jouer.
        </p>
      </div>
    </div>
  );
}
