/**
 * IA Game Master — Génère des événements et adapte l'expérience
 * V1: Maître du jeu IA qui crée la narration
 */

export const EVENT_CATEGORIES = {
  NATURAL_DISASTER: {
    id: 'disaster',
    name: 'Catastrophe Naturelle',
    icon: '🌊',
    severity: 'high',
    events: [
      {
        id: 'drought',
        title: 'La Grande Sécheresse',
        description: 'Les terres se dessèchent. Les récoltes échouent. Que faire ?',
        impact: { prosperity: -30, population: -50 }
      },
      {
        id: 'earthquake',
        title: 'Tremblement de Terre',
        description: 'La terre tremble. Les bâtiments s\'effondrent!',
        impact: { infrastructure: -40, health: -20 }
      },
      {
        id: 'flood',
        title: 'Inondation Dévastatrice',
        description: 'Les fleuves débordent. La ville est submergée.',
        impact: { prosperity: -25, infrastructure: -20 }
      }
    ]
  },

  DIPLOMATIC: {
    id: 'diplomatic',
    name: 'Événement Diplomatique',
    icon: '🤝',
    severity: 'medium',
    events: [
      {
        id: 'trade_offer',
        title: 'Offre de Commerce',
        description: 'Une caravane propose un échange avantageux.',
        impact: { coins: 100, reputation: 10 }
      },
      {
        id: 'alliance',
        title: 'Alliance Proposée',
        description: 'Une faction propose une alliance militaire.',
        impact: { prosperity: 20, reputation: 25 }
      },
      {
        id: 'betrayal',
        title: 'Trahison Découverte',
        description: 'Un allié vous a trahi. Vendetta?',
        impact: { reputation: -30, coins: -50 }
      }
    ]
  },

  MYSTERY: {
    id: 'mystery',
    name: 'Mystère',
    icon: '🔍',
    severity: 'medium',
    events: [
      {
        id: 'treasure_map',
        title: 'Découverte d\'une Carte au Trésor',
        description: 'Une vieille carte aux trésors apparaît. Authentique ?',
        impact: { knowledge: 50 }
      },
      {
        id: 'prophecy',
        title: 'Prophétie Ancienne',
        description: 'Un oracle prédit l\'avenir. Vous croyez ?',
        impact: { reputation: 15, knowledge: 30 }
      },
      {
        id: 'lost_city',
        title: 'Cité Perdue Découverte',
        description: 'Une cité ancienne est découverte! Que contient-elle ?',
        impact: { knowledge: 100, prosperity: 40 }
      }
    ]
  },

  CONFLICT: {
    id: 'conflict',
    name: 'Conflit',
    icon: '⚔️',
    severity: 'high',
    events: [
      {
        id: 'rebellion',
        title: 'Révolte Populaire',
        description: 'Le peuple se révolte! Vos décisions ont conséquences.',
        impact: { reputation: -40, prosperity: -30 }
      },
      {
        id: 'invasion',
        title: 'Invasion Ennemie',
        description: 'Des envahisseurs franchissent la frontière!',
        impact: { infrastructure: -50, health: -30, prosperity: -40 }
      },
      {
        id: 'civil_war',
        title: 'Guerre Civile',
        description: 'Deux factions rivales s\'affrontent.',
        impact: { population: -100, prosperity: -50, reputation: -25 }
      }
    ]
  },

  WONDROUS: {
    id: 'wondrous',
    name: 'Merveilleux',
    icon: '✨',
    severity: 'low',
    events: [
      {
        id: 'miracle',
        title: 'Miracle Divin',
        description: 'Une intervention divine aide votre cause!',
        impact: { health: 50, reputation: 30, prosperity: 20 }
      },
      {
        id: 'discovery',
        title: 'Découverte Technologique',
        description: 'Un scientifique fait une découverte révolutionnaire!',
        impact: { knowledge: 80, prosperity: 30 }
      },
      {
        id: 'celebration',
        title: 'Grande Célébration',
        description: 'La ville célèbre une victoire commune!',
        impact: { reputation: 25, coins: 50 }
      }
    ]
  }
};

/**
 * Génère des événements basés sur l'état du monde
 */
export class GameMasterAI {
  constructor(worldState) {
    this.worldState = worldState;
    this.eventHistory = [];
    this.suggestionCache = {};
  }

  /**
   * Génère un événement basé sur l'état du monde
   */
  generateNextEvent() {
    const mood = this.analyzeWorldMood();
    const appropriateEvents = this.selectAppropriateEvents(mood);
    const selectedEvent = appropriateEvents[Math.floor(Math.random() * appropriateEvents.length)];

    this.eventHistory.push({
      ...selectedEvent,
      timestamp: Date.now(),
      round: this.worldState.round
    });

    return selectedEvent;
  }

