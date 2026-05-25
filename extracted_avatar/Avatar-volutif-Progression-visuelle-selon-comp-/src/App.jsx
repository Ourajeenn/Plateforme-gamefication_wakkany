import React, { useState, useEffect } from 'react';
import ChampionPath from './components/ChampionPath';
import ProfileSetup from './components/ProfileSetup';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'setup', 'dashboard'
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        Initializing Aethermoor...
      </div>
    </div>
  );

  const LandingNav = () => (
    <nav className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between px-6 py-4 z-50">
      <div className="flex items-center gap-3">
        <iconify-icon icon="lucide:triangle" width="32" height="32" className="text-white rotate-180 stroke-[1.5]"></iconify-icon>
      </div>
      <div className="hidden md:flex items-center gap-10 text-white text-base font-medium uppercase tracking-wider">
        <button onClick={() => setView('landing')} className="bg-zinc-800/80 px-6 py-2 rounded-lg text-white transition-colors hover:bg-zinc-700">HOME</button>
        <button onClick={() => scrollToSection('lore')} className="text-gray-300 hover:text-white transition-colors">WAITLIST</button>
        <button onClick={() => {
          if (user) setView('dashboard');
          else handleJoinClick();
        }} className="text-gray-300 hover:text-white transition-colors">CHAMPION</button>
        <button onClick={() => scrollToSection('characters')} className="text-gray-300 hover:text-white transition-colors">ABOUT</button>
        <a href="https://steamcommunity.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">BLOG</a>
      </div>
      <div className="hidden md:flex items-center bg-white/5 rounded-lg px-4 py-2 border border-white/5">
        <iconify-icon icon="solar:magnifier-linear" width="16" height="16" className="text-gray-400 stroke-[1.5]"></iconify-icon>
        <input type="text" className="bg-transparent border-none outline-none text-white text-base ml-3 w-40 placeholder-gray-500 focus:ring-0" placeholder="Search..." />
      </div>
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
        <button onClick={() => setView('landing')} className="text-zinc-600 hover:text-[#c28e3a] transition-all hover:scale-110">
          <iconify-icon icon="solar:logout-2-linear" width="24"></iconify-icon>
        </button>
      </div>
    </nav>
  );

  if (isLoading) return <Preloader />;

  if (view === 'setup') {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="antialiased opacity-0 animate-fade-in">
      {view === 'landing' ? <LandingNav /> : <DashboardNav />}

      {view === 'landing' ? (
        <>
          {/* Hero Section */}
          <header className="relative w-full h-screen min-h-[900px] overflow-hidden flex flex-col justify-end pb-24">
            <div className="absolute inset-0 z-0 bg-zinc-900 overflow-hidden">
              <iframe
                className="video-background opacity-80"
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
                  <h2 className="text-white text-4xl md:text-5xl font-medium italic tracking-tight font-heading uppercase text-shadow-strong">UNITE THE CLANS</h2>
                </div>
                <div className="text-right flex flex-col items-end mt-12 md:mt-0 opacity-0 animate-fade-in delay-400">
                  <h1 className="text-white text-7xl md:text-9xl font-bold italic leading-[0.9] tracking-tight font-heading text-shadow-strong">Beast<br />borne</h1>
                  <p className="text-gray-200 text-2xl md:text-3xl mt-6 max-w-lg text-shadow-strong tracking-tight">The Covenant is broken. The hunt begins.</p>
                  <div className="mt-16 flex flex-col items-end gap-8">
                    <div className="text-center shadow-xl bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-[#c28e3a]/50 transition-all group">
                      <iconify-icon icon="lucide:swords" width="48" height="48" className="text-[#c28e3a] mx-auto stroke-[1.5] block group-hover:scale-110 transition-transform"></iconify-icon>
                      <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mt-4 font-bold">Combat Role</p>
                      <p className="text-white text-2xl font-heading italic uppercase mt-1">Fighter</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-auto mt-auto mb-12 flex justify-center">
                <button
                  onClick={handleJoinClick}
                  className="clip-button relative px-16 py-5 bg-gradient-to-r from-[#e6aa45] to-[#c28e3a] text-black font-bold text-2xl uppercase tracking-[0.2em] font-heading italic transition-all duration-300 hover:scale-105 hover:brightness-110 shadow-2xl hover:shadow-[#c28e3a]/20"
                >
                  Join the Pack
                </button>
              </div>
            </div>
          </header>

          {/* Lore Section */}
          <section id="lore" className="py-32 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "linear-gradient(to bottom, rgba(21,21,21,0.85), rgba(21,21,21,0.9)), url('https://i.postimg.cc/Qtjkb1QH/bg24.png')", backgroundColor: "#151515" }}>
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 flex justify-between items-center px-4 md:px-12 opacity-40">
              <img src="https://i.postimg.cc/C1wHNkG1/blade2.png" alt="Left Blade" className="w-48 md:w-80 object-contain animate-float-left" />
              <img src="https://i.postimg.cc/Ssm7rC6K/bladepng.png" alt="Right Blade" className="w-48 md:w-80 object-contain animate-float-right" />
            </div>
            <div className="max-w-6xl mx-auto px-6 relative z-10 text-center py-24">
              <h2 className="text-white text-5xl md:text-6xl font-bold tracking-tight font-heading italic uppercase mb-6">THE WORLD OF AETHERMOOR</h2>
              <div className="w-16 h-1 bg-[#c28e3a] mx-auto mb-20 shadow-[0_0_10px_#c28e3a]"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 text-left text-gray-400 text-2xl font-monda leading-relaxed italic">
                <p>Before the chains. Before the silence. There was a promise between beasts — sworn in blood, sealed in steel.<br /><br />They called it the Covenant. An oath that bound fox, tiger, wolf, and a hundred clans to a single truth: no beast stands alone.</p>
                <p className="md:text-right">That truth is dead now. Broken by betrayal. Buried under iron and ash. The clans turned on each other. The old forests went silent. And the last guardian — a fox with a blade and a promise she refuses to forget — walks a world that has already given up.</p>
              </div>
            </div>
          </section>

          {/* Characters Section */}
          <section id="characters" className="bg-zinc-900 py-32 text-center relative z-10 border-t border-white/5">
            <h3 className="text-zinc-500 text-2xl font-bold tracking-[0.2em] font-heading uppercase mb-4">ARCHETYPES OF THE</h3>
            <h2 className="text-white text-7xl md:text-8xl font-bold tracking-tight font-heading italic uppercase mb-6 text-shadow-strong">COVENANT</h2>
            <div className="w-16 h-1 bg-[#c28e3a] mx-auto mb-24 shadow-[0_0_10px_#c28e3a]"></div>

            <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 relative">
              {/* Grumm Profiler Example */}
              <div className="flex flex-col text-left w-full max-w-xl z-20 shadow-2xl bg-zinc-950 text-white transform transition-all hover:scale-[1.02] border border-white/10 group">
                <div className="w-full h-[500px] relative overflow-hidden bg-zinc-800">
                  <img src="https://i.postimg.cc/qv918NDq/hippo1.png" alt="Grumm" className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80"></div>
                </div>
                <div className="p-10 flex flex-col gap-6 bg-zinc-950 relative">
                  <div className="flex items-baseline gap-4">
                    <h4 className="text-white text-5xl font-bold tracking-tight font-heading italic uppercase">GRUMM</h4>
                    <span className="text-[#c28e3a] text-2xl font-heading italic opacity-60">/ The Siege</span>
                  </div>
                  <p className="text-gray-300 text-xl font-medium italic line-clamp-2">"I don't knock. I am the knock."</p>
                  <p className="text-gray-500 text-lg leading-relaxed font-monda">The walking earthquake. Grumm doesn't strategize — he arrives, and the problem stops existing. Fiercely protective of anyone small enough to stand behind him.</p>
                  <div className="mt-6 flex justify-between items-center">
                    <button onClick={handleJoinClick} className="clip-card-btn px-12 py-4 bg-white text-black text-lg font-bold italic uppercase tracking-widest hover:bg-[#c28e3a] hover:text-white transition-all font-heading">Claim Path</button>
                    <div className="flex gap-2">
                      <div className="w-10 h-1 bg-[#c28e3a]"></div>
                      <div className="w-6 h-1 bg-zinc-800"></div>
                      <div className="w-6 h-1 bg-zinc-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Social / Support CTA */}
          <section className="bg-black py-24 text-center border-t border-white/5">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-zinc-600 text-sm font-bold uppercase tracking-[0.5em] mb-12">Expand The Hunt</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <a href="#" className="flex flex-col items-center gap-4 group">
                  <div className="p-6 bg-white/5 rounded-full border border-white/5 group-hover:border-[#c28e3a]/50 transition-all group-hover:scale-110">
                    <iconify-icon icon="simple-icons:steam" width="32" height="32" className="text-gray-400 group-hover:text-white transition-colors"></iconify-icon>
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-500 group-hover:text-white">Steam</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-4 group">
                  <div className="p-6 bg-white/5 rounded-full border border-white/5 group-hover:border-[#c28e3a]/50 transition-all group-hover:scale-110">
                    <iconify-icon icon="simple-icons:discord" width="32" height="32" className="text-gray-400 group-hover:text-white transition-colors"></iconify-icon>
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-500 group-hover:text-white">Discord</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-4 group">
                  <div className="p-6 bg-white/5 rounded-full border border-white/5 group-hover:border-[#c28e3a]/50 transition-all group-hover:scale-110">
                    <iconify-icon icon="simple-icons:x" width="32" height="32" className="text-gray-400 group-hover:text-white transition-colors"></iconify-icon>
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-500 group-hover:text-white">Twitter</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-4 group">
                  <div className="p-6 bg-white/5 rounded-full border border-white/5 group-hover:border-[#c28e3a]/50 transition-all group-hover:scale-110">
                    <iconify-icon icon="simple-icons:twitch" width="32" height="32" className="text-gray-400 group-hover:text-white transition-colors"></iconify-icon>
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-500 group-hover:text-white">Twitch</span>
                </a>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="pt-24 min-h-screen bg-zinc-950">
          <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 border-b border-white/5">
            <h1 className="text-white text-4xl font-heading font-bold italic uppercase mb-2">Welcome Back, {user?.name}</h1>
            <p className="text-zinc-500 font-monda">Your visual evolution is tracked via the quest completion system below.</p>
          </section>

          <ChampionPath userClan={user?.clan} />

          <Leaderboard />
        </div>
      )}

      {/* Footer */}
      <footer className="relative bg-black pt-48 pb-12 flex flex-col items-center border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[50%] w-full max-w-6xl z-20 pointer-events-none flex justify-center px-4">
          <img src="https://i.postimg.cc/9MzzCfVb/footer.png" alt="Footer Lineup" className="w-full h-auto max-h-[600px] object-contain drop-shadow-2xl opacity-50" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-16 pb-12 border-b border-white/10 text-center">
          <div className="flex items-center justify-center gap-3 text-white font-heading text-2xl font-semibold italic tracking-tight mb-8">
            <iconify-icon icon="lucide:swords" width="32" height="32" className="text-white stroke-[1.5]"></iconify-icon> The Hunt
          </div>
          <p className="text-gray-500 text-sm">© 2026 The Hunt. Built for future champions.</p>
        </div>
      </footer>
    </div>
  );
}