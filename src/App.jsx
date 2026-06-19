import { Suspense, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import ProfileSetup from './components/ProfileSetup';
import Preloader from './components/Preloader';
import NotificationToast from './components/NotificationToast';
import DashboardNav from './components/layout/DashboardNav';
import PageLoader from './components/common/PageLoader';
import ChatWidget from './components/common/ChatWidget';
import usePlayerData from './hooks/usePlayerData';
import useAuth from './hooks/useAuth';
import { signOut } from './utils/auth';
import { ACHIEVEMENTS } from './data/achievements';
import { realtime } from './utils/realtime';
import { getTotalXp } from './utils/xpHelpers';
import { getLevel } from './data/levels';
import { useSoundFX } from './hooks/useSoundFX';
import useNotifications from './hooks/useNotifications';
import { DashboardPage, QuizRoutes, GamesPage, LandingPage } from './routes/lazyComponents';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSetup = location.pathname === '/setup';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isGames = location.pathname.startsWith('/quiz/games');
  const isQuiz = location.pathname.startsWith('/quiz') && !isGames;
  const dashboardTab = isDashboard ? location.pathname.replace('/dashboard/', '') || 'profile' : 'profile';

  const {
    user, setUser, xp, setXp, unlockedSkills, setUnlockedSkills,
    completedQuests, setCompletedQuests, xpHistory,
    unlockedAchievements, setUnlockedAchievements, isLoaded,
  } = usePlayerData();
  const { isAuthenticated, authRequired, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const { addLocalNotification } = useNotifications(user);
  const [toasts, setToasts] = useState([]);
  const [flashQuests, setFlashQuests] = useState([
    { id: 'f1', title: "Anomalie de l'Aether", desc: "Une faille s'est ouverte dans le secteur 4. Stabilisez-la.", xpReward: 200, timeLeft: 300 },
  ]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const cumulativeXp = getTotalXp(unlockedSkills) + xp;
  const { playClick, playUnlock, playLevelUp } = useSoundFX();

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    addLocalNotification(type, message);
  }, [addLocalNotification]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.closest('button, a, [role="button"]')) playClick();
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [playClick]);

  useEffect(() => {
    const questTimer = setInterval(() => {
      setFlashQuests((prev) => prev.map((q) => ({ ...q, timeLeft: Math.max(0, q.timeLeft - 1) })).filter((q) => q.timeLeft > 0));
    }, 1000);
    return () => clearInterval(questTimer);
  }, []);

  useEffect(() => {
    if (!user) return;
    ACHIEVEMENTS.forEach((achievement) => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition({ user, xp, unlockedSkills, completedQuests })) {
        setUnlockedAchievements((prev) => [...prev, achievement.id]);
        addNotification('achievement', `Succès débloqué : ${achievement.title}`);
      }
    });
  }, [xp, unlockedSkills, completedQuests, user, unlockedAchievements, setUnlockedAchievements, addNotification]);

  const handleJoinClick = useCallback(() => {
    if (authRequired && !isAuthenticated) {
      navigate('/setup');
      return;
    }
    if (user) {
      navigate('/dashboard/profile');
      return;
    }
    navigate('/setup');
  }, [authRequired, isAuthenticated, user, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // ignore in local fallback mode
    }
    setUser(null);
    navigate('/');
  }, [setUser, navigate]);

  const handleProfileComplete = useCallback((userData) => {
    setUser(userData);
    navigate('/dashboard/profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setUser, navigate]);

  const handleUnlockSkill = useCallback((node) => {
    setXp((prev) => prev - node.xp);
    setUnlockedSkills((prev) => [...prev, node.id]);
    addNotification('success', `Talent débloqué : ${node.name} est maintenant actif !`);
    realtime.broadcast({
      type: 'SKILL_UNLOCK',
      user: user.name,
      clan: user.clan?.name,
      message: `a acquis le talent [${node.name}]`,
    });
  }, [user, setXp, setUnlockedSkills, addNotification]);

  const handleResetSkills = useCallback(() => {
    setUnlockedSkills([]);
    addNotification('info', 'Arbre de compétences réinitialisé.');
  }, [setUnlockedSkills, addNotification]);

  const handleCompleteQuest = useCallback((quest) => {
    const oldLevel = getLevel(cumulativeXp).level;
    setCompletedQuests((prev) => [...prev, quest.id]);
    setXp((prev) => prev + quest.xpReward);
    addNotification('xp', `+${quest.xpReward} XP gagnés !`);
    realtime.broadcast({
      type: 'QUEST_COMPLETE',
      user: user.name,
      clan: user.clan?.name,
      message: `a terminé la mission [${quest.title}] (+${quest.xpReward} XP)`,
    });
    if (getLevel(cumulativeXp + quest.xpReward).level > oldLevel) {
      playLevelUp();
      addNotification('level', `Niveau ${getLevel(cumulativeXp + quest.xpReward).level} atteint !`);
    }
  }, [cumulativeXp, user, setCompletedQuests, setXp, addNotification, playLevelUp]);

  const handleUpdateClan = useCallback((clanData) => {
    setUser((prev) => ({ ...prev, clan: clanData }));
    addNotification('info', 'Pacte du Clan scellé.');
    playLevelUp();
  }, [setUser, addNotification, playLevelUp]);

  if (isLoading || authLoading || !isLoaded) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  if (isDashboard && authRequired && (!isAuthenticated || !user)) {
    return <Navigate to="/setup" replace />;
  }

  if (isSetup) {
    return <ProfileSetup onComplete={handleProfileComplete} isAuthenticated={isAuthenticated} />;
  }

  if (isGames) {
    return (
      <Suspense fallback={<PageLoader />}>
        <GamesPage />
      </Suspense>
    );
  }

  if (isQuiz) {
    return (
      <Suspense fallback={<PageLoader />}>
        <QuizRoutes />
      </Suspense>
    );
  }

  return (
    <>
      <div className="antialiased text-white min-h-screen bg-zinc-950 animate-fade-in overflow-y-auto">
        {isDashboard ? <DashboardNav user={user} onLogout={handleLogout} /> : null}

        {isDashboard ? (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage
              user={user}
              dashboardTab={dashboardTab}
              cumulativeXp={cumulativeXp}
              xp={xp}
              unlockedSkills={unlockedSkills}
              unlockedAchievements={unlockedAchievements}
              completedQuests={completedQuests}
              xpHistory={xpHistory}
              flashQuests={flashQuests}
              setXp={setXp}
              setUnlockedAchievements={setUnlockedAchievements}
              onCompleteQuest={handleCompleteQuest}
              onUnlockSkill={handleUnlockSkill}
              onResetSkills={handleResetSkills}
              onUpdateClan={handleUpdateClan}
              playUnlock={playUnlock}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}>
            <LandingPage user={user} onJoin={handleJoinClick} />
          </Suspense>
        )}
      </div>

      <NotificationToast notifications={toasts} removeNotification={removeToast} />

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Retourner en haut de la page"
        className={`fixed bottom-24 right-8 z-[100] w-14 h-14 bg-[#c28e3a] text-black rounded-2xl shadow-2xl transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95 group ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <iconify-icon icon="lucide:arrow-up" width="24" className="relative z-10"></iconify-icon>
      </button>

      {isAuthenticated && user && <ChatWidget user={user} />}
    </>
  );
}
