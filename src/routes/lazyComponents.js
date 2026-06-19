import { lazy } from 'react';

export const DashboardPage = lazy(() => import('../pages/DashboardPage'));
export const QuizRoutes = lazy(() => import('../pages/QuizRoutes'));
export const GamesPage = lazy(() => import('../pages/GamesPage'));
export const LandingPage = lazy(() => import('../pages/LandingPage'));

export const StatsPanel = lazy(() => import('../components/StatsPanel'));
export const FamilyGame = lazy(() => import('../components/quiz/FamilyGame'));
export const SkillTree = lazy(() => import('../components/SkillTree'));
export const AvatarCarousel = lazy(() => import('../components/AvatarCarousel'));
