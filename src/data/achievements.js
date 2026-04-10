export const ACHIEVEMENTS = [
    {
        id: 'first_step',
        title: 'Premiers Pas',
        desc: 'Rejoindre la meute et initialiser son profil.',
        icon: 'lucide:sparkles',
        condition: (data) => data.user !== null,
        color: '#ffffff'
    },
    {
        id: 'contract_init',
        title: 'Premier Contrat',
        desc: 'Terminer votre premier contrat de mission.',
        icon: 'lucide:scroll',
        condition: (data) => data.completedQuests.length >= 1,
        color: '#c28e3a'
    },
    {
        id: 'specialist_force',
        title: 'Maitre de l\'Acier',
        desc: 'Débloquer 3 compétences dans la voie de la Force.',
        icon: 'lucide:swords',
        condition: (data) => data.unlockedSkills.filter(s => s.includes('force') || s.startsWith('str_')).length >= 3,
        color: '#4ade80'
    },
    {
        id: 'specialist_arcane',
        title: 'Érudit de l\'Aether',
        desc: 'Débloquer 3 compétences dans la voie de l\'Arcane.',
        icon: 'lucide:wand-2',
        condition: (data) => data.unlockedSkills.filter(s => s.includes('arcane') || s.startsWith('int_')).length >= 3,
        color: '#f87171'
    },
    {
        id: 'specialist_ombre',
        title: 'Spectre de Stase',
        desc: 'Débloquer 3 compétences dans la voie de l\'Ombre.',
        icon: 'lucide:skull',
        condition: (data) => data.unlockedSkills.filter(s => s.includes('ombre') || s.startsWith('dex_')).length >= 3,
        color: '#818cf8'
    },
    {
        id: 'legend_level',
        title: 'Légende Émanante',
        desc: 'Atteindre 500 XP cumulés.',
        icon: 'lucide:trophy',
        condition: (data) => data.xp >= 500,
        color: '#eab308'
    }
];
