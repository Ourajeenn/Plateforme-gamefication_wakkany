// src/data/quests.js
export const QUESTS = [
  { id: "q1", title: "Appel aux Armes Cosmiques", lore: "La faille s'ouvre. Prouve ta valeur héroïque.", branch: "heroes", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "justice et super-pouvoirs" },
  { id: "q2", title: "L'Arène de Sparte", lore: "Survis au premier assaut de l'armée perse.", branch: "warriors", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "guerre et mythes" },
  { id: "q3", title: "L'Œuf Primordial", lore: "Protège le nid contre les prédateurs.", branch: "dinos", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "survie et instinct" },
  { id: "q4", title: "Piste Néon", lore: "Termine la course de qualification dans le Cyber-Dôme.", branch: "cars", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "vitesse et moteurs" },
  
  { id: "q5", title: "Guerre de l'Infini", lore: "Récupère l'artefact avant qu'il ne tombe entre de mauvaises mains.", branch: "heroes", nodeReq: "h2", difficulty: "Moyen", xpReward: 50, riddleTheme: "espace et temps" },
  { id: "q6", title: "Le Choc des Titans", lore: "Affronte une créature mythologique gigantesque.", branch: "warriors", nodeReq: "w2", difficulty: "Difficile", xpReward: 60, riddleTheme: "dieux et monstres" },
  { id: "q7", title: "La Chasse du T-Rex", lore: "Traque la plus grande menace de la jungle jurassique.", branch: "dinos", nodeReq: "d2", difficulty: "Difficile", xpReward: 60, riddleTheme: "traque et prédateurs" },
  { id: "q8", title: "Grand Prix du Multivers", lore: "Remporte la course à travers trois dimensions.", branch: "cars", nodeReq: "c2", difficulty: "Expert", xpReward: 75, riddleTheme: "ingénierie et adrénaline" },
  
  { id: "q10", title: "Infiltration Hydra", lore: "Pénètre dans la base secrète sans déclencher d'alarme.", branch: "heroes", nodeReq: "h1", difficulty: "Moyen", xpReward: 40, riddleTheme: "furtivité et technologie" },
  { id: "q11", title: "Le Siège de Troie", lore: "Utilise la ruse pour franchir les murailles imprenables.", branch: "warriors", nodeReq: "w1", difficulty: "Moyen", xpReward: 45, riddleTheme: "histoire et stratégie" },
  { id: "q12", title: "Migration Arctique", lore: "Guide ton clan à travers les terres gelées de l'ère glaciaire.", branch: "dinos", nodeReq: "d1", difficulty: "Moyen", xpReward: 40, riddleTheme: "froid et endurance" },
  { id: "q13", title: "Drift Nocturne", lore: "Maîtrise les virages serrés du col de la montagne sous la pluie.", branch: "cars", nodeReq: "c1", difficulty: "Difficile", xpReward: 55, riddleTheme: "pilotage et météo" },

  { id: "q9", title: "Épreuve Légendaire: La Collision", lore: "Les 4 univers entrent en collision. Seul le plus fort survivra.", branch: "all", nodeReq: "ultimate", difficulty: "Légendaire", xpReward: 150, riddleTheme: "multivers et destinée" }
];
