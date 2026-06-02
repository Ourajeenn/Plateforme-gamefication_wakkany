import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import games from '../data/anaisGames.json';

const topicRoulettePrompts = [
  "Parle de ton plus grand projet actuel.",
  "Quel serait ton métier de rêve si tout était possible ?",
  "Décris un souvenir d'enfance qui te fait sourire.",
  "Explique ce que signifie pour toi 'confiance'.",
  "Quel animal décrit le mieux ta personnalité ?",
  "Raconte un moment où tu as dû improviser.",
  "Comment te prépares-tu pour un grand défi ?",
  "Quelle est la dernière chose qui t'a fait rire aux éclats ?",
  "Décris un endroit où tu te sens totalement à l'aise.",
  "Quel conseil donnerais-tu à ton 'toi' de 10 ans ?",
];

const parleOuPerdsPrompts = [
  "Raconte une expérience où tu as surmonté ta timidité.",
  "Décris ta journée idéale en détail.",
  "Énumère trois choses qui te motivent vraiment.",
  "Parle d'un talent caché que peu de gens connaissent.",
  "Imagine un monde où tout le monde parle librement.",
  "Explique pourquoi la communication est importante pour toi.",
  "Raconte ton dernier défi créatif.",
  "Décris comment tu te détends après une journée stressante.",
  "Qu'est-ce qui te rend fier(e) de toi aujourd'hui ?",
  "Raconte une décision que tu as prise rapidement et dont tu es content(e).",
];

