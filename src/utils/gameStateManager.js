/**
 * Système d'état du jeu — Gère la mémoire, les ressources et les conséquences
 * V1: Les décisions des joueurs affectent le monde (plutard alimenter par une LLM IA)
 */

export class GameStateManager {
  constructor(gameId = 'default') {
    this.gameId = gameId;
    this.state = this.initializeState();
  }

  initializeState() {
    return {
      round: 0,
      worldState: {
        city_name: 'Wakama',
        population: 1000,
        prosperity: 50,
        environment: 70,
        infrastructure: 30
      },
      playerResources: {
        health: 100,           // ❤️
        coins: 100,            // 🪙
        reputation: 50,        // ⭐
        knowledge: 0,          // 🧠
        powers: []             // 🔮
      },
      decisions: [],           // Historique des décisions
      consequences: [],        // Historique des conséquences
      questionsAnswered: [],   // Questions répondues
      unlockedSkills: [],      // Compétences déverrouillées
      worldMemory: {},         // Mémoire du monde (key: event_id, value: impact)
      events: []               // Événements survenus
    };
  }

  /**
   * Enregistre une décision et ses conséquences
   */
  recordDecision(questionId, answer, consequence) {
    this.state.decisions.push({
      questionId,
      answer,
      timestamp: Date.now(),
      round: this.state.round
    });

    this.applyConsequence(consequence);
    this.state.questionsAnswered.push(questionId);
  }

  /**
   * Applique une conséquence au monde du jeu
   */
  applyConsequence(consequence) {
    if (!consequence) return;

    this.state.consequences.push({
      type: consequence.type,
      description: consequence.description,
      timestamp: Date.now(),
      round: this.state.round
    });

    switch (consequence.type) {
      case 'resource_gain':
        if (consequence.resource === 'water') {
          this.state.worldState.infrastructure += consequence.amount;
        }
        break;

      case 'reputation_loss':
        this.state.playerResources.reputation = Math.max(
          0,
          this.state.playerResources.reputation - consequence.amount
        );
        break;

      case 'technology_unlock':
        this.state.unlockedSkills.push(consequence.tech);
        this.state.playerResources.knowledge += 30;
        break;

      case 'quest_unlock':
        this.state.events.push({
          type: 'quest_available',
          questId: consequence.quest,
          description: consequence.description
        });
        break;

      case 'skill_unlock':
        this.state.unlockedSkills.push(consequence.skill);
        this.state.playerResources.knowledge += 50;
        break;

      case 'event_trigger':
        this.state.events.push({
          type: consequence.event,
          description: consequence.description,
          impact: consequence.impact || 'neutral'
        });
        if (consequence.event === 'drought_disaster') {
          this.state.worldState.prosperity -= 30;
          this.state.worldState.population -= 100;
        }
        break;

      case 'memory_callback':
        this.state.worldMemory[consequence.pastAction] = true;
        break;

      case 'mixed_consequence':
        if (consequence.rewards) {
          consequence.rewards.forEach(r => {
            if (r.type === 'coins') {
              this.state.playerResources.coins += r.amount;
            }
          });
        }
        if (consequence.penalties) {
          consequence.penalties.forEach(p => {
            if (p.type === 'reputation_loss') {
              this.state.playerResources.reputation -= p.amount;
            }
          });
        }
        break;

      default:
        // passive_reward, etc.
        break;
    }
  }

  /**
   * Récupère la mémoire du monde (ce qui s'est passé avant)
   */
  getWorldMemory() {
    return {
      pastDecisions: this.state.decisions,
      pastConsequences: this.state.consequences,
      pastEvents: this.state.events,
      unlockedSkills: this.state.unlockedSkills
    };
  }

  /**
   * Progresse au prochain round
   */
  advanceRound() {
    this.state.round += 1;
    return this.state.round;
  }

  /**
   * Obtient l'état actuel du monde
   */
  getWorldState() {
    return {
      round: this.state.round,
      worldState: this.state.worldState,
      playerResources: this.state.playerResources,
      events: this.state.events,
      unlockedSkills: this.state.unlockedSkills
    };
  }

  /**
   * Génère un résumé pour le Game Master IA
   */
  generateGameMasterContext() {
    return {
      round: this.state.round,
      worldState: this.state.worldState,
      playerActions: this.state.decisions,
      worldImpact: this.state.consequences,
      currentMood: this.calculateWorldMood(),
      suggestions: this.suggestNextEvents()
    };
  }

  calculateWorldMood() {
    const prosperity = this.state.worldState.prosperity;
    const reputation = this.state.playerResources.reputation;
    
    if (prosperity > 70 && reputation > 60) return 'flourishing';
    if (prosperity > 40 && reputation > 40) return 'stable';
    if (prosperity < 30 || reputation < 20) return 'crisis';
    return 'uncertain';
  }

  suggestNextEvents() {
    const mood = this.calculateWorldMood();
    const suggestions = [];

    if (mood === 'flourishing') {
      suggestions.push('Nouvelle région à explorer');
      suggestions.push('Alliance avec une faction');
    } else if (mood === 'crisis') {
      suggestions.push('Catastrophe naturelle');
      suggestions.push('Révolte populaire');
    }

    return suggestions;
  }
}

export default GameStateManager;