  /**
   * Analyse le "mood" du monde
   */
  analyzeWorldMood() {
    const { prosperity, population, infrastructure } = this.worldState.worldState;

    if (prosperity > 70 && population > 900) return 'flourishing';
    if (prosperity < 20 || population < 500) return 'crisis';
    if (infrastructure < 20) return 'desperate';
    if (prosperity > 50) return 'stable';

    return 'uncertain';
  }

  /**
   * Sélectionne les événements appropriés au mood
   */
  selectAppropriateEvents(mood) {
    let categories = [];

    if (mood === 'flourishing') {
      categories = ['diplomatic', 'wondrous'];
      // Possibilité d'événements mystérieux
      if (Math.random() > 0.7) categories.push('mystery');
    } else if (mood === 'crisis') {
      categories = ['disaster', 'conflict'];
    } else if (mood === 'desperate') {
      categories = ['conflict', 'disaster'];
    } else if (mood === 'stable') {
      categories = ['diplomatic', 'mystery'];
    } else {
      categories = Object.keys(EVENT_CATEGORIES);
    }

    const allEvents = [];
    categories.forEach(catId => {
      const category = EVENT_CATEGORIES[catId];
      if (category) {
        allEvents.push(...category.events);
      }
    });

    return allEvents;
  }

  /**
   * Suggère les prochains événements basés sur les décisions
   */
  suggestNextEvents(playerDecisions) {
    const suggestions = [];

    // Si les joueurs détruisent une forêt → catastrophe écologique
    if (playerDecisions.includes('forest_destruction')) {
      suggestions.push(EVENT_CATEGORIES.NATURAL_DISASTER.events.find(e => e.id === 'drought'));
    }

    // Si les joueurs gagnent beaucoup → événement diplomatique
    if (this.worldState.worldState.prosperity > 60) {
      suggestions.push(EVENT_CATEGORIES.DIPLOMATIC.events[Math.floor(Math.random() * 3)]);
    }

    // Si les joueurs perdent confiance → révolte
    if (this.worldState.playerResources.reputation < 30) {
      suggestions.push(EVENT_CATEGORIES.CONFLICT.events.find(e => e.id === 'rebellion'));
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Génère une narration pour un événement
   */
  generateNarration(event) {
    const narratives = {
      drought: `Les terres de ${this.worldState.worldState.city_name} se dessèchent. Les récoltes meurent. Le peuple a soif.`,
      earthquake: `La terre tremble violemment! Les bâtiments s'effondrent dans un chaos terrifiant.`,
      trade_offer: `Des marchands arrivent à ${this.worldState.worldState.city_name} avec des marchandises exotiques.`,
      treasure_map: `Une vieille carte au trésor apparaît entre vos mains. Son authenticité vous échappe.`,
      miracle: `La lumière divine illumine ${this.worldState.worldState.city_name}. C'est un miracle!`,
      rebellion: `Le peuple se lève contre vous! Vos décisions les ont poussés à bout.`
    };

    return narratives[event.id] || event.description;
  }

  /**
   * Génère un contexte pour le prochain round
   */
  generateRoundContext(roundNumber) {
    const event = this.generateNextEvent();
    const narration = this.generateNarration(event);

    return {
      round: roundNumber,
      event,
      narration,
      worldState: { ...this.worldState.worldState },
      challenge: `Comment réagissez-vous à cet événement?`,
      options: [
        { text: 'Affronter le problème de front', impact: 'direct' },
        { text: 'Chercher une solution créative', impact: 'creative' },
        { text: 'Attendre et observer', impact: 'passive' }
      ]
    };
  }

  /**
   * Évalue les décisions des joueurs
   */
  evaluatePlayerDecision(decision, expectedOutcome) {
    const impact = {
      correctness: decision.impact === expectedOutcome ? 1.0 : 0.5,
      creativity: decision.isCreative ? 1.2 : 1.0,
      consequences: this.calculateConsequences(decision)
    };

    return {
      xpReward: Math.floor(100 * impact.correctness * impact.creativity),
      narrativeFeedback: this.generateFeedback(decision, impact),
      worldImpact: impact.consequences
    };
  }

  calculateConsequences(decision) {
    // Simule l'impact de la décision sur le monde
    return {
      prosperity: Math.random() * 20 - 10,
      reputation: decision.isCreative ? 15 : 5,
      population: 0
    };
  }

  generateFeedback(decision, impact) {
    if (impact.correctness === 1.0) {
      return '✓ Excellente décision! Le monde en est reconnaissant.';
    } else if (impact.correctness === 0.5) {
      return '⚠ Bonne tentative, mais les résultats sont mitigés.';
    }
    return '✗ Cette décision a eu des conséquences négatives.';
  }
}

export default GameMasterAI;
