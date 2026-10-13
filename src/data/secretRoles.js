/**
 * Système de Rôles Secrets — Chaque joueur a un objectif caché
 * V1: Mécanique inspirée de Mafia/Loup-garou
 */

export const SECRET_ROLES = {
  ARCHIVIST: {
    id: 'archivist',
    name: 'Archiviste',
    description: 'Découvrir certaines informations historiques',
    icon: '📚',
    objectives: [
      'Répondre correctement à 3 questions sur l\'histoire',
      'Découvrir un secret caché dans la narration',
      'Voter pour la bonne personne au moins une fois'
    ],
    rewards: {
      xp: 200,
      badge: 'history_keeper'
    }
  },

  IMPOSTOR: {
    id: 'impostor',
    name: 'Imposteur',
    description: 'Perturber le groupe sans être découvert',
    icon: '🎭',
    objectives: [
      'Bluffer sans être accusé',
      'Faire voter le groupe pour quelqu\'un d\'innocent',
      'Récolter du "chaos" en trompant les autres'
    ],
    rewards: {
      xp: 250,
      badge: 'master_bluffer'
    }
  },

  GUIDE: {
    id: 'guide',
    name: 'Guide',
    description: 'Aider certains joueurs sans être obvious',
    icon: '🧭',
    objectives: [
      'Aider un joueur spécifique à progresser',
      'Débloquer une nouvelle région',
      'Protéger un joueur une fois'
    ],
    rewards: {
      xp: 150,
      badge: 'wise_guide'
    }
  },

  EXPLORER: {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Découvrir un maximum d\'informations',
    icon: '🔍',
    objectives: [
      'Répondre correctement à 5 questions',
      'Découvrir tous les secrets d\'une région',
      'Atteindre le plus haut XP de la partie'
    ],
    rewards: {
      xp: 200,
      badge: 'master_explorer'
    }
  },

  GUARDIAN: {
    id: 'guardian',
    name: 'Gardien',
    description: 'Protéger le groupe des dangers',
    icon: '⚔️',
    objectives: [
      'Bloquer une attaque ou événement négatif',
      'Maintenir le moral du groupe (reputation > 60)',
      'Voter pour le bon suspect'
    ],
    rewards: {
      xp: 180,
      badge: 'protector'
    }
  },

  TRADER: {
    id: 'trader',
    name: 'Marchand',
    description: 'Accumuler le plus de richesses',
    icon: '🪙',
    objectives: [
      'Gagner 500 pièces',
      'Faire 3 échanges avantageux',
      'Atteindre le plus haut score économique'
    ],
    rewards: {
      xp: 200,
      badge: 'wealthy_merchant'
    }
  }
};

/**
 * Distribue les rôles secrets aux joueurs
 */
export function distributeSecretRoles(players) {
  const roleIds = Object.keys(SECRET_ROLES);
  const distribution = {};

  players.forEach((player, index) => {
    const roleId = roleIds[index % roleIds.length];
    distribution[player.id] = {
      ...SECRET_ROLES[roleId],
      assignedTo: player.name,
      progress: initializeRoleProgress(SECRET_ROLES[roleId])
    };
  });

  return distribution;
}

/**
 * Initialise le suivi de progression pour un rôle
 */
function initializeRoleProgress(role) {
  return {
    objectivesCompleted: role.objectives.map(obj => ({ text: obj, completed: false })),
    points: 0,
    isRevealed: false
  };
}

/**
 * Gère l'avancement des objectifs d'un rôle
 */
export class RoleProgressTracker {
  constructor(role) {
    this.role = role;
    this.progress = initializeRoleProgress(role);
  }

  completeObjective(objectiveIndex) {
    if (objectiveIndex < this.progress.objectivesCompleted.length) {
      this.progress.objectivesCompleted[objectiveIndex].completed = true;
      this.progress.points += 50; // Points pour chaque objectif
    }
  }

  isRoleCompleted() {
    return this.progress.objectivesCompleted.every(obj => obj.completed);
  }

  getReward() {
    if (this.isRoleCompleted()) {
      return {
        xp: this.role.rewards.xp,
        badge: this.role.rewards.badge,
        bonus: this.progress.points
      };
    }
    return null;
  }

  revealRole() {
    this.progress.isRevealed = true;
    return {
      role: this.role,
      reward: this.getReward()
    };
  }
}

/**
 * Génère une quête secrète basée sur le rôle
 */
export function generateSecretQuest(role) {
  const quests = {
    archivist: {
      title: 'Les Mystères de l\'Aether',
      description: 'Découvrez les secrets cachés dans les anciennes ruines.',
      difficulty: 'medium'
    },
    impostor: {
      title: 'L\'Art du Bluff',
      description: 'Bluffez sans être découvert pendant 3 manches.',
      difficulty: 'hard'
    },
    guide: {
      title: 'Mentor des Mondes',
      description: 'Guidez un autre joueur vers la victoire sans révéler votre identité.',
      difficulty: 'medium'
    },
    explorer: {
      title: 'Conquérant des Terres',
      description: 'Explorez et découvrez tous les mystères du monde.',
      difficulty: 'hard'
    },
    guardian: {
      title: 'Défenseur du Royaume',
      description: 'Protégez le groupe d\'au moins 2 menaces.',
      difficulty: 'medium'
    },
    trader: {
      title: 'Roi du Commerce',
      description: 'Accumulez richesses et privilèges par le commerce.',
      difficulty: 'medium'
    }
  };

  return quests[role.id] || null;
}

export default SECRET_ROLES;
