import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icons.jsx';
import { ThemeContext } from '../../context/ThemeContext';

export default function LandingNav({ user, landingTab, setLandingTab, onJoin }) {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(window.navigator.userAgent);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    let frameId = 0;
    let scrolled = window.scrollY > 40;
    header.classList.toggle('is-scrolled', scrolled);

    const updateScrollState = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const nextScrolled = window.scrollY > 40;
        if (nextScrolled === scrolled) return;
        scrolled = nextScrolled;
        header.classList.toggle('is-scrolled', scrolled);
      });
    };

    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstallHelp(false);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstallHelp((visible) => !visible);
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const canOfferInstall = !isInstalled;

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
    <header ref={headerRef} className="landing-header fixed inset-x-0 top-0 z-[100]">
    <nav aria-label="Navigation principale" className="landing-nav mx-auto flex w-full items-center justify-between border border-white/10 text-white">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={goHome}>
        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
          <img
            src="/assets/scarab-logo.png"
            alt="Wakkany logo"
            className="w-full h-full object-contain rounded-md"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/wakkany_1.webp'; }}
          />
          <div className="absolute inset-0 bg-[#c28e3a] blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-md"></div>
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

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="landing-nav-theme hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 sm:inline-flex"
          aria-label={theme === 'sombre' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          title={theme === 'sombre' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'sombre' ? '☀️' : '🌙'}
        </button>

        <button
          type="button"
          onClick={onJoin}
          className="hidden md:flex items-center gap-3 px-6 py-2 bg-zinc-900 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#c28e3a] hover:text-black transition-all group active:scale-95 shadow-xl"
        >
          {user && (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black flex items-center justify-center shrink-0">
              {user.clan?.id === 'heroes' && <Icon name="shield" width={18} height={18} className="text-red-500" />}
              {user.clan?.id === 'warriors' && <Icon name="sword" width={18} height={18} className="text-orange-500" />}
              {user.clan?.id === 'dinos' && <Icon name="zap" width={18} height={18} className="text-green-500" />}
              {user.clan?.id === 'cars' && <Icon name="gauge" width={18} height={18} className="text-blue-500" />}
            </div>
          )}
          <span className="truncate max-w-[150px]">{user ? `${user.name}` : 'Commencer'}</span>
        </button>

        <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-2" aria-expanded={isMenuOpen} aria-controls="landing-mobile-menu" aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
          <Icon name={isMenuOpen ? 'close' : 'menu'} width={24} height={24} />
        </button>
      </div>

      {isMenuOpen && (
        <div id="landing-mobile-menu" className="landing-mobile-menu absolute top-full left-0 flex w-full flex-col gap-6 border border-white/10 bg-zinc-950/98 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl animate-fade-in">
          <button type="button" onClick={() => { goHome(); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Accueil</button>
          <button type="button" onClick={() => { setLandingTab('waitlist'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Liste d&apos;attente</button>
          <button type="button" onClick={() => { onJoin(); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Commencer</button>
          <button type="button" onClick={() => { navigate('/quiz'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">Quiz Salon</button>
          <button type="button" onClick={() => { setLandingTab('about'); setIsMenuOpen(false); }} className="text-white font-black uppercase tracking-widest text-left">À Propos</button>
          {canOfferInstall && (
            <button type="button" onClick={handleInstall} className="text-left font-black uppercase tracking-widest text-[#c28e3a]">
              Installer l&apos;application
            </button>
          )}
          {showInstallHelp && (
            <p className="text-sm leading-6 text-zinc-300">
              {isIos
                ? 'Dans Safari, touchez Partager puis « Sur l’écran d’accueil ».'
                : isAndroid
                  ? 'Dans le menu du navigateur, choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».'
                  : 'Ouvrez le menu de votre navigateur et choisissez « Installer Wakkany » ou « Installer cette application ». '}
            </p>
          )}
        </div>
      )}
    </nav>
    {!isMenuOpen && (
      <button
        type="button"
        onClick={handleInstall}
        className="absolute right-4 top-full mt-3 hidden items-center gap-2 rounded-full border border-[#c28e3a]/50 bg-zinc-950/95 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-xl transition-colors hover:border-[#c28e3a] hover:text-[#e8b96a] sm:inline-flex"
      >
        <iconify-icon icon="mdi:download" width="16" height="16" />
        Installer l&apos;application
      </button>
    )}
    {showInstallHelp && !isMenuOpen && (
      <p className="absolute right-4 top-full mt-14 max-w-xs rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300 shadow-xl">
        {isIos
          ? 'Dans Safari, touchez Partager puis « Sur l’écran d’accueil ».'
          : isAndroid
            ? 'Dans le menu du navigateur, choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».'
            : 'Ouvrez le menu de votre navigateur et choisissez « Installer Wakkany ».'}
      </p>
    )}
    </header>
  );
}

