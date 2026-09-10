/**
 * JoinRoom — Interface pour rejoindre une salle de jeu existante
 * L'utilisateur entre le code de salle et son pseudo, puis atterrit dans le lobby.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameRoom } from '../../hooks/useGameRoom';
import { isSupabaseConfigured } from '../../utils/isSupabaseConfigured';
import { useSoundFX } from '../../hooks/useSoundFX';
import Button from '../common/Button';
const SUPABASE_UNAVAILABLE_MESSAGE = import.meta.env.VITE_SUPABASE_UNAVAILABLE_MESSAGE || 'Le mode multijoueur est indisponible.';

export default function JoinRoom() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { room, players, myPlayer, loading, error, joinRoom, setReady, leaveRoom } = useGameRoom();
  const isConfigured = isSupabaseConfigured();
  const { playCountdownBeep, playCountdownGo, playLevelUp } = useSoundFX();

  const [step, setStep]     = useState('join'); // 'join' | 'lobby'
  const [code, setCode]     = useState(searchParams.get('code') || '');
  const [pseudo, setPseudo] = useState(() => localStorage.getItem('wakkany_pseudo') || '');
  const [isReady, setIsReadyLocal] = useState(false);

  // Décompte piloté par l'hôte (room.status passe à 'playing')
  const [countdown, setCountdown] = useState(null);

  // ── Rejoindre ────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!code.trim() || !pseudo.trim()) return;
    if (!isConfigured) {
      setError(SUPABASE_UNAVAILABLE_MESSAGE);
      return;
    }

    localStorage.setItem('wakkany_pseudo', pseudo.trim());
    const result = await joinRoom({ code: code.trim(), pseudo: pseudo.trim() });
    if (result) setStep('lobby');
  }, [code, pseudo, joinRoom, isConfigured]);

  // ── Marquer prêt ─────────────────────────────────────────────────────────
  const handleReady = useCallback(async () => {
    const next = !isReady;
    setIsReadyLocal(next);
    await setReady(next);
  }, [isReady, setReady]);

  // ── Quitter ───────────────────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    await leaveRoom();
    navigate('/quiz');
  }, [leaveRoom, navigate]);

  // ── Écouter le lancement (room.status → 'playing') ───────────────────────
  useEffect(() => {
    if (room?.status !== 'playing' || countdown !== null) return;

    // Décompte visuel + sonore côté client pour les non-hôtes
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

        setTimeout(() => {
          const mode  = room?.mode || 'bluff_royal';
          const path  = mode === 'bluff_royal' ? '/quiz/bluff' : '/quiz/play';
          navigate(path, {
            state: {
              roomCode : room?.code,
              players  : players.map(p => p.pseudo),
              theme    : room?.theme || 'rpg',
            },
          });
        }, 500);
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status]);

  // ── Son à l'arrivée d'un joueur ──────────────────────────────────────────
  useEffect(() => {
    if (players.length > 1) playLevelUp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER : Décompte
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER : Formulaire join
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'join') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <iconify-icon icon="mdi:arrow-left" width="20" />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔗</div>
            <h1 className="text-3xl font-heading font-black text-[#c28e3a]">Rejoindre</h1>
            <p className="text-zinc-400 mt-1">Entrez le code fourni par l'hôte</p>
          </div>

          {/* Code */}
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2 font-medium">Code de salle</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="AB3K9Z"
              maxLength={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-2xl font-heading font-black text-center tracking-[0.3em] placeholder-zinc-700 focus:outline-none focus:border-[#c28e3a] transition-colors uppercase"
            />
          </div>

          {/* Pseudo */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2 font-medium">Votre pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              placeholder="Chasseur légendaire…"
              maxLength={20}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c28e3a] transition-colors"
            />
          </div>

          {!isConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-900/30 border border-yellow-500/30 text-yellow-200 text-sm">
                  {SUPABASE_UNAVAILABLE_MESSAGE}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleJoin}
            disabled={code.length < 6 || !pseudo.trim() || loading || !isConfigured}
            className="w-full"
          >
            {loading ? 'Connexion…' : 'Rejoindre →'}
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER : Lobby (attente de l'hôte)
  // ─────────────────────────────────────────────────────────────────────────
  const modeLabels = { bluff_royal: '🃏 Bluff Royal', family: '👨‍👩‍👧 Quiz Famille' };
  const themeLabels = { rpg: '⚔️ RPG', history: '📜 Histoire', science: '🔬 Science', general: '🌍 Culture' };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Code visible */}
        <div className="text-center mb-8">
          <p className="text-zinc-500 text-sm uppercase tracking-widest mb-1">Salle rejointe</p>
          <p className="text-4xl font-heading font-black text-[#c28e3a] tracking-[0.25em]">{room?.code}</p>
          <p className="text-zinc-500 text-sm mt-1">
            {modeLabels[room?.mode] || room?.mode}
            {' · '}
            {themeLabels[room?.theme] || room?.theme}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-zinc-500 text-xs bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            En attente du lancement par l'hôte…
          </div>
        </div>

        {/* Joueurs */}
        <div className="bg-zinc-900/60 backdrop-blur rounded-2xl border border-zinc-800 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-white">Joueurs</h2>
            <span className="text-zinc-500 text-sm">{players.length} / 8</span>
          </div>
          <ul className="space-y-2">
            {players.map((p, i) => (
              <li
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                  p.device_id === myPlayer?.device_id ? 'bg-[#c28e3a]/10 border border-[#c28e3a]/30' : 'bg-zinc-800/50'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-[#c28e3a]">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-sm">{p.pseudo}</span>
                {p.is_host && (
                  <span className="text-xs bg-[#c28e3a]/20 text-[#c28e3a] px-2 py-0.5 rounded-full">Hôte</span>
                )}
                {p.is_ready && !p.is_host && (
                  <span className="text-green-400 text-sm">✓ Prêt</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={handleLeave}
            className="flex-shrink-0 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            Quitter
          </button>

          <Button
            onClick={handleReady}
            className={`flex-1 ${isReady ? 'opacity-70' : ''}`}
          >
            {isReady ? '✓ Prêt — Annuler' : 'Je suis prêt !'}
          </Button>
        </div>
      </div>
    </div>
  );
}
