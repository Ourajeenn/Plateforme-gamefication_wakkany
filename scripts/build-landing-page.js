import fs from 'fs';

const body = fs.readFileSync('src/pages/_landing_body.txt', 'utf8');
const mainStart = body.indexOf('<>');
const mainEnd = body.lastIndexOf('</>');
const mainContent = body.slice(mainStart, mainEnd + 3);

const file = `import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoireView from '../components/HistoireView';
import LandingNav from '../components/layout/LandingNav';
import PageLoader from '../components/common/PageLoader';
import WaitlistPage from './landing/WaitlistPage';
import AboutPage from './landing/AboutPage';
import ArchetypesPage from './landing/ArchetypesPage';
import { AvatarCarousel } from '../routes/lazyComponents';

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
        ${mainContent.replace('<AvatarCarousel />', `<Suspense fallback={<PageLoader />}><AvatarCarousel /></Suspense>`)}
      )}
    </>
  );
}
`;

fs.writeFileSync('src/pages/LandingPage.jsx', file);
console.log('LandingPage.jsx generated');
