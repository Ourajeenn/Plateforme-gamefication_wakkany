/**
 * Système de Quêtes — Missions narratives avec récompenses
 * V2: Quêtes individuelles et communautaires
 */

export const QUESTS = {
  // Quêtes de Personnage
  CHARACTER: {
    'archive_historian': {
      id: 'archive_historian',
      type: 'character',
      title: 'L\'Archiviste de l\'Histoire',
      description: 'Collectez 5 artefacts historiques et écrivez leur histoire.',
      difficulty: 'medium',
      xpReward: 300,
      coinReward: 200,
      unlockedAt: 'reputation >= 50',
      objectives: [
        { id: 1, text: 'Trouver 5 artefacts historiques', progress: 0, target: 5 },
        { id: 2, text: 'Lire les descriptions historiques', progress: 0, target: 5 },
        { id: 3, text: 'Répondre correctement à des questions d\'histoire', progress: 0, target: 10 }
      ],
      rewards: {
        badge: 'historian',
        skill: 'ancient_knowledge',
        territoryBonus: { knowledge: 50 }
      }
    },

    'the_last_explorer': {
      id: 'the_last_explorer',
      type: 'character',
      title: 'Le Dernier Explorateur',
      description: 'Explorez toutes les régions et trouvez les secrets cachés.',
      difficulty: 'hard',
      xpReward: 500,
      coinReward: 500,
      unlockedAt: 'knowledge >= 200',
      objectives: [
        { id: 1, text: 'Visiter 10 régions', progress: 0, target: 10 },
        { id: 2, text: 'Découvrir 5 secrets', progress: 0, target: 5 },
        { id: 3, text: 'Créer une carte complète', progress: 0, target: 1 }
      ],
      rewards: {
        badge: 'master_explorer',
        skill: 'map_maker',
        territoryBonus: { exploration: 100 }
      }
    },

    'guardian_of_light': {
      id: 'guardian_of_light',
      type: 'character',
      title: 'Gardien de la Lumière',
      description: 'Aidez 5 joueurs différents et devenez une légende.',
      difficulty: 'medium',
      xpReward: 350,
      coinReward: 250,
      unlockedAt: 'reputation >= 70',
      objectives: [
        { id: 1, text: 'Aider 5 joueurs différents', progress: 0, target: 5 },
        { id: 2, text: 'Recevoir des remerciements', progress: 0, target: 10 },
        { id: 3, text: 'Atteindre une réputation de 80+', progress: 0, target: 80 }
      ],
      rewards: {
        badge: 'protector',
        skill: 'altruism',
        territoryBonus: { reputation: 30 }
      }
    }
  },

  // Quêtes Communautaires
  COMMUNITY: {
    'save_the_crops': {
      id: 'save_the_crops',
      type: 'community',
      title: 'Sauver les Récoltes',
      description: 'Ensemble, les joueurs doivent répondre à 1000 questions agricoles.',
      difficulty: 'medium',
      globalObjective: { category: 'agriculture', questions: 1000 },
      reward: {
        allPlayers: {
          xp: 200,
          items: ['seed_pouch', 'farmer_hat']
        },
        territoryUnlock: 'fertile_plains'
      },
      progress: {
        current: 0,
        target: 1000,
        deadline: 7 * 24 * 60 * 60 * 1000 // 7 jours
      }
    },

    'ancient_library': {
      id: 'ancient_library',
      type: 'community',
      title: 'Restaurer la Bibliothèque Ancienne',
      description: 'Ensemble, collectez 500 livres rares pour restaurer la bibliothèque.',
      difficulty: 'hard',
      globalObjective: { type: 'collection', items: 500 },
      reward: {
        allPlayers: {
          xp: 500,
          items: ['librarian_badge', 'spell_book']
        },
        territoryUnlock: 'ancient_library',
        permanentBonus: { knowledge: 50 }
      },
      progress: {
        current: 0,
        target: 500
      }
    },

    'defend_the_realm': {
      id: 'defend_the_realm',
      type: 'community',
      title: 'Défendre le Royaume',
      description: 'Résistez à une invasion. Les joueurs doivent coordonner.',
      difficulty: 'very_hard',
      globalObjective: { type: 'defense', rounds: 10 },
      reward: {
        allPlayers: {
          xp: 1000,
          items: ['legendary_sword', 'hero_crown']
        },
        seasonalBonus: { XP: 1.5 }, // +50% XP pour la saison
        territoryUnlock: 'hero_monument'
      },
      requirements: {
        minPlayers: 20,
        teamworkRequired: true
      },
      progress: {
        current: 0,
        target: 10,
        lastEventDate: null
      }
    }
  }
};

