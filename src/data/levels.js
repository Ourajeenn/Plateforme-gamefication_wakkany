export const LEVELS = [
    { level: 0, name: "Novice", xp: 0, color: "text-gray-400" },
    { level: 1, name: "Chasseur", xp: 100, color: "text-green-400" },
    { level: 2, name: "Vétéran", xp: 250, color: "text-blue-400" },
    { level: 3, name: "Champion", xp: 450, color: "text-purple-400" },
    { level: 4, name: "LÉGENDE", xp: 700, color: "text-yellow-400" }
];

export const getLevel = (xp) => {
    return [...LEVELS].reverse().find(l => xp >= l.xp) || LEVELS[0];
};

export const getNextLevelXp = (xp) => {
    const next = LEVELS.find(l => l.xp > xp);
    return next ? next.xp : null;
};
