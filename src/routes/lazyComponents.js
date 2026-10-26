import { lazy } from 'react';

// Core pages
export const DashboardPage = lazy(() => import('../pages/DashboardPage'));
export const QuizRoutes = lazy(() => import('../pages/QuizRoutes'));
export const GamesPage = lazy(() => import('../pages/GamesPage'));
export const LandingPage = lazy(() => import('../pages/LandingPage'));
export const SettingsPage = lazy(() => import('../pages/SettingsPage'));
export const AdminPage = lazy(() => import('../pages/AdminPage'));

// Landing sub-pages (heavy 3D / forms / legal)
export const HistoireView = lazy(() => import('../components/HistoireView'));
export const WaitlistPage = lazy(() => import('../pages/landing/WaitlistPage'));
export const AboutPage = lazy(() => import('../pages/landing/AboutPage'));
export const ArchetypesPage = lazy(() => import('../pages/landing/ArchetypesPage'));
export const MentionsLegales = lazy(() => import('../pages/legal/MentionsLegales'));
export const PolitiqueConfidentialite = lazy(() => import('../pages/legal/PolitiqueConfidentialite'));

// Dashboard & common features
export const StatsPanel = lazy(() => import('../components/StatsPanel'));
export const FamilyGame = lazy(() => import('../components/quiz/FamilyGame'));
export const SkillTree = lazy(() => import('../components/SkillTree'));
export const AvatarCarousel = lazy(() => import('../components/AvatarCarousel'));
export const AvatarRoster = lazy(() => import('../components/AvatarCarousel').then((module) => ({ default: module.AvatarRoster })));

// Heavy sub-components
export const QuestPanel = lazy(() => import('../components/quests/QuestPanel'));
export const ClanManagement = lazy(() => import('../components/ClanManagement'));
export const Leaderboard = lazy(() => import('../components/Leaderboard'));
export const LevelEvolutionMap = lazy(() => import('../components/LevelEvolutionMap'));
export const ProfileSetup = lazy(() => import('../components/ProfileSetup'));
export const ChatWidget = lazy(() => import('../components/common/ChatWidget'));
