/**
 * AssistantModeControl — Interface administrateur pour l'assistant Wakkany (Étapes 8 & 9)
 *
 * Fonctionnalités :
 *   1. Sélecteur de mode : 'off' | 'supervised' | 'auto' (sauvegardé dans app_settings)
 *   2. File d'attente de modération (assistant_pending) :
 *      - Consultation des questions et des réponses générées par le RAG
 *      - Validation / Approbation avec injection dans ai_questions (boucle d'apprentissage)
 *      - Rejet des réponses non conformes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';

const MODES = [
  {
    value: 'off',
    label: 'Désactivé',
    icon: 'mdi:power-off',
    color: 'text-red-400',
    border: 'border-red-500/60',
    bg: 'bg-red-900/20',
    badge: 'bg-red-500/20 text-red-300',
    description: 'Aucune réponse de l\'assistant.',
  },
  {
    value: 'supervised',
    label: 'Supervisé',
    icon: 'mdi:account-supervisor',
    color: 'text-amber-400',
    border: 'border-amber-500/60',
    bg: 'bg-amber-900/20',
    badge: 'bg-amber-500/20 text-amber-300',
    description: 'Chaque réponse nouvelle attend votre validation avant d\'être retournée.',
  },
  {
    value: 'auto',
    label: 'Automatique',
    icon: 'mdi:robot-happy',
    color: 'text-emerald-400',
    border: 'border-emerald-500/60',
    bg: 'bg-emerald-900/20',
    badge: 'bg-emerald-500/20 text-emerald-300',
    description: 'Réponses directes à partir des connaissances validées. Pas de réponse si hors périmètre.',
  },
];

// ──────────────────────────────────────────────
// File d'attente de modération (Étape 8)
// ──────────────────────────────────────────────
function PendingQueue() {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [edits, setEdits]               = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const loadPending = useCallback(async () => {
    setLoading(true);
    // RLS enabled on assistant_pending
    const { data, error } = await supabase
      .from('assistant_pending')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error) {
      setPendingItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // Approuver la réponse (boucle d'apprentissage : ajout optionnel dans ai_questions)
  const handleApprove = async (item) => {
    setActionLoading((prev) => ({ ...prev, [item.id]: 'approving' }));
    const { data: { user } } = await supabase.auth.getUser();
    const finalAnswer = edits[item.id] !== undefined ? edits[item.id] : item.proposed_answer;

    // 1. Mettre à jour assistant_pending
    // RLS enabled on assistant_pending
    const { error: updateError } = await supabase
      .from('assistant_pending')
      .update({
        proposed_answer: finalAnswer,
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (!updateError) {
      // 2. Boucle d'apprentissage : insérer la paire validée dans ai_questions
      try {
        // RLS enabled on ai_questions
        await supabase.from('ai_questions').insert({
          theme: 'general',
          mode: 'coop_meute',
          difficulty: 'rookie',
          type: 'mcq',
          question: item.question,
          answer: finalAnswer,
          explanation: `Validé par l'administrateur le ${new Date().toLocaleDateString('fr-FR')}`,
          status: 'approved',
          created_by: user?.id,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Apprentissage auto ai_questions note:', err);
      }

      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
    }
    setActionLoading((prev) => ({ ...prev, [item.id]: null }));
  };

  // Rejeter la réponse
  const handleReject = async (itemId) => {
    setActionLoading((prev) => ({ ...prev, [itemId]: 'rejecting' }));
    const { data: { user } } = await supabase.auth.getUser();

    // RLS enabled on assistant_pending
    const { error } = await supabase
      .from('assistant_pending')
      .update({
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (!error) {
      setPendingItems((prev) => prev.filter((p) => p.id !== itemId));
    }
    setActionLoading((prev) => ({ ...prev, [itemId]: null }));
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-zinc-500 animate-pulse">
        Chargement des réponses en attente…
      </div>
    );
  }

  if (pendingItems.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <iconify-icon icon="mdi:checkbox-marked-circle-outline" width="40" className="mb-2 mx-auto block text-emerald-500/60" />
        <p className="text-sm font-semibold">Toutes les réponses ont été validées.</p>
        <p className="text-xs text-zinc-600 mt-1">Aucune réponse en attente dans la file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingItems.map((item) => (
        <div
          key={item.id}
          className="bg-zinc-800/40 border border-white/10 rounded-2xl p-5 space-y-4"
        >
          {/* Question du joueur */}
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Question du joueur
            </div>
            <p className="text-white font-semibold text-base">{item.question}</p>
            <div className="text-[11px] text-zinc-500 mt-1">
              Reçue le {new Date(item.created_at).toLocaleString('fr-FR')}
              {item.source_ids?.length > 0 && ` · ${item.source_ids.length} source(s) trouvée(s)`}
            </div>
          </div>

          {/* Réponse proposée (éditable) */}
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1 flex items-center justify-between">
              <span>Réponse proposée par le RAG</span>
              <span className="text-[11px] text-zinc-500 normal-case">Modifiable avant validation</span>
            </div>
            <textarea
              rows={3}
              value={edits[item.id] !== undefined ? edits[item.id] : item.proposed_answer}
              onChange={(e) => setEdits({ ...edits, [item.id]: e.target.value })}
              className="w-full bg-zinc-900/70 border border-white/10 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-[#c28e3a] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-1">
            <button
              onClick={() => handleReject(item.id)}
              disabled={!!actionLoading[item.id]}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-bold uppercase rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading[item.id] === 'rejecting' ? 'Rejet…' : '✕ Rejeter'}
            </button>
            <button
              onClick={() => handleApprove(item)}
              disabled={!!actionLoading[item.id]}
              className="px-6 py-2 bg-[#c28e3a] hover:bg-[#e8b96a] text-black text-xs font-bold uppercase rounded-xl transition-colors shadow-lg disabled:opacity-50"
            >
              {actionLoading[item.id] === 'approving' ? 'Validation…' : '✓ Valider & Intégrer'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Composant Principal (Étape 9)
// ──────────────────────────────────────────────
export default function AssistantModeControl() {
  const [mode, setMode]     = useState(null);
  const [error, setError]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // RLS enabled on app_settings
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'assistant_mode')
      .single()
      .then(({ data, error: fetchErr }) => {
        if (!fetchErr && data) {
          setMode(data.value);
        } else {
          setMode('supervised');
        }
      });
  }, []);

  const changeMode = async (value) => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    // RLS enabled on app_settings
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      })
      .eq('key', 'assistant_mode');

    if (updateError) {
      setError('Modification refusée. Vérifiez vos droits administrateur.');
    } else {
      setMode(value);
      const label = MODES.find((m) => m.value === value)?.label ?? value;
      setSuccess(`Mode "${label}" activé avec succès.`);
      setTimeout(() => setSuccess(null), 3500);
    }
    setSaving(false);
  };

  if (mode === null) {
    return <p className="text-zinc-500 animate-pulse text-sm">Chargement…</p>;
  }

  const activeModeConfig = MODES.find((m) => m.value === mode);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <iconify-icon icon="mdi:robot" width="28" className="text-[#c28e3a]" />
        <div>
          <h2 className="text-xl font-heading font-black uppercase text-white">
            Mode de l'Assistant Wakkany
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Régule les réponses apportées aux joueurs à partir des connaissances validées (RAG).
          </p>
        </div>
        {activeModeConfig && (
          <span className={`ml-auto text-xs font-bold uppercase px-3 py-1 rounded-full ${activeModeConfig.badge}`}>
            <iconify-icon icon={activeModeConfig.icon} width="14" className="inline mr-1" />
            {activeModeConfig.label}
          </span>
        )}
      </div>

      {/* Sélecteur de mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((m) => {
          const isActive = mode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => changeMode(m.value)}
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

      {/* Messages d'état */}
      {error && (
        <div role="alert" className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 rounded-xl text-sm font-semibold">
          ✗ {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold">
          ✓ {success}
        </div>
      )}

      {/* File d'attente supervisée */}
      {mode === 'supervised' && (
        <div className="bg-zinc-900/40 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <iconify-icon icon="mdi:inbox-multiple" width="22" className="text-amber-400" />
            <h3 className="font-bold uppercase text-sm text-amber-400 tracking-wider">
              File d'attente — Réponses en attente de validation
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            En mode supervisé, les réponses générées par le RAG sont consignées ici. Vous pouvez les ajuster et les valider pour enrichir la base de connaissances.
          </p>
          <PendingQueue />
        </div>
      )}

      {/* Information mode auto */}
      {mode === 'auto' && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 text-sm text-emerald-300 leading-relaxed">
          <iconify-icon icon="mdi:information-outline" width="18" className="inline mr-2 align-middle" />
          <strong>Mode Automatique actif :</strong> L'assistant répond directement en consultant la base de questions approuvées. S'il ne trouve aucune correspondance, il prévient le joueur qu'il n'a pas de réponse validée, évitant ainsi toute hallucination.
        </div>
      )}
    </div>
  );
}
