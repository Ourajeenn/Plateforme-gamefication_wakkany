import React from 'react';
import { Link } from 'react-router-dom';

/**
 * GameCard – affiche les informations d’un jeu / quête.
 * Props attendues :
 *   - emoji: string
 *   - title: string
 *   - description: string
 *   - link: string
 *   - popular?: boolean
 */
export default function GameCard({ emoji, title, description, link, popular = false }) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-1 hover:border-[#c28e3a]/40">
      {popular && (
        <span className="absolute right-4 top-4 rounded-full bg-[#c28e3a] px-4 py-2 text-[10px] uppercase tracking-[0.35em] font-black text-black">Populaire</span>
      )}
      <div className="mb-6">
        <span className="text-5xl block mb-4">{emoji}</span>
        <h3 className="text-2xl font-heading font-black uppercase tracking-tight text-white mb-4">{title}</h3>
        <p className="text-zinc-400 leading-7">{description}</p>
      </div>
      <Link
        to={link}
        className="inline-flex items-center justify-center rounded-2xl bg-[#c28e3a] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-[#d4a045]"
      >
        Jouer
      </Link>
    </div>
  );
}
