import React from 'react';
import Button from '../common/Button';

export default function PresentationMode({ topic, timeRemaining, onFinish }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in text-center">
      <div className="mb-8">
        <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">Sujet en cours</h3>
        <h2 className="text-white text-4xl font-heading font-bold italic uppercase">{topic.title}</h2>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-full w-48 h-48 mx-auto flex items-center justify-center mb-12 shadow-2xl shadow-orange-950/20">
        <span className={`text-6xl font-heading font-black italic ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
        <h4 className="text-[#c28e3a] text-xs font-black uppercase tracking-widest mb-4">Mots-clés à placer</h4>
        <div className="flex flex-wrap gap-3 justify-center">
          {topic.keypoints.map((kp, idx) => (
            <span key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-zinc-300 font-monda">
              {kp}
            </span>
          ))}
        </div>
      </div>

      <Button onClick={() => onFinish()} className="w-full sm:w-auto">Terminer la présentation</Button>
    </div>
  );
}
