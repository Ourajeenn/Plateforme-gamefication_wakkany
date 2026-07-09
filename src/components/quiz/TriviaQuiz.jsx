import React, { useEffect, useState } from 'react';

// Props: setXp (function) to award XP, optional xpPerCorrect (default 10)
export default function TriviaQuiz({ setXp, xpPerCorrect = 10 }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  // Fetch 10 questions from OpenTDB
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const resp = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await resp.json();
        if (data.results) {
          // Transform each question: decode HTML entities, shuffle answers
          const transformed = data.results.map(q => {
            const decode = (html) => new DOMParser().parseFromString(html, 'text/html').documentElement.textContent;
            const correct = decode(q.correct_answer);
            const incorrect = q.incorrect_answers.map(decode);
            const all = [...incorrect, correct];
            // Shuffle answers
            for (let i = all.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [all[i], all[j]] = [all[j], all[i]];
            }
            return {
              question: decode(q.question),
              correct,
              options: all,
            };
          });
          setQuestions(transformed);
        }
      } catch (e) {
        console.error('Failed to fetch trivia questions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (option) => {
    if (selected !== null) return; // prevent double click
    setSelected(option);
    const isCorrect = option === questions[currentIdx].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    // Reveal answer briefly then move on
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
        setSelected(null);
      } else {
        // Quiz finished
        setShowResult(true);
      }
    }, 1500);
  };

  const claimReward = () => {
    const earned = score * xpPerCorrect;
    if (setXp) {
      setXp(prev => prev + earned);
    }
    // Reset for next play
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setLoading(true);
    setShowResult(false);
    // Re-fetch questions
    const fetchAgain = async () => {
      try {
        const resp = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await resp.json();
        if (data.results) {
          const transformed = data.results.map(q => {
            const decode = (html) => new DOMParser().parseFromString(html, 'text/html').documentElement.textContent;
            const correct = decode(q.correct_answer);
            const incorrect = q.incorrect_answers.map(decode);
            const all = [...incorrect, correct];
            for (let i = all.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [all[i], all[j]] = [all[j], all[i]];
            }
            return { question: decode(q.question), correct, options: all };
          });
          setQuestions(transformed);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAgain();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-zinc-400">
        <span className="animate-pulse">Chargement des questions...</span>
      </div>
    );
  }

  if (showResult) {
    const earnedXp = score * xpPerCorrect;
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
        <h2 className="text-3xl font-heading font-black uppercase text-[#c28e3a]">Quiz terminé !</h2>
        <p className="text-xl text-zinc-200">Score : {score} / {questions.length}</p>
        <p className="text-lg text-purple-300">XP gagné : {earnedXp}</p>
        <button
          onClick={claimReward}
          className="px-6 py-2 bg-[#c28e3a] text-black font-heading font-bold uppercase rounded-lg hover:bg-white transition-colors"
        >
          Réclamer XP
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];
  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/60 border border-purple-500/20 rounded-2xl shadow-xl">
      <h3 className="text-xl font-heading font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: q.question }} />
      <ul className="space-y-3">
        {q.options.map((opt, i) => (
          <li key={i}>
            <button
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors 
                ${selected === null ? 'bg-zinc-800 hover:bg-zinc-700' : ''}
                ${selected && opt === q.correct ? 'bg-green-600 text-white' : ''}
                ${selected && opt !== q.correct ? 'bg-red-600 text-white' : ''}`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

