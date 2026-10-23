import { motion } from 'framer-motion';

export default function MentionsLegales({ onBack }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-zinc-950 text-white font-monda pt-24 pb-20 px-5 sm:px-8 max-w-4xl mx-auto"
    >
      {/* Header & Back */}
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <span className="text-[#c28e3a] text-[10px] font-black uppercase tracking-[0.3em]">
            Informations Légales & Réglementaires
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-black italic uppercase text-white mt-1">
            Mentions Légales
          </h1>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-[#c28e3a] transition-all"
          >
            <iconify-icon icon="mdi:arrow-left" width="16" />
            <span>Retour</span>
          </button>
        )}
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-300">
        {/* Section 1 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:domain" width="20" />
            1. Éditeur de la Plateforme
          </h2>
          <p>
            La plateforme web interactive et le jeu ludo-éducatif <strong>Wakkany</strong> sont édités par l&apos;équipe du projet Wakkany.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs sm:text-sm">
            <li><strong>Dénomination :</strong> Wakkany Multiverse Studio</li>
            <li><strong>Forme juridique :</strong> Projet indépendant en cours d&apos;immatriculation</li>
            <li><strong>Directeur de la publication :</strong> L&apos;équipe fondatrice Wakkany</li>
            <li><strong>Contact électronique :</strong> <a href="mailto:contact@wakkany.fr" className="text-[#c28e3a] hover:underline">contact@wakkany.fr</a></li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:server-network" width="20" />
            2. Hébergement & Infrastructure
          </h2>
          <p>
            La plateforme Wakkany, ses données de jeu et ses fonctions d&apos;intelligence artificielle sont hébergées auprès d&apos;infrastructures cloud hautement sécurisées :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">Hébergement Web & Edge</p>
              <p className="text-zinc-400">Vercel Inc. / GitHub Pages</p>
              <p className="text-zinc-500">440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#c28e3a] hover:underline block pt-1">vercel.com</a>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">Base de Données & Authentification</p>
              <p className="text-zinc-400">Supabase Inc. (Région Europe - Francfort)</p>
              <p className="text-zinc-500">Infrastructure conforme RGPD & SOC 2 Type II</p>
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#c28e3a] hover:underline block pt-1">supabase.com</a>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:shield-sword" width="20" />
            3. Propriété Intellectuelle & Lore
          </h2>
          <p>
            L&apos;ensemble des composantes graphiques, sonores, littéraires et logicielles composant l&apos;univers Wakkany (comprenant le nom, le logo, les illustrations des bêtes de l&apos;Akméda, les clans, les factions, les textes de quêtes et le système de règles de jeu) sont protégés par le Code de la Propriété Intellectuelle et le droit d&apos;auteur international.
          </p>
          <p className="text-zinc-400 text-xs">
            Toute reproduction, représentation, modification ou diffusion, intégrale ou partielle, de ces contenus sans l&apos;autorisation préalable écrite de l&apos;éditeur est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:scale-balance" width="20" />
            4. Responsabilités & Disponibilité
          </h2>
          <p>
            L&apos;éditeur met en œuvre tous les moyens raisonnables pour assurer un accès continu et de qualité à la plateforme. Cependant, la responsabilité de l&apos;éditeur ne saurait être engagée en cas d&apos;interruption technique temporaire, de maintenance programmée, de défaillance du réseau Internet ou de force majeure.
          </p>
          <p className="text-zinc-400 text-xs">
            Les questions éducatives et le contenu généré par intelligence artificielle (modèles RAG et quiz) sont fournis à titre de divertissement et de stimulation intellectuelle. L&apos;équipe veille à la pertinence et à l&apos;exactitude des connaissances validées dans l&apos;Arène.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center text-xs text-zinc-600 border-t border-white/5 pt-6">
        Dernière mise à jour légale : Octobre 2026 · Wakkany Multiverse · Tous droits réservés.
      </div>
    </motion.main>
  );
}
