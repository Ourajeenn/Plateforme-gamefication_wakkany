/**
 * Mapping : Jeu → Compétences débloquées
 * 
 * Structure:
 *   mode: {
 *     win: { skills: [skikls], xp: number, description: string },
 *     loss: { skills: [skills], xp: number }
 *   }
 */

export const GAME_TO_SKILL_MAPPING = {
  // ✅ QUIZ — OpenTDB Trivia
  'quiz': {
    win: {
      skills: ['rhcsa'],
      xp: 60,
      description: 'Maître des questions rapides! "FLASH" disponible'
    },
    loss: { skills: [], xp: 15 }
  },

  // ✅ QUIZ parfait (10/10 correct)
  'quiz:perfect': {
    skills: ['rhce', 'h5a'],
    xp: 150,
    description: 'Quiz parfait! "AVGER" et "PHÉNIX" déverrouillés!'
  },

  // ✅ BLUFF ROYAL
  'bluff-royal': {
    win: {
      skills: ['crtp'],
      xp: 100,
      description: 'Roi du Bluff! Vous contrôlez la tromperie - "WAR" déverrouillé'
    },
    loss: { skills: [], xp: 20 }
  },

  // ✅ BLUFF 5/5 victoires (sweep)
  'bluff-royal:sweep': {
    skills: ['crte', 'oscp'],
    xp: 200,
    description: 'Vous avez remporté toutes les manches! "ODIN" et "APEX" accessibles'
  },

  // ✅ BOSS RAID
  'boss-raid': {
    win: {
      skills: ['h5b', 'h6'],
      xp: 180,
      description: 'Vous avez vaincu le boss! "AVATAR" et "KRYPT" déverrouillés!'
    },
    loss: {
      skills: ['ecca'],
      xp: 40,
      description: 'Vous avez combattu honorablement. "GENE-X" déverrouillé en consolation'
    }
  },

  // ✅ FAMILY GAME
  'family-game': {
    win: {
      skills: ['oswp', 'emap'],
      xp: 120,
      description: 'Vainqueur du jeu familial! "VALKY" et "MYTH" déverrouillés'
    },
    loss: { skills: [], xp: 25 }
  }
};

/**
 * Bonus de session : débloquer si certains critères atteints
 */
export const SESSION_BONUSES = {
  '3-different-games': {
    skills: ['sb_hero'],
    xp: 250,
    description: 'Vous avez conquis 3 modes différents! "SERAP" déverrouillé!'
  },
  'all-modes-daily': {
    skills: ['sb_warrior'],
    xp: 300,
    description: 'Vous avez complété TOUS les modes aujourd\'hui! "FENRIR" épique!'
  }
};

/**
 * Récupère le mapping pour un mode donné
 * @param {string} mode - Mode du jeu (ex: 'quiz', 'bluff-royal:sweep', 'boss-raid')
 * @param {boolean} won - Si le joueur a gagné
 * @returns {object|null} - { skills: [...], xp: number, description: string }
 */
export function getSkillUnlock(mode, won = true) {
  const mapping = GAME_TO_SKILL_MAPPING[mode];
  if (!mapping) return null;

  // Si c'est un mode sans win/loss (ex: quiz:perfect)
  if (!mapping.win) {
    return mapping;
  }

  // Sinon, retourner win ou loss
  return won ? mapping.win : (mapping.loss || null);
}
