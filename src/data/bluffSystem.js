/**
 * Système de Bluff — Les joueurs bluffent et devinent qui ment
 * V1: Mécanique clé de Wakkany
 */

export const BLUFF_SCENARIOS = [
  {
    id: 'bluff_1',
    title: 'Le Trésor Perdu',
    setup: 'Trois joueurs possèdent des informations différentes sur un trésor caché.',
    trueFact: 'Le trésor est caché sous la Grande Tour.',
    clues: [
      {
        playerId: 'player1',
        isTruth: true,
        information: 'Le trésor est caché sous la Grande Tour.',
        reason: 'Information historique confirmée'
      },
      {
        playerId: 'player2',
        isTruth: false,
        information: 'Le trésor est caché dans la Forêt Enchantée.',
        reason: 'Légende locale mais probablement fausse'
      },
      {
        playerId: 'player3',
        isTruth: false,
        information: 'Le trésor est sur l\'île secrète au nord.',
        reason: 'Rumeur sans fondement'
      }
    ],
    discussionTime: 120, // secondes
    votingTime: 30
  },

  {
    id: 'bluff_2',
    title: 'L\'Énigme du Sphinx',
    setup: 'Qui peut résoudre l\'énigme du Sphinx ?',
    trueFact: 'La réponse est "le temps".',
    clues: [
      {
        playerId: 'player1',
        isTruth: true,
        information: 'La réponse est "le temps". Le Sphinx teste la sagesse.',
        reason: 'Énigme classique bien connue'
      },
      {
        playerId: 'player2',
        isTruth: false,
        information: 'La réponse est "l\'or". Le Sphinx cherche de la richesse.',
        reason: 'Interprétation erronée'
      },
      {
        playerId: 'player3',
        isTruth: false,
        information: 'La réponse est "l\'amour". C\'est une énigme du cœur.',
        reason: 'Confusion avec une autre légende'
      }
    ],
    discussionTime: 90,
    votingTime: 30
  }
];

/**
 * Gère une partie de Bluff
 */
export class BluffGameManager {
  constructor(players, scenario) {
    this.players = players; // [{ id, name, isImpostor }]
    this.scenario = scenario;
    this.roundState = 'setup'; // setup | discussion | voting | revelation
    this.votes = {}; // { playerId: targetPlayerId }
    this.scores = {}; // { playerId: score }
    this.discussionTime = scenario.discussionTime;
    this.votingTime = scenario.votingTime;

    this.initializeScores();
  }

  initializeScores() {
    this.players.forEach(p => {
      this.scores[p.id] = 0;
    });
  }

  /**
   * Distribue les clues aux joueurs
   */
  distributeClues() {
    const distribution = {};
    this.scenario.clues.forEach(clue => {
      distribution[clue.playerId] = clue;
    });
    return distribution;
  }

  /**
   * Lance la phase de discussion
   */
  startDiscussion() {
    this.roundState = 'discussion';
    return {
      phase: 'discussion',
      duration: this.discussionTime,
      message: `${this.scenario.setup} Vous avez ${this.discussionTime}s pour discuter.`
    };
  }

  /**
   * Lance la phase de vote
   */
  startVoting() {
    this.roundState = 'voting';
    return {
      phase: 'voting',
      duration: this.votingTime,
      message: `Qui pense que est en train de bluffer ? Vote en ${this.votingTime}s.`,
      options: this.players.map(p => ({ id: p.id, name: p.name }))
    };
  }

  /**
   * Enregistre un vote
   */
  recordVote(voterId, targetId) {
    this.votes[voterId] = targetId;
  }

  /**
   * Révèle la vérité et calcule les scores
   */
  revealTruth() {
    this.roundState = 'revelation';
    
    const results = {
      trueFact: this.scenario.trueFact,
      cluesRevealed: this.scenario.clues,
      scores: {},
      winners: [],
      loosers: []
    };

    // Compte les votes pour chaque joueur
    const voteCount = {};
    Object.values(this.votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    });

    // Détermine qui a été voté (le plus de votes)
    const mostVoted = Object.entries(voteCount).sort((a, b) => b[1] - a[1])[0];
    const accusedPlayerId = mostVoted ? mostVoted[0] : null;

    // Cherche qui bluffait vraiment
    const impostorClue = this.scenario.clues.find(c => !c.isTruth);
    const impostorId = impostorClue.playerId;

    // Calcule les points
    this.players.forEach(player => {
      if (player.id === impostorId) {
        // L'imposteur gagne s'il n'est pas voté
        if (player.id !== accusedPlayerId) {
          this.scores[player.id] += 100;
          results.winners.push(player.name);
        } else {
          results.loosers.push(player.name);
        }
      } else {
        // Les honnêtes gagnent s'ils votent l'imposteur
        if (this.votes[player.id] === impostorId) {
          this.scores[player.id] += 50;
          results.winners.push(player.name);
        } else {
          results.loosers.push(player.name);
        }
      }
    });

    results.scores = { ...this.scores };
    return results;
  }

  /**
   * Obtient le contexte complet de la partie
   */
  getGameContext() {
    return {
      scenario: this.scenario,
      players: this.players,
      roundState: this.roundState,
      scores: this.scores,
      votes: this.votes
    };
  }
}

/**
 * Stratégie d'IA pour bluffer
 */
export function generateAIBluff(trueInfo, scenario) {
  const falseClues = scenario.clues.filter(c => !c.isTruth);
  return falseClues[Math.floor(Math.random() * falseClues.length)];
}

export default BluffGameManager;
