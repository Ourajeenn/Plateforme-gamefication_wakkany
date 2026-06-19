import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingNav({ user, landingTab, setLandingTab, onJoin }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goHome = () => {
    navigate('/');
    setLandingTab(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 w-full glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 z-[100] shadow-[0_18px_50px_rgba(0,0,0,0.35)]" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
      <div className="flex items-center gap-3 group cursor-pointer" onClick={goHome}>
        <div className="relative">
          <iconify-icon icon="lucide:triangle" width="32" height="32" className="text-[#c28e3a] rotate-180 stroke-[1.5]"></iconify-icon>
          <div className="absolute inset-0 bg-[#c28e3a] blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
        </div>
        <span className="text-white font-heading font-bold italic tracking-tighter uppercase text-lg sm:text-xl">Wakkany</span>
      </div>

      <div className="hidden lg:flex items-center gap-10 text-white text-[11px] font-black uppercase tracking-[0.2em]">
        <button type="button" onClick={() => { goHome(); scrollToSection('hero'); }} className="hover:text-[#c28e3a] transition-all hover:tracking-[0.3em]">ACCUEIL</button>
        <button type="button" onClick={() => setLandingTab('waitlist')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'waitlist' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>LISTE D&apos;ATTENTE</button>
        <button type="button" onClick={() => navigate('/quiz')} className="text-zinc-500 hover:text-[#c28e3a] transition-all">QUIZ SALON</button>
        <button type="button" onClick={onJoin} className="text-zinc-500 hover:text-white transition-all">MON PROFIL</button>
        <button type="button" onClick={() => setLandingTab('blog')} className={`transition-all hover:text-[#c28e3a] ${landingTab === 'blog' ? 'text-[#c28e3a]' : 'text-zinc-500'}`}>HISTOIRE</button>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onJoin}
          className="hidden md:flex items-center gap-3 px-6 py-2 bg-zinc-900 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#c28e3a] hover:text-black transition-all group active:scale-95 shadow-xl"
        >
          {user && (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black flex items-center justify-center shrink-0">
              {user.clan?.id === 'heroes' && <iconify-icon icon="lucide:shield" className="text-red-500"></iconify-icon>}
              {user.clan?.id === 'warriors' && <iconify-icon icon="lucide:sword" className="text-orange-500"></iconify-icon>}
              {user.clan?.id === 'dinos' && <iconify-icon icon="lucide:Zap" className="text-green-500"></iconify-icon>}
              {user.clan?.id === 'cars' && <iconify-icon icon="lucide:gauge" className="text-blue-500"></iconify-icon>}
            </div>
          )}
          <span className="truncate max-w-[150px]">{user ? `${user.name}` : 'Commencer'}</span>
        </button>

        <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-2" aria-label="Basculer le menu mobile">
          <iconify-icon icon={isMenuOpen ? 'lucide:x' : 'lucide:menu'} width="24"></iconify-icon>
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed top-[60px] left-0 w-full bg-zinc-950/98 backdrop-blur-3xl border-b border-white/10 p-8 flex flex-col gap-6 animate-fade-in z-[99]">
          <button type="button" onClick={() => { goHome(); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Accueil</button>
          <button type="button" onClick={() => { setLandingTab('waitlist'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Liste d&apos;attente</button>
          <button type="button" onClick={() => { onJoin(); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Commencer</button>
          <button type="button" onClick={() => { navigate('/quiz'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Quiz Salon</button>
          <button type="button" onClick={() => { setLandingTab('about'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">À Propos</button>
        </div>
      )}
    </nav>
  );
}
