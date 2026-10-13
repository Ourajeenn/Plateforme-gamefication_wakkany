/**
 * Vue du Territoire — Affiche et gère le développement du royaume du joueur
 */

import React, { useState, useEffect } from 'react';
import TerritoryManager, { TERRITORIES } from '../../utils/territoryManager';

export default function TerritoryView({ playerId }) {
  const [territory, setTerritory] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showBuildingMenu, setShowBuildingMenu] = useState(false);

  useEffect(() => {
    const manager = new TerritoryManager(playerId);
    setTerritory(manager);
  }, [playerId]);

  const handleBuildBuilding = (buildingId) => {
    if (!territory) return;
    const result = territory.buildBuilding(buildingId);
    if (result.success) {
      setTerritory({ ...territory });
      setShowBuildingMenu(false);
    } else {
      alert(result.message);
    }
  };

  const handleUpgradeBuilding = (buildingId) => {
    if (!territory) return;
    const result = territory.upgradeBuilding(buildingId);
    if (result.success) {
      setTerritory({ ...territory });
    } else {
      alert(result.message);
    }
  };

  const handleRenameTerritory = (newName) => {
    if (!territory) return;
    const result = territory.setTerritoryName(newName);
    if (result.success) {
      setTerritory({ ...territory });
    }
  };

  if (!territory) {
    return <div className="text-white text-center py-8">Chargement du territoire...</div>;
  }

  const summary = territory.getTerritorySummary();

  return (
    <div className="w-full bg-zinc-950 text-white p-6 rounded-2xl border border-zinc-800">
      {/* En-tête avec Nom du Territoire */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl">🏰</h1>
          <div className="flex-1">
            <input
              type="text"
              defaultValue={summary.name}
              onBlur={(e) => handleRenameTerritory(e.target.value)}
              className="bg-transparent text-3xl font-heading font-black text-[#c28e3a] border-b border-[#c28e3a]/30 w-full focus:outline-none focus:border-[#c28e3a] transition-colors"
              maxLength={50}
            />
            <p className="text-zinc-400 text-sm mt-1">Niveau {summary.level}</p>
          </div>
        </div>

        {/* Statistiques Principales */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-sm">Population</p>
            <p className="text-xl font-bold text-blue-400">{summary.population}</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-sm">Bonheur</p>
            <p className="text-xl font-bold text-green-400">{summary.happiness}%</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-zinc-400 text-sm">Bâtiments</p>
            <p className="text-xl font-bold text-purple-400">{summary.buildings.length}</p>
          </div>
        </div>
      </div>

      {/* Ressources */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-black text-[#c28e3a] mb-4">Ressources</h2>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(summary.resources).map(([key, value]) => (
            <div key={key} className="bg-zinc-900 p-3 rounded-lg text-center">
              <p className="text-xs text-zinc-400 capitalize">{key}</p>
              <p className="text-lg font-bold text-[#c28e3a]">{Math.floor(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Production par Round */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-black text-[#c28e3a] mb-4">Production par Round</h2>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(summary.production).map(([key, value]) => (
            value > 0 && (
              <div key={key} className="bg-green-900/20 border border-green-600/50 p-3 rounded-lg text-center">
                <p className="text-xs text-green-400">+{value}</p>
                <p className="text-sm font-bold text-green-300 capitalize">{key}</p>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Bâtiments */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-black text-[#c28e3a] mb-4">Bâtiments</h2>
        <div className="grid grid-cols-3 gap-4">
          {summary.buildings.map((building, idx) => (
            <div
              key={idx}
              className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-[#c28e3a] transition-all cursor-pointer"
              onClick={() => setSelectedBuilding(building)}
            >
              <p className="text-3xl mb-2">{building.icon}</p>
              <p className="font-bold mb-1">{building.name}</p>
              <p className="text-sm text-zinc-400">Niveau {building.level}</p>
              <button
                onClick={() => handleUpgradeBuilding(building.id)}
                className="mt-2 w-full bg-[#c28e3a]/20 hover:bg-[#c28e3a]/40 text-[#c28e3a] text-xs py-1 rounded transition-all"
              >
                Améliorer
              </button>
            </div>
          ))}

          {/* Bouton Construire */}
          <button
            onClick={() => setShowBuildingMenu(!showBuildingMenu)}
            className="bg-zinc-900 p-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-[#c28e3a] transition-all flex flex-col items-center justify-center"
          >
            <p className="text-4xl mb-2">➕</p>
            <p className="font-bold text-sm">Construire</p>
          </button>
        </div>
      </div>

      {/* Menu de Construction */}
      {showBuildingMenu && (
        <div className="mb-8 bg-zinc-900 p-6 rounded-xl border border-[#c28e3a]/30">
          <h3 className="text-lg font-heading font-bold text-[#c28e3a] mb-4">Construire un Bâtiment</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(TERRITORIES.UNLOCKABLE).map(([key, building]) => (
              <button
                key={key}
                onClick={() => handleBuildBuilding(key)}
                className="bg-zinc-800 hover:bg-[#c28e3a]/20 p-4 rounded-lg text-left transition-all border border-zinc-700 hover:border-[#c28e3a]"
              >
                <p className="text-2xl mb-1">{building.icon}</p>
                <p className="font-bold text-sm">{building.name}</p>
                <p className="text-xs text-zinc-400 mt-1">💰 {building.cost.coins}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowBuildingMenu(false)}
            className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm transition-all"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Recommandations */}
      <div className="bg-blue-900/20 border border-blue-600/50 p-4 rounded-xl">
        <h3 className="text-sm font-bold text-blue-300 mb-2">💡 Recommandations</h3>
        <ul className="space-y-1 text-sm text-blue-200">
          {territory.getRecommendations().map((rec, idx) => (
            <li key={idx}>• {rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
