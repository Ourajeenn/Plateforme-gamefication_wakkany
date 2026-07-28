/**
 * HostLobby — Interface de l'hôte pour créer et gérer une salle de jeu
 * Affiche le code salle, la liste des joueurs et lance la partie.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameRoom } from '../../hooks/useGameRoom';
import { useSoundFX } from '../../hooks/useSoundFX';
import Button from '../common/Button';

const MODES = [
  { id: 'bluff_royal', label: 'Bluff Royal', icon: '🃏', desc: 'Bluffez et devinez qui ment' },
  { id: 'family',      label: 'Quiz Famille', icon: '👨‍👩‍👧', desc: 'Quiz rapide en équipe' },
];

const THEMES = [
  { id: 'rpg',      label: 'Univers RPG',    icon: '⚔️' },
  { id: 'history',  label: 'Histoire',        icon: '📜' },
  { id: 'science',  label: 'Science',         icon: '🔬' },
  { id: 'general',  label: 'Culture générale',icon: '🌍' },
];

export default function HostLobby() {
  const navigate = useNavigate();
  const { room, players, myPlayer, loading, error, createRoom, startGame, leaveRoom } = useGameRoom();
  const { playClick, playCountdownBeep, playCountdownGo, playLevelUp } = useSoundFX();

  // Étape : 'setup' | 'lobby'
  const [step, setStep]     = useState('setup');
  const [pseudo, setPseudo] = useState(() => localStorage.getItem('wakkany_pseudo') || '');
  const [mode, setMode]     = useState('bluff_royal');
  const [theme, setTheme]   = useState('rpg');

  const [copied, setCopied]             = useState(false);
  const [countdown, setCountdown]       = useState(null);  // null | 3 | 2 | 1 | 0
  const [launching, setLaunching]       = useState(false);

  const allReady = players.length >= 2 && players.every(p => p.is_ready);

  // ── Démarrer la création ────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!pseudo.trim()) return;
    localStorage.setItem('wakkany_pseudo', pseudo.trim());
    const result = await createRoom({ pseudo: pseudo.trim(), mode, theme });
    if (result) setStep('lobby');
  }, [pseudo, mode, theme, createRoom]);

  // ── Copier le code ──────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [room?.code]);

  // ── Lancer le décompte puis la partie ──────────────────────────────────
  const handleLaunch = useCallback(async () => {
    if (launching) return;
    setLaunching(true);

    // Décompte 3 → 0 avec sons
    let c = 3;
    setCountdown(c);
    playCountdownBeep();

    const tick = setInterval(() => {
      c -= 1;
      if (c > 0) {
        setCountdown(c);
        playCountdownBeep();
      } else {
        clearInterval(tick);
        setCountdown(0);
        playCountdownGo();

        // Lancer réellement la partie
        setTimeout(async () => {
          await startGame({ round: 0, phase: 'pass-collect' });
          // Rediriger l'hôte vers le bon jeu
          const path = mode === 'bluff_royal' ? '/quiz/bluff' : '/quiz/play';
          navigate(path, { state: { roomCode: room?.code, players: players.map(p => p.pseudo), theme } });
        }, 500);
      }
    }, 1000);
  }, [launching, mode, theme, room, players, navigate, startGame, playCountdownBeep, playCountdownGo]);

  // ── Quitter ──────────────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    await leaveRoom();
    navigate('/quiz');
  }, [leaveRoom, navigate]);

  // ── Son de niveau à l'arrivée d'un joueur ────────────────────────────
  useEffect(() => {
    if (players.length > 1) playLevelUp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length]);

  // ─────────────────────────────────────────────────────────────────────
  // RENDER : Décompte
  // ─────────────────────────────────────────────────────────────────────
  if (countdown !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center animate-breathe">
          <p className="text-[#c28e3a] text-xl font-heading mb-4 tracking-widest uppercase">La partie commence</p>
          <h2 className="text-[10rem] font-heading font-black italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#fde68a] via-[#c28e3a] to-[#78350f] drop-shadow-[0_0_60px_rgba(194,142,58,0.6)]">
            {countdown > 0 ? countdown : 'GO!'}
          </h2>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // RENDER : Setup
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Back */}
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <iconify-icon icon="mdi:arrow-left" width="20" />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎮</div>
            <h1 className="text-3xl font-heading font-black text-[#c28e3a]">Créer une salle</h1>
            <p className="text-zinc-400 mt-1">Configurez votre partie multijoueur</p>
          </div>

          {/* Pseudo */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2 font-medium">Votre pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              placeholder="Chasseur légendaire..."
              maxLength={20}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c28e3a] transition-colors"
            />
          </div>

          {/* Mode */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2 font-medium">Mode de jeu</label>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    mode === m.id
                      ? 'border-[#c28e3a] bg-[#c28e3a]/10 text-white'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className="font-bold text-sm">{m.label}</div>
                  <div className="text-xs opacity-70 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Thème */}
          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2 font-medium">Thème</label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    theme === t.id
                      ? 'border-[#c28e3a] bg-[#c28e3a]/10 text-[#e8b96a]'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={!pseudo.trim() || loading}
            className="w-full"
          >
            {loading ? 'Création…' : 'Créer la salle →'}
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // RENDER : Lobby
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* En-tête */}
        <div className="text-center mb-8">
          <p className="text-zinc-500 text-sm uppercase tracking-widest mb-1">Code de la salle</p>
          <button
            onClick={handleCopy}
            className="group inline-flex items-center gap-3 text-5xl md:text-6xl font-heading font-black text-[#c28e3a] hover:text-[#e8b96a] transition-colors duration-200"
            title="Copier le code"
          >
            <span className="tracking-[0.25em]">{room?.code}</span>
            <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
              {copied ? '✅' : '📋'}
            </span>
          </button>
          {copied && <p className="text-green-400 text-sm mt-1 animate-fade-in">Copié !</p>}
          <p className="text-zinc-500 text-sm mt-2">
            Mode <span className="text-white font-medium">{MODES.find(m => m.id === room?.mode)?.label}</span>
            {' · '}Thème <span className="text-white font-medium">{THEMES.find(t => t.id === room?.theme)?.label}</span>
          </p>
        </div>

        {/* Liste des joueurs */}
        <div className="bg-zinc-900/60 backdrop-blur rounded-2xl border border-zinc-800 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-white">Joueurs</h2>
            <span className="text-zinc-500 text-sm">{players.length} / 8</span>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-6 text-zinc-600">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm">En attente de joueurs…</p>
              <p className="text-xs mt-1">Partagez le code <span className="text-[#c28e3a] font-bold">{room?.code}</span></p>
            </div>
          ) : (
            <ul className="space-y-2">
              {players.map((p, i) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    p.device_id === myPlayer?.device_id ? 'bg-[#c28e3a]/10 border border-[#c28e3a]/30' : 'bg-zinc-800/50'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-[#c28e3a]">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-sm">{p.pseudo}</span>
                  {p.is_host && (
                    <span className="text-xs bg-[#c28e3a]/20 text-[#c28e3a] px-2 py-0.5 rounded-full font-medium">Hôte</span>
                  )}
                  {p.is_ready && !p.is_host && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Conditions de lancement */}
        {players.length < 2 && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4 justify-center">
            <iconify-icon icon="mdi:information-outline" width="16" />
            Minimum 2 joueurs pour commencer
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={handleLeave}
            className="flex-shrink-0 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            Quitter
          </button>

          <Button
            onClick={handleLaunch}
            disabled={players.length < 2 || launching}
            className="flex-1"
          >
            {launching ? 'Lancement…' : `Lancer la partie (${players.length})`}
          </Button>
        </div>

        {/* Note */}
        <p className="text-center text-zinc-600 text-xs mt-4">
          En tant qu'hôte, vous contrôlez le lancement.
        </p>
      </div>
    </div>
  );
}
