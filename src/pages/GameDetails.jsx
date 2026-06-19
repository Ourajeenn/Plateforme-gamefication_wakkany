import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import games from '../data/anaisGames.json';
import {
  topicRouletteCategories,
  topicByCategory,
  allTopics,
  parleOuPerdsPrompts,
} from '../data/gamePrompts.js';

// ── LAVA TIMER (Parle ou Perds) ─────────────────────────────────────────────
const LAVA_DURATION = 15; // secondes

// ── TIMER OPTIONS (Topic Roulette) ──────────────────────────────────────────
const TIMER_OPTIONS = [60, 120, 180, 300]; // secondes

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── SHARED BACK BUTTON ───────────────────────────────────────────────────────
function BackButton({ navigate }) {
  return (
    <button
      onClick={() => navigate('/quiz/games')}
      className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-6 py-3 text-xs uppercase tracking-[0.3em] font-bold text-white transition-all hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
    >
      <span className="transition-transform group-hover:-translate-x-1">←</span> Retour aux jeux
    </button>
  );
}

// ── SHARED BACKGROUND GLOWS ──────────────────────────────────────────────────
function BgGlows({ color1 = '#c28e3a', color2 = 'rgb(147,51,234)' }) {
  return (
    <>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-[pulse_8s_ease-in-out_infinite]" style={{ background: color1 }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-[pulse_10s_ease-in-out_infinite_reverse]" style={{ background: color2 }} />
    </>
  );
}

