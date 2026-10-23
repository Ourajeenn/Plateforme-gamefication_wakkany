import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

// Lazy-loaded quiz components to lighten initial route bundle
const QuizHome = lazy(() => import('../components/quiz/QuizHome'));
const QuizModes = lazy(() => import('../components/quiz/QuizModes'));
const QuizConfig = lazy(() => import('../components/quiz/QuizConfig'));
const PackProfile = lazy(() => import('../components/quiz/PackProfile'));
const AcademyView = lazy(() => import('../components/AcademyView'));
const AdminQuestionsReview = lazy(() => import('../components/admin/AdminQuestionsReview'));
const BluffRoyal = lazy(() => import('../components/quiz/BluffRoyal'));
const HostLobby = lazy(() => import('../components/quiz/HostLobby'));
const JoinRoom = lazy(() => import('../components/quiz/JoinRoom'));

import { FamilyGame, GamesPage } from '../routes/lazyComponents';

export default function QuizRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/quiz" element={<QuizHome />} />
        <Route path="/quiz/modes" element={<QuizModes />} />
        <Route path="/quiz/config" element={<QuizConfig />} />
        <Route path="/quiz/profile" element={<PackProfile />} />
        <Route path="/quiz/play" element={<FamilyGame />} />
        <Route path="/quiz/bluff" element={<BluffRoyal />} />
        <Route path="/quiz/academy" element={<AcademyView />} />
        <Route path="/quiz/admin/questions" element={<AdminQuestionsReview />} />
        <Route path="/quiz/host" element={<HostLobby />} />
        <Route path="/quiz/join" element={<JoinRoom />} />
        <Route path="/quiz/games/*" element={<GamesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
