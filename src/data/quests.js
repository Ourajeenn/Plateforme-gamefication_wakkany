// src/data/quests.js
export const QUESTS = [
  { id: "q1", title: "Épreuve du Débutant", lore: "Le forge-maître t'observe. Prouve ta valeur.", branch: "force", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "force et combat" },
  { id: "q2", title: "Le Grimoire Perdu", lore: "Retrouve les pages de l'ancien savoir éthéré.", branch: "arcane", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "magie et grimoires" },
  { id: "q3", title: "L'Ombre du Passé", lore: "Un écho de tes ennemis rôde dans les couloirs.", branch: "ombre", nodeReq: null, difficulty: "Moyen", xpReward: 40, riddleTheme: "discrétion et ombres" },
  { id: "q4", title: "Duel des Champions", lore: "Affronte un adversaire digne de ton nom.", branch: "force", nodeReq: "f2", difficulty: "Difficile", xpReward: 60, riddleTheme: "honneur et duels" },
  { id: "q5", title: "Rituel des Anciens", lore: "Connecte-toi aux flux primordiaux de l'Aether.", branch: "arcane", nodeReq: "a2", difficulty: "Difficile", xpReward: 60, riddleTheme: "rituels et constellations" },
  { id: "q6", title: "Contrat du Fantôme", lore: "Exécute une mission sans jamais être détecté.", branch: "ombre", nodeReq: "o2", difficulty: "Expert", xpReward: 75, riddleTheme: "espionnage et infiltration" },
  { id: "q7", title: "La Forge Maudite", lore: "Purifie l'acier corrompu du volcan d'Ebène.", branch: "force", nodeReq: "f3a", difficulty: "Expert", xpReward: 80, riddleTheme: "forge et métaux" },
  { id: "q8", title: "Portail des Étoiles", lore: "Ouvre une brèche vers les confins du Cosmos.", branch: "arcane", nodeReq: "a3a", difficulty: "Expert", xpReward: 80, riddleTheme: "astronomie et dimensions" },
  { id: "q9", title: "Danse de la Mort", lore: "Esquive chaque lame dans l'arène des ombres.", branch: "ombre", nodeReq: "o3a", difficulty: "Expert", xpReward: 80, riddleTheme: "agilité et lames" },
  { id: "q10", title: "Épreuve Légendaire", lore: "L'ultime test avant l'ascension finale.", branch: "all", nodeReq: "ultimate", difficulty: "Légendaire", xpReward: 150, riddleTheme: "destinée et sacrifice" }
];
