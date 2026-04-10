// src/data/branches.js
export const BRANCHES = {
  force: {
    id: "force",
    label: "FORCE",
    color: "#e55c2f",
    icon: "⚔️",
    nodes: [
      { id: "f1", name: "Frappe Brute", xp: 25, tier: 0, req: [], desc: "Augmente la puissance physique de base." },
      { id: "f2", name: "Endurance", xp: 50, tier: 1, req: ["f1"], desc: "Permet de tenir plus longtemps dans l'effort." },
      { id: "f3a", name: "Furie", xp: 75, tier: 2, req: ["f2"], branch: "A", desc: "Attaques dévastatrices au détriment de la défense." },
      { id: "f3b", name: "Bouclier", xp: 75, tier: 2, req: ["f2"], branch: "B", desc: "Protection supérieure et contre-attaques." },
      { id: "f4a", name: "TITAN", xp: 100, tier: 3, req: ["f3a"], ultimate: true, desc: "La forme ultime de la puissance brute." },
      { id: "f4b", name: "BASTION", xp: 100, tier: 3, req: ["f3b"], ultimate: true, desc: "Une forteresse inébranlable." },
    ]
  },
  arcane: {
    id: "arcane",
    label: "ARCANE",
    color: "#4a9eff",
    icon: "🪄",
    nodes: [
      { id: "a1", name: "Étincelle", xp: 25, tier: 0, req: [], desc: "Première manifestation de l'énergie éthérée." },
      { id: "a2", name: "Concentration", xp: 50, tier: 1, req: ["a1"], desc: "Maîtrise du flux magique." },
      { id: "a3a", name: "Invocation", xp: 75, tier: 2, req: ["a2"], branch: "A", desc: "Appel de créatures des plans supérieurs." },
      { id: "a3b", name: "Transmutation", xp: 75, tier: 2, req: ["a2"], branch: "B", desc: "Changement de la matière elle-même." },
      { id: "a4a", name: "ARCHMAGE", xp: 100, tier: 3, req: ["a3a"], ultimate: true, desc: "Maître absolu des arts mystiques." },
      { id: "a4b", name: "ALCHIMISTE", xp: 100, tier: 3, req: ["a3b"], ultimate: true, desc: "L'art ultime de la création et destruction." },
    ]
  },
  ombre: {
    id: "ombre",
    label: "OMBRE",
    color: "#b44fff",
    icon: "👤",
    nodes: [
      { id: "o1", name: "Discrétion", xp: 25, tier: 0, req: [], desc: "L'art de ne pas être vu." },
      { id: "o2", name: "Piège", xp: 50, tier: 1, req: ["o1"], desc: "Préparation du terrain pour surprendre l'ennemi." },
      { id: "o3a", name: "Assassinat", xp: 75, tier: 2, req: ["o2"], branch: "A", desc: "Frappes chirurgicales et létales." },
      { id: "o3b", name: "Évasion", xp: 75, tier: 2, req: ["o2"], branch: "B", desc: "Disparition totale et mobilité extrême." },
      { id: "o4a", name: "FANTÔME", xp: 100, tier: 3, req: ["o3a"], ultimate: true, desc: "L'ombre qui frappe et disparaît." },
      { id: "o4b", name: "OMBRE ÉTERNELLE", xp: 100, tier: 3, req: ["o3b"], ultimate: true, desc: "Devenir un avec les ténèbres." },
    ]
  }
};
