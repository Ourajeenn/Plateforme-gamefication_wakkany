import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import Button from '../common/Button';

import { BLUFF_QUESTIONS } from '../../data/bluffQuestions';

const ROUNDS_PER_GAME = 5;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function BluffRoyal() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location?.state?.config || { players: ['Chasseur 1', 'Chasseur 2'], theme: 'rpg' };
  const players = config.players?.length >= 2 ? config.players : ['Chasseur 1', 'Chasseur 2'];

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roundIndex, setRoundIndex] = useState(0);
  // phase: 'pass-collect' | 'collect' | 'pass-vote' | 'vote' | 'results' | 'gameover'
  const [phase, setPhase] = useState('pass-collect');
  const [playerCursor, setPlayerCursor] = useState(0);
  const [bluffs, setBluffs] = useState({});     // { playerName: text }
  const [votes, setVotes] = useState({});       // { playerName: chosenAnswerText }
  const [bluffInput, setBluffInput] = useState('');
  const [scores, setScores] = useState(() => Object.fromEntries(players.map((p) => [p, 0])));

  const currentQuestion = questions[roundIndex];

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const currentTheme = config.theme || 'rpg';
      
      try {
        const { data, error: fetchError } = await supabase
          .from('ai_questions')
          .select('*')
          .eq('type', 'bluff')
          .eq('status', 'approved')
          .eq('theme', currentTheme)
          .limit(ROUNDS_PER_GAME * 2);

        if (fetchError || !data || data.length === 0) {
          // Utilisation du fallback local si vide ou erreur
          console.log("Utilisation des questions de bluff locales en fallback pour le thème:", currentTheme);
          const localSet = BLUFF_QUESTIONS[currentTheme] || BLUFF_QUESTIONS['rpg'];
          setQuestions(shuffle(localSet).slice(0, ROUNDS_PER_GAME));
        } else {
          setQuestions(shuffle(data).slice(0, ROUNDS_PER_GAME));
        }
      } catch (err) {
        console.warn("Erreur fetch, bascule sur les questions locales :", err);
        const localSet = BLUFF_QUESTIONS[currentTheme] || BLUFF_QUESTIONS['rpg'];
        setQuestions(shuffle(localSet).slice(0, ROUNDS_PER_GAME));
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const votingOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const allBluffs = Object.values(bluffs);
    const pool = [...new Set([currentQuestion.answer, ...allBluffs])];
    return shuffle(pool);
  }, [currentQuestion, bluffs]);

  const submitBluff = useCallback(() => {
    if (!bluffInput.trim()) return;
    setBluffs((prev) => ({ ...prev, [players[playerCursor]]: bluffInput.trim() }));
    setBluffInput('');
    if (playerCursor + 1 < players.length) {
      setPlayerCursor(playerCursor + 1);
      setPhase('pass-collect');
    } else {
      setPlayerCursor(0);
      setPhase('pass-vote');
    }
  }, [bluffInput, playerCursor, players]);

  const submitVote = useCallback((choice) => {
    const voter = players[playerCursor];
    const isLastVoter = playerCursor + 1 >= players.length;

    setVotes((prev) => {
      const next = { ...prev, [voter]: choice };

      if (isLastVoter) {
        // Calcul des scores une fois tous les votes connus
        setScores((prevScores) => {
          const updated = { ...prevScores };
          Object.entries(next).forEach(([voterName, chosen]) => {
            if (chosen === currentQuestion.answer) {
              updated[voterName] = (updated[voterName] || 0) + 1000;
            }
          });
          Object.entries(bluffs).forEach(([author, bluffText]) => {
            const foolCount = Object.values(next).filter((v) => v === bluffText).length;
            updated[author] = (updated[author] || 0) + foolCount * 500;
          });
          return updated;
        });
      }
      return next;
    });

    if (!isLastVoter) {
      setPlayerCursor(playerCursor + 1);
      setPhase('pass-vote');
    } else {
      setPhase('results');
    }
  }, [playerCursor, players, bluffs, currentQuestion]);

  function nextRound() {
    if (roundIndex + 1 < questions.length) {
      setRoundIndex(roundIndex + 1);
      setBluffs({});
      setVotes({});
      setPlayerCursor(0);
      setPhase('pass-collect');
    } else {
      setPhase('gameover');
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center">Préparation de l'arène…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={() => navigate('/quiz')}>Retour au QG</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      {/* Bouton retour persistant */}
      <button
        onClick={() => navigate('/quiz')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all text-sm backdrop-blur-sm"
        title="Retour au QG"
      >
        <iconify-icon icon="mdi:arrow-left" width="16" />
        Quitter
      </button>

      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8 text-sm text-zinc-500 uppercase tracking-widest">
          <span>Manche {roundIndex + 1}/{questions.length}</span>
          <span className="text-[#c28e3a] font-bold">Bluff Royal</span>
        </div>

        {phase === 'pass-collect' && (
          <PassScreen
            player={players[playerCursor]}
            instruction="invente une fausse réponse crédible"
            onReady={() => setPhase('collect')}
          />
        )}

        {phase === 'collect' && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#c28e3a] mb-2">{players[playerCursor]}</p>
            <h2 className="text-2xl font-bold mb-8">{currentQuestion.question}</h2>
            <input
              autoFocus
              value={bluffInput}
              onChange={(e) => setBluffInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitBluff()}
              placeholder="Ta fausse réponse la plus convaincante…"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-center mb-6 focus:outline-none focus:border-[#c28e3a]"
            />
            <Button onClick={submitBluff} disabled={!bluffInput.trim()}>Valider mon bluff</Button>
          </div>
        )}

        {phase === 'pass-vote' && (
          <PassScreen
            player={players[playerCursor]}
            instruction="trouve la vraie réponse parmi les bluffs"
            onReady={() => setPhase('vote')}
          />
        )}

        {phase === 'vote' && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#c28e3a] mb-2">{players[playerCursor]}</p>
            <h2 className="text-2xl font-bold mb-8">{currentQuestion.question}</h2>
            <div className="grid gap-3">
              {votingOptions
                .filter((opt) => opt !== bluffs[players[playerCursor]]) // pas de vote pour son propre bluff
                .map((opt) => (
                  <button
                    key={opt}
                    onClick={() => submitVote(opt)}
                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 hover:border-[#c28e3a] transition-colors"
                  >
                    {opt}
                  </button>
                ))}
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#c28e3a] mb-4">Vraie réponse : {currentQuestion.answer}</h2>
            {currentQuestion.explanation && (
              <p className="text-zinc-400 italic mb-6">{currentQuestion.explanation}</p>
            )}
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 mb-6 text-left">
              {Object.entries(bluffs).map(([author, text]) => (
                <p key={author} className="text-sm mb-1">
                  <span className="text-[#c28e3a] font-bold">{author}</span> a proposé : "{text}"
                </p>
              ))}
            </div>
            <ScoreBoard scores={scores} />
            <Button onClick={nextRound} className="mt-6">
              {roundIndex + 1 < questions.length ? 'Manche suivante' : 'Voir le classement final'}
            </Button>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#c28e3a] mb-6 uppercase">Fin de partie</h2>
            <ScoreBoard scores={scores} highlightWinner />
            <Button onClick={() => navigate('/quiz')} className="mt-6">Retour au QG</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PassScreen({ player, instruction, onReady }) {
  return (
    <div className="text-center py-16">
      <p className="text-zinc-500 mb-2 uppercase tracking-widest text-xs">Passe l'appareil à</p>
      <h2 className="text-3xl font-bold text-[#c28e3a] mb-4">{player}</h2>
      <p className="text-zinc-400 mb-8">{instruction}</p>
      <Button onClick={onReady}>C'est bon, j'ai l'appareil</Button>
    </div>
  );
}

function ScoreBoard({ scores, highlightWinner = false }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0]?.[1];
  return (
    <div className="space-y-2">
      {sorted.map(([name, score]) => (
        <div
          key={name}
          className={`flex justify-between px-4 py-2 rounded-lg ${
            highlightWinner && score === topScore
              ? 'bg-[#c28e3a]/20 border border-[#c28e3a]/50'
              : 'bg-zinc-900 border border-white/5'
          }`}
        >
          <span>{name}</span>
          <span className="font-bold">{score} pts</span>
        </div>
      ))}
    </div>
  );
}
