// src/data/branches.js
export const BRANCHES = {
  heroes: {
    id: "heroes",
    label: "HÉROS",
    color: "#ff3b30",
    icon: "🦸‍♂️",
    nodes: [
      { id: "h1", name: "Gène X", xp: 25, tier: 0, req: [], desc: "L'éveil d'un potentiel cosmique latent.", x: 40, y: 40 },
      { id: "h2", name: "Vitesse Flash", xp: 50, tier: 1, req: ["h1"], desc: "Réflexes surhumains et vitesse lumière.", x: 30, y: 30 },
      { id: "h3a", name: "Vol Stellaire", xp: 75, tier: 2, req: ["h2"], branch: "A", desc: "Défier la gravité et traverser l'espace.", x: 18, y: 35 },
      { id: "h3b", name: "Armure Tech", xp: 75, tier: 2, req: ["h2"], branch: "B", desc: "Technologie de pointe à la Iron Man.", x: 35, y: 18 },
      { id: "h4a", name: "AVENGER", xp: 100, tier: 3, req: ["h3a"], ultimate: true, desc: "Le défenseur suprême de la galaxie.", x: 5, y: 40 },
      { id: "h4b", name: "KRYPTONIEN", xp: 100, tier: 3, req: ["h3b"], ultimate: true, desc: "Invulnérabilité et puissance solaire infinie.", x: 40, y: 5 },
    ]
  },
  warriors: {
    id: "warriors",
    label: "GUERRIERS",
    color: "#c28e3a",
    icon: "⚔️",
    nodes: [
      { id: "w1", name: "Esprit Spartiate", xp: 25, tier: 0, req: [], desc: "Discipline de fer et formation au combat.", x: 60, y: 40 },
      { id: "w2", name: "Rage de Kratos", xp: 50, tier: 1, req: ["w1"], desc: "Force destructrice dévastatrice.", x: 70, y: 30 },
      { id: "w3a", name: "Marteau de Thor", xp: 75, tier: 2, req: ["w2"], branch: "A", desc: "Manipulation de la foudre et puissance asgardienne.", x: 82, y: 35 },
      { id: "w3b", name: "Lame d'Achille", xp: 75, tier: 2, req: ["w2"], branch: "B", desc: "Précision mortelle et quasi-invulnérabilité.", x: 65, y: 18 },
      { id: "w4a", name: "DIEU DE LA GUERRE", xp: 100, tier: 3, req: ["w3a"], ultimate: true, desc: "L'incarnation mythologique du carnage.", x: 95, y: 40 },
      { id: "w4b", name: "LÉGENDE ANTIQUE", xp: 100, tier: 3, req: ["w3b"], ultimate: true, desc: "Un nom qui résonnera dans l'éternité.", x: 60, y: 5 },
    ]
  },
  dinos: {
    id: "dinos",
    label: "PRIMITIFS",
    color: "#34c759",
    icon: "🦖",
    nodes: [
      { id: "d1", name: "Instinct Jurassique", xp: 25, tier: 0, req: [], desc: "Retour à l'état sauvage originel.", x: 40, y: 60 },
      { id: "d2", name: "Peau Écailleuse", xp: 50, tier: 1, req: ["d1"], desc: "Armure naturelle impénétrable.", x: 30, y: 70 },
      { id: "d3a", name: "Croc Acéré", xp: 75, tier: 2, req: ["d2"], branch: "A", desc: "Morsure mortelle inspirée du T-Rex.", x: 18, y: 65 },
      { id: "d3b", name: "Agilité Vélociraptor", xp: 75, tier: 2, req: ["d2"], branch: "B", desc: "Vitesse, meute et ruse primitive.", x: 35, y: 82 },
      { id: "d4a", name: "APEX PREDATOR", xp: 100, tier: 3, req: ["d3a"], ultimate: true, desc: "Le sommet absolu de la chaîne alimentaire.", x: 5, y: 60 },
      { id: "d4b", name: "TITANOSAURE", xp: 100, tier: 3, req: ["d3b"], ultimate: true, desc: "Une taille colossale qui fait trembler la terre.", x: 40, y: 95 },
    ]
  },
  cars: {
    id: "cars",
    label: "MÉCANIQUE",
    color: "#007aff",
    icon: "🏎️",
    nodes: [
      { id: "c1", name: "Allumage V8", xp: 25, tier: 0, req: [], desc: "La puissance du moteur rugissant.", x: 60, y: 60 },
      { id: "c2", name: "Aérodynamisme", xp: 50, tier: 1, req: ["c1"], desc: "Fendre l'air à des vitesses hallucinantes.", x: 70, y: 70 },
      { id: "c3a", name: "Turbo Boost", xp: 75, tier: 2, req: ["c2"], branch: "A", desc: "Accélération nitro fulgurante.", x: 82, y: 65 },
      { id: "c3b", name: "Châssis Renforcé", xp: 75, tier: 2, req: ["c2"], branch: "B", desc: "Robustesse blindée de type F1.", x: 65, y: 82 },
      { id: "c4a", name: "HYPERCAR", xp: 100, tier: 3, req: ["c3a"], ultimate: true, desc: "La perfection de l'ingénierie automobile mondiale.", x: 95, y: 60 },
      { id: "c4b", name: "CYBER-BOLIDE", xp: 100, tier: 3, req: ["c3b"], ultimate: true, desc: "Un véhicule venu tout droit du futur.", x: 60, y: 95 },
    ]
  }
};
