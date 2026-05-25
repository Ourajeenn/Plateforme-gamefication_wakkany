// src/data/levels.js
export const LEVELS = [
  { level: 0, name: "Novice", xp: 0, color: "text-zinc-500", desc: "Le début de l'aventure." },
  { level: 1, name: "Chasseur", xp: 100, color: "text-green-500", desc: "Vous commencez à maîtriser vos outils." },
  { level: 2, name: "Vétéran", xp: 250, color: "text-blue-500", desc: "L'expérience forge votre volonté." },
  { level: 3, name: "Champion", xp: 450, color: "text-purple-500", desc: "Un nom reconnu dans tout Arthélyon." },
  { level: 4, name: "LÉGENDE", xp: 700, color: "text-orange-500", desc: "Votre nom sera gravé dans l'éternité." }
];

export const getLevel = (xp) => {
  return [...LEVELS].reverse().find(l => xp >= l.xp) || LEVELS[0];
};

export const getXpToNextLevel = (xp) => {
  const current = getLevel(xp);
  const next = LEVELS[current.level + 1];
  if (!next) return 0;
  return next.xp - xp;
};