/**
 * Gestionnaire de Quêtes
 */
export class QuestManager {
  constructor(playerId) {
    this.playerId = playerId;
    this.activeQuests = [];
    this.completedQuests = [];
    this.progress = {}; // { questId: { objective1: value, objective2: value } }
  }

  /**
   * Commence une quête
   */
  startQuest(questId) {
    const quest = this.findQuestById(questId);
    if (!quest) {
      return { success: false, message: 'Quête introuvable' };
    }

    if (this.activeQuests.find(q => q.id === questId)) {
      return { success: false, message: 'Quête déjà commencée' };
    }

    this.activeQuests.push({
      ...quest,
      startedAt: Date.now(),
      progress: {}
    });

    this.progress[questId] = quest.objectives.reduce((acc, obj) => {
      acc[obj.id] = 0;
      return acc;
    }, {});

    return { success: true, message: `Quête "${quest.title}" commencée!` };
  }

  /**
   * Met à jour la progression d'une quête
   */
  updateQuestProgress(questId, objectiveId, value) {
    if (!this.progress[questId]) {
      return { success: false, message: 'Quête non commencée' };
    }

    this.progress[questId][objectiveId] = value;

    // Vérifier si la quête est complétée
    const quest = this.activeQuests.find(q => q.id === questId);
    if (this.isQuestCompleted(quest)) {
      return this.completeQuest(questId);
    }

    return { success: true, progress: this.progress[questId] };
  }

  /**
   * Vérifie si une quête est complétée
   */
  isQuestCompleted(quest) {
    if (!quest) return false;

    return quest.objectives.every(obj => {
      const progress = this.progress[quest.id][obj.id] || 0;
      return progress >= obj.target;
    });
  }

  /**
   * Termine une quête
   */
  completeQuest(questId) {
    const index = this.activeQuests.findIndex(q => q.id === questId);
    if (index === -1) {
      return { success: false, message: 'Quête non trouvée' };
    }

    const completedQuest = this.activeQuests[index];
    this.activeQuests.splice(index, 1);
    this.completedQuests.push({
      ...completedQuest,
      completedAt: Date.now()
    });

    return {
      success: true,
      quest: completedQuest,
      rewards: {
        xp: completedQuest.xpReward,
        coins: completedQuest.coinReward,
        badge: completedQuest.rewards?.badge,
        skill: completedQuest.rewards?.skill
      },
      message: `Quête "${completedQuest.title}" complétée! 🎉`
    };
  }

  /**
   * Trouve une quête par ID
   */
  findQuestById(questId) {
    for (const category of Object.values(QUESTS)) {
      if (category[questId]) {
        return category[questId];
      }
    }
    return null;
  }

  /**
   * Obtient les quêtes disponibles
   */
  getAvailableQuests(playerStats) {
    const available = [];

    // Quêtes de personnage
    Object.values(QUESTS.CHARACTER).forEach(quest => {
      if (this.meetsRequirements(quest, playerStats) && !this.isActive(quest.id)) {
        available.push(quest);
      }
    });

    return available;
  }

  /**
   * Vérifie les conditions pour une quête
   */
  meetsRequirements(quest, playerStats) {
    if (!quest.unlockedAt) return true;

    // Parse simple de "reputation >= 50"
    const [stat, operator, value] = quest.unlockedAt.split(' ');
    const playerValue = playerStats[stat] || 0;

    if (operator === '>=') return playerValue >= parseInt(value);
    if (operator === '>') return playerValue > parseInt(value);
    if (operator === '<=') return playerValue <= parseInt(value);

    return true;
  }

  /**
   * Vérifie si une quête est active
   */
  isActive(questId) {
    return this.activeQuests.some(q => q.id === questId);
  }

  /**
   * Obtient les statistiques des quêtes
   */
  getStats() {
    return {
      active: this.activeQuests.length,
      completed: this.completedQuests.length,
      totalXp: this.completedQuests.reduce((sum, q) => sum + (q.xpReward || 0), 0),
      totalCoins: this.completedQuests.reduce((sum, q) => sum + (q.coinReward || 0), 0)
    };
  }
}

export default QuestManager;
