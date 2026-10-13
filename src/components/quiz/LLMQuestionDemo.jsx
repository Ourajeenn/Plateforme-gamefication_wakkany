/**
 * LLM Question Generator Demo & Test Component
 */

import React, { useState, useEffect } from 'react';
import useLLMQuestionGenerator from '../../hooks/useLLMQuestionGenerator';

export default function LLMQuestionDemo() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [round, setRound] = useState(0);
  const [worldState, setWorldState] = useState({
    prosperity: 70,
    population: 1000
  });

  const {
    currentQuestion,
    loading,
    error,
    generateNextQuestion,
    generateBatch,
    generateForRound,
    generateFollowUp,
    getStats,
    reset
  } = useLLMQuestionGenerator({
    round,
    worldState,
    category: 'general'
  });

  // Load first question on mount
  useEffect(() => {
    generateForRound(0, worldState);
  }, []);

  const handleAnswerSelect = (answer) => {
    if (!answered) {
      setSelectedAnswer(answer);
      setAnswered(true);

      // Show feedback
      if (answer.isCorrect) {
        setFeedback({
          type: 'correct',
          message: `✓ Correct! +${answer.xpReward} XP`,
          consequence: answer.consequence
        });
      } else {
        setFeedback({
          type: 'wrong',
          message: `✗ Incorrect. Bonne réponse: ${currentQuestion.answers.find(a => a.isCorrect).text}`
        });
      }
    }
  };

  const handleNextQuestion = async () => {
    setSelectedAnswer(null);
    setAnswered(false);
    setFeedback(null);
    setRound(prev => prev + 1);

    // Generate follow-up based on consequence
    if (selectedAnswer?.consequence) {
      await generateFollowUp(selectedAnswer.consequence, worldState);
    } else {
      await generateForRound(round + 1, worldState);
    }
  };

  const handleBatchGeneration = async () => {
    const questions = await generateBatch(5, { category: 'history' });
    if (questions.length > 0) {
      setFeedback({
        type: 'info',
        message: `✓ Generated ${questions.length} questions successfully!`
      });
    }
  };

  const stats = getStats();

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-950 text-white p-8 rounded-2xl border border-zinc-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-[#c28e3a] mb-2">
          🤖 LLM Question Generator
        </h1>
        <p className="text-zinc-400">Test & Verification Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Round</p>
          <p className="text-2xl font-bold text-[#c28e3a]">{round}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Generated</p>
          <p className="text-2xl font-bold text-blue-400">{stats.generated}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">History</p>
          <p className="text-2xl font-bold text-green-400">{stats.inHistory}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Status</p>
          <p className="text-2xl font-bold">{loading ? '⏳' : '✓'}</p>
        </div>
      </div>

      {/* World State Controls */}
      <div className="bg-zinc-900 p-4 rounded-lg mb-8 border border-zinc-800">
        <h3 className="text-sm font-bold text-[#c28e3a] mb-3">World State</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-400">Prosperity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={worldState.prosperity}
              onChange={(e) => setWorldState({ ...worldState, prosperity: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-[#c28e3a] font-bold">{worldState.prosperity}%</p>
          </div>
          <div>
            <label className="text-xs text-zinc-400">Population</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={worldState.population}
              onChange={(e) => setWorldState({ ...worldState, population: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-[#c28e3a] font-bold">{worldState.population}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-300 p-4 rounded-lg mb-8">
          <p className="font-bold">⚠️ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <p className="text-2xl mb-3">⏳</p>
            <p className="text-zinc-400">Generating question...</p>
          </div>
        </div>
      )}

      {/* Question Display */}
      {currentQuestion && !loading && (
        <div className="space-y-6 mb-8">
          {/* Situation */}
          <div className="bg-blue-900/10 border border-blue-600/30 p-4 rounded-lg">
            <p className="text-xs text-blue-400 font-bold mb-1">SITUATION</p>
            <p className="text-blue-100">{currentQuestion.situation}</p>
          </div>

          {/* Question */}
          <div className="bg-zinc-900 p-6 rounded-lg border-l-4 border-[#c28e3a]">
            <p className="text-lg font-bold text-white mb-2">{currentQuestion.question}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-[#c28e3a]/20 text-[#c28e3a] text-xs rounded">
                {currentQuestion.difficulty}
              </span>
              <span className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs rounded">
                {currentQuestion.category}
              </span>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-2">
            {currentQuestion.answers.map((answer, idx) => {
              const isSelected = selectedAnswer?.text === answer.text;
              const isCorrect = answer.isCorrect;
              const isWrong = answered && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={answered}
                  className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                    !answered
                      ? 'bg-zinc-900 border-zinc-700 hover:border-[#c28e3a] hover:bg-zinc-800'
                      : isSelected && isCorrect
                      ? 'bg-green-900/30 border-green-600 text-green-200'
                      : isSelected && isWrong
                      ? 'bg-red-900/30 border-red-600 text-red-200'
                      : isCorrect
                      ? 'bg-green-900/20 border-green-600/50 text-green-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{answer.text}</span>
                    <span className="text-xs text-zinc-400">+{answer.xpReward} XP</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-lg border-2 ${
              feedback.type === 'correct'
                ? 'bg-green-900/20 border-green-600 text-green-200'
                : feedback.type === 'wrong'
                ? 'bg-red-900/20 border-red-600 text-red-200'
                : 'bg-blue-900/20 border-blue-600 text-blue-200'
            }`}>
              <p className="font-bold mb-1">{feedback.message}</p>
              {feedback.consequence && (
                <p className="text-xs text-opacity-80">
                  Conséquence: {feedback.consequence.description}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {answered && (
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-[#c28e3a] hover:bg-[#e8b96a] text-black font-bold py-3 px-4 rounded-lg transition-all"
              >
                Prochaine Question →
              </button>
            )}
            {!answered && (
              <button
                onClick={() => {
                  setSelectedAnswer(null);
                  setAnswered(false);
                  setFeedback(null);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800">
        <button
          onClick={() => {
            reset();
            generateForRound(0, worldState);
          }}
          className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-lg text-sm transition-all"
        >
          🔄 Réinitialiser
        </button>
        <button
          onClick={handleBatchGeneration}
          className="bg-blue-900 hover:bg-blue-800 py-2 px-4 rounded-lg text-sm transition-all"
        >
          📦 Générer Batch (5)
        </button>
        <button
          onClick={() => generateNextQuestion()}
          className="bg-[#c28e3a] hover:bg-[#e8b96a] text-black py-2 px-4 rounded-lg text-sm font-bold transition-all"
        >
          ✨ Nouvelle Question
        </button>
      </div>
    </div>
  );
}
