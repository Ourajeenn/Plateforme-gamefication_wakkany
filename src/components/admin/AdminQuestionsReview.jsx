import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Button from '../common/Button';
import { BLUFF_QUESTIONS } from '../../data/bluffQuestions';

const THEMES = ['culture', 'cinema', 'animaux', 'sport', 'musique', 'rpg'];
const MODES = ['coop_meute', 'party_salon', 'raid_boss', 'bluff_royal'];
const DIFFICULTIES = ['rookie', 'hunter', 'monarque'];

export default function AdminQuestionsReview() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // null = vérification en cours

  const [theme, setTheme] = useState('rpg');
  const [mode, setMode] = useState('coop_meute');
  const [difficulty, setDifficulty] = useState('hunter');
  const [count, setCount] = useState(5);
  const [type, setType] = useState('mcq');

  const [newQuestion, setNewQuestion] = useState({
    theme: 'rpg',
    mode: 'bluff_royal',
    difficulty: 'hunter',
    type: 'bluff',
    question: '',
    answer: '',
    explanation: '',
    optionsString: ''
  });
  const [inserting, setInserting] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsAdmin(profile?.role === 'admin');
    }
    checkAdmin();
  }, []);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('ai_questions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (fetchError) setError(fetchError.message);
    else setPending(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchPending();
  }, [isAdmin, fetchPending]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();

    const { error: fnError } = await supabase.functions.invoke('generate-quiz', {
      body: { theme, mode, difficulty, count: Number(count), type },
      headers: {
        Authorization: `Bearer ${sessionData?.session?.access_token ?? ''}`,
      },
    });

    if (fnError) setError(fnError.message);
    else await fetchPending();
    setGenerating(false);
  }

  async function handleReview(id, status) {
    const { error: reviewError } = await supabase
      .from('ai_questions')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (reviewError) setError(reviewError.message);
    else setPending((prev) => prev.filter((q) => q.id !== id));
  }

  async function handleInsertDefaultBluffs() {
    setInitializing(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Vous devez être connecté pour insérer des questions.");
      setInitializing(false);
      return;
    }
    
    const rows = [];
    Object.entries(BLUFF_QUESTIONS).forEach(([th, list]) => {
      list.forEach(q => {
        rows.push({
          theme: th,
          mode: 'bluff_royal',
          difficulty: 'hunter',
          type: 'bluff',
          question: q.question,
          options: [],
          answer: q.answer,
          explanation: q.explanation || null,
          status: 'approved',
          created_by: user.id
        });
      });
    });

    const { error: insertError } = await supabase
      .from('ai_questions')
      .insert(rows);

    if (insertError) {
      setError("Erreur d'insertion (vérifiez si la politique RLS INSERT pour admin est bien déployée sur votre base de données Supabase) : " + insertError.message);
    } else {
      alert("Succès ! Questions de bluff initialisées et approuvées en base de données.");
      await fetchPending();
    }
    setInitializing(false);
  }

  async function handleCreateManual() {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setError("La question et la réponse sont requises.");
      return;
    }
    setInserting(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    
    const options = newQuestion.type === 'mcq' 
      ? newQuestion.optionsString.split(',').map(o => o.trim()).filter(Boolean)
      : [];

    const row = {
      theme: newQuestion.theme,
      mode: newQuestion.mode,
      difficulty: newQuestion.difficulty,
      type: newQuestion.type,
      question: newQuestion.question.trim(),
      options,
      answer: newQuestion.answer.trim(),
      explanation: newQuestion.explanation.trim() || null,
      status: 'approved',
      created_by: user?.id || null
    };

    const { error: insertErr } = await supabase
      .from('ai_questions')
      .insert([row]);

    if (insertErr) {
      setError("Erreur de création directe : " + insertErr.message);
    } else {
      alert("Question créée et approuvée avec succès !");
      setNewQuestion(prev => ({ ...prev, question: '', answer: '', explanation: '', optionsString: '' }));
      await fetchPending();
    }
    setInserting(false);
  }

  if (isAdmin === null) {
    return <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center">Vérification des droits…</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-400">Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#c28e3a] mb-8 uppercase tracking-widest">
        Modération des questions IA
      </h1>

      {/* Formulaire de génération */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-bold mb-4">Générer un nouveau lot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10">
            {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10">
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10">
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10">
            <option value="mcq">QCM classique</option>
            <option value="bluff">Bluff (réponse ouverte)</option>
          </select>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
          />
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? 'Génération en cours…' : 'Générer avec l\'IA'}
        </Button>
      </div>

      {/* Remplissage de démo par défaut */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-bold mb-2">Initialisation rapide (Fallback local)</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Insérez directement dans la base de données 30 questions de Bluff Royal auto-approuvées (5 par thème) extraites du dictionnaire de démonstration local.
        </p>
        <Button onClick={handleInsertDefaultBluffs} disabled={initializing} variant="secondary">
          {initializing ? "Initialisation…" : "Générer et Approuver les Questions par Défaut"}
        </Button>
      </div>

      {/* Création manuelle */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-bold mb-4">Créer une question manuellement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Thème</span>
            <select 
              value={newQuestion.theme} 
              onChange={(e) => setNewQuestion(prev => ({ ...prev, theme: e.target.value }))} 
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
            >
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Mode de Jeu</span>
            <select 
              value={newQuestion.mode} 
              onChange={(e) => setNewQuestion(prev => ({ ...prev, mode: e.target.value }))} 
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
            >
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Difficulté</span>
            <select 
              value={newQuestion.difficulty} 
              onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value }))} 
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Type de Question</span>
            <select 
              value={newQuestion.type} 
              onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value }))} 
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
            >
              <option value="bluff">Bluff (réponse ouverte)</option>
              <option value="mcq">QCM Classique</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Question</span>
            <input 
              type="text" 
              value={newQuestion.question}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Ex: Quelle est la particularité biologique du wombat ?"
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Vraie Réponse</span>
            <input 
              type="text" 
              value={newQuestion.answer}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, answer: e.target.value }))}
              placeholder="Ex: Ses crottes sont cubiques"
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
            />
          </div>

          {newQuestion.type === 'mcq' && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 font-bold uppercase">Autres Options (QCM) - Séparées par des virgules</span>
              <input 
                type="text" 
                value={newQuestion.optionsString}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, optionsString: e.target.value }))}
                placeholder="Option 2, Option 3, Option 4 (La bonne réponse sera ajoutée automatiquement)"
                className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-bold uppercase">Explication courte (Optionnel)</span>
            <textarea 
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Explications montrées lors de la révélation..."
              className="bg-zinc-800 rounded-lg px-3 py-2 border border-white/10 text-sm h-20 resize-none"
            />
          </div>
        </div>

        <Button onClick={handleCreateManual} disabled={inserting}>
          {inserting ? "Création…" : "Créer et Approuver Directement"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Liste des questions en attente */}
      <h2 className="text-lg font-bold mb-4">
        En attente de validation {!loading && `(${pending.length})`}
      </h2>

      {loading ? (
        <p className="text-zinc-500">Chargement…</p>
      ) : pending.length === 0 ? (
        <p className="text-zinc-500">Aucune question en attente.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((q) => (
            <div key={q.id} className="bg-zinc-900 border border-white/10 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs uppercase tracking-widest text-[#c28e3a]">
                  {q.theme} · {q.mode} · {q.difficulty} · {q.type === 'bluff' ? 'Bluff' : 'QCM'}
                </span>
              </div>
              <p className="font-bold mb-3">{q.question}</p>
              {q.options?.length > 0 ? (
                <ul className="grid grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt) => (
                    <li
                      key={opt}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        opt === q.answer
                          ? 'bg-green-900/40 border border-green-500/40 text-green-300'
                          : 'bg-zinc-800 border border-white/5'
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-3">
                  <span className="text-zinc-500 text-sm">Réponse : </span>
                  <span className="px-3 py-1 rounded-lg text-sm bg-green-900/40 border border-green-500/40 text-green-300">
                    {q.answer}
                  </span>
                </p>
              )}
              {q.explanation && (
                <p className="text-sm text-zinc-400 mb-4 italic">{q.explanation}</p>
              )}
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => handleReview(q.id, 'approved')}>
                  Approuver
                </Button>
                <Button variant="outline" onClick={() => handleReview(q.id, 'rejected')}>
                  Rejeter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
