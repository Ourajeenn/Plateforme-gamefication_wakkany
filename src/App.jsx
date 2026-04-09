import React, { useState, useEffect } from 'react';
import ProfileSetup from './components/ProfileSetup';
import Leaderboard from './components/Leaderboard';
import Avatar from './components/Avatar';
import SkillTree from './components/SkillTree';
import QuestPanel from './components/quests/QuestPanel';
import usePlayerData from './hooks/usePlayerData';
export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'setup', 'dashboard'
  const [dashboardTab, setDashboardTab] = useState('profile'); // 'profile', 'skills', 'quests', 'rankings'
  const { user, setUser, xp, setXp, unlockedSkills, setUnlockedSkills, completedQuests, setCompletedQuests } = usePlayerData();
  const [isLoading, setIsLoading] = useState(true);
  const [landingTab, setLandingTab] = useState(null); // 'waitlist', 'about', 'blog', 'archetypes'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('idle'); // 'idle', 'loading', 'success'
  useEffect(() => {
    // Initial loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
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
  };

  const handleCompleteQuest = (quest) => {
    setCompletedQuests(prev => [...prev, quest.id]);
    setXp(prev => prev + quest.xpReward);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const Preloader = () => (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      <div className="relative mb-8 animate-preloader-scale">
        <iconify-icon icon="lucide:triangle" width="80" height="80" className="text-white rotate-180"></iconify-icon>
        <div className="absolute inset-0 bg-[#c28e3a]/20 blur-2xl rounded-full"></div>
      </div>
      <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[#c28e3a] w-1/4 animate-progress-run"></div>
      </div>
      <div className="mt-6 text-[#c28e3a] font-heading font-bold italic tracking-[0.3em] uppercase text-xs animate-pulse">
        Initialisation de Aethermoor...
      </div>
    </div>
  );

  const LandingNav = () => (
    <nav className="fixed md:absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-between px-6 py-4 z-[100]">
      <div className="flex items-center gap-3">
        <iconify-icon icon="lucide:triangle" width="32" height="32" className="text-[#c28e3a] rotate-180 stroke-[1.5]"></iconify-icon>
        <span className="text-white font-heading font-bold italic tracking-tighter uppercase text-xl md:hidden">Beastborne</span>
      </div>

      <div className="hidden md:flex items-center gap-10 text-white text-base font-medium uppercase tracking-wider">
        <button onClick={() => { setView('landing'); setLandingTab(null); scrollToSection('hero'); }} className="hover:text-[#c28e3a] transition-colors">ACCUEIL</button>
        <button onClick={() => setLandingTab('waitlist')} className={`transition-colors ${landingTab === 'waitlist' ? 'text-[#c28e3a]' : 'text-gray-300 hover:text-white'}`}>LISTE D'ATTENTE</button>
        <button onClick={() => {
          if (user) setView('dashboard');
          else handleJoinClick();
        }} className="text-gray-300 hover:text-white transition-colors">MON PROFIL</button>
        <button onClick={() => setLandingTab('about')} className={`transition-colors ${landingTab === 'about' ? 'text-[#c28e3a]' : 'text-gray-300 hover:text-white'}`}>À PROPOS</button>
        <button onClick={() => setLandingTab('blog')} className={`transition-colors ${landingTab === 'blog' ? 'text-[#c28e3a]' : 'text-gray-300 hover:text-white'}`}>ACTUALITÉS</button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-white/5 rounded-lg px-4 py-2 border border-white/5">
          <iconify-icon icon="solar:magnifier-linear" width="16" height="16" className="text-gray-400 stroke-[1.5]"></iconify-icon>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-base ml-3 w-40 placeholder-gray-500 focus:ring-0"
            placeholder="Search lore..."
          />
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
        >
          <iconify-icon icon={isMenuOpen ? "lucide:x" : "lucide:menu"} width="24"></iconify-icon>
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full mt-4 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 flex flex-col gap-6 animate-fade-in md:hidden">
          <button onClick={() => { setView('landing'); setIsMenuOpen(false); }} className="text-white font-bold uppercase tracking-widest text-left">Home</button>
          <button onClick={() => { setLandingTab('waitlist'); setIsMenuOpen(false); }} className="text-white font-bold uppercase tracking-widest text-left">Waitlist</button>
          <button onClick={() => { handleJoinClick(); setIsMenuOpen(false); }} className="text-white font-bold uppercase tracking-widest text-left">Join the Pack</button>
          <button onClick={() => { setLandingTab('about'); setIsMenuOpen(false); }} className="text-white font-bold uppercase tracking-widest text-left">About</button>
        </div>
      )}
    </nav>
  );

  const DashboardNav = () => (
    <nav className="fixed top-0 left-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 py-4 z-[60]">
      <div className="flex items-center gap-4">
        <iconify-icon icon="lucide:triangle" width="24" height="24" className="text-[#c28e3a] rotate-180"></iconify-icon>
        <span className="text-white font-heading font-bold tracking-widest text-lg italic uppercase">Beastborne <span className="text-zinc-600 ml-2">// Dashboard</span></span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-white font-bold text-sm leading-none">{user?.name || 'Nomade'}</span>
          <span className="text-[#c28e3a] text-[10px] uppercase font-bold tracking-widest">{user?.clan?.name || 'Clanless'}</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-[#c28e3a] overflow-hidden bg-zinc-800 pointer-events-none">
          <img src={user?.clan?.image || 'https://i.postimg.cc/qv918NDq/hippo1.png'} className="w-full h-full object-cover" />
        </div>
        <button onClick={() => { setUser(null); setView('landing'); }} className="text-zinc-600 hover:text-[#c28e3a] transition-all hover:scale-110">
          <iconify-icon icon="solar:logout-2-linear" width="24"></iconify-icon>
        </button>
      </div>
    </nav>
  );

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
            <form onSubmit={(e) => { e.preventDefault(); setWaitlistStatus('loading'); }} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Aethermail Address</label>
                <input type="email" required className="w-full bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl text-white outline-none focus:border-[#c28e3a] transition-all" placeholder="hunter@aethermoor.com" />
              </div>
              <button type="submit" className="w-full py-5 bg-[#c28e3a] text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all font-monda">Apply for Access</button>
            </form>
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
        <h1 className="text-white text-6xl font-heading font-bold italic uppercase mb-16 text-center">THE WORLD OF AETHERMOOR</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { title: 'The Covenant', desc: 'An ancient treaty between the three major schools of power: The Iron Legion, The Arcane Order, and the Silent Veils.', icon: 'lucide:shield-check' },
            { title: 'Aether Essence', desc: 'The lifeblood of the world. It flows through the veins of every creature, granting power to those who can harness it.', icon: 'lucide:sparkles' },
            { title: 'The Great Hunt', desc: 'A perpetual cycle of challenge where champions are born and legends are forged in the fires of battle.', icon: 'lucide:swords' }
          ].map((item, idx) => (
            <div key={idx} className="bg-zinc-900/50 border border-white/5 p-10 rounded-3xl hover:border-[#c28e3a]/30 transition-all group">
              <iconify-icon icon={item.icon} width="48" className="text-[#c28e3a] mb-6 block group-hover:scale-110 transition-transform"></iconify-icon>
              <h3 className="text-white text-2xl font-bold uppercase mb-4 italic font-heading">{item.title}</h3>
              <p className="text-zinc-500 font-monda leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-[1px] bg-gradient-to-r from-transparent via-[#c28e3a]/30 to-transparent">
          <div className="bg-black/40 backdrop-blur-md p-16 text-center rounded-3xl">
            <h2 className="text-white text-3xl font-heading italic uppercase mb-6">"History is written in blood, but the future is forged in XP."</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto font-monda">Beastborne is a unique RPG ecosystem where your visual identity evolves with your skills. Every choice in the skill tree reflects in your Evo-Avatar, making every champion unique.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const BlogPage = () => (
    <div className="min-h-screen bg-zinc-950 pt-40 px-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => setLandingTab(null)} className="flex items-center gap-2 text-[#c28e3a] uppercase font-bold text-xs tracking-[0.3em] mb-12 hover:gap-4 transition-all">
          <iconify-icon icon="lucide:arrow-left"></iconify-icon> Back to Home
        </button>
        <div className="flex justify-between items-end mb-16">
          <h1 className="text-white text-6xl font-heading font-bold italic uppercase">CHRONICLES</h1>
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest border-b border-[#c28e3a] pb-1">v2.0 Update Logs</span>
        </div>

        <div className="space-y-12">
          {[
            { date: 'APR 03, 2026', title: 'The Evolution Patch', desc: 'Introducing the dynamic SVG avatar system. Your progression is now visual. Branching skill trees (Force, Arcane, Ombre) are now active.' },
            { date: 'MAR 28, 2026', title: 'Bounty Boards Open', desc: 'Solving riddles now grants Aether Essence. New NPC merchants added to the Tech Academy outskirts.' },
            { date: 'MAR 15, 2026', title: 'The Great Betrayal', desc: 'Lore update: Why the Covenant was broken and what it means for the upcoming Iron Legion campaign.' }
          ].map((post, idx) => (
            <article key={idx} className="group cursor-pointer">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <time className="text-[#c28e3a] font-monda font-bold text-sm min-w-[120px] pt-1">{post.date}</time>
                <div className="flex-1 border-l border-white/5 pl-8 group-hover:border-[#c28e3a] transition-all">
                  <h3 className="text-white text-3xl font-heading font-bold italic uppercase mb-4 group-hover:text-[#c28e3a] transition-colors">{post.title}</h3>
                  <p className="text-zinc-500 font-monda leading-relaxed text-lg italic mb-6">"{post.desc}"</p>
                  <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-all">Read Transmission →</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );

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

  if (isLoading) return <Preloader />;

  if (view === 'setup') {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="antialiased opacity-0 animate-fade-in text-white min-h-screen bg-zinc-950">
      {view === 'landing' ? <LandingNav /> : <DashboardNav />}

      {view === 'landing' ? (
        landingTab === 'waitlist' ? (
          <WaitlistPage />
        ) : landingTab === 'about' ? (
          <AboutPage />
        ) : landingTab === 'blog' ? (
          <BlogPage />
        ) : landingTab === 'archetypes' ? (
          <ArchetypesPage />
        ) : (
          <>
            {/* Hero Section */}
            <header id="hero" className="relative w-full h-screen min-h-[900px] overflow-hidden flex flex-col justify-end pb-24">
              <div className="absolute inset-0 z-0 bg-zinc-900 overflow-hidden">
                <iframe
                  className="video-background opacity-80 w-full h-full object-cover scale-[1.5]"
                  src="https://player.mux.com/01mywJGOo4l00f8YOasdq4nIXXI6vrrIIVTKtMN6PCeQM?autoplay=true&loop=true&muted=true&controls=false"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#151515]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40"></div>
              </div>

              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col pt-40">
                <div className="flex flex-col md:flex-row justify-between items-start w-full">
                  <div className="mt-24 md:mt-32 opacity-0 animate-fade-in delay-200">
                    <h2 className="text-white text-4xl md:text-5xl font-medium italic tracking-tight font-heading uppercase">DEVENEZ LA MEILLEURE VERSION DE VOUS-MÊME</h2>
                  </div>
                  <div className="text-right flex flex-col items-end mt-12 md:mt-0 opacity-0 animate-fade-in delay-400">
                    <h1 className="text-white text-7xl md:text-9xl font-bold italic leading-[0.9] tracking-tight font-heading">Beast<br />borne</h1>
                    <p className="text-gray-200 text-2xl md:text-3xl mt-6 max-w-lg tracking-tight">Votre évolution commence maintenant.</p>

                    <div className="mt-12 flex gap-4 w-full justify-end">
                      <button
                        onClick={() => setLandingTab('archetypes')}
                        className="text-center shadow-xl bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-[#c28e3a]/50 transition-all group flex flex-col items-center"
                      >
                        <iconify-icon icon="lucide:star" width="48" height="48" className="text-[#c28e3a] mx-auto stroke-[1.5] block group-hover:scale-110 transition-transform"></iconify-icon>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-4 font-bold">Votre Profil</p>
                        <p className="text-white text-2xl font-heading italic uppercase mt-1">Explorateur</p>
                      </button>

                      <button
                        onClick={() => setWaitlistStatus('loading')}
                        className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-[#c28e3a] hover:border-[#c28e3a] hover:text-black transition-all"
                      >
                        {waitlistStatus === 'success' ? 'Inscrit !' : 'Liste d\'attente'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-auto mb-12 flex justify-center">
                  <button
                    onClick={handleJoinClick}
                    className="clip-button relative px-16 py-5 bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black font-bold text-2xl uppercase tracking-[0.2em] font-heading italic transition-all duration-300 hover:scale-105 hover:brightness-110 shadow-2xl"
                  >
                    COMMENCER L'AVENTURE
                  </button>
                </div>
              </div>

              {waitlistStatus === 'loading' && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
                  <div className="bg-zinc-900 border border-[#c28e3a] p-12 rounded-3xl max-w-md animate-scale-up">
                    <iconify-icon icon="lucide:mail-check" width="64" className="text-[#c28e3a] mb-6 mx-auto"></iconify-icon>
                    <h2 className="text-white text-2xl font-bold uppercase mb-4">Securing Your Slot</h2>
                    <p className="text-zinc-500 mb-8">You've been added to the elite queue. Watch your inbox, hunter.</p>
                    <button onClick={() => { setWaitlistStatus('success'); }} className="w-full py-4 bg-[#c28e3a] text-black font-bold uppercase tracking-widest">Acknowledge</button>
                  </div>
                </div>
              )}
            </header>

            {/* Lore Section */}
            <section id="lore" className="py-32 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(to bottom, rgba(21,21,21,0.85), rgba(21,21,21,0.9)), url('https://i.postimg.cc/Qtjkb1QH/bg24.png')" }}>
              <div className="max-w-6xl mx-auto px-6 relative z-10 text-center py-24">
                <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight font-heading italic uppercase mb-6 text-center">THE WORLD OF AETHERMOOR</h2>
                <div className="w-16 h-1 bg-[#c28e3a] mx-auto mb-20 shadow-[0_0_10px_#c28e3a]"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left text-gray-400 text-xl leading-relaxed italic">
                  <p>Before the chains. Before the silence. There was a promise between beasts — sworn in blood, sealed in steel.</p>
                  <p className="md:text-right">That truth is dead now. Broken by betrayal. Buried under iron and ash. The clans turned on each other.</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-black pt-48 pb-12 flex flex-col items-center border-t border-white/5 w-full">
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-16 pb-12 border-b border-white/10 text-center">
                <div className="flex items-center justify-center gap-3 text-white font-heading text-2xl font-semibold italic tracking-tight mb-8">
                  <iconify-icon icon="lucide:swords" width="32" height="32" className="text-white"></iconify-icon> The Hunt
                </div>
                <p className="text-gray-500 text-sm">© 2026 The Hunt. Built for future champions.</p>
              </div>
            </footer>
          </>
        )
      ) : (
        <div className="pt-24 min-h-screen bg-zinc-950">
          <section className="max-w-7xl mx-auto px-6 pt-12 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 mb-8">
              <div>
                <h1 className="text-white text-5xl font-heading font-bold italic uppercase mb-2">
                  Bienvenue, <span className="text-[#c28e3a]">{user?.name}</span>
                </h1>
                <p className="text-zinc-500 font-monda uppercase text-xs tracking-widest">
                  {user?.academy} // {user?.clan?.name}
                </p>
              </div>

              {/* Dashboard Nav */}
              <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl">
                {[
                  { id: 'profile', label: 'Mon Évolution', icon: 'lucide:user' },
                  { id: 'skills', label: 'Compétences', icon: 'lucide:git-branch' },
                  { id: 'quests', label: 'Défis & Quêtes', icon: 'lucide:scroll' },
                  { id: 'rankings', label: 'Classement', icon: 'lucide:trophy' }
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

            {/* Tab Secret Content */}
            <div className="animate-fade-in py-10">
              {dashboardTab === 'profile' && (
                <div className="flex flex-col items-center gap-12">
                  <Avatar xp={xp} unlockedSkills={unlockedSkills} />
                  <div className="max-w-md w-full bg-zinc-900 border border-white/5 p-8 rounded-2xl text-center">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Progression Totale</h3>
                    <div className="text-6xl text-white font-monda mb-2">{xp}</div>
                    <div className="text-[#c28e3a] text-xs font-bold uppercase tracking-widest">XP Cumulée</div>

                    <div className="mt-8 flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        <span>PROCHAINE ÉVOLUTION</span>
                        <span>{(xp % 100)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#c28e3a]" style={{ width: `${(xp % 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dashboardTab === 'skills' && (
                <SkillTree xp={xp} unlockedSkills={unlockedSkills} onUnlock={handleUnlockSkill} />
              )}

              {dashboardTab === 'quests' && (
                <QuestPanel
                  xp={xp}
                  unlockedSkills={unlockedSkills}
                  completedQuests={completedQuests}
                  onCompleteQuest={handleCompleteQuest}
                />
              )}

              {dashboardTab === 'rankings' && (
                <Leaderboard currentUser={{ ...user, xp, dominant: null }} />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}