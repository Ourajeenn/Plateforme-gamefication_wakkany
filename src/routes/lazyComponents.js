import { lazy } from 'react';

/**
 * lazyWithRetry — Tente de charger un composant dynamique.
 * Si le composant échoue (ex: chunk renommé après déploiement Netlify/Vercel),
 * purge le cache et recharge la page une fois automatiquement pour charger les nouveaux bundles.
 */
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const hasRetried = sessionStorage.getItem('chunk_retry_in_progress');
    try {
      const component = await componentImport();
      sessionStorage.removeItem('chunk_retry_in_progress');
      return component;
    } catch (error) {
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError && !hasRetried) {
        console.warn('[Vite] Chunk obsolète détecté, rechargement automatique...', error);
        sessionStorage.setItem('chunk_retry_in_progress', 'true');
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          } catch {
            /* ignore cache deletion error */
          }
        }
        window.location.reload();
        return new Promise(() => {}); // Suspend jusqu'au reload
      }
      throw error;
    }
  });
}

// Core pages
export const DashboardPage = lazyWithRetry(() => import('../pages/DashboardPage'));
export const QuizRoutes = lazyWithRetry(() => import('../pages/QuizRoutes'));
export const GamesPage = lazyWithRetry(() => import('../pages/GamesPage'));
export const LandingPage = lazyWithRetry(() => import('../pages/LandingPage'));
export const SettingsPage = lazyWithRetry(() => import('../pages/SettingsPage'));
export const AdminPage = lazyWithRetry(() => import('../pages/AdminPage'));

// Landing sub-pages (heavy 3D / forms / legal)
export const HistoireView = lazyWithRetry(() => import('../components/HistoireView'));
export const WaitlistPage = lazyWithRetry(() => import('../pages/landing/WaitlistPage'));
export const AboutPage = lazyWithRetry(() => import('../pages/landing/AboutPage'));
export const ArchetypesPage = lazyWithRetry(() => import('../pages/landing/ArchetypesPage'));
export const MentionsLegales = lazyWithRetry(() => import('../pages/legal/MentionsLegales'));
export const PolitiqueConfidentialite = lazyWithRetry(() => import('../pages/legal/PolitiqueConfidentialite'));

// Dashboard & common features
export const StatsPanel = lazyWithRetry(() => import('../components/StatsPanel'));
export const FamilyGame = lazyWithRetry(() => import('../components/quiz/FamilyGame'));
export const SkillTree = lazyWithRetry(() => import('../components/SkillTree'));
export const AvatarCarousel = lazyWithRetry(() => import('../components/AvatarCarousel'));
export const AvatarRoster = lazyWithRetry(() =>
  import('../components/AvatarCarousel').then((module) => ({ default: module.AvatarRoster }))
);

// Heavy sub-components
export const QuestPanel = lazyWithRetry(() => import('../components/quests/QuestPanel'));
export const ClanManagement = lazyWithRetry(() => import('../components/ClanManagement'));
export const Leaderboard = lazyWithRetry(() => import('../components/Leaderboard'));
export const LevelEvolutionMap = lazyWithRetry(() => import('../components/LevelEvolutionMap'));
export const ProfileSetup = lazyWithRetry(() => import('../components/ProfileSetup'));
export const ChatWidget = lazyWithRetry(() => import('../components/common/ChatWidget'));
