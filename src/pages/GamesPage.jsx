import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GamesGrid from '../components/GamesGrid';
import GameDetails from './GameDetails.jsx';
import Marquee from '../components/Marquee.jsx';

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-white/10 bg-zinc-900/90 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/10"
          >
            Retour
          </button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#c28e3a] font-black">Anaïs Living</p>
            <p className="text-xs text-zinc-400">Section Jeux intégrée dans Wakkany</p>
          </div>
        </div>
      </div>

      <Marquee
        messages={[
          'Choisis ton jeu',
          'Parle',
          'Joue',
          'Progresse',
          'Jeux vocaux pour mieux t’exprimer',
        ]}
      />

      <Routes>
        <Route path="/jeux" element={<GamesGrid />} />
        <Route path="/jeux/:slug" element={<GameDetails />} />
        <Route path="/quiz/games" element={<GamesGrid />} />
        <Route path="/quiz/games/:slug" element={<GameDetails />} />
        <Route path="*" element={<Navigate to="/jeux" replace />} />
      </Routes>
    </div>
  );
}
