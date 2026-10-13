/**
 * Système de Ressources — Les joueurs gèrent plusieurs types de ressources
 * V1: Économie de jeu basée sur des décisions stratégiques
 */

export const RESOURCES = {
  HEALTH: {
    id: 'health',
    name: 'Vie',
    icon: '❤️',
    description: 'Votre santé vitale',
    max: 100,
    regen: 5 // par round
  },
  COINS: {
    id: 'coins',
    name: 'Pièces',
    icon: '🪙',
    description: 'Monnaie du royaume',
    max: 1000,
    regen: 0
  },
  REPUTATION: {
    id: 'reputation',
    name: 'Réputation',
    icon: '⭐',
    description: 'Crédibilité dans le groupe',
    max: 100,
    regen: 0
  },
  KNOWLEDGE: {
    id: 'knowledge',
    name: 'Connaissance',
    icon: '🧠',
    description: 'Sagesse accumulée',
    max: 500,
    regen: 0
  },
  POWER: {
    id: 'power',
    name: 'Pouvoirs',
    icon: '🔮',
    description: 'Capacités magiques',
    max: 10,
    regen: 0
  }
};

/**
 * Les pouvoirs que les joueurs peuvent utiliser
 */
export const POWERS = [
  {
    id: 'hint',
    name: 'Demander un Indice',
    icon: '💡',
    description: 'Obtenez un indice pour la prochaine question',
    cost: { power: 1 },
    reward: { knowledge: 20 }
  },
  {
    id: 'eliminate',
    name: 'Éliminer une Réponse',
    icon: '❌',
    description: 'Supprimez une mauvaise réponse',
    cost: { power: 2 },
    reward: { knowledge: 10 }
  },
  {
    id: 'protect',
    name: 'Protéger un Joueur',
    icon: '🛡️',
    description: 'Protégez un joueur d\'une attaque ou événement négatif',
    cost: { power: 2 },
    reward: { reputation: 15 }
  },
  {
    id: 'spy',
    name: 'Espionner',
    icon: '👁️',
    description: 'Découvrez une information cachée d\'un autre joueur',
    cost: { power: 3, coins: 50 },
    reward: { knowledge: 30 }
  },
  {
    id: 'double_reward',
    name: 'Doubler la Récompense',
    icon: '📈',
    description: 'Doublez votre récompense pour la prochaine bonne réponse',
    cost: { power: 1, coins: 100 },
    reward: { knowledge: 5 }
  },
  {
    id: 'challenge',
    name: 'Défier un Joueur',
    icon: '⚡',
    description: 'Lancez un duel à un autre joueur',
    cost: { power: 2 },
    reward: { reputation: 20, coins: 50 }
  },
  {
    id: 'modify_consequence',
    name: 'Modifier une Conséquence',
    icon: '🔄',
    description: 'Changez l\'impact d\'une conséquence',
    cost: { power: 5 },
    reward: { knowledge: 50 }
  }
];

/**
 * Gestionnaire de ressources pour un joueur
 */
export class ResourceManager {
  constructor(playerId) {
    this.playerId = playerId;
    this.resources = {
      health: RESOURCES.HEALTH.max,
      coins: 100,
      reputation: 50,
      knowledge: 0,
      power: 0
    };
    this.usedPowers = {};
    this.powerCooldowns = {};
  }

  /**
   * Ajoute une ressource
   */
  addResource(resourceType, amount) {
    const max = RESOURCES[resourceType.toUpperCase()]?.max || Infinity;
    this.resources[resourceType] = Math.min(
      this.resources[resourceType] + amount,
      max
    );
    return this.resources[resourceType];
  }

  /**
   * Enlève une ressource
   */
  removeResource(resourceType, amount) {
    if (this.resources[resourceType] < amount) {
      return { success: false, message: 'Ressources insuffisantes' };
    }
    this.resources[resourceType] -= amount;
    return { success: true, remaining: this.resources[resourceType] };
  }

  /**
   * Régénère les ressources (health surtout)
   */
  regenResources() {
    this.resources.health = Math.min(
      this.resources.health + RESOURCES.HEALTH.regen,
      RESOURCES.HEALTH.max
    );
  }

  /**
   * Utilise un pouvoir
   */
  usePower(powerId) {
    const power = POWERS.find(p => p.id === powerId);
    if (!power) {
      return { success: false, message: 'Pouvoir introuvable' };
    }

    // Vérifier les coûts
    if (power.cost.power && this.resources.power < power.cost.power) {
      return { success: false, message: 'Pas assez de pouvoirs' };
    }
    if (power.cost.coins && this.resources.coins < power.cost.coins) {
      return { success: false, message: 'Pas assez de pièces' };
    }

    // Vérifier le cooldown (4 tours)
    if (this.powerCooldowns[powerId] && Date.now() - this.powerCooldowns[powerId] < 240000) {
      return { success: false, message: 'Pouvoir en cooldown' };
    }

    // Appliquer les coûts
    if (power.cost.power) this.resources.power -= power.cost.power;
    if (power.cost.coins) this.resources.coins -= power.cost.coins;

    // Enregistrer l'utilisation
    this.usedPowers[powerId] = (this.usedPowers[powerId] || 0) + 1;
    this.powerCooldowns[powerId] = Date.now();

    return {
      success: true,
      reward: power.reward,
      message: `${power.name} utilisé avec succès!`
    };
  }

  /**
   * Applique une récompense
   */
  applyReward(reward) {
    if (reward.xp) this.addResource('knowledge', reward.xp);
    if (reward.coins) this.addResource('coins', reward.coins);
    if (reward.reputation) this.addResource('reputation', reward.reputation);
    if (reward.health) this.addResource('health', reward.health);
    if (reward.power) this.addResource('power', reward.power);

    return {
      newResources: { ...this.resources },
      rewardApplied: reward
    };
  }

  /**
   * Obtient l'état actuel des ressources
   */
  getStatus() {
    return {
      playerId: this.playerId,
      resources: { ...this.resources },
      availablePowers: POWERS.filter(p => {
        if (p.cost.power && this.resources.power < p.cost.power) return false;
        if (p.cost.coins && this.resources.coins < p.cost.coins) return false;
        return true;
      }),
      totalPoints: this.resources.knowledge + this.resources.reputation + this.resources.coins / 10
    };
  }

  /**
   * Calcule un score global
   */
  getScore() {
    return {
      knowledge: this.resources.knowledge,
      reputation: this.resources.reputation,
      wealth: this.resources.coins,
      health: this.resources.health,
      powers: this.resources.power,
      totalScore: (
        this.resources.knowledge * 2 +
        this.resources.reputation * 1.5 +
        this.resources.coins / 20 +
        this.resources.power * 10
      )
    };
  }
}

export default ResourceManager;
