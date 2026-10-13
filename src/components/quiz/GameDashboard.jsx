/**
 * Tableau de bord du jeu — Affiche l'état du monde et des ressources
 */

import React, { useState, useEffect } from 'react';
import GameStateManager from '../../utils/gameStateManager';
import ResourceManager from '../../utils/resourceManager';
import GameMasterAI from '../../utils/gameMasterAI';

export default function GameDashboard({ roomCode, players }) {
  const [gameState, setGameState] = useState(null);
  const [resourceState, setResourceState] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('world');

  useEffect(() => {
    if (!gameState) {
      const manager = new GameStateManager(roomCode);
      setGameState(manager);
    }
  }, [gameState, roomCode]);

  useEffect(() => {
    if (!resourceState) {
      const resourceMgr = new ResourceManager(players?.[0]?.id);
      setResourceState(resourceMgr);
    }
  }, [resourceState, players]);

  // Simule un événement du Game Master
  const triggerGameMasterEvent = () => {
    if (gameState) {
      const worldState = gameState.getWorldState();
      const gameMaster = new GameMasterAI(worldState);
      const event = gameMaster.generateNextEvent();
      setCurrentEvent(event);
    }
  };

  return (
    <div className="w-full bg-zinc-950 text-white p-6 rounded-2xl border border-zinc-800">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black mb-2">⚔️ Wakkany</h1>
        <p className="text-zinc-400">Votre expérience de jeu</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
        {['world', 'resources', 'events', 'quests'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-[#c28e3a] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {tab === 'world' && '🌍 Monde'}
            {tab === 'resources' && '💎 Ressources'}
            {tab === 'events' && '⚡ Événements'}
            {tab === 'quests' && '📜 Quêtes'}
          </button>
        ))}
      </div>

      {/* Contenu des Tabs */}
      {activeTab === 'world' && gameState && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* État du Monde */}
            <div className="bg-zinc-900 p-4 rounded-xl">
              <h3 className="font-bold text-[#c28e3a] mb-3">État de Wakama</h3>
              {gameState.state.worldState && (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Prospérité</span>
                    <span className="text-yellow-400">{gameState.state.worldState.prosperity}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${gameState.state.worldState.prosperity}%` }}
                    />
                  </div>

                  <div className="flex justify-between mb-2">
                    <span>Population</span>
                    <span className="text-blue-400">{gameState.state.worldState.population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infrastructure</span>
                    <span className="text-orange-400">{gameState.state.worldState.infrastructure}%</span>
                  </div>
                </>
              )}
            </div>

            {/* Historique des Décisions */}
            <div className="bg-zinc-900 p-4 rounded-xl">
              <h3 className="font-bold text-[#c28e3a] mb-3">Décisions ({gameState.state.decisions.length})</h3>
              <ul className="space-y-1 text-sm">
                {gameState.state.decisions.slice(-3).map((d, i) => (
                  <li key={i} className="text-zinc-400">
                    Tour {d.round}: {d.answer.substring(0, 30)}...
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bouton Générer Événement */}
          <button
            onClick={triggerGameMasterEvent}
            className="w-full bg-[#c28e3a] hover:bg-[#e8b96a] text-black font-bold py-3 px-4 rounded-xl transition-all"
          >
            🎲 Générer un Événement
          </button>
        </div>
      )}

      {activeTab === 'resources' && resourceState && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(resourceState.resources).map(([key, value]) => (
              <div key={key} className="bg-zinc-900 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="capitalize font-bold">{key}</span>
                  <span className="text-[#c28e3a] text-lg font-bold">{Math.floor(value)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pouvoirs Disponibles */}
          <div className="bg-zinc-900 p-4 rounded-xl">
            <h3 className="font-bold text-[#c28e3a] mb-3">Pouvoirs Disponibles</h3>
            <div className="grid grid-cols-2 gap-2">
              {resourceState.availablePowers.slice(0, 4).map(power => (
                <button
                  key={power.id}
                  className="bg-zinc-800 hover:bg-[#c28e3a]/20 p-2 rounded-lg text-sm transition-all"
                  title={power.description}
                >
                  {power.icon} {power.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && currentEvent && (
        <div className="bg-zinc-900 p-6 rounded-xl border-l-4 border-[#c28e3a]">
          <h3 className="text-2xl font-heading font-black mb-3">{currentEvent.title}</h3>
          <p className="text-zinc-300 mb-4">{currentEvent.description}</p>
          <div className="text-sm text-zinc-400 space-y-1">
            <p><strong>Catégorie:</strong> {currentEvent.category || 'Mystère'}</p>
            <p><strong>Impact:</strong> {JSON.stringify(currentEvent.impact)}</p>
          </div>
          <button
            onClick={triggerGameMasterEvent}
            className="mt-4 bg-[#c28e3a] hover:bg-[#e8b96a] text-black font-bold py-2 px-4 rounded-lg transition-all"
          >
            Prochain Événement →
          </button>
        </div>
      )}

      {activeTab === 'quests' && (
        <div className="bg-zinc-900 p-4 rounded-xl text-center text-zinc-400">
          <p>🗂️ Système de Quêtes - Bientôt disponible</p>
        </div>
      )}
    </div>
  );
}
