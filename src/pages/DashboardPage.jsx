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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-12">
        <div className="flex flex-col items-center gap-6 border-b border-white/5 pb-8 mb-8">
          <div className="w-full">
            <div className="hidden lg:flex justify-center bg-black/40 border border-white/10 p-1 rounded-xl">
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/dashboard/${tab.id}`)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${dashboardTab === tab.id ? 'bg-[#c28e3a] text-black shadow-lg shadow-orange-950/20' : 'text-zinc-500 hover:text-white'}`}
                >
                  <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="lg:hidden overflow-x-auto scrollbar-hide w-full flex justify-center">
              <div className="flex justify-center gap-2 min-w-max bg-black/40 border border-white/10 p-1 rounded-xl mx-auto">
                {DASHBOARD_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigate(`/dashboard/${tab.id}`)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${dashboardTab === tab.id ? 'bg-[#c28e3a] text-black shadow-lg shadow-orange-950/20' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full text-center mt-2">
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold italic uppercase mb-2 break-words">
              Bienvenue, <span className="text-[#c28e3a]">{user?.name}</span>
            </h1>
            <p className="text-zinc-500 font-monda uppercase text-[10px] sm:text-xs tracking-widest break-words">
              {user?.academy} // {user?.clan?.name}
            </p>
          </div>
        </div>

        <div className="py-10">
          {dashboardTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProfileView
                  user={user}
                  xp={cumulativeXp}
                  unlockedSkills={unlockedSkills}
                  unlockedAchievements={unlockedAchievements}
                  setXp={setXp}
                  setUnlockedAchievements={setUnlockedAchievements}
                />
              </div>
              <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-zinc-200 text-[10px] font-black uppercase tracking-[0.3em]">Flux d&apos;Activité en Temps Réel</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>
                <ActivityList />
              </div>
            </div>
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
              <iconify-icon icon="lucide:gamepad-2" width="64" className="text-[#c28e3a] mb-6 animate-bounce"></iconify-icon>
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
      </section>
    </div>
  );
}