export default function GameDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = useMemo(() => games.find((item) => item.slug === slug), [slug]);

  const [topic, setTopic] = useState('Clique sur "Nouveau sujet" pour lancer le jeu.');
  const [rounds, setRounds] = useState(0);
  const [timer, setTimer] = useState(15);
  const [running, setRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          setRunning(false);
          setResultMessage('La lave a atteint ton socle ! Tu as perdu ce round.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const pickPrompt = () => {
    const prompts = slug === 'topic-roulette' ? topicRoulettePrompts : parleOuPerdsPrompts;
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setTopic(prompt);
    setResultMessage('');
    setRounds((prev) => prev + 1);
  };

  const startLavaChallenge = () => {
    pickPrompt();
    setTimer(15);
    setResultMessage('');
    setRunning(true);
  };

  const stopLavaChallenge = () => {
    setRunning(false);
    setResultMessage('Tu as arrêté le jeu. Reviens quand tu es prêt(e) à te lancer à nouveau !');
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c28e3a] mb-4">Jeu introuvable</p>
          <h2 className="text-3xl font-bold mb-4">Désolé, ce jeu n'est pas encore disponible.</h2>
          <button
            onClick={() => navigate('/jeux')}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#c28e3a] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-[#d4a045]"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const isRoulette = slug === 'topic-roulette';
  const isLava = slug === 'parle-ou-perds';

  return (
    <section className="min-h-screen bg-zinc-950 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/jeux')}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
        >
          ← Retour aux jeux
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-zinc-900/80 p-10 shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="text-6xl">{game.emoji}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#c28e3a] font-black mb-2">{isRoulette ? 'Topic Roulette' : 'Parle ou Perds'}</p>
                  <h1 className="text-5xl font-heading font-black uppercase tracking-tight">{game.title}</h1>
                </div>
              </div>

              <p className="text-zinc-300 text-lg leading-8">{game.description}</p>

              <div className="grid gap-3 sm:grid-cols-2 mt-6">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-[#c28e3a] font-black">Règles</p>
                  <ul className="mt-4 space-y-3 text-zinc-300 text-sm leading-7 list-disc list-inside">
                    <li>🌀 Choisis ton sujet ou laisse la roulette tirer pour toi.</li>
                    <li>{isRoulette ? 'Parle 60 secondes sur le sujet proposé sans t’arrêter.' : 'Tu dois continuer de parler avant que la lave n’atteigne ton point de sécurité.'}</li>
                    <li>{isLava ? 'Appuie sur le bouton pour commencer le compteur et lancer un nouveau challenge.' : 'Réclame un nouveau sujet quand tu es prêt(e) à poursuivre.'}</li>
                    <li>🎯 L’objectif : être plus fluide, plus expressif et gagner en confiance.</li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-[#c28e3a] font-black">Conseils</p>
                  <ul className="mt-4 space-y-3 text-zinc-300 text-sm leading-7 list-disc list-inside">
                    <li>Respire profondément, puis commence par ce que tu connais déjà.</li>
                    <li>Ajoute un détail personnel ou une anecdote pour enrichir ton discours.</li>
                    <li>Si tu bloques, reformule la question ou change de perspective.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 rounded-[28px] border border-white/10 bg-zinc-950/90 p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-[#c28e3a] font-black">Sujet actuel</p>
                    <p className="mt-3 text-xl text-zinc-100 leading-8">{topic}</p>
                  </div>

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <button
                      onClick={pickPrompt}
                      className="rounded-2xl bg-white/10 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
                    >
                      Nouveau sujet
                    </button>
                    {isLava && (
                      <button
                        onClick={running ? stopLavaChallenge : startLavaChallenge}
                        className="rounded-2xl bg-[#c28e3a] px-6 py-3 text-sm uppercase tracking-[0.2em] font-black text-black transition hover:bg-[#d4a045]"
                      >
                        {running ? 'Arrêter' : 'Commencer'}
                      </button>
                    )}
                  </div>
                </div>

                {isLava && (
                  <div className="mt-8 rounded-3xl bg-black/70 p-6 border border-white/10">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span className="text-sm uppercase tracking-[0.25em] text-[#c28e3a] font-black">Temps restant</span>
                      <span className="text-2xl font-black text-white">{timer}s</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 transition-all duration-500"
                        style={{ width: `${(timer / 15) * 100}%` }}
                      />
                    </div>
                    <p className="mt-4 text-sm text-zinc-400">
                      {running ? 'Parle tant que le chrono décompte. Si le timer arrive à zéro, la lave gagne.' : 'Appuie sur "Commencer" pour démarrer le défi.'}
                    </p>
                  </div>
                )}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/5 p-5 text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#c28e3a] font-black mb-3">Tours joués</p>
                    <p className="text-3xl font-black text-white">{rounds}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5 text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#c28e3a] font-black mb-3">Statut</p>
                    <p className="text-lg leading-7">{resultMessage || 'Prêt à relever le défi ?'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-white/10 bg-zinc-900/80 p-10 shadow-2xl">
            <div className="space-y-6">
              <div className="rounded-3xl bg-zinc-950/80 p-6 border border-white/10">
                <p className="text-xs uppercase tracking-[0.35em] text-[#c28e3a] font-black mb-4">Objectif</p>
                <p className="text-zinc-300 leading-7">
                  {isRoulette
                    ? 'Exprime-toi librement sur un sujet aléatoire pour renforcer ta fluidité et trouver ton style.'
                    : 'Garde le rythme et la parole avant que la lave ne te rattrape. L’objectif est d’oser parler sans interruption.'}
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-950/80 p-6 border border-white/10">
                <p className="text-xs uppercase tracking-[0.35em] text-[#c28e3a] font-black mb-4">Astuce rapide</p>
                <p className="text-zinc-300 leading-7">
                  {isRoulette
                    ? 'Si tu bloques, commence par une anecdote personnelle puis élargis sur ton ressenti.'
                    : 'Concentre-toi sur une image ou une histoire simple, puis enrichis-la au fil du temps.'}
                </p>
              </div>

              <div className="rounded-3xl bg-black/80 p-6 border border-white/10">
                <p className="text-xs uppercase tracking-[0.35em] text-[#c28e3a] font-black mb-4">Interactions</p>
                <ul className="list-disc list-inside space-y-3 text-zinc-300 leading-7 text-sm">
                  <li>Utilise « Nouveau sujet » pour relancer une idée.</li>
                  {isLava && <li>« Commencer » démarre un nouveau round avec le timer en jeu.</li>}
                  <li>Arrête-toi uniquement lorsque tu veux changer de challenge.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
