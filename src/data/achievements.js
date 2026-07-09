export const ACHIEVEMENTS = [
    {
        id: 'first_step',
        title: 'Traversée du Portail',
        desc: 'Rejoindre le Multivers Wakkany et initialiser son identité.',
        icon: 'mdi:sparkles',
        condition: (data) => data.user !== null,
        color: '#ffffff'
    },
    {
        id: 'contract_init',
        title: 'Première Victoire',
        desc: 'Survivre à votre première épreuve multiverselle.',
        icon: 'mdi:scroll',
        condition: (data) => data.completedQuests.length >= 1,
        color: '#c28e3a'
    },
    {
        id: 'specialist_heroes',
        title: 'Justicier Cosmique',
        desc: 'Débloquer 3 compétences dans la Légion Héroïque.',
        icon: 'mdi:shield-flash',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('h')).length >= 3,
        color: '#ff3b30'
    },
    {
        id: 'specialist_warriors',
        title: 'Sang de Sparte',
        desc: 'Débloquer 3 compétences dans l\'Ordre Antique.',
        icon: 'mdi:swords',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('w')).length >= 3,
        color: '#c28e3a'
    },
    {
        id: 'specialist_dinos',
        title: 'Prédateur Alpha',
        desc: 'Débloquer 3 compétences dans l\'Ère Primaire.',
        icon: 'mdi:bone',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('d')).length >= 3,
        color: '#34c759'
    },
    {
        id: 'specialist_cars',
        title: 'Pilote Suprême',
        desc: 'Débloquer 3 compétences dans le Syndicat Mécanique.',
        icon: 'mdi:car-front',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('c')).length >= 3,
        color: '#007aff'
    },
    {
        id: 'legend_level',
        title: 'Légende du Multivers',
        desc: 'Atteindre 500 XP cumulés.',
        icon: 'mdi:trophy',
        condition: (data) => data.xp >= 500,
        color: '#eab308'
    },
    {
        id: 'social_butterfly',
        title: 'Voix de la Sagesse',
        desc: 'Vous avez rejoint une Académie.',
        icon: 'mdi:messages-square',
        condition: (data) => data.user && data.user.academy,
        color: '#a855f7'
    },
    {
        id: 'polymath',
        title: 'Esprit Omniscient',
        desc: 'Débloquer au moins 1 compétence dans 3 branches différentes.',
        icon: 'mdi:brain-circuit',
        condition: (data) => {
            const branches = new Set(data.unlockedSkills.map(s => s[0]));
            return branches.size >= 3;
        },
        color: '#ec4899'
    }
];

