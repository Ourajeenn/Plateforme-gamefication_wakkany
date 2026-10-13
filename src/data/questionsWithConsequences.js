/**
 * Questions avec conséquences — Système de questions qui affectent l'état du jeu
 * Inspire par la conception V1 du document Wakkany
 */

export const QUESTIONS_WITH_CONSEQUENCES = [
  {
    id: 'q1_water_crisis',
    round: 0,
    situation: 'La ville de Wakama manque d\'eau. Que faire ?',
    question: 'Quelle est la meilleure solution pour résoudre une crise d\'eau ?',
    answers: [
      {
        text: 'Construire un barrage',
        isCorrect: true,
        xpReward: 100,
        consequence: {
          type: 'resource_gain',
          resource: 'water',
          amount: 50,
          description: 'Un barrage a été construit. La ville a de l\'eau pour 6 mois.'
        }
      },
      {
        text: 'Importer de l\'eau',
        isCorrect: false,
        xpReward: 30,
        consequence: {
          type: 'reputation_loss',
          amount: 20,
          description: 'Les habitants perdent confiance. L\'importation coûte cher.'
        }
      },
      {
        text: 'Recycler les eaux usées',
        isCorrect: true,
        xpReward: 80,
        consequence: {
          type: 'technology_unlock',
          tech: 'water_recycling',
          description: 'Vous déverrouillez la technologie de recyclage des eaux usées.'
        }
      },
      {
        text: 'Ne rien faire',
        isCorrect: false,
        xpReward: 0,
        consequence: {
          type: 'event_trigger',
          event: 'drought_disaster',
          description: 'La ville sombre dans une sécheresse. Les habitants vous blâment.'
        }
      }
    ]
  },

  {
    id: 'q2_historian_tablet',
    round: 1,
    situation: 'Une ancienne tablette vient d\'être découverte. Vous avez résolu la question sur les civilisations anciennes.',
    question: 'Quelle information cette tablette pourrait-elle révéler ?',
    answers: [
      {
        text: 'Secrets militaires perdus',
        isCorrect: false,
        xpReward: 50,
        consequence: {
          type: 'event_trigger',
          event: 'conflict_awakened',
          description: 'Des tensions anciennes refont surface. Prudence requise.'
        }
      },
      {
        text: 'Carte d\'un trésor caché',
        isCorrect: true,
        xpReward: 150,
        consequence: {
          type: 'quest_unlock',
          quest: 'hidden_treasure_hunt',
          description: 'Une nouvelle quête: Trouver le trésor caché de Wakama!'
        }
      },
      {
        text: 'Formules de médecine ancienne',
        isCorrect: true,
        xpReward: 120,
        consequence: {
          type: 'skill_unlock',
          skill: 'ancient_medicine',
          description: 'Vous apprenez une médecine oubliée. Peut soigner les maux anciens.'
        }
      },
      {
        text: 'Recettes culinaires',
        isCorrect: false,
        xpReward: 20,
        consequence: {
          type: 'passive_reward',
          description: 'Intéressant, mais pas très utile pour le moment.'
        }
      }
    ]
  },

  {
    id: 'q3_forest_decision',
    round: 2,
    situation: 'Les joueurs ont construit une ville. Maintenant, une forêt menace de les submerger.',
    question: 'Vous avez détruit la forêt au tour 4. Comment gérez-vous les conséquences ?',
    answers: [
      {
        text: 'Replanter rapidement',
        isCorrect: true,
        xpReward: 100,
        consequence: {
          type: 'memory_callback',
          pastAction: 'forest_destruction',
          description: 'Vous vous souvenez: vous avez détruit la forêt. Maintenant vous la restaurez.'
        }
      },
      {
        text: 'Ignorer les problèmes',
        isCorrect: false,
        xpReward: 0,
        consequence: {
          type: 'event_trigger',
          event: 'environmental_collapse',
          description: 'La ville fait face à une catastrophe environnementale.'
        }
      },
      {
        text: 'Exporter les ressources',
        isCorrect: false,
        xpReward: 40,
        consequence: {
          type: 'mixed_consequence',
          rewards: [{ type: 'coins', amount: 50 }],
          penalties: [{ type: 'reputation_loss', amount: 30 }],
          description: 'Profits économiques mais perte de réputation.'
        }
      }
    ]
  }
];

/**
 * Génère la prochaine question basée sur les conséquences précédentes
 */
export function getNextQuestionBasedOnConsequences(gameState, currentRound) {
  // Filtre les questions du prochain round
  const nextRoundQuestions = QUESTIONS_WITH_CONSEQUENCES.filter(
    q => q.round === currentRound + 1
  );

  // Si il existe des conséquences, adapter la situation
  if (gameState.consequences && gameState.consequences.length > 0) {
    const lastConsequence = gameState.consequences[gameState.consequences.length - 1];
    
    // Adapte la situation de la prochaine question
    nextRoundQuestions.forEach(q => {
      if (lastConsequence.type === 'forest_destruction' && q.id === 'q3_forest_decision') {
        q.situation = `Suite à votre décision précédente (destruction de forêt), la nature se venge.`;
      }
    });
  }

  return nextRoundQuestions[0] || null;
}

export default QUESTIONS_WITH_CONSEQUENCES;
