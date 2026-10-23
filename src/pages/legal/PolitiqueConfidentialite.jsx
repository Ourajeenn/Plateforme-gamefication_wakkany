import { motion } from 'framer-motion';

export default function PolitiqueConfidentialite({ onBack }) {
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
            Protection des Données Personnelles (RGPD)
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-black italic uppercase text-white mt-1">
            Politique de Confidentialité
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
        {/* Intro RGPD */}
        <section className="bg-[#c28e3a]/10 border border-[#c28e3a]/30 rounded-2xl p-6 sm:p-8 space-y-2">
          <p className="font-bold text-[#fcd34d] uppercase text-xs tracking-wider">
            Notre engagement de transparence
          </p>
          <p className="text-zinc-200 text-sm">
            Wakkany respecte scrupuleusement la vie privée de ses joueurs. Conformément au Règlement Général sur la Protection des Données (RGPD n° 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, nous appliquons le principe de <strong>minimisation des données</strong> : nous ne collectons que ce qui est strictement nécessaire pour faire fonctionner le jeu et sauvegarder votre progression.
          </p>
        </section>

        {/* Section 1 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:database-eye" width="20" />
            1. Données collectées
          </h2>
          <p>Dans le cadre de l&apos;utilisation de Wakkany, les données suivantes peuvent être traitées :</p>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-400 text-xs sm:text-sm">
            <li><strong>Données d&apos;identité et de compte :</strong> pseudonyme de joueur (Nom de guerre), adresse email, mot de passe chiffré (hashé avec bcrypt).</li>
            <li><strong>Données de jeu et progression :</strong> points d&apos;expérience (XP), niveau, compétences débloquées, quêtes accomplies, faction/clan sélectionné, badges obtenus.</li>
            <li><strong>Statistiques de parties :</strong> scores dans les salons de quiz, temps de réponse moyen, historique d&apos;épreuves.</li>
            <li><strong>Données techniques locales (PWA) :</strong> mise en cache des sons, images et état hors-ligne stocké localement dans votre navigateur (IndexedDB / localStorage).</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:target" width="20" />
            2. Finalités & Base Légale
          </h2>
          <p>Vos données sont collectées pour des objectifs précis :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-white uppercase">Gestion du compte de jeu</span>
              <p className="text-zinc-400">Permettre la connexion, la reprise de session et la synchronisation multiverselle.</p>
              <span className="text-[10px] text-[#c28e3a]">Base légale : Exécution contractuelle</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-white uppercase">Classements & Multijoueur</span>
              <p className="text-zinc-400">Affichage de votre clan et de votre rang dans le tableau des meneurs.</p>
              <span className="text-[10px] text-[#c28e3a]">Base légale : Intérêt légitime</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-white uppercase">Mode Hors-ligne (PWA)</span>
              <p className="text-zinc-400">Sauvegarde temporaire dans l&apos;appareil pour jouer sans connexion Internet.</p>
              <span className="text-[10px] text-[#c28e3a]">Base légale : Consentement local</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-white uppercase">Sécurité & Anti-triche</span>
              <p className="text-zinc-400">Limitation du débit (rate limiting) pour protéger l&apos;Arène et les serveurs.</p>
              <span className="text-[10px] text-[#c28e3a]">Base légale : Intérêt légitime</span>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:cookie" width="20" />
            3. Cookies & Traqueurs Tiers
          </h2>
          <p>
            <strong>Wakkany n&apos;utilise AUCUN cookie publicitaire, commercial ou traqueur tiers (Google Analytics, Meta Pixel, etc.).</strong>
          </p>
          <p className="text-zinc-400 text-xs">
            Seuls des témoins techniques de session et le cache PWA (Service Worker) nécessaires au bon fonctionnement de la plateforme et à la persistance de votre volume audio sont stockés dans votre navigateur.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:account-lock" width="20" />
            4. Vos Droits & Exercice
          </h2>
          <p>
            Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs sm:text-sm">
            <li><strong>Droit d&apos;accès et de rectification :</strong> consulter et modifier votre nom, clan ou informations de profil.</li>
            <li><strong>Droit à l&apos;effacement (droit à l&apos;oubli) :</strong> suppression définitive de votre compte et de toutes vos statistiques associées.</li>
            <li><strong>Droit à la portabilité :</strong> exporter vos données de progression dans un format structuré.</li>
            <li><strong>Droit d&apos;opposition :</strong> vous opposer à tout moment au traitement de vos données.</li>
          </ul>
          <p className="text-xs pt-2">
            Pour exercer l&apos;un de ces droits, envoyez un simple courriel à :{' '}
            <a href="mailto:privacy@wakkany.fr" className="text-[#c28e3a] font-bold hover:underline">
              privacy@wakkany.fr
            </a>
            . Nous vous répondrons dans un délai maximal de 30 jours.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-heading font-bold uppercase text-[#c28e3a] flex items-center gap-2">
            <iconify-icon icon="mdi:timer-sand" width="20" />
            5. Durée de conservation & Sécurité
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Les données de compte inactif sont conservées pour une durée maximale de 24 mois après la dernière session de jeu, sauf demande expresse de suppression. Les transmissions sont intégralement chiffrées de bout en bout via le protocole TLS 1.3 / HTTPS. Les bases de données Supabase sont protégées par des politiques de sécurité strictes au niveau des lignes (Row-Level Security / RLS).
          </p>
        </section>
      </div>

      <div className="mt-12 text-center text-xs text-zinc-600 border-t border-white/5 pt-6">
        Dernière mise à jour : 23 Octobre 2026 · Conforme RGPD · Wakkany
      </div>
    </motion.main>
  );
}
