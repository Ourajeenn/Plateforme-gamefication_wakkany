/**
 * AdminPage — Interface administrateur
 * Gère les questions, les utilisateurs, l'analyse
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gameStats, setGameStats] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Charger stats par mode
      const { data: stats } = await supabase.from('game_stats_by_mode').select('*');
      setGameStats(stats);

      // Charger top joueurs
      const { data: players } = await supabase.from('top_performers').select('*').limit(10);
      setTopPlayers(players || []);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <iconify-icon icon="mdi:arrow-left" width="20" />
            </button>
            <h1 className="text-3xl font-heading font-black uppercase text-[#c28e3a]">Admin Panel</h1>
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest">👨‍💼 Administrateur</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 flex gap-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'mdi:chart-box' },
            { id: 'questions', label: 'Questions', icon: 'mdi:help-circle' },
            { id: 'users', label: 'Utilisateurs', icon: 'mdi:account-group' },
            { id: 'moderation', label: 'Modération', icon: 'mdi:shield-alert' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 font-bold uppercase text-xs tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#c28e3a] text-[#c28e3a]'
                  : 'border-transparent text-zinc-500 hover:text-white'
              }`}
            >
              <iconify-icon icon={tab.icon} width="16" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-zinc-500 animate-pulse">Chargement des données...</div>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && <Dashboard stats={gameStats} topPlayers={topPlayers} />}

            {/* QUESTIONS */}
            {activeTab === 'questions' && <QuestionsTab />}

            {/* USERS */}
            {activeTab === 'users' && <UsersTab />}

            {/* MODERATION */}
            {activeTab === 'moderation' && <ModerationTab />}
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ stats, topPlayers }) {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Parties jouées" value={stats?.reduce((sum, s) => sum + s.total_plays, 0) || 0} icon="mdi:gamepad-variant" />
        <KPICard title="Win Rate Moyen" value={`${((stats?.reduce((sum, s) => sum + s.win_rate, 0) || 0) / (stats?.length || 1)).toFixed(1)}%`} icon="mdi:percent" />
        <KPICard title="XP distribuée" value={stats?.reduce((sum, s) => sum + s.total_xp_distributed, 0) || 0} icon="mdi:star" />
        <KPICard title="Joueurs actifs" value={topPlayers?.length || 0} icon="mdi:account" />
      </div>

      {/* Graphique par mode */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-heading font-black mb-4 uppercase">Statistiques par Mode</h2>
        <div className="space-y-3">
          {stats?.map((stat) => (
            <div key={stat.mode} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
              <div className="flex-1">
                <div className="font-bold capitalize">{stat.mode.replace('-', ' ')}</div>
                <div className="text-xs text-zinc-500">{stat.total_plays} parties · {stat.win_rate}% victoires</div>
              </div>
              <div className="text-right">
                <div className="font-black text-[#c28e3a]">+{stat.avg_xp} XP moy</div>
                <div className="text-xs text-zinc-500">{stat.total_xp_distributed} XP total</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top joueurs */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-heading font-black mb-4 uppercase">Top 10 Joueurs</h2>
        <div className="space-y-2">
          {topPlayers?.map((player, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-[#c28e3a] w-8">{idx + 1}.</span>
                <div>
                  <div className="font-bold text-white truncate">{player.player}</div>
                  <div className="text-xs text-zinc-500">{player.games_played} parties · {player.win_rate}% victoires</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-[#c28e3a]">{player.total_xp}</div>
                <div className="text-xs text-zinc-500 uppercase">XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/30 border border-white/5 rounded-2xl p-6 text-center">
      <div className="text-3xl text-[#c28e3a] mb-2 flex justify-center">
        <iconify-icon icon={icon} width="32"></iconify-icon>
      </div>
      <div className="text-zinc-500 text-xs uppercase font-bold tracking-widest">{title}</div>
      <div className="text-4xl font-heading font-black text-white mt-2">{value}</div>
    </div>
  );
}

function QuestionsTab() {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 text-center py-12">
      <iconify-icon icon="mdi:help-circle" width="48" className="text-zinc-600 mx-auto mb-4"></iconify-icon>
      <h3 className="font-bold text-lg mb-2">Gestion des Questions</h3>
      <p className="text-zinc-500 text-sm">Approuver, éditer ou supprimer les questions proposées par la communauté</p>
      <button className="mt-6 px-8 py-3 bg-[#c28e3a] text-black font-bold uppercase rounded-xl hover:bg-[#e8b96a] transition-all">
        + Ajouter une question
      </button>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 text-center py-12">
      <iconify-icon icon="mdi:account-group" width="48" className="text-zinc-600 mx-auto mb-4"></iconify-icon>
      <h3 className="font-bold text-lg mb-2">Gestion des Utilisateurs</h3>
      <p className="text-zinc-500 text-sm">Voir les utilisateurs, leur progression et gérer les droits d'accès</p>
      <button className="mt-6 px-8 py-3 bg-[#c28e3a] text-black font-bold uppercase rounded-xl hover:bg-[#e8b96a] transition-all">
        👥 Voir tous les utilisateurs
      </button>
    </div>
  );
}

function ModerationTab() {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 text-center py-12">
      <iconify-icon icon="mdi:shield-alert" width="48" className="text-zinc-600 mx-auto mb-4"></iconify-icon>
      <h3 className="font-bold text-lg mb-2">Modération</h3>
      <p className="text-zinc-500 text-sm">Signalements, contenus inappropriés et gestion des violations</p>
      <button className="mt-6 px-8 py-3 bg-red-600 text-white font-bold uppercase rounded-xl hover:bg-red-700 transition-all">
        🚨 Voir les signalements
      </button>
    </div>
  );
}
