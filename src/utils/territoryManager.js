/**
 * Système de Territoires — Chaque joueur possède un territoire et le développe
 * V2: Persistance du monde et progression personnelle
 */

export const TERRITORIES = {
  STARTING: {
    id: 'home_village',
    name: 'Village Natal',
    icon: '🏘️',
    baseProduction: { coins: 5, knowledge: 1 },
    buildings: [
      { id: 'hut', name: 'Chaumière', level: 1, icon: '🏠' }
    ]
  },

  UNLOCKABLE: {
    'library': {
      id: 'library',
      name: 'Bibliothèque',
      icon: '📚',
      requirement: { knowledge: 100 },
      cost: { coins: 200 },
      production: { knowledge: 10 },
      bonus: { xp: 1.2 } // +20% XP
    },

    'laboratory': {
      id: 'laboratory',
      name: 'Laboratoire',
      icon: '🔬',
      requirement: { knowledge: 150, science_questions: 10 },
      cost: { coins: 300 },
      production: { innovation: 15 },
      bonus: { discovery_chance: 0.15 }
    },

    'market': {
      id: 'market',
      name: 'Marché',
      icon: '🛒',
      requirement: { coins: 500 },
      cost: { coins: 100 },
      production: { coins: 20 },
      bonus: { trade_efficiency: 1.5 }
    },

    'temple': {
      id: 'temple',
      name: 'Temple',
      icon: '🏛️',
      requirement: { reputation: 80 },
      cost: { coins: 400 },
      production: { reputation: 5 },
      bonus: { reputation_gain: 1.3 }
    },

    'fortress': {
      id: 'fortress',
      name: 'Forteresse',
      icon: '🏰',
      requirement: { defense_level: 50 },
      cost: { coins: 500 },
      production: { defense: 20 },
      bonus: { protection: 0.8 } // Réduit les dégâts de 20%
    },

    'garden': {
      id: 'garden',
      name: 'Jardin Magique',
      icon: '🌳',
      requirement: { knowledge: 200, nature_harmony: 60 },
      cost: { coins: 250 },
      production: { health: 10, crops: 15 },
      bonus: { healing: 1.5 }
    },

    'tower': {
      id: 'tower',
      name: 'Tour de Mage',
      icon: '🧙',
      requirement: { knowledge: 250, magic_affinity: 80 },
      cost: { coins: 600 },
      production: { mana: 20, power: 5 },
      bonus: { spell_power: 2.0 }
    },

    'arena': {
      id: 'arena',
      name: 'Arène de Combat',
      icon: '⚔️',
      requirement: { strength: 50, duels_won: 10 },
      cost: { coins: 400 },
      production: { strength: 10 },
      bonus: { combat_bonus: 1.4 }
    },

    'observatory': {
      id: 'observatory',
      name: 'Observatoire',
      icon: '🔭',
      requirement: { knowledge: 300, astronomy: 100 },
      cost: { coins: 700 },
      production: { prophecy: 5, knowledge: 20 },
      bonus: { foresight: 0.8 }
    }
  }
};

/**
 * Gestionnaire de Territoires
 */
export class TerritoryManager {
  constructor(playerId) {
    this.playerId = playerId;
    this.territory = {
      name: 'Mon Royaume',
      level: 1,
      buildings: [TERRITORIES.STARTING],
      population: 100,
      resources: {
        coins: 0,
        knowledge: 0,
        innovation: 0,
        mana: 0,
        crops: 0,
        defense: 0,
        strength: 0
      },
      upgrades: [],
      discoveries: [],
      totalPopulation: 100,
      happiness: 70
    };
    this.productionPerRound = this.calculateProduction();
  }

  /**
   * Renomme le territoire
   */
  setTerritoryName(name) {
    if (name.length > 50) {
      return { success: false, message: 'Nom trop long' };
    }
    this.territory.name = name;
    return { success: true, territory: this.territory };
  }

