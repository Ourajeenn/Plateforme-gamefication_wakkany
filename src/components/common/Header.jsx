import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Icon from './Icons.jsx';

export default function Header({ title, subtitle, onBack }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
      <div>
        <h2 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.3em] mb-1">{subtitle}</h2>
        <h1 className="text-white text-3xl font-heading font-bold italic uppercase">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase font-bold text-[10px] tracking-widest"
          >
            <Icon name="arrowLeft" width={18} height={18} /> Retour
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="text-sm p-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition flex items-center gap-2"
          aria-label="Toggle theme"
        >
          {theme === 'default' && '✨ Default'}
          {theme === 'sombre' && '🌙 Sombre'}
          {theme === 'claire' && '🔵 Claire'}
        </button>
      </div>
    </div>
  );
}

