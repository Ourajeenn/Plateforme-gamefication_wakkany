import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GamesGrid from '../components/GamesGrid';
import GameDetails from './GameDetails.jsx';
import Marquee from '../components/Marquee.jsx';

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-white/10 bg-zinc-900/90 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/10"
        >
          Retour
        </button>
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
        <Route path="/quiz/games" element={<GamesGrid />} />
        <Route path="/quiz/games/:slug" element={<GameDetails />} />
        <Route path="*" element={<Navigate to="/quiz/games" replace />} />
      </Routes>
    </div>
  );
}