  /**
   * Construit un bâtiment
   */
  buildBuilding(buildingId) {
    const building = TERRITORIES.UNLOCKABLE[buildingId];
    if (!building) {
      return { success: false, message: 'Bâtiment introuvable' };
    }

    // Vérifier les conditions
    if (!this.meetsRequirement(building.requirement)) {
      return { success: false, message: 'Conditions non remplies' };
    }

    // Vérifier les ressources
    if (this.territory.resources.coins < building.cost.coins) {
      return { success: false, message: 'Pièces insuffisantes' };
    }

    // Construire
    this.territory.resources.coins -= building.cost.coins;
    this.territory.buildings.push({
      ...building,
      level: 1,
      builtAt: Date.now()
    });

    this.productionPerRound = this.calculateProduction();

    return {
      success: true,
      message: `${building.name} a été construit!`,
      territory: this.territory
    };
  }

  /**
   * Améliore un bâtiment
   */
  upgradeBuilding(buildingId) {
    const building = this.territory.buildings.find(b => b.id === buildingId);
    if (!building) {
      return { success: false, message: 'Bâtiment non trouvé' };
    }

    // Coût augmente avec le niveau
    const upgradeCost = Math.pow(building.level + 1, 2) * 50;
    if (this.territory.resources.coins < upgradeCost) {
      return { success: false, message: 'Pièces insuffisantes' };
    }

    building.level += 1;
    this.territory.resources.coins -= upgradeCost;
    this.productionPerRound = this.calculateProduction();

    return {
      success: true,
      message: `${building.name} a été amélioré au niveau ${building.level}!`,
      newCost: Math.pow(building.level + 2, 2) * 50
    };
  }

  /**
   * Calcule la production par round
   */
  calculateProduction() {
    let production = { coins: 0, knowledge: 0, innovation: 0, mana: 0, defense: 0 };

    this.territory.buildings.forEach(building => {
      if (building.production) {
        Object.entries(building.production).forEach(([resource, amount]) => {
          if (production[resource] !== undefined) {
            production[resource] += amount * building.level;
          }
        });
      }
    });

    return production;
  }

  /**
   * Applique la production du round
   */
  applyProduction() {
    Object.entries(this.productionPerRound).forEach(([resource, amount]) => {
      if (this.territory.resources[resource] !== undefined) {
        this.territory.resources[resource] += amount;
      }
    });

    // Population augmente lentement si le bonheur est > 60
    if (this.territory.happiness > 60) {
      this.territory.population += Math.floor(this.territory.population * 0.01);
    }

    return this.territory.resources;
  }

  /**
   * Vérifie si les conditions sont remplies
   */
  meetsRequirement(requirement) {
    if (!requirement) return true;

    for (const [stat, value] of Object.entries(requirement)) {
      if (this.territory.resources[stat] !== undefined) {
        if (this.territory.resources[stat] < value) return false;
      }
    }

    return true;
  }

  /**
   * Obtient l'état du territoire
   */
  getTerritorySummary() {
    return {
      name: this.territory.name,
      level: this.territory.level,
      population: Math.floor(this.territory.population),
      happiness: this.territory.happiness,
      buildings: this.territory.buildings.map(b => ({
        name: b.name,
        level: b.level,
        icon: b.icon
      })),
      production: this.productionPerRound,
      resources: { ...this.territory.resources }
    };
  }

  /**
   * Génère un rapport détaillé
   */
  getDetailedReport() {
    const buildingStats = {};
    this.territory.buildings.forEach(b => {
      buildingStats[b.id] = {
        name: b.name,
        level: b.level,
        production: b.production ? Object.entries(b.production).map(([k, v]) => `${k}: +${v * b.level}`) : []
      };
    });

    return {
      territory: this.territory.name,
      overallLevel: this.territory.level,
      population: Math.floor(this.territory.population),
      happiness: this.territory.happiness + '%',
      buildings: buildingStats,
      totalProduction: this.productionPerRound,
      currentResources: this.territory.resources,
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Donne des recommandations pour améliorer le territoire
   */
  getRecommendations() {
    const recommendations = [];

    if (this.territory.resources.coins > 500) {
      recommendations.push('Vous avez assez de pièces pour construire un nouveau bâtiment!');
    }

    if (this.territory.happiness < 50) {
      recommendations.push('Le bonheur est bas. Construisez un temple ou un jardin.');
    }

    if (this.territory.resources.knowledge < 50) {
      recommendations.push('Investissez dans la connaissance. Construisez une bibliothèque.');
    }

    return recommendations;
  }
}

export default TerritoryManager;
