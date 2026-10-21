/**
 * AssistantModeControl — Composant admin (RAG Step 9)
 *
 * Permet à l'administrateur de choisir le mode de l'assistant :
 *   - off        : désactivé
 *   - supervised : questions en file d'attente, réponse manuelle admin
 *   - auto       : RAG automatique depuis ai_questions approuvées
 *
 * Affiché dans l'onglet "Assistant" de AdminPage.jsx.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';

// ──────────────────────────────────────────────
// Configuration des modes (labels, icônes, descriptions)
// ──────────────────────────────────────────────
const MODES = [
  {
    id: 'off',
    label: 'Désactivé',
    icon: 'mdi:power-off',
    color: 'text-red-400',
    border: 'border-red-500/60',
    bg: 'bg-red-900/20',
    badge: 'bg-red-500/20 text-red-300',
    description:
      'L\'assistant ne répond pas. Les joueurs voient un message les invitant à consulter les règles du jeu.',
  },
  {
    id: 'supervised',
    label: 'Supervisé',
    icon: 'mdi:account-supervisor',
    color: 'text-amber-400',
    border: 'border-amber-500/60',
    bg: 'bg-amber-900/20',
    badge: 'bg-amber-500/20 text-amber-300',
    description:
      'Les questions des joueurs sont mises en file d\'attente. Tu réponds manuellement depuis le panneau ci-dessous. '
      + 'Aucune IA ne génère de réponse à ta place.',
  },
  {
    id: 'auto',
    label: 'Automatique (RAG)',
    icon: 'mdi:robot-happy',
    color: 'text-emerald-400',
    border: 'border-emerald-500/60',
    bg: 'bg-emerald-900/20',
    badge: 'bg-emerald-500/20 text-emerald-300',
    description:
      'L\'assistant répond automatiquement en cherchant dans les questions approuvées. '
      + 'S\'il ne trouve rien, il indique qu\'il n\'a pas de réponse validée.',
  },
];

// ──────────────────────────────────────────────
// Sous-composant : file d'attente supervisée
// ──────────────────────────────────────────────
function PendingQueue() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [replies, setReplies]     = useState({});
  const [saving, setSaving]       = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('assistant_pending')
      .select('*')
      .eq('handled', false)
      .order('created_at', { ascending: true })
      .limit(50);
    setQuestions(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReply = async (id) => {
    const reply = (replies[id] ?? '').trim();
    if (!reply) return;

    setSaving((s) => ({ ...s, [id]: true }));
    const { error } = await supabase
      .from('assistant_pending')
      .update({
        handled:    true,
        handled_at: new Date().toISOString(),
        admin_reply: reply,
      })
      .eq('id', id);

    if (!error) {
      setQuestions((q) => q.filter((item) => item.id !== id));
      setReplies((r) => { const copy = { ...r }; delete copy[id]; return copy; });
    }
    setSaving((s) => ({ ...s, [id]: false }));
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-zinc-500 animate-pulse">
        Chargement de la file d'attente…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <iconify-icon icon="mdi:inbox-outline" width="40" className="mb-2 mx-auto block" />
        <p className="text-sm">Aucune question en attente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-zinc-800/40 border border-white/10 rounded-2xl p-5 space-y-3"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold">{q.prompt}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {new Date(q.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full shrink-0">
              En attente
            </span>
          </div>

          {/* Zone de réponse */}
          <textarea
            rows={3}
            placeholder="Rédige ta réponse ici…"
            value={replies[q.id] ?? ''}
            onChange={(e) =>
              setReplies((r) => ({ ...r, [q.id]: e.target.value }))
            }
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-[#c28e3a] transition-colors"
          />

          <button
            onClick={() => handleReply(q.id)}
            disabled={!replies[q.id]?.trim() || saving[q.id]}
            className="px-6 py-2 bg-[#c28e3a] text-black text-sm font-bold uppercase rounded-xl hover:bg-[#e8b96a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving[q.id] ? 'Envoi…' : '✓ Répondre'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Composant principal
// ──────────────────────────────────────────────
export default function AssistantModeControl() {
  const [currentMode, setCurrentMode] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [feedback, setFeedback]       = useState(null); // { type: 'ok'|'err', msg }

  // Lecture du mode actuel
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'assistant_mode')
        .single();
      setCurrentMode(data?.value ?? 'supervised');
      setLoading(false);
    })();
  }, []);

  const applyMode = async (modeId) => {
    if (modeId === currentMode || saving) return;
    setSaving(true);
    setFeedback(null);

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'assistant_mode', value: modeId, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      setFeedback({ type: 'err', msg: `Erreur : ${error.message}` });
    } else {
      setCurrentMode(modeId);
      const label = MODES.find((m) => m.id === modeId)?.label ?? modeId;
      setFeedback({ type: 'ok', msg: `Mode "${label}" activé avec succès.` });
      setTimeout(() => setFeedback(null), 4000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-zinc-500 animate-pulse">
        Chargement de la configuration…
      </div>
    );
  }

  const activeModeConfig = MODES.find((m) => m.id === currentMode);

  return (
    <div className="space-y-8">

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3">
        <iconify-icon icon="mdi:robot" width="28" className="text-[#c28e3a]" />
        <div>
          <h2 className="text-xl font-heading font-black uppercase text-white">
            Mode de l'Assistant IA
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Choisis comment l'assistant répond aux joueurs.
          </p>
        </div>
        {activeModeConfig && (
          <span className={`ml-auto text-xs font-bold uppercase px-3 py-1 rounded-full ${activeModeConfig.badge}`}>
            <iconify-icon icon={activeModeConfig.icon} width="14" className="inline mr-1" />
            {activeModeConfig.label}
          </span>
        )}
      </div>

      {/* ── Sélecteur de mode ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => applyMode(m.id)}
              disabled={saving}
              className={`
                relative text-left p-5 rounded-2xl border-2 transition-all duration-200
                ${isActive
                  ? `${m.border} ${m.bg} shadow-lg`
                  : 'border-white/10 bg-zinc-900/30 hover:border-white/25 hover:bg-zinc-900/50'
                }
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {isActive && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                  Actif
                </span>
              )}
              <iconify-icon
                icon={m.icon}
                width="32"
                className={`mb-3 block ${isActive ? m.color : 'text-zinc-500'}`}
              />
              <div className={`font-bold mb-1 ${isActive ? m.color : 'text-white'}`}>
                {m.label}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{m.description}</p>
            </button>
          );
        })}
      </div>

      {/* ── Feedback ── */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            feedback.type === 'ok'
              ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/40'
              : 'bg-red-900/30 text-red-300 border border-red-500/40'
          }`}
        >
          {feedback.type === 'ok' ? '✓ ' : '✗ '}
          {feedback.msg}
        </div>
      )}

      {/* ── File d'attente supervisée ── */}
      {currentMode === 'supervised' && (
        <div className="bg-zinc-900/40 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <iconify-icon icon="mdi:inbox-multiple" width="22" className="text-amber-400" />
            <h3 className="font-bold uppercase text-sm text-amber-400 tracking-wider">
              File d'attente — Questions en attente de réponse
            </h3>
          </div>
          <PendingQueue />
        </div>
      )}

      {/* ── Rappel mode auto ── */}
      {currentMode === 'auto' && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 text-sm text-emerald-300 leading-relaxed">
          <iconify-icon icon="mdi:information-outline" width="18" className="inline mr-2 align-middle" />
          <strong>Mode RAG actif.</strong> L'assistant répond automatiquement en recherchant parmi les questions approuvées.
          Assure-toi que la table <code className="bg-white/10 px-1 rounded">ai_questions</code> contient
          des entrées avec <code className="bg-white/10 px-1 rounded">status = 'approved'</code> pour que le RAG fonctionne.
        </div>
      )}
    </div>
  );
}
