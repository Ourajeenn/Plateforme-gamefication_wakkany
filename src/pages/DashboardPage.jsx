import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';
import Avatar from '../components/Avatar';
import LevelEvolutionMap from '../components/LevelEvolutionMap';
import QuestPanel from '../components/quests/QuestPanel';
import ClanManagement from '../components/ClanManagement';
import Leaderboard from '../components/Leaderboard';
import ActivityList from '../components/dashboard/ActivityList';
import PageLoader from '../components/common/PageLoader';
import { DASHBOARD_TABS } from '../constants/dashboardTabs';
import { getDominantBranch } from '../utils/xpHelpers';
import { getLevel } from '../data/levels';
import { StatsPanel, SkillTree } from '../routes/lazyComponents';

export default function DashboardPage({
  user,
  dashboardTab,
  cumulativeXp,
  xp,
  unlockedSkills,
  unlockedAchievements,
  completedQuests,
  xpHistory,
  flashQuests,
  setXp,
  setUnlockedAchievements,
  onCompleteQuest,
  onUnlockSkill,
  onResetSkills,
  onUpdateClan,
  playUnlock,
}) {
  const navigate = useNavigate();

  return (
    <div className="pt-20 min-h-screen bg-zinc-950">
      {/* Premium hero banner */}
      <div className="relative w-full overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(194,142,58,0.12)_0%,transparent_65%)] pointer-events-none" />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">

          {/* Titre du tableau de bord */}
          <div className="w-full text-center mb-8 animate-fade-in">
            <p className="text-[#c28e3a] text-[9px] font-black uppercase tracking-[0.4em] mb-3">Tableau de Bord</p>
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold italic uppercase mb-2">
              Bienvenue, <span className="text-[#c28e3a]">{user?.name}</span>
            </h1>
            <p className="text-zinc-500 font-monda uppercase text-[10px] sm:text-xs tracking-widest">
              {user?.academy} · {user?.clan?.name}
            </p>
            <div className="mt-4 w-16 h-px bg-gradient-to-r from-transparent via-[#c28e3a]/60 to-transparent mx-auto" />
          </div>

          {/* Navigation tabs — desktop : grille flexible */}
          <div className="hidden md:flex flex-wrap justify-center gap-1.5 bg-black/50 border border-white/10 backdrop-blur-sm rounded-2xl p-2">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(`/dashboard/${tab.id}`)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                  dashboardTab === tab.id
                    ? 'bg-[#c28e3a] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Navigation tabs — mobile : scroll horizontal */}
          <div className="md:hidden w-full overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max mx-auto bg-black/50 border border-white/10 rounded-2xl p-2.5">
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/dashboard/${tab.id}`)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    dashboardTab === tab.id
                      ? 'bg-[#c28e3a] text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

        </section>
      </div>


        <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
          {dashboardTab === 'profile' && (
            <ProfileView
              user={user}
              xp={cumulativeXp}
              unlockedSkills={unlockedSkills}
              unlockedAchievements={unlockedAchievements}
              setXp={setXp}
              setUnlockedAchievements={setUnlockedAchievements}
            />
          )}

          {dashboardTab === 'avatar' && (
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 sm:gap-12 py-6 sm:py-10 px-4">
              <h2 className="text-white text-2xl sm:text-4xl font-heading font-black italic uppercase text-center">VOTRE RÉALITÉ VISUELLE</h2>
              <div className="bg-zinc-900 border border-white/10 p-6 sm:p-10 lg:p-20 rounded-[32px] sm:rounded-[48px] lg:rounded-[60px] shadow-2xl relative group w-full overflow-hidden">
                <div className="absolute inset-0 bg-[#c28e3a]/10 blur-[120px] opacity-20 animate-pulse"></div>
                <div className="flex justify-center items-center relative z-10 scale-[1.05] sm:scale-[1.7] lg:scale-[2.5] origin-center">
                  <Avatar xp={cumulativeXp} unlockedSkills={unlockedSkills} />
                </div>
              </div>
            </div>
          )}

          {dashboardTab === 'quiz' && (
            <div className="text-center py-20 flex flex-col items-center">
              <iconify-icon icon="mdi:gamepad-2" width="64" className="text-[#c28e3a] mb-6 animate-bounce"></iconify-icon>
              <h2 className="text-3xl font-heading font-black italic uppercase mb-4">L&apos;Arène du Savoir</h2>
              <button
                onClick={() => navigate('/quiz')}
                className="px-8 py-4 bg-[#c28e3a] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all"
              >
                Lancer le Salon Quiz
              </button>
            </div>
          )}

          {dashboardTab === 'quests' && (
            <QuestPanel
              xp={cumulativeXp}
              unlockedSkills={unlockedSkills}
              completedQuests={completedQuests}
              onCompleteQuest={onCompleteQuest}
              flashQuests={flashQuests}
            />
          )}

          {dashboardTab === 'stats' && (
            <Suspense fallback={<PageLoader />}>
              <StatsPanel xp={cumulativeXp} unlockedSkills={unlockedSkills} xpHistory={xpHistory} />
            </Suspense>
          )}

          {dashboardTab === 'map' && (
            <div className="animate-fade-in">
              <LevelEvolutionMap xp={cumulativeXp} />
            </div>
          )}

          {dashboardTab === 'skills' && (
            <Suspense fallback={<PageLoader />}>
              <SkillTree
                xp={xp}
                unlockedSkills={unlockedSkills}
                onUnlock={(node) => { onUnlockSkill(node); playUnlock(); }}
                onReset={onResetSkills}
              />
            </Suspense>
          )}

          {dashboardTab === 'clans' && (
            <ClanManagement user={user} onUpdateClan={onUpdateClan} />
          )}

          {dashboardTab === 'rankings' && (
            <Leaderboard currentUser={{
              ...user,
              xp: cumulativeXp,
              level: getLevel(cumulativeXp).level,
              dominant: getDominantBranch(unlockedSkills),
            }}
            />
          )}
      </div>
    </div>
  );
}

