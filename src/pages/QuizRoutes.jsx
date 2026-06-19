import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';
import QuizHome from '../components/quiz/QuizHome';
import QuizConfig from '../components/quiz/QuizConfig';
import PackProfile from '../components/quiz/PackProfile';
import AcademyView from '../components/AcademyView';
import { FamilyGame, GamesPage } from '../routes/lazyComponents';

export default function QuizRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/quiz" element={<QuizHome />} />
        <Route path="/quiz/config" element={<QuizConfig />} />
        <Route path="/quiz/profile" element={<PackProfile />} />
        <Route path="/quiz/play" element={<FamilyGame />} />
        <Route path="/quiz/academy" element={<AcademyView />} />
        <Route path="/quiz/games/*" element={<GamesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
