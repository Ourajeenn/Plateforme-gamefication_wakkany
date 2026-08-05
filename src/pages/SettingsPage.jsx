/**
 * SettingsPage — Paramètres utilisateur et préférences
 * Consolide Settings et Themes en une même interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const THEMES = [
  { id: 'dark', label: 'Mode Sombre', icon: 'mdi:moon', color: 'text-purple-400' },
  { id: 'light', label: 'Mode Clair', icon: 'mdi:sun', color: 'text-yellow-400' },
  { id: 'auto', label: 'Auto', icon: 'mdi:brightness-auto', color: 'text-blue-400' },
];

const GAME_THEMES = [
  { id: 'rpg', label: 'Univers RPG', icon: 'mdi:swords', desc: 'Monde fantasy et magie' },
  { id: 'history', label: 'Histoire', icon: 'mdi:scroll', desc: 'Civilisations et récits' },
  { id: 'science', label: 'Science', icon: 'mdi:microscope', desc: 'Découvertes et nature' },
  { id: 'general', label: 'Culture générale', icon: 'mdi:earth', desc: 'De tout un peu' },
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Facile', icon: 'mdi:star', color: 'text-green-400' },
  { id: 'hunter', label: 'Chasseur', icon: 'mdi:star-half', color: 'text-yellow-400' },
  { id: 'legend', label: 'Légendaire', icon: 'mdi:star', color: 'text-red-400' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [appTheme, setAppTheme] = useState('dark');
  const [gameTheme, setGameTheme] = useState('rpg');
  const [difficulty, setDifficulty] = useState('hunter');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Charger les préférences
  useEffect(() => {
    const savedAppTheme = localStorage.getItem('wakkany_app_theme') || 'dark';
    const savedGameTheme = localStorage.getItem('wakkany_game_theme') || 'rpg';
    const savedDifficulty = localStorage.getItem('wakkany_difficulty') || 'hunter';
    const savedSound = localStorage.getItem('wakkany_sound') !== 'false';
    const savedNotif = localStorage.getItem('wakkany_notifications') !== 'false';
    const savedLang = localStorage.getItem('wakkany_language') || 'fr';

    setAppTheme(savedAppTheme);
    setGameTheme(savedGameTheme);
    setDifficulty(savedDifficulty);
    setSoundEnabled(savedSound);
    setNotifications(savedNotif);
    setLanguage(savedLang);
  }, []);

  // Sauvegarder les préférences
  const handleSave = () => {
    localStorage.setItem('wakkany_app_theme', appTheme);
    localStorage.setItem('wakkany_game_theme', gameTheme);
    localStorage.setItem('wakkany_difficulty', difficulty);
    localStorage.setItem('wakkany_sound', soundEnabled);
    localStorage.setItem('wakkany_notifications', notifications);
    localStorage.setItem('wakkany_language', language);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser tous les paramètres par défaut ?')) {
      localStorage.removeItem('wakkany_app_theme');
      localStorage.removeItem('wakkany_game_theme');
      localStorage.removeItem('wakkany_difficulty');
      localStorage.removeItem('wakkany_sound');
      localStorage.removeItem('wakkany_notifications');
      localStorage.removeItem('wakkany_language');

      setAppTheme('dark');
      setGameTheme('rpg');
      setDifficulty('hunter');
      setSoundEnabled(true);
      setNotifications(true);
      setLanguage('fr');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <iconify-icon icon="mdi:arrow-left" width="20" />
            </button>
            <h1 className="text-3xl font-heading font-black uppercase text-[#c28e3a]">Paramètres</h1>
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest">⚙️ Configuration</div>
        </div>
      </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 bg-zinc-900/30 p-2 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'appearance' ? 'bg-[#c28e3a] text-black' : 'text-zinc-300'}`}
            >Apparence</button>
            <button
              onClick={() => setActiveTab('game')}
              className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'game' ? 'bg-[#c28e3a] text-black' : 'text-zinc-300'}`}
            >Paramètres</button>
          </div>
        </div>

        {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Notification de sauvegarde */}
        {saved && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium">
            ✓ Paramètres sauvegardés avec succès
          </div>
        )}

        {activeTab === 'appearance' && (
          <>
            {/* Section Thème Visuel */}
            <Section title="Thème Visuel" icon="mdi:palette">
          <div className="grid grid-cols-3 gap-4">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setAppTheme(t.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  appTheme === t.id
                    ? 'border-[#c28e3a] bg-[#c28e3a]/10'
                    : 'border-white/10 bg-zinc-900 hover:border-white/20'
                }`}
              >
                <div className={`text-3xl flex justify-center mb-2 ${t.color}`}>
                  <iconify-icon icon={t.icon} width="28"></iconify-icon>
                </div>
                <div className="text-sm font-bold">{t.label}</div>
              </button>
            ))}
          </div>
            </Section>

            {/* Section Difficulté */}
            <Section title="Difficulté par Défaut" icon="mdi:target">
              <div className="grid grid-cols-3 gap-4">
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      difficulty === d.id
                        ? 'border-[#c28e3a] bg-[#c28e3a]/10'
                        : 'border-white/10 bg-zinc-900 hover:border-white/20'
                    }`}
                  >
                    <div className={`text-3xl flex justify-center mb-2 ${d.color}`}>
                      <iconify-icon icon={d.icon} width="28"></iconify-icon>
                    </div>
                    <div className="text-sm font-bold">{d.label}</div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Section Langue */}
            <Section title="Langue" icon="mdi:translate">
              <div className="flex gap-4">
                {[
                  { id: 'fr', label: '🇫🇷 Français' },
                  { id: 'en', label: '🇬🇧 English' },
                  { id: 'es', label: '🇪🇸 Español' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${
                      language === lang.id
                        ? 'border-[#c28e3a] bg-[#c28e3a]/10 text-white'
                        : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {activeTab === 'game' && (
          <>
            {/* Section Thème de Jeu */}
            <Section title="Thème de Jeu" icon="mdi:sword">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GAME_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setGameTheme(t.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  gameTheme === t.id
                    ? 'border-[#c28e3a] bg-[#c28e3a]/10'
                    : 'border-white/10 bg-zinc-900 hover:border-white/20'
                }`}
              >
                <div className="text-2xl flex justify-center mb-2 text-[#c28e3a]">
                  <iconify-icon icon={t.icon} width="24"></iconify-icon>
                </div>
                <div className="text-xs font-bold">{t.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
          </Section>

            {/* Section Audio et Notifications */}
            <Section title="Son et Notifications" icon="mdi:bell">
          <div className="space-y-4">
            <Toggle
              label="Effets sonores"
              checked={soundEnabled}
              onChange={setSoundEnabled}
              description="Activer les bruitages et musiques du jeu"
            />
            <Toggle
              label="Notifications"
              checked={notifications}
              onChange={setNotifications}
              description="Alertes de déblocage et achievements"
            />
          </div>
            </Section>

            {/* Section Données et Sécurité */}
            <Section title="Données et Sécurité" icon="mdi:shield">
          <div className="space-y-3">
            <DataButton
              label="Exporter mes données"
              icon="mdi:download"
              description="Télécharger vos données personnelles et progression"
              onClick={() => alert('Fonctionnalité en développement')}
            />
            <DataButton
              label="Effacer ma progression locale"
              icon="mdi:trash-can"
              description="Réinitialiser votre progression et scores"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr? Cette action est irréversible.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              variant="danger"
            />
          </div>
            </Section>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4 mt-12 mb-8">
          <button
            onClick={handleSave}
            className="flex-1 py-4 bg-[#c28e3a] text-black font-heading font-black uppercase rounded-xl hover:bg-[#e8b96a] transition-all"
          >
            💾 Sauvegarder les paramètres
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-400 font-bold uppercase rounded-xl hover:bg-zinc-800 transition-all"
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl text-[#c28e3a]">
          <iconify-icon icon={icon} width="24"></iconify-icon>
        </div>
        <h2 className="text-xl font-heading font-black uppercase text-white">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#c28e3a]/20 to-transparent"></div>
      </div>
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-6">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
      <div>
        <div className="font-bold text-white">{label}</div>
        <div className="text-xs text-zinc-500 mt-1">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-all ${
          checked ? 'bg-[#c28e3a]' : 'bg-zinc-700'
        }`}
      >
        <div
          className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${
            checked ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function DataButton({ label, icon, description, onClick, variant = 'default' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        variant === 'danger'
          ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
          : 'border-white/10 bg-zinc-800/30 hover:border-[#c28e3a]/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${variant === 'danger' ? 'text-red-400' : 'text-[#c28e3a]'}`}>
          <iconify-icon icon={icon} width="24"></iconify-icon>
        </div>
        <div className="flex-1">
          <div className="font-bold text-white">{label}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
        </div>
        <iconify-icon icon="mdi:chevron-right" width="20" className="text-zinc-600"></iconify-icon>
      </div>
    </button>
  );
}
