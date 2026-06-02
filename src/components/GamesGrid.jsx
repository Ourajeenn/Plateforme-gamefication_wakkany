import GameCard from './GameCard';
import games from '../data/anaisGames.json';

export default function GamesGrid() {
  return (
    <section className="min-h-screen bg-zinc-950 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="inline-block text-xs uppercase tracking-[0.35em] text-[#c28e3a] font-black mb-4">Deux jeux créés pour toi</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tight leading-tight">
            Choisis ton jeu, parle, joue et progresse
          </h1>

        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              emoji={game.emoji}
              title={game.title}
              description={game.description}
              link={`/jeux/${game.slug}`}
              popular={game.popular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
