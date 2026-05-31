import React, { useState } from 'react';
import Button from '../common/Button';
import { checkWordMatch } from '../../utils/textHelpers';

export default function SpellingInput({ expectedWord, onCorrect, onFail, attempts }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (checkWordMatch(input, expectedWord)) {
      onCorrect(input);
    } else {
      onFail(input);
    }
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Épelez le mot ici..."
        className="bg-zinc-900 border border-white/20 text-white text-center text-2xl font-bold uppercase py-4 rounded-xl focus:outline-none focus:border-[#c28e3a] transition-colors"
        autoFocus
        autoComplete="off"
      />
      <Button type="submit" disabled={!input.trim()}>Valider l'orthographe</Button>
    </form>
  );
}
