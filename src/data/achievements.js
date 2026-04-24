export const ACHIEVEMENTS = [
    {
        id: 'first_step',
        title: 'Traversée du Portail',
        desc: 'Rejoindre le Multivers Wakkany et initialiser son identité.',
        icon: 'lucide:sparkles',
        condition: (data) => data.user !== null,
        color: '#ffffff'
    },
    {
        id: 'contract_init',
        title: 'Première Victoire',
        desc: 'Survivre à votre première épreuve multiverselle.',
        icon: 'lucide:scroll',
        condition: (data) => data.completedQuests.length >= 1,
        color: '#c28e3a'
    },
    {
        id: 'specialist_heroes',
        title: 'Justicier Cosmique',
        desc: 'Débloquer 3 compétences dans la Légion Héroïque.',
        icon: 'lucide:shield-flash',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('h')).length >= 3,
        color: '#ff3b30'
    },
    {
        id: 'specialist_warriors',
        title: 'Sang de Sparte',
        desc: 'Débloquer 3 compétences dans l\'Ordre Antique.',
        icon: 'lucide:swords',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('w')).length >= 3,
        color: '#c28e3a'
    },
    {
        id: 'specialist_dinos',
        title: 'Prédateur Alpha',
        desc: 'Débloquer 3 compétences dans l\'Ère Primaire.',
        icon: 'lucide:bone',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('d')).length >= 3,
        color: '#34c759'
    },
    {
        id: 'specialist_cars',
        title: 'Pilote Suprême',
        desc: 'Débloquer 3 compétences dans le Syndicat Mécanique.',
        icon: 'lucide:car-front',
        condition: (data) => data.unlockedSkills.filter(s => s.startsWith('c')).length >= 3,
        color: '#007aff'
    },
    {
        id: 'legend_level',
        title: 'Légende du Multivers',
        desc: 'Atteindre 500 XP cumulés.',
        icon: 'lucide:trophy',
        condition: (data) => data.xp >= 500,
        color: '#eab308'
    }
];
