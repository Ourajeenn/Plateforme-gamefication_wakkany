import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoireView from '../components/HistoireView';
import LandingNav from '../components/layout/LandingNav';
import PageLoader from '../components/common/PageLoader';
import WaitlistPage from './landing/WaitlistPage';
import AboutPage from './landing/AboutPage';
import ArchetypesPage from './landing/ArchetypesPage';
import { AvatarCarousel } from '../routes/lazyComponents';
import ScrollReveal from '../components/common/ScrollReveal';

export default function LandingPage({ user, onJoin }) {
  const navigate = useNavigate();
  const [landingTab, setLandingTab] = useState(null);
  const [activeChar, setActiveChar] = useState('bledja');

  const handleJoinClick = () => {
    if (user) {
      navigate('/dashboard/profile');
      return;
    }
    onJoin();
  };

  const goHome = () => {
    setLandingTab(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <LandingNav
        user={user}
        landingTab={landingTab}
        setLandingTab={setLandingTab}
        onJoin={handleJoinClick}
      />

      {landingTab === 'waitlist' ? (
        <WaitlistPage onBack={goHome} />
      ) : landingTab === 'about' ? (
        <AboutPage onBack={goHome} />
      ) : landingTab === 'blog' ? (
        <div className="pt-24"><HistoireView /></div>
      ) : landingTab === 'archetypes' ? (
        <ArchetypesPage onBack={goHome} onJoin={handleJoinClick} />
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
                  <a href="#lore" onClick={(e) => { e.preventDefault(); document.getElementById('lore')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] mb-2 text-white">Défiler vers l'Aube</span>
                    <iconify-icon icon="lucide:chevron-down" width="16" className="animate-bounce text-white"></iconify-icon>
                  </a>
                  
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

            {/* Section Appel à l'Action (Steam & Discord) */}
            <section className="bg-gradient-to-b from-white to-gray-100 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center border-t border-gray-200 relative z-10">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                <ScrollReveal animation="fade-up" duration={800}>
                  <h2 className="text-zinc-900 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-heading italic uppercase mb-4 text-shadow-sm">LE COVENANT EST EN ATTENTE</h2>
                  <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-8"></div>
                  <p className="text-zinc-800 text-base sm:text-lg md:text-xl font-monda leading-relaxed mb-10">
                    Choisissez votre bête, aiguisez votre lame, et entrez dans un monde qui riposte. Wakkany est gratuit sur Steam — pas de barrières, pas de chaînes. Rejoignez la communauté sur Discord pour forger vos alliances.
                  </p>
                </ScrollReveal>
                <ScrollReveal animation="scale-up" delay={200} duration={800}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <a href="https://store.steampowered.com/app/wakkany" target="_blank" rel="noreferrer" className="group flex items-center gap-4 bg-zinc-900 text-white px-8 py-4 rounded-xl transition-all hover:bg-black hover:scale-105 shadow-xl w-full sm:w-auto">
                      <iconify-icon icon="simple-icons:steam" width="28" height="28" className="text-white group-hover:text-gray-300 block"></iconify-icon>
                      <div className="text-left border-l border-white/20 pl-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-1">Liste de souhaits sur</div>
                        <div className="text-xl font-bold tracking-wider font-heading">STEAM</div>
                      </div>
                    </a>
                    <a href="https://discord.gg/wakkany" target="_blank" rel="noreferrer" className="group flex items-center gap-4 bg-[#5865F2] text-white px-8 py-4 rounded-xl transition-all hover:bg-[#4752C4] hover:scale-105 shadow-xl w-full sm:w-auto">
                      <iconify-icon icon="simple-icons:discord" width="28" height="28" className="text-white block"></iconify-icon>
                      <div className="text-left border-l border-white/20 pl-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/80 font-medium mb-1">Rejoignez la Meute</div>
                        <div className="text-xl font-bold tracking-wider font-heading">DISCORD</div>
                      </div>
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            <Suspense fallback={<PageLoader />}><AvatarCarousel /></Suspense>

            {/* Section Lore */}
            <section id="lore" className="py-16 sm:py-24 md:py-32 relative bg-cover bg-center overflow-hidden" style={{ backgroundImage: "linear-gradient(to bottom, rgba(21,21,21,0.85), rgba(21,21,21,0.9)), url('https://i.postimg.cc/Qtjkb1QH/bg24.png')", backgroundColor: "#151515", backgroundAttachment: 'scroll' }}>
              {/* Subtle Floating Blades framing the background */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 flex justify-between items-center px-4 md:px-12 opacity-40">
                {/* Left Blade */}
                <ScrollReveal animation="fade-right" duration={1000}>
                  <img src="https://i.postimg.cc/C1wHNkG1/blade2.png" alt="Left Blade" className="w-28 sm:w-40 md:w-80 object-contain animate-float-left drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                </ScrollReveal>
                {/* Right Blade */}
                <ScrollReveal animation="fade-left" duration={1000}>
                  <img src="https://i.postimg.cc/Ssm7rC6K/bladepng.png" alt="Right Blade" className="w-28 sm:w-40 md:w-80 object-contain animate-float-right drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                </ScrollReveal>
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-8 sm:py-16 md:py-24">
                <ScrollReveal animation="fade-down" duration={800}>
                  <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight font-heading uppercase mb-4 sm:mb-6">LE MONDE D'ARTHÉLYON</h2>
                  <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-10 sm:mb-16 md:mb-20"></div>
                </ScrollReveal>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-24 text-left text-gray-300 text-base sm:text-lg md:text-2xl font-monda leading-relaxed italic">
                  <ScrollReveal animation="fade-right" delay={150} duration={850}>
                    <div className="space-y-6">
                      <p>Avant les chaînes. Avant le silence. Il y avait une promesse entre les bêtes — jurée par le sang, scellée par l'acier.</p>
                      <p>Ils l'appelaient le Covenant. Un serment qui liait le renard, le tigre, le loup et une centaine de clans à une seule vérité : aucune bête ne se tient seule.</p>
                    </div>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-left" delay={150} duration={850}>
                    <div className="space-y-6 md:text-right">
                      <p>Cette vérité est morte aujourd'hui. Brisée par la trahison. Enterrée sous le fer et les cendres.</p>
                      <p>Les clans se sont retournés les uns contre les autres. Les vieilles forêts se sont tues. Et le dernier gardien — un renard avec une lame et une promesse qu'il refuse d'oublier — marche dans un monde qui a déjà abandonné.</p>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </section>

            {/* Section Personnages (Alliés de la Covenant) */}
            <section id="characters" className="bg-white py-24 sm:py-32 text-center relative z-10">
              <h2 className="text-zinc-900 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-heading italic uppercase mb-4 sm:mb-6">ALLIÉS DE LA COVENANT</h2>
              <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-10 sm:mb-16 md:mb-20"></div>

              {/* Avatars Row */}
              <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16 md:mb-28 overflow-x-auto px-4 sm:px-6 py-4 max-w-6xl mx-auto scrollbar-hide">
                {[
                  { id: '03', name: 'Bledja', img: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=200', char: 'bledja' },
                  { id: '04', name: 'Bledja', img: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=200', char: 'bledja' },
                  { id: '05', name: 'Bledja', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200', char: 'bledja' },
                  { id: '06', name: 'Bledja', img: 'https://i.postimg.cc/qv918NDq/hippo1.png', char: 'bledja' },
                  { id: '07', name: 'Timoin', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&q=80&w=200', char: 'timoin' },
                  { id: '08', name: 'Akwa', img: 'https://i.postimg.cc/4xrWzY2N/monkey.png', char: 'akwa' },
                  { id: '09', name: 'Timoin', img: 'https://i.postimg.cc/DwtxqSpw/panda.png', char: 'timoin' },
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
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-center gap-8 relative">
                
                {/* Left Character (Timoin) */}
                <div className={`flex flex-col text-left gap-5 w-full max-w-md transition-all duration-500 ${
                  activeChar === 'timoin' 
                    ? 'z-20 scale-100 lg:scale-105 opacity-100 bg-zinc-900 text-white p-5 sm:p-8 border border-white/10 shadow-2xl relative rounded-xl' 
                    : 'z-0 opacity-70 hover:opacity-100 hover:-translate-y-2'
                }`}>
                  {activeChar === 'timoin' && <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-xl"></div>}
                  <div className="flex items-baseline gap-3 px-4">
                    <h4 className={`text-3xl font-medium tracking-tight font-heading uppercase ${activeChar === 'timoin' ? 'text-white' : 'text-zinc-800'}`}>TIMOIN</h4>
                    <span className={`text-lg ${activeChar === 'timoin' ? 'text-gray-400' : 'text-gray-500'}`}>/ L'Accord Parfait</span>
                  </div>
                  <p className={`text-lg font-medium italic px-4 ${activeChar === 'timoin' ? 'text-white' : 'text-zinc-800'}`}>« Le silence est une arme, mais la mélodie est une révolution. »</p>
                  
                  {activeChar === 'timoin' && (
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-2 px-4 font-monda">
                      Un maître des anciennes mélodies. Timoin canalise l'énergie harmonique non pas pour charmer, mais pour briser les lignes ennemies. Ses accords résonnent à travers le chaos, inspirant ses alliés et désorientant quiconque ose croiser sa route.
                    </p>
                  )}
                  
                  <div className="relative w-full h-80 overflow-hidden shadow-lg border border-gray-200 bg-zinc-100 rounded-xl mt-2">
                    <img src="https://i.postimg.cc/DwtxqSpw/panda.png" alt="Timoin" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-4">
                    <button 
                      onClick={handleJoinClick} 
                      className={`clip-card-btn px-8 py-2.5 text-base font-semibold uppercase tracking-wider transition-colors ${
                        activeChar === 'timoin' ? 'bg-[#c28e3a] text-zinc-900 hover:bg-[#d4a045]' : 'bg-zinc-900 text-white hover:bg-black'
                      }`}
                    >
                      EN SAVOIR PLUS
                    </button>
                  </div>
                </div>

                {/* Center Character (Bledja) */}
                <div className={`flex flex-col text-left w-full max-w-xl transition-all duration-500 ${
                  activeChar === 'bledja' 
                    ? 'z-20 scale-100 lg:scale-105 opacity-100 bg-zinc-900 text-white p-5 sm:p-8 border border-white/10 shadow-2xl relative rounded-xl' 
                    : 'z-0 opacity-70 hover:opacity-100 hover:-translate-y-2'
                }`}>
                  {activeChar === 'bledja' && <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-xl"></div>}
                  <div className="relative w-full h-80 overflow-hidden shadow-lg border border-gray-200 bg-zinc-800 rounded-xl mt-2">
                    <img src="https://i.postimg.cc/qv918NDq/hippo1.png" alt="Bledja" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 bg-zinc-900 relative">
                    <div className="flex items-baseline gap-3">
                      <h4 className="text-white text-4xl font-medium tracking-tight font-heading uppercase">BLEDJA</h4>
                      <span className="text-gray-400 text-xl">/ Le Brise-Roc</span>
                    </div>
                    <p className="text-white text-lg font-medium italic">« Un mur ne recule jamais. Moi non plus. »</p>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-2 font-monda">
                      Une montagne inébranlable forgée dans la fureur des combats. Bledja est le bouclier ultime de la Covenant, capable d'encaisser des chocs qui briseraient n'importe quelle autre bête. Il parle peu, préférant laisser la lourdeur de ses coups s'exprimer. Ceux qui le défient apprennent vite qu'on n'arrête pas un éboulement.
                    </p>
                    <div className="mt-4">
                      <button onClick={handleJoinClick} className="clip-card-btn px-10 py-3 bg-[#c28e3a] text-zinc-900 text-base font-semibold uppercase tracking-wider hover:bg-[#d4a045] transition-colors">EN SAVOIR PLUS</button>
                    </div>
                  </div>
                </div>

                {/* Right Character (Akwa) */}
                <div className={`flex flex-col text-right items-end gap-5 w-full max-w-md transition-all duration-500 ${
                  activeChar === 'akwa' 
                    ? 'z-20 scale-100 lg:scale-105 opacity-100 bg-zinc-900 text-white p-5 sm:p-8 border border-white/10 shadow-2xl relative text-left items-start rounded-xl' 
                    : 'z-0 opacity-70 hover:opacity-100 hover:-translate-y-2'
                }`}>
                  {activeChar === 'akwa' && <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-xl"></div>}
                  <div className="flex items-baseline justify-end gap-3 w-full px-4">
                    <h4 className={`text-3xl font-medium tracking-tight font-heading uppercase ${activeChar === 'akwa' ? 'text-white' : 'text-zinc-800'}`}>AKWA</h4>
                    <span className={`text-lg ${activeChar === 'akwa' ? 'text-gray-400' : 'text-gray-500'}`}>/ L'Ombre Bondissante</span>
                  </div>
                  <p className={`text-lg font-medium italic px-4 ${activeChar === 'akwa' ? 'text-white text-left' : 'text-zinc-800 text-right'}`}>« Si tu peux me voir, c'est que j'ai déjà gagné. »</p>
                  
                  {activeChar === 'akwa' && (
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-2 px-4 font-monda text-left">
                      Agile, imprévisible et mortellement précis. Akwa se meut avec la fluidité de l'eau, frappant depuis les angles morts avant même que ses ennemis ne réalisent sa présence. Un esprit rebelle qui défie la gravité et toutes les lois établies.
                    </p>
                  )}
                  
                  <div className="relative w-full h-80 overflow-hidden shadow-lg border border-gray-200 bg-zinc-100 rounded-xl mt-2">
                    <img src="https://i.postimg.cc/4xrWzY2N/monkey.png" alt="Akwa" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-4">
                    <button 
                      onClick={handleJoinClick} 
                      className={`clip-card-btn px-8 py-2.5 text-base font-semibold uppercase tracking-wider transition-colors ${
                        activeChar === 'akwa' ? 'bg-[#c28e3a] text-zinc-900 hover:bg-[#d4a045]' : 'bg-zinc-900 text-white hover:bg-black'
                      }`}
                    >
                      EN SAVOIR PLUS
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Section Gameplay & Fonctionnalités */}
            <section id="gameplay" className="bg-zinc-950 py-24 sm:py-32 text-center relative z-10 border-t border-white/10">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h2 className="text-white text-4xl sm:text-5xl font-bold tracking-tight font-heading italic uppercase mb-4 text-shadow-sm">FORGEZ VOTRE LÉGENDE</h2>
                <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-16"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform">
                    <iconify-icon icon="lucide:swords" width="48" className="text-[#c28e3a] mb-6"></iconify-icon>
                    <h3 className="text-white text-2xl font-bold font-heading mb-3">Combats Dynamiques</h3>
                    <p className="text-zinc-400 font-monda">Un système de combat fluide qui récompense le timing, la précision et l'exploitation des faiblesses ennemies. Chaque coup compte.</p>
                  </div>
                  <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform">
                    <iconify-icon icon="lucide:git-branch" width="48" className="text-[#c28e3a] mb-6"></iconify-icon>
                    <h3 className="text-white text-2xl font-bold font-heading mb-3">Arbre de Talents</h3>
                    <p className="text-zinc-400 font-monda">Personnalisez votre style de jeu. Vos choix de compétences modifient non seulement vos attaques, mais aussi l'apparence de votre avatar.</p>
                  </div>
                  <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform">
                    <iconify-icon icon="lucide:users" width="48" className="text-[#c28e3a] mb-6"></iconify-icon>
                    <h3 className="text-white text-2xl font-bold font-heading mb-3">Alliances de Clans</h3>
                    <p className="text-zinc-400 font-monda">Rejoignez une guilde, participez aux raids coopératifs et défendez vos territoires contre les clans rivaux dans le mode Arène.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Roadmap */}
            <section id="roadmap" className="bg-zinc-900 py-24 sm:py-32 relative z-10">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-white text-4xl sm:text-5xl font-bold tracking-tight font-heading italic uppercase mb-4 text-shadow-sm">FEUILLE DE ROUTE</h2>
                <div className="w-12 h-1 bg-[#c28e3a] mx-auto mb-16"></div>
                
                <div className="flex flex-col gap-8 text-left">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center glass-panel p-6 rounded-2xl border-l-4 border-l-[#c28e3a]">
                    <div className="text-[#c28e3a] font-bold text-xl min-w-[120px]">Q3 2026</div>
                    <div>
                      <h3 className="text-white text-lg font-bold mb-1">Alpha Fermée</h3>
                      <p className="text-zinc-400 text-sm">Tests des mécaniques de base, équilibrage des 3 classes principales, système de combat V1.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center glass-panel p-6 rounded-2xl opacity-70 border-l-4 border-l-transparent">
                    <div className="text-zinc-500 font-bold text-xl min-w-[120px]">Q4 2026</div>
                    <div>
                      <h3 className="text-white text-lg font-bold mb-1">Accès Anticipé</h3>
                      <p className="text-zinc-400 text-sm">Ouverture du premier hub social, ajout de 10 nouveaux boss, intégration du système de clans.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center glass-panel p-6 rounded-2xl opacity-50 border-l-4 border-l-transparent">
                    <div className="text-zinc-500 font-bold text-xl min-w-[120px]">Q1 2027</div>
                    <div>
                      <h3 className="text-white text-lg font-bold mb-1">Lancement Global V1.0</h3>
                      <p className="text-zinc-400 text-sm">Campagne complète, tournois e-sport intégrés, déploiement sur consoles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Preuves Sociales */}
            <section className="bg-zinc-950 pt-24 pb-56 text-center relative z-10 border-t border-white/5 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <h2 className="text-white text-3xl font-bold font-heading italic mb-12">"LE RPG DE L'ANNÉE SELON LA COMMUNAUTÉ"</h2>
                
                <div className="relative flex overflow-hidden">
                  <div className="flex w-max animate-marquee gap-6">
                    {/* Dupliquer les témoignages pour créer une boucle fluide */}
                    {[1, 2, 3].map((group) => (
                      <React.Fragment key={group}>
                        <div className="w-[300px] sm:w-[400px] glass-panel p-6 rounded-xl relative shrink-0 text-left">
                          <iconify-icon icon="lucide:quote" width="32" className="text-white/10 absolute top-4 right-4"></iconify-icon>
                          <div className="flex items-center gap-2 text-yellow-500 mb-3">
                            {[1,2,3,4,5].map(i => <iconify-icon key={i} icon="lucide:star" width="16"></iconify-icon>)}
                          </div>
                          <p className="text-zinc-300 italic mb-4">"Le système de combat est incroyablement nerveux. On ressent chaque impact, et la synergie entre les talents est phénoménale."</p>
                          <p className="text-zinc-500 text-sm font-bold uppercase">— @DarkKnight99</p>
                        </div>
                        <div className="w-[300px] sm:w-[400px] glass-panel p-6 rounded-xl relative shrink-0 text-left">
                          <iconify-icon icon="lucide:quote" width="32" className="text-white/10 absolute top-4 right-4"></iconify-icon>
                          <div className="flex items-center gap-2 text-yellow-500 mb-3">
                            {[1,2,3,4,5].map(i => <iconify-icon key={i} icon="lucide:star" width="16"></iconify-icon>)}
                          </div>
                          <p className="text-zinc-300 italic mb-4">"Enfin un jeu qui ne nous prend pas par la main. L'univers de la Covenant est sombre, mature, et graphiquement sublime."</p>
                          <p className="text-zinc-500 text-sm font-bold uppercase">— @LyraFanboy</p>
                        </div>
                        <div className="w-[300px] sm:w-[400px] glass-panel p-6 rounded-xl relative shrink-0 text-left">
                          <iconify-icon icon="lucide:quote" width="32" className="text-white/10 absolute top-4 right-4"></iconify-icon>
                          <div className="flex items-center gap-2 text-yellow-500 mb-3">
                            {[1,2,3,4,5].map(i => <iconify-icon key={i} icon="lucide:star" width="16"></iconify-icon>)}
                          </div>
                          <p className="text-zinc-300 italic mb-4">"Une direction artistique à couper le souffle. J'ai été happé par l'histoire d'Arthélyon dès les premières minutes."</p>
                          <p className="text-zinc-500 text-sm font-bold uppercase">— @EpicGamer2026</p>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
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
      )}
    </>
  );
}
