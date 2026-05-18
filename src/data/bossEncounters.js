// ============================================================
// WAKKANY — SYSTÈME DE BOSS RAID
// 3 niveaux × (3 semi-boss + 1 boss final) = 12 combats
// ============================================================

export const BOSS_LEVELS = [
  { id: 1, name: "La Faille de l'Aube",       color: '#6366f1', colorDark: '#1e1b4b', icon: '🌅' },
  { id: 2, name: "Le Sanctuaire des Ombres",   color: '#ec4899', colorDark: '#500724', icon: '🌑' },
  { id: 3, name: "Le Trône du Néant",          color: '#f1f5f9', colorDark: '#0f0f1a', icon: '♾️' },
];

export const BOSS_ENCOUNTERS = [

  // ─── NIVEAU 1 : La Faille de l'Aube ──────────────────────
  {
    id: 'semi_1_1', level: 1, type: 'semi', order: 1,
    name: 'Spectre des Brumes',
    title: 'Gardien de l\'Aube',
    icon: '👻', color: '#818cf8',
    hp: 60, damageDealt: 20, xpReward: 35,
    questionsCount: 3,
    description: 'Un spectre émergeant des brumes primordiales. Écartez-le pour ouvrir la Faille.',
    taunt: 'Tu ne peux pas me voir… mais moi je te vois !',
  },
  {
    id: 'semi_1_2', level: 1, type: 'semi', order: 2,
    name: 'Croc-Noir',
    title: 'Bête des Ténèbres',
    icon: '🐺', color: '#a78bfa',
    hp: 75, damageDealt: 25, xpReward: 50,
    questionsCount: 4,
    description: 'Une bête aux crocs de nuit. Son souffle empoisonne l\'esprit des plus faibles.',
    taunt: 'La meute ne résistera pas à mes crocs !',
  },
  {
    id: 'semi_1_3', level: 1, type: 'semi', order: 3,
    name: 'Seigneur des Cendres',
    title: 'Chambellan Maudit',
    icon: '🔥', color: '#f97316',
    hp: 90, damageDealt: 25, xpReward: 65,
    questionsCount: 4,
    description: 'Le chambellan du Boss Final. Il garde la porte avec des flammes éternelles.',
    taunt: 'Mes cendres dévoreront votre lumière !',
  },
  {
    id: 'final_1', level: 1, type: 'final', order: 4,
    name: 'Golem de Faille d\'Aéther',
    title: 'Boss Final — Niveau I',
    icon: '💀', color: '#ef4444',
    hp: 150, damageDealt: 30, xpReward: 200,
    questionsCount: 5,
    description: 'L\'être primordial de la Faille. Sa destruction ouvre les portes du Niveau II.',
    taunt: 'Je suis la Faille elle-même ! Vous ne pouvez pas me vaincre !',
    isFinal: true,
  },

  // ─── NIVEAU 2 : Le Sanctuaire des Ombres ─────────────────
  {
    id: 'semi_2_1', level: 2, type: 'semi', order: 1,
    name: 'Chasseur Fantôme',
    title: 'Vigile du Sanctuaire',
    icon: '👁️', color: '#06b6d4',
    hp: 80, damageDealt: 25, xpReward: 80,
    questionsCount: 4,
    description: 'Un chasseur spectral aux mille yeux. Il surveille les portes du Sanctuaire.',
    taunt: 'Je vois chacun de vos mouvements. Inutile de fuir.',
  },
  {
    id: 'semi_2_2', level: 2, type: 'semi', order: 2,
    name: 'Hydre de Cristal',
    title: 'Gardienne des Profondeurs',
    icon: '💎', color: '#10b981',
    hp: 100, damageDealt: 30, xpReward: 100,
    questionsCount: 5,
    description: 'Une hydre aux écailles de cristal. Chaque tête vaincue en génère une nouvelle.',
    taunt: 'Coupez une tête… et trois repoussent !',
  },
  {
    id: 'semi_2_3', level: 2, type: 'semi', order: 3,
    name: 'Archimage Corrompu',
    title: 'Main Droite du Monarque',
    icon: '✨', color: '#a855f7',
    hp: 120, damageDealt: 30, xpReward: 120,
    questionsCount: 5,
    description: 'L\'archimage trahi par la corruption du Monarque des Ombres.',
    taunt: 'Ma magie consume tout… y compris votre espoir.',
  },
  {
    id: 'final_2', level: 2, type: 'final', order: 4,
    name: 'Monarque des Ombres',
    title: 'Boss Final — Niveau II',
    icon: '👑', color: '#ec4899',
    hp: 200, damageDealt: 35, xpReward: 400,
    questionsCount: 6,
    description: 'Le Monarque régnant sur le Sanctuaire depuis des millénaires.',
    taunt: 'Mon règne est éternel. Votre résistance, pathétique.',
    isFinal: true,
  },

  // ─── NIVEAU 3 : Le Trône du Néant ────────────────────────
  {
    id: 'semi_3_1', level: 3, type: 'semi', order: 1,
    name: 'Titan Cosmique',
    title: 'Vanguard du Néant',
    icon: '🌋', color: '#f59e0b',
    hp: 110, damageDealt: 30, xpReward: 150,
    questionsCount: 5,
    description: 'Un titan cosmique, avant-garde du Dieu-Néant. Sa présence fait trembler la Faille.',
    taunt: 'Je suis l\'avant-garde de la fin. Tremblez !',
  },
  {
    id: 'semi_3_2', level: 3, type: 'semi', order: 2,
    name: 'Démon de Sang',
    title: 'Exécuteur du Néant',
    icon: '⚔️', color: '#dc2626',
    hp: 130, damageDealt: 35, xpReward: 180,
    questionsCount: 6,
    description: 'L\'exécuteur sans merci du Dieu-Néant. Il ne connaît ni pitié ni défaite.',
    taunt: 'Votre sang enrichira le Trône du Néant.',
  },
  {
    id: 'semi_3_3', level: 3, type: 'semi', order: 3,
    name: 'Ange Déchu d\'Aéther',
    title: 'Héraut de la Fin',
    icon: '🪶', color: '#e2e8f0',
    hp: 150, damageDealt: 40, xpReward: 220,
    questionsCount: 6,
    description: 'L\'ange déchu annonçant la venue du Dieu-Néant. Le franchir est le test ultime.',
    taunt: 'Je suis la dernière lumière avant l\'obscurité totale.',
  },
  {
    id: 'final_3', level: 3, type: 'final', order: 4,
    name: 'Dieu-Néant, Dévoreur de Mondes',
    title: 'Boss Suprême — Niveau III',
    icon: '♾️', color: '#ffffff',
    hp: 300, damageDealt: 50, xpReward: 1000,
    questionsCount: 8,
    description: 'Le Dieu-Néant lui-même. L\'ennemi absolu de toute existence.',
    taunt: 'Je SUIS le Néant. Votre victoire n\'existe pas.',
    isFinal: true, isSupreme: true,
  },
];

// Helpers
export const getEncountersByLevel = (level) =>
  BOSS_ENCOUNTERS.filter(b => b.level === level).sort((a, b) => a.order - b.order);

export const isLevelUnlocked = (level, defeated) => {
  if (level === 1) return true;
  const prevFinal = BOSS_ENCOUNTERS.find(b => b.level === level - 1 && b.isFinal);
  return prevFinal ? defeated.includes(prevFinal.id) : false;
};

export const getNextEncounter = (level, defeated) => {
  const levelEncounters = getEncountersByLevel(level);
  return levelEncounters.find(b => !defeated.includes(b.id)) || null;
};
