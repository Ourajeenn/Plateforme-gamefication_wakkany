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
import usePlayerData from './hooks/usePlayerData';
import { ACHIEVEMENTS } from './data/achievements';
import { realtime } from './utils/realtime';
import { getDominantBranch, getTotalXp } from './utils/xpHelpers';
import { getLevel } from './data/levels';
import { useSoundFX } from './hooks/useSoundFX';
import Preloader from './components/Preloader';

import QuizHome from './components/quiz/QuizHome';
import QuizConfig from './components/quiz/QuizConfig';
import PackProfile from './components/quiz/PackProfile';
import FamilyGame from './components/quiz/FamilyGame';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSetup = location.pathname === '/setup';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isQuiz = location.pathname.startsWith('/quiz');

  const dashboardTab = isDashboard ? location.pathname.replace('/dashboard/', '') || 'profile' : 'profile';
  const view = isSetup ? 'setup' : isDashboard ? 'dashboard' : isQuiz ? 'quiz' : 'landing';

  const setDashboardTab = (tab) => {
    if (tab === 'quiz') {
      navigate('/quiz');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };
  const setView = (v) => {
     if (v === 'landing') navigate('/');
     if (v === 'setup') navigate('/setup');
     if (v === 'dashboard') navigate('/dashboard/profile');
     if (v === 'quiz') navigate('/quiz');
  };

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);
  const { user, setUser, xp, setXp, unlockedSkills, setUnlockedSkills, completedQuests, setCompletedQuests, xpHistory, unlockedAchievements, setUnlockedAchievements } = usePlayerData();
  const [isLoading, setIsLoading] = useState(true);
  const cumulativeXp = getTotalXp(unlockedSkills) + xp;
  const levelData = getLevel(cumulativeXp);
  const { playClick, playUnlock, playLevelUp, playError } = useSoundFX();
  const [landingTab, setLandingTab] = useState(null); // 'waitlist', 'about', 'blog', 'archetypes'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('idle'); // 'idle', 'loading', 'success'
  const [notifications, setNotifications] = useState([]);
  const [flashQuests, setFlashQuests] = useState([
    { id: 'f1', title: 'Anomalie de l\'Aether', desc: 'Une faille s\'est ouverte dans le secteur 4. Stabilisez-la.', xpReward: 200, timeLeft: 300 }, // 5 mins
  ]);

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
    setView('setup');
  };

  const handleProfileComplete = (userData) => {
    setUser(userData);
    setView('dashboard');
    setDashboardTab('profile');
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
    <nav className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-[100] transition-all hover:bg-black/60 shadow-2xl">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setView('landing'); setLandingTab(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
        <div className="relative">
          <iconify-icon icon="lucide:triangle" width="32" height="32" className="text-[#c28e3a] rotate-180 stroke-[1.5]"></iconify-icon>
          <div className="absolute inset-0 bg-[#c28e3a] blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
        </div>
        <span className="text-white font-heading font-bold italic tracking-tighter uppercase text-lg sm:text-xl">Wakkany</span>
      </div>

      <div className="hidden lg:flex items-center gap-10 text-white text-[11px] font-black uppercase tracking-[0.2em]">
        <button onClick={() => { setView('landing'); setLandingTab(null); scrollToSection('hero'); }} className="hover:text-[#c28e3a] transition-all hover:tracking-[0.3em]">ACCUEIL</button>
        <button onClick={() => setLandingTab('waitlist')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'waitlist' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>LISTE D'ATTENTE</button>
        <button onClick={() => navigate('/quiz')} className="text-zinc-500 hover:text-[#c28e3a] transition-all">QUIZ SALON</button>
        <button onClick={() => {
          if (user) setView('dashboard');
          else handleJoinClick();
        }} className="text-zinc-500 hover:text-white transition-all">MON PROFIL</button>
        <button onClick={() => setLandingTab('about')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'about' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>ÉCOSYSTÈME</button>
        <button onClick={() => setLandingTab('blog')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'blog' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>HISTOIRE</button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (user) setView('dashboard');
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
        <div className="absolute top-full left-0 w-full mt-4 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 animate-scale-up lg:hidden">
          <button onClick={() => { setView('landing'); setLandingTab(null); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Accueil</button>
          <button onClick={() => { setView('landing'); setLandingTab('waitlist'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Liste d'attente</button>
          <button onClick={() => { handleJoinClick(); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Commencer</button>
          <button onClick={() => { setView('landing'); setLandingTab('about'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">À Propos</button>
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
      <nav className="fixed top-0 left-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-[60]">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => { setView('landing'); setLandingTab(null); }}
          >
            <iconify-icon icon="lucide:triangle" width="24" height="24" className="text-[#c28e3a] rotate-180 group-hover:rotate-0 transition-transform duration-500"></iconify-icon>
            <span className="text-white font-heading font-bold tracking-widest text-lg italic uppercase">Wakkany</span>
          </div>
          <LiveFeed />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-white font-bold text-sm leading-none">{user?.name || 'Nomade'}</span>
            <span className="text-[#c28e3a] text-[10px] uppercase font-bold tracking-widest">{user?.clan?.name || 'Clanless'}</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-[#c28e3a]/40 overflow-hidden bg-zinc-900 flex items-center justify-center">
            {user?.clan?.image ? (
              <img src={user.clan.image} className="w-full h-full object-cover" />
            ) : (
              <iconify-icon icon={user?.clan?.icon || 'lucide:user'} className="text-[#c28e3a] text-xl"></iconify-icon>
            )}
          </div>
          <button onClick={() => { setUser(null); setView('landing'); }} className="text-zinc-600 hover:text-red-500 transition-all hover:scale-110">
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
            <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl">
              <h3 className="text-white font-bold mb-4 uppercase">Registry Requirements</h3>
              <ul className="text-zinc-500 text-sm space-y-3">
                <li>• Level 0 clearance</li>
                <li>• Minimum 100 XP aspiration</li>
                <li>• Commitment to the hunt</li>
              </ul>
            </div>
          </div>
          <div className="bg-black/40 border border-white/10 p-10 rounded-3xl backdrop-blur-md">
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Adresse Aethermail</label>
                  <input type="email" required className="w-full bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl text-white outline-none focus:border-[#c28e3a] transition-all" placeholder="hunter@aethermoor.com" />
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
            <div key={idx} className="relative bg-zinc-900/40 backdrop-blur-sm border border-white/10 p-10 rounded-[32px] hover:border-[#c28e3a]/40 transition-all duration-500 group overflow-hidden flex flex-col h-full">
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
          <div className="bg-black/40 backdrop-blur-md p-16 text-center rounded-3xl">
            <h2 className="text-white text-3xl font-heading italic uppercase mb-6">"History is written in blood, but the future is forged in XP."</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto font-monda">Plateforme Wakkany est un écosystème RPG unique où votre identité visuelle évolue avec vos compétences. Chaque choix dans l'arbre de talents se reflète sur votre avatar, rendant chaque champion unique.</p>
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

  if (view === 'quiz') {
    return (
      <Routes>
        <Route path="/quiz" element={<QuizHome />} />
        <Route path="/quiz/config" element={<QuizConfig />} />
        <Route path="/quiz/profile" element={<PackProfile />} />
        <Route path="/quiz/play" element={<FamilyGame />} />
        <Route path="*" element={<Navigate to="/quiz" replace />} />
      </Routes>
    );
  }

  if (view === 'setup') {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <>
      <div className="antialiased opacity-0 animate-fade-in text-white min-h-screen bg-zinc-950">
        {view === 'landing' ? <LandingNav /> : <DashboardNav />}

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
            <header id="hero" className="relative w-full min-h-screen overflow-hidden flex flex-col justify-end pb-12 sm:pb-24">
              <div className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden">
                <iframe
                  className="video-background opacity-85 w-full h-full object-cover scale-[1.3] brightness-125 pointer-events-none"
                  src="https://player.mux.com/01mywJGOo4l00f8YOasdq4nIXXI6vrrIIVTKtMN6PCeQM?autoplay=true&loop=true&muted=true&controls=false"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-zinc-950/80"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#09090b_70%)] opacity-60"></div>
                <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
              </div>

              <div className="relative z-10 w-full max-w-7xl mx-auto px-8 h-full flex flex-col pt-32 sm:pt-40">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end w-full gap-8">
                  {/* Brand Column (H1) */}
                  <div className="lg:text-right flex flex-col lg:items-end opacity-0 animate-fade-in delay-500 w-full lg:w-auto lg:order-last">
                    <h1 className="text-white text-[60px] sm:text-[100px] lg:text-[140px] font-black italic leading-[0.8] tracking-tighter font-heading uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
                      Wak<br />kany
                    </h1>
                    <p className="text-yellow-500 text-lg sm:text-2xl mt-6 max-w-md tracking-tight font-monda font-light italic">
                      "Votre évolution ne dépend pas du hasard, mais de vos choix."
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4 w-full lg:justify-end">
                      <div className="flex items-center bg-black/40 backdrop-blur-xl border border-white/5 py-4 px-6 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Utilisateurs Actifs</span>
                          <span className="text-white font-heading font-bold italic text-xl">12,450+ </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle Column (H2) */}
                  <div className="opacity-0 animate-scale-up delay-200 w-full lg:w-auto">
                    <div className="flex items-center gap-3 text-[#c28e3a] mb-4">
                      <div className="h-px w-8 bg-[#c28e3a]"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Propulsé par l'Aether</span>
                    </div>
                    <h2 className="text-white text-3xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter font-heading uppercase leading-none">
                      TRANSFORMEZ<br />VOTRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c28e3a] to-white">POTENTIEL</span>
                    </h2>
                  </div>
                </div>

                <div className="mt-auto mb-8 sm:mb-12 flex flex-col items-center gap-8">
                  <div className="flex flex-col items-center opacity-40">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] mb-2">Défiler vers l'Aube</span>
                    <iconify-icon icon="lucide:chevron-down" width="16"></iconify-icon>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (user) setView('dashboard');
                      else handleJoinClick();
                    }}
                    className="relative group overflow-hidden px-16 py-6 bg-white text-black font-black text-xl sm:text-2xl uppercase tracking-[0.2em] font-heading italic transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(194,142,58,0.3)] rounded-2xl"
                  >
                    <span className="relative z-10 transition-colors group-hover:text-white">
                      {user ? `RETOURNER AU COMBAT, ${user.name.toUpperCase()}` : "REJOINDRE LA MEUTE"}
                    </span>
                    <div className="absolute inset-0 bg-[#c28e3a] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                  </button>
                </div>
              </div>
            </header>

            {/* Avatar Selection Carousel (Added from User Request) */}
            <AvatarCarousel />

            {/* Visual Evolution Section */}
            <section className="py-24 sm:py-32 bg-zinc-950 border-y border-white/5 overflow-hidden">
               <div className="max-w-7xl mx-auto px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                      <h3 className="text-[#c28e3a] text-xs font-black uppercase tracking-[0.3em] mb-4">Système d'Evolution Visuelle</h3>
                      <h2 className="text-white text-5xl font-heading font-black italic uppercase tracking-tighter mb-8 leading-none">VOTRE AVATAR<br />DEVIENT VOTRE <span className="text-zinc-500">LÉGENDE</span></h2>
                      <p className="text-zinc-400 text-lg leading-relaxed italic font-monda mb-10">
                        Chaque point d'expérience investi dans votre arbre de compétences modifie physiquement votre avatar SVG. D'un simple nomade à un champion rayonnant d'énergie éthérée.
                      </p>
                      
                      <div className="space-y-6">
                        {[
                          { label: 'FORCE / RÉSISTANCE', desc: 'Armures lourdes et teintures émeraude.', color: '#4ade80' },
                          { label: 'ARCANE / EXPLOSIVITÉ', desc: 'Effets particulaires et reflets incandescents.', color: '#f87171' },
                          { label: 'OMBRE / CONTRÔLE', desc: 'Auras de stase et nuances violettes.', color: '#818cf8' }
                        ].map((way, idx) => (
                          <div key={idx} className="flex gap-4 items-start group">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 transition-all group-hover:scale-[2.5]" style={{ backgroundColor: way.color, boxShadow: `0 0 10px ${way.color}` }}></div>
                            <div>
                              <h4 className="text-white text-xs font-black tracking-widest">{way.label}</h4>
                              <p className="text-zinc-600 text-[11px] uppercase font-bold">{way.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative group perspective-1000">
                      <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[40px] p-12 aspect-square flex items-center justify-center transform transition-all duration-700 group-hover:rotate-y-12 group-hover:scale-105 shadow-2xl">
                         <Avatar xp={150} unlockedSkills={['sustain_1', 'sus_2']} />
                         <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#c28e3a]/10 blur-3xl animate-pulse"></div>
                      </div>
                    </div>
                  </div>
               </div>
            </section>

            {/* Mechanics Section */}
            <section className="py-32 bg-black relative">
               <div className="max-w-7xl mx-auto px-8">
                  <div className="text-center mb-24">
                    <h2 className="text-white text-4xl sm:text-6xl font-heading font-black italic uppercase tracking-tighter mb-6">MÉCANIQUES DE <span className="text-zinc-700">DESTINÉE</span></h2>
                    <div className="w-24 h-1 bg-[#c28e3a] mx-auto"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: 'solar:graph-up-bold-duotone', title: 'Progression Hexagonale', desc: 'Un arbre de compétences modulaire qui s\'adapte à votre style sans contraintes de classe.' },
                      { icon: 'solar:shield-star-bold-duotone', title: 'Contrats Majeurs', desc: 'Relevez des défis de productivité pour forger votre caractère et augmenter votre score.' },
                      { icon: 'solar:ranking-bold-duotone', title: 'Honneur Partagé', desc: 'Faites partie d\'un classement dynamique géré en temps réel par la blockchain Aethermoor.' }
                    ].map((feature, idx) => (
                      <div key={idx} className="bg-zinc-900/40 border border-white/5 p-12 rounded-[32px] hover:border-[#c28e3a]/30 transition-all group">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-[#c28e3a] group-hover:text-black transition-all">
                          <iconify-icon icon={feature.icon} width="32"></iconify-icon>
                        </div>
                        <h3 className="text-white text-xl font-black uppercase mb-4 italic tracking-tight">{feature.title}</h3>
                        <p className="text-zinc-500 font-monda leading-relaxed text-sm italic">"{feature.desc}"</p>
                      </div>
                    ))}
                  </div>
               </div>
            </section>

            {/* Lore Section (Improved) */}
            <section id="lore" className="py-48 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 z-0 scale-105">
                <img src="https://i.postimg.cc/Qtjkb1QH/bg24.png" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-yellow-500/20 mix-blend-color"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
              </div>
              <div className="max-w-4xl mx-auto px-8 relative z-10 text-center">
                 <iconify-icon icon="lucide:scroll-text" className="text-[#c28e3a] mb-12 text-6xl animate-pulse"></iconify-icon>
                 <h2 className="text-white text-5xl sm:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-tight">L'HÉRITAGE DE WAKKANY</h2>
                 <p className="text-zinc-400 text-xl font-monda italic leading-relaxed mb-12">
                   "Avant les chaînes. Avant le silence. Il y avait une promesse entre les bêtes — jurée par le sang, scellée par l'acier. Aujourd'hui, cette vérité est morte, enterrée sous le fer et les cendres. Les clans se sont retournés les uns contre les autres. La chasse vient de recommencer."
                 </p>
                 <button onClick={handleJoinClick} className="text-[#c28e3a] font-black uppercase tracking-[0.4em] text-xs hover:tracking-[0.6em] transition-all">S'inscrire dans les archives →</button>
              </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-zinc-950 pt-32 pb-12 border-t border-white/5 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#c28e3a]/40 to-transparent"></div>
              
              <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-24">
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 text-white font-heading text-2xl font-black italic uppercase mb-8">
                       <iconify-icon icon="lucide:triangle" width="24" className="text-[#c28e3a] rotate-180"></iconify-icon>
                       Wakkany Plateforme
                    </div>
                    <p className="text-zinc-500 text-sm italic font-monda leading-relaxed mb-8">
                      La plateforme Wakkany est un écosystème d'évolution personnelle conçu pour transformer vos objectifs quotidiens en une quête épique.
                    </p>
                    <div className="flex gap-4">
                      {['discord', 'twitter', 'github', 'instagram'].map(platform => (
                        <a key={platform} href="#" aria-label={`Suivez-nous sur ${platform}`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                          <iconify-icon icon={`solar:${platform}-bold`} width="20"></iconify-icon>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:col-span-3 gap-12 sm:grid-cols-3">
                    <div>
                      <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">L'UNIVERS</h4>
                      <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                         <li onClick={() => { setLandingTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#c28e3a] cursor-pointer transition-colors">L'Écosystème</li>
                         <li onClick={() => addNotification('info', "La Blockchain Aethermoor est en cours de synchronisation.")} className="hover:text-[#c28e3a] cursor-pointer transition-colors">La Technologie</li>
                         <li onClick={() => { 
                            if (user) { setView('dashboard'); setDashboardTab('skills'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                            else { setLandingTab('archetypes'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                          }} className="hover:text-[#c28e3a] cursor-pointer transition-colors">Arbres de Talent</li>
                         <li onClick={() => setLandingTab('waitlist')} className="hover:text-[#c28e3a] cursor-pointer transition-colors">Accès Anticipé</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">COMMUNAUTÉ</h4>
                      <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                         <li onClick={() => window.open('https://discord.gg', '_blank')} className="hover:text-[#c28e3a] cursor-pointer transition-colors">Discord</li>
                         <li onClick={() => { 
                            if (user) { setView('dashboard'); setDashboardTab('rankings'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                            else { setLandingTab('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                          }} className="hover:text-[#c28e3a] cursor-pointer transition-colors">Classements</li>
                         <li onClick={() => { 
                            if (user) { setView('dashboard'); setDashboardTab('clans'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                            else addNotification('info', "Rejoignez la meute pour créer votre clan.");
                          }} className="hover:text-[#c28e3a] cursor-pointer transition-colors">Clans Émanants</li>
                         <li onClick={() => setLandingTab('blog')} className="hover:text-[#c28e3a] cursor-pointer transition-colors">Journal d'Évolution</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">NEWSLETTER</h4>
                      <p className="text-zinc-600 text-[10px] mb-6 leading-relaxed uppercase font-bold">Inscrivez-vous pour recevoir les mises à jour de l'Aethermoor.</p>
                      <form className="relative group" onSubmit={(e) => {
                        e.preventDefault();
                        addNotification('success', "Signal capté ! Bienvenue dans l'Aethermoor.");
                        e.target.reset();
                      }}>
                        <input type="email" placeholder="hunter@aethermoor.com" required aria-label="Adresse e-mail pour la newsletter" className="w-full bg-black/50 border border-white/5 px-4 py-4 rounded-xl text-white text-[10px] outline-none focus:border-[#c28e3a] transition-all" />
                        <button aria-label="S'inscrire à la newsletter" className="absolute right-2 top-2 p-2 bg-[#c28e3a] text-black rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-950/20">
                          <iconify-icon icon="lucide:send" width="16"></iconify-icon>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em]">© 2026 WAKKANY. TOUS DROITS RÉSERVÉS.</p>
                  <div className="flex gap-8 text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em]">
                    <span onClick={() => addNotification('info', "Codex Wakkany en cours de rédaction")} className="hover:text-zinc-400 cursor-pointer transition-colors">Constitution</span>
                    <span onClick={() => addNotification('info', "Vos données sont protégées par l'Aether")} className="hover:text-zinc-400 cursor-pointer transition-colors">Respect de la Vie Privée</span>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )
      ) : (
        <div className="pt-20 min-h-screen bg-zinc-950">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 mb-8">
              <div>
                <h1 className="text-white text-5xl font-heading font-bold italic uppercase mb-2">
                  Bienvenue, <span className="text-[#c28e3a]">{user?.name}</span>
                </h1>
                <p className="text-zinc-500 font-monda uppercase text-xs tracking-widest">
                  {user?.academy} // {user?.clan?.name}
                </p>
              </div>

              <div className="flex items-center gap-6">
                 <div className="hidden lg:flex bg-black/40 border border-white/10 p-1 rounded-xl">
                 {[
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
                ].map(tab => (
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
                   <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Flux d'Activité en Temps Réel</h3>
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
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 py-10">
                   <h2 className="text-white text-4xl font-heading font-black italic uppercase">VOTRE RÉALITÉ VISUELLE</h2>
                   <div className="bg-zinc-900 border border-white/10 p-20 rounded-[60px] shadow-2xl relative group">
                      <div className="absolute inset-0 bg-[#c28e3a]/10 blur-[120px] opacity-20 animate-pulse"></div>
                      <div className="scale-[2.5] relative z-10">
                        <Avatar xp={cumulativeXp} unlockedSkills={unlockedSkills} />
                      </div>
                   </div>
                   <p className="text-zinc-500 text-center max-w-xl font-monda italic">
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