import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ProfileSetup from './components/ProfileSetup';
import ProfileView from './components/ProfileView';
import Leaderboard from './components/Leaderboard';
import Avatar from './components/Avatar';
import SkillTree from './components/SkillTree';
import LevelEvolutionMap from './components/LevelEvolutionMap';
import QuestPanel from './components/quests/QuestPanel';
import StatsPanel from './components/StatsPanel';
import ClanManagement from './components/ClanManagement';
import HistoireView from './components/HistoireView';
import BadgesView from './components/BadgesView';
import NotificationToast from './components/NotificationToast';
import TrainingCenter from './components/TrainingCenter';
import BottomNav from './components/BottomNav';
import AvatarCarousel from './components/AvatarCarousel';
import Preloader from './components/Preloader';
import usePlayerData from './hooks/usePlayerData';
import { ACHIEVEMENTS } from './data/achievements';
import { realtime } from './utils/realtime';
import { getDominantBranch, getTotalXp } from './utils/xpHelpers';
import { getLevel } from './data/levels';
import { useSoundFX } from './hooks/useSoundFX';
import GamesPage from './pages/GamesPage.jsx';

import AcademyView from './components/AcademyView';

import QuizHome from './components/quiz/QuizHome';
import QuizConfig from './components/quiz/QuizConfig';
import PackProfile from './components/quiz/PackProfile';
import FamilyGame from './components/quiz/FamilyGame';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSetup = location.pathname === '/setup';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isGames = location.pathname.startsWith('/jeux') || location.pathname.startsWith('/quiz/games');
  const isQuiz = location.pathname.startsWith('/quiz') && !location.pathname.startsWith('/quiz/games');

  const dashboardTab = isDashboard ? location.pathname.replace('/dashboard/', '') || 'profile' : 'profile';
  const view = isSetup ? 'setup' : isDashboard ? 'dashboard' : isGames ? 'games' : isQuiz ? 'quiz' : 'landing';

  const goTo = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
    navigate('/quiz');
  }, [navigate]);
  const { user, setUser, xp, setXp, unlockedSkills, setUnlockedSkills, completedQuests, setCompletedQuests, xpHistory, unlockedAchievements, setUnlockedAchievements } = usePlayerData();
  const [isLoading, setIsLoading] = useState(true);
  const cumulativeXp = getTotalXp(unlockedSkills) + xp;
  const levelData = getLevel(cumulativeXp);
  const { playClick, playUnlock, playLevelUp, playError } = useSoundFX();
  const [landingTab, setLandingTab] = useState(null); // 'waitlist', 'about', 'blog', 'archetypes'
  const [activeChar, setActiveChar] = useState('grumm');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('idle'); // 'idle', 'loading', 'success'
  const [notifications, setNotifications] = useState([]);
  const [flashQuests, setFlashQuests] = useState([
    { id: 'f1', title: 'Anomalie de l\'Aether', desc: 'Une faille s\'est ouverte dans le secteur 4. Stabilisez-la.', xpReward: 200, timeLeft: 300 }, // 5 mins
  ]);
  const dashboardTabs = [
    { id: 'profile', label: 'Évolution', icon: 'lucide:user' },
    { id: 'quests', label: 'Quêtes', icon: 'lucide:scroll' },
    { id: 'quiz', label: 'Quiz TV', icon: 'lucide:gamepad-2' },
    { id: 'avatar', label: 'Avatar', icon: 'lucide:box' },
    { id: 'stats', label: 'Stats', icon: 'lucide:bar-chart-3' },
    { id: 'map', label: 'Carte', icon: 'lucide:map' },
    { id: 'skills', label: 'Talents', icon: 'lucide:git-branch' },
    { id: 'clans', label: 'Clan', icon: 'lucide:users' },
    { id: 'rankings', label: 'Rang', icon: 'lucide:trophy' },
    { id: 'badges', label: 'Badges', icon: 'lucide:award' }
  ];

  // Gestion des notifications
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effet sonore global pour chaque clic sur un élément interactif
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Vérifie si l'élément cliqué (ou l'un de ses parents) est un bouton ou un lien
      const isClickable = e.target.closest('button, a, [role="button"]');
      if (isClickable) {
        playClick();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [playClick]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Tracking automatique des succès
  useEffect(() => {
    if (!user) return;
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id)) {
        if (achievement.condition({ user, xp, unlockedSkills, completedQuests })) {
          setUnlockedAchievements(prev => [...prev, achievement.id]);
          addNotification('achievement', `Succès débloqué : ${achievement.title}`);
        }
      }
    });
  }, [xp, unlockedSkills, completedQuests, user]);

  useEffect(() => {
    // Enregistrement du Service Worker pour la PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('SW Registered!', reg);
        }).catch(err => {
          console.log('SW Registration failed', err);
        });
      });
    }

    // Initial loading simulation removed, Preloader component handles its own timeout.

    // Flash Quest Timer
    const questTimer = setInterval(() => {
      setFlashQuests(prev => prev.map(q => ({ ...q, timeLeft: Math.max(0, q.timeLeft - 1) })).filter(q => q.timeLeft > 0));
    }, 1000);

    return () => {
      clearInterval(questTimer);
    };
  }, []);

  const handleJoinClick = () => {
    navigate('/setup');
  };

  const handleProfileComplete = (userData) => {
    setUser(userData);
    navigate('/dashboard/profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnlockSkill = (node) => {
    setXp(prev => prev - node.xp);
    setUnlockedSkills(prev => [...prev, node.id]);
    addNotification('success', `Talent débloqué : ${node.name} est maintenant actif !`);
    realtime.broadcast({
      type: 'SKILL_UNLOCK',
      user: user.name,
      clan: user.clan?.name,
      message: `a acquis le talent [${node.name}]`
    });
  };

  const handleResetSkills = () => {
    setUnlockedSkills([]);
    addNotification('info', "Arbre de compétences réinitialisé.");
  };

  const handleCompleteQuest = (quest) => {
    const oldLevel = getLevel(cumulativeXp).level;
    setCompletedQuests(prev => [...prev, quest.id]);
    setXp(prev => prev + quest.xpReward);
    addNotification('xp', `+${quest.xpReward} XP gagnés !`);
    
    realtime.broadcast({
      type: 'QUEST_COMPLETE',
      user: user.name,
      clan: user.clan?.name,
      message: `a terminé la mission [${quest.title}] (+${quest.xpReward} XP)`
    });

    if (getLevel(cumulativeXp + quest.xpReward).level > oldLevel) {
      playLevelUp();
      addNotification('level', `Niveau ${getLevel(cumulativeXp + quest.xpReward).level} atteint !`);
    }
  };

  const handleQuizPenalty = (amount) => {
    setXp(prev => Math.max(0, prev - amount));
    addNotification('error', `Erreur détectée : -${amount} XP déduits !`);
  };

  const handleUpdateClan = (clanData) => {
    setUser(prev => ({ ...prev, clan: clanData }));
    addNotification('info', "Pacte du Clan scellé.");
    playLevelUp();
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };



  const LandingNav = () => (
    <nav className="fixed top-0 left-0 w-full glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-[100] shadow-[0_18px_50px_rgba(0,0,0,0.35)]" style={{transform:'translateZ(0)', willChange:'transform'}}>
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { goTo('/'); setLandingTab(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <div className="relative">
          <iconify-icon icon="lucide:triangle" width="32" height="32" className="text-[#c28e3a] rotate-180 stroke-[1.5]"></iconify-icon>
          <div className="absolute inset-0 bg-[#c28e3a] blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
        </div>
        <span className="text-white font-heading font-bold italic tracking-tighter uppercase text-lg sm:text-xl">Wakkany</span>
      </div>

      <div className="hidden lg:flex items-center gap-10 text-white text-[11px] font-black uppercase tracking-[0.2em]">
        <button onClick={() => { goTo('/'); setLandingTab(null); scrollToSection('hero'); }} className="hover:text-[#c28e3a] transition-all hover:tracking-[0.3em]">ACCUEIL</button>
        <button onClick={() => setLandingTab('waitlist')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'waitlist' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>LISTE D'ATTENTE</button>
        <button onClick={() => navigate('/quiz')} className="text-zinc-500 hover:text-[#c28e3a] transition-all">QUIZ SALON</button>
        <button onClick={() => navigate('/jeux')} className="text-zinc-500 hover:text-[#c28e3a] transition-all">JEUX</button>
        <button onClick={() => {
          if (user) navigate('/dashboard/profile');
          else handleJoinClick();
        }} className="text-zinc-500 hover:text-white transition-all">MON PROFIL</button>
        <button onClick={() => setLandingTab('blog')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'blog' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>HISTOIRE</button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (user) navigate('/dashboard/profile');
            else handleJoinClick();
          }}
          className="hidden md:flex items-center gap-3 px-6 py-2 bg-zinc-900 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#c28e3a] hover:text-black transition-all group active:scale-95 shadow-xl"
        >
          {user && (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black flex items-center justify-center shrink-0">
               {user.faction === 'heroes' && <iconify-icon icon="lucide:shield" className="text-red-500"></iconify-icon>}
               {user.faction === 'warriors' && <iconify-icon icon="lucide:sword" className="text-orange-500"></iconify-icon>}
               {user.faction === 'dinos' && <iconify-icon icon="lucide:Zap" className="text-green-500"></iconify-icon>}
               {user.faction === 'cars' && <iconify-icon icon="lucide:gauge" className="text-blue-500"></iconify-icon>}
            </div>
          )}
          <span className="truncate max-w-[150px]">
            {user ? `${user.name}` : "Commencer"}
          </span>
        </button>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-white p-2"
          aria-label="Basculer le menu mobile"
        >
          <iconify-icon icon={isMenuOpen ? "lucide:x" : "lucide:menu"} width="24"></iconify-icon>
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed top-[60px] left-0 w-full bg-zinc-950/98 backdrop-blur-3xl border-b border-white/10 p-8 flex flex-col gap-6 animate-fade-in z-[99]">
          <button onClick={() => { goTo('/'); setLandingTab(null); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Accueil</button>
          <button onClick={() => { goTo('/'); setLandingTab('waitlist'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Liste d'attente</button>
          <button onClick={() => { handleJoinClick(); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Commencer</button>
          <button onClick={() => { navigate('/quiz'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Quiz Salon</button>
          <button onClick={() => { navigate('/jeux'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Jeux</button>
          <button onClick={() => { goTo('/'); setLandingTab('about'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">À Propos</button>
        </div>
      )}
    </nav>
  );

  const DashboardNav = () => {
    const LiveFeed = () => {
      const [events, setEvents] = useState(realtime.getEvents());

      useEffect(() => {
        const unsubscribe = realtime.subscribe((event) => {
          setEvents(prev => [event, ...prev].slice(0, 5));
        });
        return unsubscribe;
      }, []);

      return (
        <div className="hidden xl:flex items-center gap-6 bg-black/40 border border-white/5 py-2 px-6 rounded-2xl backdrop-blur-xl overflow-hidden max-w-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Flux Live</span>
          </div>
          <div className="flex-1 h-8 overflow-hidden relative">
            <div className="flex flex-col gap-1 transition-all duration-500">
              {events.length > 0 ? (
                <div key={events[0].id} className="animate-slide-up py-1">
                  <p className="text-[10px] text-zinc-400 font-monda truncate">
                    <span className="text-[#c28e3a] font-bold">{events[0].user}</span> {events[0].message}
                  </p>
                </div>
              ) : (
                <p className="text-[9px] text-zinc-700 italic py-2">En attente de nouvelles transmissions...</p>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <nav className="fixed top-0 left-0 w-full glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-[60] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 sm:gap-8 min-w-0">
          <div 
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group shrink-0" 
            onClick={() => { goTo('/'); setLandingTab(null); }}
          >
            <iconify-icon icon="lucide:triangle" width="24" height="24" className="text-[#c28e3a] rotate-180 group-hover:rotate-0 transition-transform duration-500"></iconify-icon>
            <span className="text-white font-heading font-bold tracking-widest text-base sm:text-lg italic uppercase">Wakkany</span>
          </div>
          <LiveFeed />
        </div>

        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <div className="hidden md:flex min-w-0 flex-col text-right">
            <span className="text-white font-bold text-sm leading-none truncate max-w-[10rem]">{user?.name || 'Nomade'}</span>
            <span className="text-[#c28e3a] text-[10px] uppercase font-bold tracking-widest truncate max-w-[10rem]">{user?.clan?.name || 'Clanless'}</span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#c28e3a]/40 overflow-hidden bg-zinc-900/70/70 flex items-center justify-center shrink-0">
            {user?.clan?.image ? (
              <img src={user.clan.image} className="w-full h-full object-cover" />
            ) : (
              <iconify-icon icon={user?.clan?.icon || 'lucide:user'} className="text-[#c28e3a] text-xl"></iconify-icon>
            )}
          </div>
          <button onClick={() => { setUser(null); goTo('/'); }} className="text-zinc-600 hover:text-red-500 transition-all hover:scale-110 shrink-0">
            <iconify-icon icon="solar:logout-2-linear" width="24"></iconify-icon>
          </button>
        </div>
      </nav>
    );
  };

  const WaitlistPage = () => (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setLandingTab(null)} className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-8">Join the Elite</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-zinc-400 text-xl font-monda leading-relaxed italic">
              "The Covenant may be broken, but the spirit of the pack remains. Secure your position in the upcoming trials."
            </p>
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="text-white font-bold mb-4 uppercase">Registry Requirements</h3>
              <ul className="text-zinc-200 text-sm space-y-3">
                <li>• Level 0 clearance</li>
                <li>• Minimum 100 XP aspiration</li>
                <li>• Engagement pour Wakkany</li>
              </ul>
            </div>
          </div>
          <div className="glass-panel p-10 rounded-3xl">
            {waitlistStatus === 'success' ? (
              <div className="text-center py-12 animate-scale-up">
                <iconify-icon icon="lucide:check-circle" width="64" className="text-[#c28e3a] mb-6"></iconify-icon>
                <h3 className="text-white text-2xl font-bold uppercase mb-4">Transmission Reçue</h3>
                <p className="text-zinc-500 font-monda">Votre signal a été capté. Vous serez informé dès que le portail sera stabilisé.</p>
                <button onClick={() => setWaitlistStatus('idle')} className="mt-8 text-[#c28e3a] text-xs font-bold uppercase tracking-widest border-b border-[#c28e3a]/20 hover:border-[#c28e3a] transition-all">S'inscrire à nouveau</button>
              </div>
            ) : (
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                setWaitlistStatus('loading');
                setTimeout(() => setWaitlistStatus('success'), 1500);
              }} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Adresse Arthélyonmail</label>
                  <input type="email" required className="w-full bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl text-white outline-none focus:border-[#c28e3a] transition-all" placeholder="wakkany@arthelyon.com" />
                </div>
                <button type="submit" disabled={waitlistStatus === 'loading'} className="w-full py-5 bg-[#c28e3a] text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all font-monda disabled:opacity-50">
                  {waitlistStatus === 'loading' ? 'Chiffrement...' : 'Demander l\'Accès'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const AboutPage = () => (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => setLandingTab(null)} className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-16 text-center">LE MULTIVERS WAKKANY</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { 
              title: 'La Grande Faille', 
              subtitle: 'L\'Événement Fondateur',
              desc: 'Une anomalie temporelle cataclysmique a brisé les barrières de la réalité, provoquant la fusion brutale de quatre dimensions distinctes.', 
              points: ['Légion Héroïque (Guerriers de Lumière)', 'Ordre Antique (Mages et Érudits)', 'Ère Primaire (Bêtes et Dinosaures)', 'Syndicat Mécanique (Cyborgs)'],
              icon: 'lucide:shield-check',
              color: '#3b82f6'
            },
            { 
              title: 'L\'Aether', 
              subtitle: 'Source de Pouvoir',
              desc: 'Le flux quantique, ou Aether, irrigue désormais toutes les entités du multivers. Il est la source de toute magie et de la technologie avancée.', 
              points: ['Modification de l\'ADN', 'Alimentation des Noyaux Mécaniques', 'Contrôle des Éléments', 'Évolution par l\'Expérience (XP)'],
              icon: 'lucide:sparkles',
              color: '#a855f7'
            },
            { 
              title: 'L\'Arène Éternelle', 
              subtitle: 'Le Choc des Mondes',
              desc: 'Pour éviter une guerre totale destructrice, les conflits se règlent désormais dans l\'Arène, un cycle infini de combats titanesques.', 
              points: ['Combats Inter-dimensionnels', 'Forges de Nouvelles Légendes', 'Système de Rangs et Badges', 'Conquête de Territoires'],
              icon: 'lucide:swords',
              color: '#f43f5e'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative glass-panel p-10 rounded-[32px] hover:border-[#c28e3a]/40 transition-all duration-500 group overflow-hidden flex flex-col h-full">
              {/* Background Glow */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: item.color }}
              ></div>
              
              <iconify-icon icon={item.icon} width="56" style={{ color: item.color }} className="mb-6 block group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"></iconify-icon>
              
              <div className="mb-6 flex-grow">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] block mb-2">{item.subtitle}</span>
                <h3 className="text-white text-3xl font-bold uppercase mb-4 italic font-heading tracking-tight">{item.title}</h3>
                <div className="h-px w-12 bg-white/20 mb-6 group-hover:w-full transition-all duration-700"></div>
                <p className="text-zinc-400 font-monda leading-relaxed text-sm">{item.desc}</p>
              </div>

              <ul className="space-y-3 mt-auto">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm font-monda">
                    <iconify-icon icon="lucide:check" width="16" className="text-[#c28e3a] mt-0.5 shrink-0"></iconify-icon>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 p-[1px] bg-gradient-to-r from-transparent via-[#c28e3a]/30 to-transparent">
          <div className="glass-panel p-16 text-center rounded-3xl">
            <h2 className="text-white text-3xl font-heading italic uppercase mb-6">"History is written in blood, but the future is forged in XP."</h2>
            <p className="text-zinc-200 max-w-2xl mx-auto font-monda">Plateforme Wakkany est un écosystème RPG unique où votre identité visuelle évolue avec vos compétences. Chaque choix dans l'arbre de talents se reflète sur votre avatar, rendant chaque champion unique.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // The BlogPage component is no longer used directly as it's merged into HistoireView

  const ArchetypesPage = () => (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => setLandingTab(null)} className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-16 text-center">CORE ARCHETYPES</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Fighter', role: 'Iron Legion', icon: 'lucide:swords', desc: 'Masters of steel and physical dominance. High defense and brutal close-quarters combat.', color: '#ef4444' },
            { title: 'Mage', role: 'Arcane Order', icon: 'lucide:wand-2', desc: 'Wielders of Aether essence. Devastating area attacks and reality-bending utility.', color: '#3b82f6' },
            { title: 'Rogue', role: 'Silent Veils', icon: 'lucide:skull', desc: 'Ghosts in the machine. High critical damage, stealth, and lethal precision.', color: '#a855f7' }
          ].map((item, idx) => (
            <div key={idx} className="bg-zinc-900 border border-white/5 p-12 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `radial-gradient(circle at top right, ${item.color}, transparent)` }}></div>
              <iconify-icon icon={item.icon} width="64" style={{ color: item.color }} className="mb-8 block group-hover:scale-110 transition-transform"></iconify-icon>
              <h3 className="text-white text-3xl font-heading font-bold italic uppercase mb-2">{item.title}</h3>
              <p className="text-[#c28e3a] text-xs font-bold uppercase tracking-widest mb-6">{item.role}</p>
              <p className="text-zinc-500 font-monda leading-relaxed">{item.desc}</p>
              <button
                onClick={handleJoinClick}
                className="mt-10 w-full py-4 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Select Path
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ActivityList = () => {
    const [events, setEvents] = React.useState(realtime.getEvents());

    React.useEffect(() => {
      const unsubscribe = realtime.subscribe((event) => {
        setEvents(prev => [event, ...prev].slice(0, 5));
      });
      return unsubscribe;
    }, []);

    if (events.length === 0) {
        return <p className="text-zinc-700 text-xs italic py-4">Aucune activité récente détectée sur le Nexus...</p>;
    }

    return (
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 animate-fade-in">
             <div className="w-8 h-8 rounded-lg bg-[#c28e3a]/10 flex items-center justify-center border border-[#c28e3a]/20">
                <iconify-icon icon={event.type === 'QUEST_COMPLETE' ? 'lucide:scroll' : 'lucide:git-branch'} className="text-[#c28e3a]" width="14"></iconify-icon>
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-300 truncate">
                  <span className="text-white font-bold">{event.user}</span> {event.message}
                </p>
                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{event.timestamp}</p>
             </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <Preloader onComplete={handlePreloaderComplete} />;
  if (isSetup) return <ProfileSetup onComplete={handleProfileComplete} />;
  if (isGames) return <GamesPage />;

  // Affichage du module Quiz lorsqu'on est sur la vue 'quiz'
  if (view === 'quiz') {
    return (
      // Définition des routes de l'application
      <Routes>
        {/* Route principale du quiz */}
        <Route path="/quiz" element={<QuizHome />} />
        {/* Configuration du quiz */}
        <Route path="/quiz/config" element={<QuizConfig />} />
        {/* Profil du quiz */}
        <Route path="/quiz/profile" element={<PackProfile />} />
        {/* Jeu du quiz */}
        <Route path="/quiz/play" element={<FamilyGame />} />
        {/* Accès à l'Académie */}
        <Route path="/quiz/academy" element={<AcademyView />} />
        {/* Route pour la page de jeux dédiée */}
        <Route path="/quiz/games" element={<GamesPage />} />
        {/* Rediriger les routes inconnues vers la page d'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Vue pour le jeu d'orthographe
  // Spelling view removed as per request
  // if (view === 'spelling') {
  //   return <SpellingVoiceGame />;
  // }

  return (
    <>
      <div className="antialiased text-white min-h-screen bg-zinc-950 animate-fade-in overflow-y-auto">
        {view === 'quiz' ? null : view === 'landing' ? <LandingNav /> : <DashboardNav />}

      {view === 'landing' ? (
        landingTab === 'waitlist' ? (
          <WaitlistPage />
        ) : landingTab === 'about' ? (
          <AboutPage />
        ) : landingTab === 'blog' ? (
          <div className="pt-24"><HistoireView /></div>
        ) : landingTab === 'archetypes' ? (
          <ArchetypesPage />
        ) : (
          <>
            {/* Hero Section */}
            <header id="hero" className="relative w-full h-screen overflow-hidden flex flex-col justify-end pb-10 sm:pb-24">
              <div className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden stabilize-motion">
                <iframe
                  className="video-background opacity-85 brightness-125 pointer-events-none stabilize-motion"
                  src="https://player.mux.com/01mywJGOo4l00f8YOasdq4nIXXI6vrrIIVTKtMN6PCeQM?autoplay=true&loop=true&muted=true&controls=false"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-zinc-950/80"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#09090b_70%)] opacity-60"></div>
                <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
              </div>

              <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 h-full flex flex-col pt-20 sm:pt-40">
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end w-full gap-8 lg:gap-12">
                  {/* Brand Column (H1) */}
                  <div className="text-center lg:text-right flex flex-col lg:items-end opacity-0 animate-fade-in delay-500 w-full max-w-full lg:w-auto lg:order-last">
                    <h1 className="text-white text-[clamp(2.2rem,8vw,8.75rem)] font-black italic leading-[0.8] tracking-tighter font-heading uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] w-full max-w-full break-words">
                      Wak<br />kany
                    </h1>
                    <p className="text-yellow-500 text-sm sm:text-lg lg:text-2xl mt-4 sm:mt-6 max-w-md mx-auto lg:mx-0 tracking-tight font-monda font-light italic">
                      "Votre évolution ne dépend pas du hasard, mais de vos choix."
                    </p>

                    <div className="mt-8 sm:mt-10 flex justify-center lg:justify-end flex-wrap gap-3 sm:gap-4 w-full">
                      <div className="glass-panel flex items-center py-3 px-5 sm:py-4 sm:px-6 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-zinc-300 font-black uppercase tracking-widest">Utilisateurs Actifs</span>
                          <span className="text-white font-heading font-bold italic text-xl">12,450+ </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle Column (H2) */}
                  <div className="opacity-0 animate-fade-in-up delay-200 w-full max-w-full lg:w-auto text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-[#c28e3a] mb-4">
                      <div className="h-px w-8 bg-[#c28e3a]"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Propulsé Arthélyon</span>
                    </div>
                    <h2 className="text-white text-[clamp(1.6rem,4.5vw,3.75rem)] sm:text-5xl lg:text-6xl font-black italic tracking-tighter font-heading uppercase leading-none w-full max-w-full break-words">
                      TRANSFORMEZ<br />VOTRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c28e3a] to-white">POTENTIEL</span>
                    </h2>
                  </div>
                </div>

                <div className="mt-auto mb-6 sm:mb-12 flex flex-col items-center gap-5 sm:gap-8 w-full">
                  <div className="flex flex-col items-center opacity-40">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] mb-2">Défiler vers l'Aube</span>
                    <iconify-icon icon="lucide:chevron-down" width="16"></iconify-icon>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (user) navigate('/dashboard/profile');
                      else handleJoinClick();
                    }}
                    className="relative group overflow-hidden w-full max-w-sm sm:max-w-md px-6 py-4 sm:px-16 sm:py-6 bg-white text-black font-black text-sm sm:text-xl lg:text-2xl uppercase tracking-[0.2em] font-heading italic transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(194,142,58,0.3)] rounded-2xl"
                  >
                    <span className="relative z-10 transition-colors group-hover:text-white">
                      {user ? `RETOURNER AU COMBAT, ${user.name.toUpperCase()}` : "REJOINDRE LA MEUTE"}
                    </span>
                    <div className="absolute inset-0 bg-[#c28e3a] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                  </button>
                </div>
              </div>
            </header>
            <AvatarCarousel />

            {/* Section Lore */}
            <section id="lore" className="py-16 sm:py-24 md:py-32 relative bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to bottom, rgba(21,21,21,0.85), rgba(21,21,21,0.9)), url('https://i.postimg.cc/Qtjkb1QH/bg24.png')", backgroundColor: "#151515", backgroundAttachment: 'scroll' }}>
              {/* Subtle Floating Blades framing the background */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 flex justify-between items-center px-4 md:px-12 opacity-40">
                {/* Left Blade */}
                <img src="https://i.postimg.cc/C1wHNkG1/blade2.png" alt="Left Blade" className="w-28 sm:w-40 md:w-80 object-contain animate-float-left drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                {/* Right Blade */}
                <img src="https://i.postimg.cc/Ssm7rC6K/bladepng.png" alt="Right Blade" className="w-28 sm:w-40 md:w-80 object-contain animate-float-right drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-8 sm:py-16 md:py-24">
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight font-heading uppercase mb-4 sm:mb-6">LE MONDE D'ARTHÉLYON</h2>
                <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-10 sm:mb-16 md:mb-20"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-24 text-left text-gray-300 text-base sm:text-lg md:text-2xl font-monda leading-relaxed italic">
                  <p>Avant les chaînes. Avant le silence. Il y avait une promesse entre les bêtes — jurée par le sang, scellée par l'acier.<br/><br/>Ils l'appelaient le Covenant. Un serment qui liait le renard, le tigre, le loup et une centaine de clans à une seule vérité : aucune bête ne se tient seule.</p>
                  <p className="md:text-right">Cette vérité est morte aujourd'hui. Brisée par la trahison. Enterrée sous le fer et les cendres. Les clans se sont retournés les uns contre les autres. Les vieilles forêts se sont tues. Et le dernier gardien — un renard avec une lame et une promesse qu'il refuse d'oublier — marche dans un monde qui a déjà abandonné.</p>
                </div>
              </div>
            </section>

            {/* Section Personnages (Alliés de la Covenant) */}
            <section id="characters" className="bg-white py-16 sm:py-24 md:py-32 text-center relative z-10">
              <h3 className="text-zinc-800 text-2xl sm:text-3xl font-medium tracking-tight font-heading italic mb-2">ALLIÉS DE LA</h3>
              <h2 className="text-zinc-900 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-heading italic uppercase mb-4 sm:mb-6">COVENANT</h2>
              <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-10 sm:mb-16 md:mb-20"></div>

              {/* Avatars Row */}
              <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16 md:mb-28 overflow-x-auto px-4 sm:px-6 py-4 max-w-6xl mx-auto scrollbar-hide">
                {[
                  { id: '03', name: 'Grumm', img: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=200', char: 'grumm' },
                  { id: '04', name: 'Grumm', img: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=200', char: 'grumm' },
                  { id: '05', name: 'Grumm', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200', char: 'grumm' },
                  { id: '06', name: 'Grumm', img: 'https://i.postimg.cc/qv918NDq/hippo1.png', char: 'grumm' },
                  { id: '07', name: 'Lyra', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&q=80&w=200', char: 'lyra' },
                  { id: '08', name: 'Kiko', img: 'https://i.postimg.cc/4xrWzY2N/monkey.png', char: 'kiko' },
                  { id: '09', name: 'Lyra', img: 'https://i.postimg.cc/DwtxqSpw/panda.png', char: 'lyra' },
                ].map((item, idx) => {
                  const isActive = activeChar === item.char;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveChar(item.char)}
                      className={`rounded-full overflow-hidden shrink-0 transition-all cursor-pointer bg-zinc-900 ${
                        isActive 
                          ? 'w-28 h-28 border-[3px] border-[#c28e3a] shadow-2xl scale-110 z-10 ring-4 ring-white/20' 
                          : 'w-20 h-20 border border-gray-300 filter grayscale hover:grayscale-0'
                      }`}
                    >
                      <img src={item.img} alt={`${item.name} Avatar`} className="w-full h-full object-cover object-top" />
                    </div>
                  );
                })}
              </div>

              {/* Character Profiles Grid */}
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 relative">
                
                {/* Left Character (Lyra) */}
                <div className={`flex flex-col text-left gap-5 w-full max-w-md lg:-mr-12 transition-all duration-500 ${
                  activeChar === 'lyra' 
                    ? 'z-20 scale-100 lg:scale-105 opacity-100 bg-zinc-900 text-white p-5 sm:p-8 border border-white/10 shadow-2xl relative rounded-xl' 
                    : 'z-0 opacity-70 hover:opacity-100 hover:-translate-y-2'
                }`}>
                  {activeChar === 'lyra' && <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-xl"></div>}
                  <div className="flex items-baseline gap-3 px-4">
                    <h4 className={`text-3xl font-medium tracking-tight font-heading uppercase ${activeChar === 'lyra' ? 'text-white' : 'text-zinc-800'}`}>LYRA</h4>
                    <span className={`text-lg ${activeChar === 'lyra' ? 'text-gray-400' : 'text-gray-500'}`}>/ La Dissonance</span>
                  </div>
                  <p className={`text-lg font-medium italic px-4 ${activeChar === 'lyra' ? 'text-white' : 'text-zinc-800'}`}>« Chaque bête a un chant. La plupart ne l’ont pas encore entendu. »</p>
                  
                  {activeChar === 'lyra' && (
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-2 px-4 font-monda">
                      Une mélodie dans le chaos. Lyra canalise l'énergie harmonique pour apaiser les tempêtes d'Aether ou manipuler l'esprit de ses adversaires. Toujours à la recherche des vérités oubliées.
                    </p>
                  )}
                  
                  <div className="relative w-full h-80 overflow-hidden shadow-lg border border-gray-200 bg-zinc-100">
                    <img src="https://i.postimg.cc/DwtxqSpw/panda.png" alt="Lyra" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-4">
                    <button 
                      onClick={handleJoinClick} 
                      className={`clip-card-btn px-8 py-2.5 text-base font-semibold uppercase tracking-wider transition-colors ${
                        activeChar === 'lyra' ? 'bg-[#c28e3a] text-zinc-900 hover:bg-[#d4a045]' : 'bg-zinc-900 text-white hover:bg-black'
                      }`}
                    >
                      EN SAVOIR PLUS
                    </button>
                  </div>
                </div>

                {/* Center Character (Grumm) */}
                <div className={`flex flex-col text-left w-full max-w-xl transition-all duration-500 ${
                  activeChar === 'grumm' 
                    ? 'z-20 scale-100 lg:scale-105 opacity-100 bg-zinc-900 text-white p-5 sm:p-8 border border-white/10 shadow-2xl relative rounded-xl' 
                    : 'z-0 opacity-70 hover:opacity-100 hover:-translate-y-2'
                }`}>
                  {activeChar === 'grumm' && <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-xl"></div>}
                  <div className="w-full h-[400px] relative overflow-hidden bg-zinc-800">
                    <img src="https://i.postimg.cc/qv918NDq/hippo1.png" alt="Grumm" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 bg-zinc-900 relative">
                    <div className="flex items-baseline gap-3">
                      <h4 className="text-white text-4xl font-medium tracking-tight font-heading uppercase">GRUMM</h4>
                      <span className="text-gray-400 text-xl">/ Le colosse</span>
                    </div>
                    <p className="text-white text-lg font-medium italic">« Je ne fatigue pas. Je suis la pierre. »</p>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-2 font-monda">
                      Le tremblement de terre ambulant. Grumm ne fait pas de bla-bla inutile — il arrive, et le problème cesse d’exister. Très protecteur envers quiconque est assez petit pour se tenir derrière lui, c’est-à-dire tout le monde. Ne confondez pas sa simplicité avec de la stupidité. Il sait exactement ce qu’il fait. Il s’en fiche juste que vous le sachiez aussi.
                    </p>
                    <div className="mt-4">
                      <button onClick={handleJoinClick} className="clip-card-btn px-10 py-3 bg-[#c28e3a] text-zinc-900 text-base font-semibold uppercase tracking-wider hover:bg-[#d4a045] transition-colors">EN SAVOIR PLUS</button>
                    </div>
                  </div>
                </div>

                {/* Right Character (Kiko) */}
                <div className={`flex flex-col text-right items-end gap-5 w-full max-w-md lg:-ml-12 transition-all duration-500 ${
                  activeChar === 'kiko' 
                    ? 'z-20 scale-100 lg:scale-105 opacity-100 bg-zinc-900 text-white p-5 sm:p-8 border border-white/10 shadow-2xl relative text-left items-start rounded-xl' 
                    : 'z-0 opacity-70 hover:opacity-100 hover:-translate-y-2'
                }`}>
                  {activeChar === 'kiko' && <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-xl"></div>}
                  <div className="flex items-baseline justify-end gap-3 w-full px-4">
                    <h4 className={`text-3xl font-medium tracking-tight font-heading uppercase ${activeChar === 'kiko' ? 'text-white' : 'text-zinc-800'}`}>KIKO</h4>
                    <span className={`text-lg ${activeChar === 'kiko' ? 'text-gray-400' : 'text-gray-500'}`}>/ Le saut libre</span>
                  </div>
                  <p className={`text-lg font-medium italic px-4 ${activeChar === 'kiko' ? 'text-white text-left' : 'text-zinc-800 text-right'}`}>« Les règles ne sont que des suggestions que personne n’a appliquées avec assez de force. »</p>
                  
                  {activeChar === 'kiko' && (
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-2 px-4 font-monda text-left">
                      Voltigeur de l'extrême. Kiko glisse entre les failles temporelles avec une agilité déconcertante, bravant la gravité et les lois de la physique avec malice.
                    </p>
                  )}
                  
                  <div className="relative w-full h-80 overflow-hidden shadow-lg border border-gray-200 bg-zinc-100">
                    <img src="https://i.postimg.cc/4xrWzY2N/monkey.png" alt="Kiko" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-4">
                    <button 
                      onClick={handleJoinClick} 
                      className={`clip-card-btn px-8 py-2.5 text-base font-semibold uppercase tracking-wider transition-colors ${
                        activeChar === 'kiko' ? 'bg-[#c28e3a] text-zinc-900 hover:bg-[#d4a045]' : 'bg-zinc-900 text-white hover:bg-black'
                      }`}
                    >
                      EN SAVOIR PLUS
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Section Appel à l'Action (Steam Wishlist) */}
            <section className="bg-gradient-to-b from-white to-gray-100 pt-20 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48 text-center border-t border-gray-200 relative z-10">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                <h3 className="text-zinc-800 text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight font-heading mb-2">Arthélyon est</h3>
                <h2 className="text-zinc-900 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight font-heading italic uppercase mb-6 sm:mb-8 text-shadow-sm">EN ATTENTE</h2>
                <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-8 sm:mb-12"></div>
                
                <p className="text-zinc-800 text-base sm:text-lg md:text-2xl lg:text-3xl font-monda leading-relaxed mb-10 sm:mb-16">Le Covenant ne se restaurera pas lui-même. Choisissez votre bête, aiguisez votre lame, et entrez dans un monde qui riposte. Wakkany est gratuit sur Steam — pas de barrières, pas de chaînes, juste les terres sauvages et tout ce que vous avez le courage d’y affronter.</p>
                
                <a 
                  href="https://store.steampowered.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="group inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-zinc-900 text-white px-6 sm:px-10 py-4 sm:py-5 rounded transition-all hover:bg-black hover:scale-105 shadow-xl hover:shadow-2xl cursor-pointer w-full sm:w-auto"
                >
                  <iconify-icon icon="simple-icons:steam" width="32" height="32" className="text-white group-hover:text-gray-300 block sm:w-10 sm:h-10"></iconify-icon>
                  <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6">
                    <div className="text-sm sm:text-base uppercase tracking-[0.2em] text-gray-400 font-medium mb-1">Liste de souhaits sur</div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-wider font-heading">STEAM</div>
                  </div>
                </a>
              </div>
            </section>

            {/* Footer & Bottom Hero */}
            <footer className="relative bg-black pt-48 pb-12 flex flex-col items-center border-t border-white/5">
              
              {/* Overlapping Footer Image */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[40%] md:-translate-y-[50%] w-full max-w-6xl z-20 pointer-events-none flex justify-center px-4">
                <img src="https://i.postimg.cc/9MzzCfVb/footer.png" alt="Alignement des Champions" className="w-full h-auto max-h-[600px] object-contain drop-shadow-2xl" />
              </div>

              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-16 md:mt-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-lg text-gray-400 font-monda border-t border-white/10 pt-16 bg-gradient-to-t from-black via-black/80 to-transparent p-8 rounded-t-3xl backdrop-blur-sm">
                  
                  {/* Brand Info */}
                  <div className="md:col-span-4 flex flex-col gap-6">
                    <div>
                      <p className="text-base uppercase tracking-widest text-gray-500 mb-2 font-medium">Géré par</p>
                      <div className="flex items-center gap-3 text-white font-heading text-2xl font-semibold italic tracking-tight">
                        <iconify-icon icon="lucide:swords" width="32" height="32" className="text-white stroke-[1.5]"></iconify-icon> Wakkany
                      </div>
                    </div>
                    <div className="flex gap-5 mt-2">
                      <a href="#" aria-label="Youtube" className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full flex"><iconify-icon icon="simple-icons:youtube" width="20" height="20"></iconify-icon></a>
                      <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full flex"><iconify-icon icon="simple-icons:x" width="20" height="20"></iconify-icon></a>
                      <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full flex"><iconify-icon icon="simple-icons:instagram" width="20" height="20"></iconify-icon></a>
                      <a href="#" aria-label="Twitch" className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full flex"><iconify-icon icon="simple-icons:twitch" width="20" height="20"></iconify-icon></a>
                    </div>
                    <p className="text-base text-gray-500 mt-6 font-medium">© 2026 Wakkany. Tous droits réservés.</p>
                  </div>

                  {/* Links 1 */}
                  <div className="md:col-span-3 flex flex-col gap-4">
                    <h5 className="text-white text-lg font-medium uppercase tracking-widest mb-2 tracking-tight">WAKKANY</h5>
                    <a href="#" className="hover:text-[#c28e3a] transition-colors w-max">Carrières</a>
                    <a href="#" className="hover:text-[#c28e3a] transition-colors w-max">Mentions Légales</a>
                    <a href="#" className="hover:text-[#c28e3a] transition-colors w-max">Confidentialité</a>
                  </div>

                  {/* Links 2 */}
                  <div className="md:col-span-3 flex flex-col gap-4">
                    <h5 className="text-white text-lg font-medium uppercase tracking-widest mb-2 tracking-tight">COMMUNAUTÉ</h5>
                    <a href="#" className="hover:text-[#c28e3a] transition-colors w-max">Blog</a>
                    <a href="#" className="hover:text-[#c28e3a] transition-colors w-max">Newsletter</a>
                  </div>

                  {/* Lang Select */}
                  <div className="md:col-span-2 flex justify-start md:justify-end items-start">
                    <button className="flex items-center gap-2 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg bg-white/5">
                      <iconify-icon icon="solar:global-linear" width="16" height="16" className="stroke-[1.5]"></iconify-icon> 
                      <span className="font-medium uppercase text-base">FR</span> 
                      <iconify-icon icon="solar:alt-arrow-down-linear" width="16" height="16" className="stroke-[1.5]"></iconify-icon>
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )
      ) : (
        <div className="pt-20 min-h-screen bg-zinc-950">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-12">
            <div className="flex flex-col items-center gap-6 border-b border-white/5 pb-8 mb-8">
              
              {/* Menu Tabs Container - Placed above the welcome text */}
              <div className="w-full">
                 <div className="hidden lg:flex justify-center bg-black/40 border border-white/10 p-1 rounded-xl">
                 {dashboardTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDashboardTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${dashboardTab === tab.id ? 'bg-[#c28e3a] text-black shadow-lg shadow-orange-950/20' : 'text-zinc-500 hover:text-white'
                      }`}
                  >
                    <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="lg:hidden overflow-x-auto scrollbar-hide w-full flex justify-center">
                <div className="flex justify-center gap-2 min-w-max bg-black/40 border border-white/10 p-1 rounded-xl mx-auto">
                  {dashboardTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDashboardTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${dashboardTab === tab.id ? 'bg-[#c28e3a] text-black shadow-lg shadow-orange-950/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <iconify-icon icon={tab.icon} width="14"></iconify-icon>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Welcome Title Container - Placed below and centered */}
            <div className="w-full text-center mt-2">
              <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-heading font-bold italic uppercase mb-2 break-words">
                Bienvenue, <span className="text-[#c28e3a]">{user?.name}</span>
              </h1>
              <p className="text-zinc-500 font-monda uppercase text-[10px] sm:text-xs tracking-widest break-words">
                {user?.academy} // {user?.clan?.name}
              </p>
            </div>

          </div>

          {/* Tab Secret Content */}
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
                   
                   {/* Real-time Activity Feed */}
                   <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-zinc-200 text-[10px] font-black uppercase tracking-[0.3em]">Flux d'Activité en Temps Réel</h3>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Live</span>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <ActivityList />
                      </div>
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
                   <p className="text-zinc-500 text-center max-w-xl font-monda italic text-sm sm:text-base">
                     L'évolution de votre avatar est liée à vos progrès. Débloquez de nouveaux talents dans l'arbre pour voir votre identité visuelle se transformer.
                   </p>
                </div>
              )}

              {dashboardTab === 'quiz' && (
                <div className="text-center py-20 flex flex-col items-center">
                  <iconify-icon icon="lucide:gamepad-2" width="64" className="text-[#c28e3a] mb-6 animate-bounce"></iconify-icon>
                  <h2 className="text-3xl font-heading font-black italic uppercase mb-4">L'Arène du Savoir</h2>
                  <p className="text-zinc-500 mb-8 max-w-md mx-auto">Jouez en famille dans le mode TV / Salon pour accumuler de l'XP collective !</p>
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
                  onCompleteQuest={handleCompleteQuest} 
                  flashQuests={flashQuests}
                />
              )}

              {dashboardTab === 'stats' && (
                <StatsPanel xp={cumulativeXp} unlockedSkills={unlockedSkills} xpHistory={xpHistory} />
              )}
              
              {dashboardTab === 'map' && (
                <div className="animate-fade-in">
                  <LevelEvolutionMap xp={cumulativeXp} />
                </div>
              )}

              {dashboardTab === 'skills' && (
                <SkillTree 
                  xp={xp} 
                  unlockedSkills={unlockedSkills} 
                  onUnlock={(node) => { handleUnlockSkill(node); playUnlock(); }} 
                  onReset={handleResetSkills} 
                />
              )}

              {dashboardTab === 'clans' && (
                <ClanManagement user={user} onUpdateClan={handleUpdateClan} />
              )}

              {dashboardTab === 'rankings' && (
                <Leaderboard currentUser={{ 
                  ...user, 
                  xp: cumulativeXp, 
                  level: getLevel(cumulativeXp).level,
                  dominant: getDominantBranch(unlockedSkills) 
                }} />
              )}

              {dashboardTab === 'badges' && (
                <BadgesView userLevel={getLevel(cumulativeXp).level} />
              )}
            </div>
          </section>
        </div>
      )}
      </div>

      {/* BottomNav removed as requested */}
      <NotificationToast notifications={notifications} removeNotification={removeNotification} />

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Retourner en haut de la page"
        className={`fixed bottom-24 right-8 z-[100] w-14 h-14 bg-[#c28e3a] text-black rounded-2xl shadow-2xl transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95 group ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <iconify-icon icon="lucide:arrow-up" width="24" className="relative z-10"></iconify-icon>
      </button>
    </>
  );
}