// ── TOPIC ROULETTE PAGE ──────────────────────────────────────────────────────
function TopicRoulettePage({ game, navigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [topic, setTopic] = useState('Choisis une catégorie et clique sur "Tourner !" pour lancer la roulette.');
  const [rounds, setRounds] = useState(0);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  const promptPool = useMemo(() => {
    if (selectedCategory === 'all') return allTopics;
    return topicByCategory[selectedCategory] || allTopics;
  }, [selectedCategory]);

  const spin = useCallback(() => {
    const pick = promptPool[Math.floor(Math.random() * promptPool.length)];
    setTopic(pick);
    setRounds((r) => r + 1);
    setTimerRunning(false);
    setTimerFinished(false);
    setTimeLeft(timerDuration);
  }, [promptPool, timerDuration]);

  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft <= 0) {
      setTimerRunning(false);
      setTimerFinished(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timerRunning, timeLeft]);

  const handleDuration = (d) => {
    setTimerDuration(d);
    setTimeLeft(d);
    setTimerRunning(false);
    setTimerFinished(false);
  };

  const startTimer = () => {
    setTimeLeft(timerDuration);
    setTimerRunning(true);
    setTimerFinished(false);
  };

  const catInfo = topicRouletteCategories.find((c) => c.id === selectedCategory) || topicRouletteCategories[0];

  return (
    <section className="relative min-h-screen bg-zinc-950 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <BgGlows />
      <div className="relative mx-auto max-w-6xl z-10">
        <BackButton navigate={navigate} />

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Main Card */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 sm:p-12 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-white/10 pb-8">
                <span className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{game.emoji}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#c28e3a] font-black mb-3">Topic Roulette</p>
                  <h1 className="text-5xl sm:text-6xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                    {game.title}
                  </h1>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{game.description}</p>
                </div>
              </div>

              {/* Catégories */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#c28e3a] font-black mb-4">Choisir une catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {topicRouletteCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black shadow-[0_0_16px_rgba(194,142,58,0.5)]'
                          : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-600">
                  {promptPool.length} sujet{promptPool.length > 1 ? 's' : ''} disponibles dans cette catégorie
                </p>
              </div>

              {/* Sujet actuel */}
              <div className="rounded-[32px] border border-[#c28e3a]/30 bg-gradient-to-b from-[#c28e3a]/10 to-transparent p-8 sm:p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#c28e3a] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#c28e3a] font-black mb-4">
                  {catInfo.emoji} Sujet en cours · {catInfo.label}
                </p>
                <p className="text-2xl sm:text-3xl font-heading font-medium text-white leading-snug min-h-[4rem]">
                  {topic}
                </p>
                <div className="mt-8 flex gap-3 flex-wrap">
                  <button
                    onClick={spin}
                    className="rounded-2xl bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(194,142,58,0.4)]"
                  >
                    🎰 Tourner !
                  </button>
                  <button
                    onClick={startTimer}
                    disabled={topic.startsWith('Choisis')}
                    className="rounded-2xl border border-[#c28e3a]/50 bg-[#c28e3a]/10 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#c28e3a] transition-all hover:bg-[#c28e3a]/20 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ⏱ Lancer le chrono
                  </button>
                </div>
              </div>

              {/* Chronomètre */}
              <div className="rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-black">Durée de parole</p>
                  <div className="flex gap-2">
                    {TIMER_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDuration(d)}
                        className={`w-12 h-8 rounded-full text-xs font-bold transition-all ${
                          timerDuration === d
                            ? 'bg-[#c28e3a] text-black'
                            : 'border border-white/10 text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        {d < 60 ? `${d}s` : `${d / 60}m`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-black font-mono text-white tabular-nums">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-black border border-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                          timerFinished
                            ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                            : 'bg-gradient-to-r from-[#c28e3a] via-[#e6aa45] to-yellow-300 shadow-[0_0_10px_rgba(194,142,58,0.8)]'
                        }`}
                        style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                      />
                    </div>
                    {timerFinished && (
                      <p className="mt-2 text-green-400 text-xs font-bold animate-pulse">
                        🎉 Temps écoulé ! Bravo, on continue ?
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-2">Sujets tirés</p>
                  <p className="text-4xl font-black bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">{rounds}</p>
                </div>
                <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-2">Catégorie</p>
                  <p className="text-2xl">{catInfo.emoji}</p>
                  <p className="text-xs text-zinc-400 font-bold mt-1">{catInfo.label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Aside */}
          <aside className="space-y-6 h-fit sticky top-8">
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#c28e3a]/20 flex items-center justify-center border border-[#c28e3a]/50">🎯</div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white font-black">Objectif</p>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">Exprime-toi librement sur un sujet aléatoire. L'improvisation est la clé pour gagner en fluidité.</p>
                </div>
                <hr className="border-white/5" />
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">⚡</div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white font-black">Astuce</p>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">Si tu bloques, commence par une anecdote personnelle, puis élargis. Ne cherche pas la perfection.</p>
                </div>
                <hr className="border-white/5" />
                {/* Mode guide */}
                <div className="rounded-3xl border border-[#c28e3a]/30 bg-gradient-to-br from-[#c28e3a]/10 to-transparent p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#c28e3a] font-black mb-4">Comment jouer</p>
                  <ul className="space-y-3 text-zinc-300 text-sm font-medium">
                    {['Choisis une catégorie (Personnel, Débat…)', 'Clique sur "Tourner !" pour un sujet aléatoire', "Lance le chrono et parle sans t'arrêter !", 'Rejoue autant de fois que tu veux.'].map((step, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#c28e3a] text-black flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Règles */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Règles du jeu</p>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    {[
                      'Parle 1 à 5 minutes sans interruption.',
                      'Tous les sujets sont tirés aléatoirement.',
                      "Mode \"Mots\" : décris l'objet ou l'expression tirée.",
                    ].map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#c28e3a] opacity-60 mt-0.5">▹</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ── PARLE OU PERDS PAGE ──────────────────────────────────────────────────────
function ParleOuPerdsPage({ game, navigate }) {
  const [topic, setTopic] = useState('Clique sur "Commencer" pour lancer le défi !');
  const [rounds, setRounds] = useState(0);
  const [wins, setWins] = useState(0);
  const [timer, setTimer] = useState(LAVA_DURATION);
  const [running, setRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState(''); // 'win' | 'lose' | ''

  useEffect(() => {
    if (!running) return;
    if (timer <= 0) {
      setRunning(false);
      setResultMessage('🌋 La lave a atteint ton socle ! Tu as perdu ce round.');
      setResultType('lose');
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [running, timer]);

  const pickPrompt = () => {
    const pick = parleOuPerdsPrompts[Math.floor(Math.random() * parleOuPerdsPrompts.length)];
    setTopic(pick);
  };

  const startChallenge = () => {
    pickPrompt();
    setTimer(LAVA_DURATION);
    setResultMessage('');
    setResultType('');
    setRunning(true);
    setRounds((r) => r + 1);
  };

  const stopChallenge = () => {
    setRunning(false);
    setResultMessage('✅ Tu as tenu ! Round validé !');
    setResultType('win');
    setWins((w) => w + 1);
  };

  const progressPct = (timer / LAVA_DURATION) * 100;
  const isDanger = timer <= 5;

  return (
    <section className="relative min-h-screen bg-zinc-950 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <BgGlows color1="#ef4444" color2="rgb(239,68,68)" />
      <div className="relative mx-auto max-w-6xl z-10">
        <BackButton navigate={navigate} />

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Main Card */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 sm:p-12 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-white/10 pb-8">
                <span className="text-7xl drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">{game.emoji}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-red-400 font-black mb-3">Parle ou Perds</p>
                  <h1 className="text-5xl sm:text-6xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                    {game.title}
                  </h1>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{game.description}</p>
                </div>
              </div>

              {/* Règles visuelles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group rounded-3xl border border-white/5 bg-black/40 p-6 transition-all hover:bg-black/60 hover:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="p-2 rounded-full bg-red-500/10 text-red-400">📜</span>
                    <p className="text-sm uppercase tracking-[0.25em] text-red-400 font-black">Règles</p>
                  </div>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    {['Un sujet est tiré au sort au lancement.', `Parle sans interruption pendant ${LAVA_DURATION} secondes.`, 'La lave monte si tu te tais trop longtemps !', 'Appuie sur "Arrêter" avant la fin pour valider.'].map((r, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-red-400 opacity-60">▹</span>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="group rounded-3xl border border-white/5 bg-black/40 p-6 transition-all hover:bg-black/60 hover:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="p-2 rounded-full bg-blue-500/10 text-blue-400">💡</span>
                    <p className="text-sm uppercase tracking-[0.25em] text-blue-400 font-black">Conseils</p>
                  </div>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    {['Commence par "la chose la plus importante est…"', 'Utilise des exemples personnels.', 'Le silence est ton seul ennemi.', 'Reformule si tu bloques.'].map((c, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-blue-400 opacity-60">▹</span>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Zone de jeu principale */}
              <div className={`rounded-[32px] border p-8 sm:p-10 relative overflow-hidden transition-all duration-500 ${
                isDanger && running
                  ? 'border-red-500/60 bg-gradient-to-b from-red-900/20 to-transparent shadow-[inset_0_0_40px_rgba(239,68,68,0.15)]'
                  : 'border-[#c28e3a]/30 bg-gradient-to-b from-[#c28e3a]/10 to-transparent'
              }`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-40" />

                {/* Sujet */}
                <p className="text-[10px] uppercase tracking-[0.4em] text-red-400 font-black mb-4">🌋 Sujet en cours</p>
                <p className="text-2xl sm:text-3xl font-heading font-medium text-white leading-snug min-h-[5rem] mb-8">
                  {topic}
                </p>

                {/* Boutons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={running ? stopChallenge : startChallenge}
                    className={`rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg ${
                      running
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black shadow-[0_0_20px_rgba(194,142,58,0.4)]'
                    }`}
                  >
                    {running ? '⏹ J\'ai tenu !' : '▶ Commencer'}
                  </button>
                  {!running && rounds > 0 && (
                    <button
                      onClick={startChallenge}
                      className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
                    >
                      🔄 Nouveau round
                    </button>
                  )}
                </div>

                {/* Timer lave */}
                {(running || (rounds > 0 && !running)) && (
                  <div className="mt-8 rounded-2xl bg-black/60 backdrop-blur-md p-6 border border-white/5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`text-xs uppercase tracking-[0.3em] font-black flex items-center gap-2 ${isDanger && running ? 'text-red-400' : 'text-zinc-400'}`}>
                        {running ? <span className="animate-pulse">🌋</span> : null}
                        {running ? (isDanger ? 'DANGER ! La lave monte !' : 'Temps restant') : 'Chrono arrêté'}
                      </span>
                      <span className={`text-3xl font-black font-mono tabular-nums ${isDanger && running ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        {timer}s
                      </span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full bg-black border border-white/10 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                          isDanger
                            ? 'bg-gradient-to-r from-red-800 to-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]'
                            : 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Message résultat */}
                {resultMessage && (
                  <div className={`mt-6 rounded-2xl p-4 border text-sm font-bold text-center animate-[fadeIn_0.3s_ease] ${
                    resultType === 'win'
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}>
                    {resultMessage}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Rounds joués', value: rounds, color: 'text-white' },
                  { label: 'Victoires', value: wins, color: 'text-green-400' },
                  { label: 'Ratio', value: rounds > 0 ? `${Math.round((wins / rounds) * 100)}%` : '—', color: 'text-[#c28e3a]' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/5 bg-white/5 p-5 text-center">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-2">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aside */}
          <aside className="space-y-6 h-fit sticky top-8">
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">🎯</div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white font-black">Objectif</p>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Garde la parole et le rythme avant que la lave ne te rattrape. Oser parler sans interruption, c'est ça l'objectif.
                  </p>
                </div>
                <hr className="border-white/5" />
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">⚡</div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white font-black">Astuce</p>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Concentre-toi sur une image ou une histoire simple, puis enrichis-la au fil des secondes. Le silence est ton seul ennemi.
                  </p>
                </div>
                <hr className="border-white/5" />
                <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-red-400 font-black mb-4">Comment jouer</p>
                  <ul className="space-y-3 text-zinc-300 text-sm font-medium">
                    {['Clique sur "Commencer"', 'Parle sans t\'arrêter 15 secondes', 'Clique "J\'ai tenu !" pour valider', 'Rejoue pour battre ton score !'].map((step, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ── SHADOWING PAGE ───────────────────────────────────────────────────────────
function ShadowingPage({ navigate }) {
  const videos = [
    { emoji: '🎤', title: "Finale concours d'éloquence", author: 'Lauréline · @laureline.louis', url: 'https://www.tiktok.com/@laureline.louis/video/7616417867524787478' },
    { emoji: '⚖️', title: 'Finale éloquence - plaidoirie', author: 'Lauréline · @laureline.louis', url: 'https://www.tiktok.com/@laureline.louis/video/7485793451892608278' },
    { emoji: '🎙️', title: "On ne s'excuse pas de parler", author: 'Laetitia M. · @laetitiamampaka', url: 'https://www.tiktok.com/@laetitiamampaka/video/7613116877727894817' },
    { emoji: '💛', title: 'Avoir confiance en soi', author: '@blou_08', url: 'https://www.tiktok.com/@blou_08/video/7601209505384303894' },
    { emoji: '🪞', title: 'Se libérer du regard des autres', author: '@blou_08', url: 'https://www.tiktok.com/@blou_08/video/7614568652708547842' },
  ];
  const steps = [
    { title: 'Je choisis ma vidéo sur TikTok', desc: "Une personne dont j'adore la façon de parler + un contenu qui me donne de l'énergie ou de la confiance. C'est le combo parfait 💪" },
    { title: 'Je télécharge la vidéo sur mon ordinateur', desc: 'Pour pouvoir la lire facilement et la charger dans un logiciel de montage.' },
    { title: "J'ajoute les sous-titres avec CapCut", desc: "C'est gratuit, ça se génère automatiquement. Astuce : je décale légèrement les sous-titres en avance pour anticiper ce qu'elle va dire 😊" },
    { title: "Je répète en même temps qu'elle", desc: "D'abord j'écoute et je répète. Puis je parle en même temps qu'elle. Et ensuite je coupe le son et je le fais seule en lisant les sous-titres." },
    { title: 'Je répète sur plusieurs jours', desc: "Et naturellement, sans forcer, je finis par le connaître par cœur 😅" },
  ];

  return (
    <section className="relative min-h-screen bg-zinc-950 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <BgGlows />
      <div className="relative mx-auto max-w-6xl z-10">
        <BackButton navigate={navigate} />
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 sm:p-12 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-white/10 pb-8">
                <span className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🎙️</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#c28e3a] font-black mb-3">Ma Méthode</p>
                  <h1 className="text-5xl sm:text-6xl font-heading font-black uppercase tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Le Shadowing</h1>
                </div>
              </div>
              <div className="rounded-3xl border border-[#c28e3a]/30 bg-gradient-to-b from-[#c28e3a]/10 to-transparent p-6 sm:p-8">
                <h2 className="text-lg font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">🤔 C'est quoi ?</h2>
                <p className="text-zinc-300 text-base leading-relaxed">
                  Le shadowing c'est simple : tu répètes mot pour mot ce que quelqu'un dit, en même temps que lui. Tu l'imites en temps réel.
                  <br /><br />
                  Sans t'en rendre compte, tu absorbes sa façon d'articuler, son vocabulaire, la structure de ses phrases, son intonation et son rythme. C'est comme télécharger sa façon de parler dans ton cerveau ! 🧠
                </p>
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">🛠️ En 5 étapes</h2>
                <div className="space-y-4">
                  {steps.map((s, i) => (
                    <div key={i} className="group flex gap-4 p-5 rounded-3xl border border-white/5 bg-black/40 transition-all hover:bg-black/60 hover:border-white/10">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#c28e3a] text-black flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">{i + 1}</div>
                      <div>
                        <h3 className="text-white font-bold mb-1">{s.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#c28e3a]/20 flex items-center justify-center border border-[#c28e3a]/50 text-[#c28e3a]">⏱️</div>
                <h2 className="text-sm uppercase tracking-[0.25em] text-white font-black">Combien de temps ?</h2>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-2"><strong className="text-white">10 min</strong> pour une nouvelle vidéo + <strong className="text-white">5 min</strong> de révision des anciennes.</p>
              <p className="text-zinc-400 text-sm leading-relaxed">Au fil des semaines, tu accumules et ton cerveau absorbe de plus en plus !</p>
            </div>
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 text-blue-400">🎬</div>
                <h2 className="text-sm uppercase tracking-[0.25em] text-white font-black">Vidéos du moment</h2>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed mb-5">Ces vidéos résonnent avec moi. Choisis une personne dont tu aimes l'élocution !</p>
              <div className="space-y-3">
                {videos.map((v, i) => (
                  <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/40 hover:bg-black/60 hover:border-white/10 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{v.emoji}</span>
                      <div>
                        <h4 className="text-white font-bold text-xs group-hover:text-[#c28e3a] transition-colors">{v.title}</h4>
                        <p className="text-zinc-500 text-[10px]">{v.author}</p>
                      </div>
                    </div>
                    <span className="text-zinc-400 group-hover:text-white transition-colors">▶</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ── NOT FOUND ────────────────────────────────────────────────────────────────
function NotFoundPage({ navigate }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c28e3a] rounded-full mix-blend-multiply filter blur-[150px] opacity-20" />
      <div className="max-w-2xl text-center relative z-10 p-12 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="text-6xl mb-6">❓</div>
        <p className="text-sm font-black uppercase tracking-[0.35em] text-[#c28e3a] mb-4">Jeu introuvable</p>
        <h2 className="text-4xl font-heading font-bold mb-8">Désolé, ce jeu n'est pas encore disponible.</h2>
        <button
          onClick={() => navigate('/quiz/games')}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(194,142,58,0.4)]"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function GameDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = useMemo(() => games.find((item) => item.slug === slug), [slug]);

  if (!game) return <NotFoundPage navigate={navigate} />;

  if (slug === 'shadowing') return <ShadowingPage navigate={navigate} />;
  if (slug === 'parle-ou-perds') return <ParleOuPerdsPage game={game} navigate={navigate} />;
  if (slug === 'topic-roulette') return <TopicRoulettePage game={game} navigate={navigate} />;

  return <NotFoundPage navigate={navigate} />;
}
