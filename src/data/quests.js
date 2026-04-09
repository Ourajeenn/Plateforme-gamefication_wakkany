export const QUESTS = [
    { id: "q1", title: "Rituel Matinal", lore: "Connecte-toi avant 9h pour bien démarrer la journée.", branch: "sustain", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "null" },
    { id: "q2", title: "Micro-Apprentissage", lore: "Lis un article ou apprends quelque chose de nouveau.", branch: "burst", nodeReq: null, difficulty: "Facile", xpReward: 30, riddleTheme: "null" },
    { id: "q3", title: "Zen Attitude", lore: "Prends 5 minutes pour respirer sans écran.", branch: "control", nodeReq: null, difficulty: "Moyen", xpReward: 40, riddleTheme: "null" },
    { id: "q4", title: "Activité Physique", lore: "Fais 20 minutes de marche ou de sport.", branch: "sustain", nodeReq: "sus_2", difficulty: "Difficile", xpReward: 60, riddleTheme: "null" },
    { id: "q5", title: "Deep Work", lore: "Travaille 1 heure non-stop sans distraction.", branch: "burst", nodeReq: "burst_2", difficulty: "Difficile", xpReward: 60, riddleTheme: "null" },
    { id: "q6", title: "Digital Detox", lore: "Pas de réseaux sociaux pendant la matinée.", branch: "control", nodeReq: "ctrl_2", difficulty: "Expert", xpReward: 75, riddleTheme: "null" },
    { id: "q7", title: "Corps sain", lore: "Mange équilibré et bois 2L d'eau aujourd'hui.", branch: "sustain", nodeReq: "sus_ring2_1", difficulty: "Expert", xpReward: 80, riddleTheme: "null" },
    { id: "q8", title: "Projet Terminé", lore: "Achève une tâche majeure de ta to-do list.", branch: "burst", nodeReq: "burst_ring2_1", difficulty: "Expert", xpReward: 80, riddleTheme: "null" },
    { id: "q9", title: "Maître de l'Agenda", lore: "Planifie l'intégralité de la semaine prochaine.", branch: "control", nodeReq: "ctrl_ring2_1", difficulty: "Expert", xpReward: 80, riddleTheme: "null" },
    { id: "q10", title: "Le Test Ultime", lore: "Prouve ta régularité en validant une semaine parfaite.", branch: "all", nodeReq: "ultimate", difficulty: "Légendaire", xpReward: 150, riddleTheme: "null" }
];
