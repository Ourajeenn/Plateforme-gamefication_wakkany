// --- Hexagonal Skill Tree Data ---

export const SKILL_NODES = [
    // Center
    { id: 'core', label: 'CORE', tier: 0, angle: 0, category: 'core', xpCost: 0, icon: '✦' },

    // Inner ring (6 nodes at 60° increments)
    { id: 'sustain_1', label: 'Vitalité', tier: 1, angle: 90, category: 'sustain', xpCost: 50, req: ['core'] },
    { id: 'burst_1', label: 'Surcharge', tier: 1, angle: 210, category: 'burst', xpCost: 50, req: ['core'] },
    { id: 'control_1', label: 'Stase', tier: 1, angle: 330, category: 'control', xpCost: 50, req: ['core'] },
    { id: 'sus_2', label: 'Égide', tier: 1, angle: 30, category: 'sustain', xpCost: 60, req: ['core'] },
    { id: 'burst_2', label: 'Nova', tier: 1, angle: 150, category: 'burst', xpCost: 60, req: ['core'] },
    { id: 'ctrl_2', label: 'Entraves', tier: 1, angle: 270, category: 'control', xpCost: 60, req: ['core'] },

    // Mid ring
    { id: 'sus_ring2_1', label: 'Volonté de Fer', tier: 2, angle: 90, category: 'sustain', xpCost: 100, req: ['sustain_1'] },
    { id: 'sus_ring2_2', label: 'Rempart', tier: 2, angle: 60, category: 'sustain', xpCost: 100, req: ['sus_2'] },
    { id: 'sus_ring2_3', label: 'Renouveau', tier: 2, angle: 120, category: 'sustain', xpCost: 100, req: ['sustain_1'] },
    { id: 'burst_ring2_1', label: 'Détonation', tier: 2, angle: 210, category: 'burst', xpCost: 100, req: ['burst_1'] },
    { id: 'burst_ring2_2', label: 'Brasier', tier: 2, angle: 180, category: 'burst', xpCost: 100, req: ['burst_2'] },
    { id: 'burst_ring2_3', label: 'Tempête', tier: 2, angle: 240, category: 'burst', xpCost: 100, req: ['burst_1'] },
    { id: 'ctrl_ring2_1', label: 'Enchevêtrement', tier: 2, angle: 330, category: 'control', xpCost: 100, req: ['control_1'] },
    { id: 'ctrl_ring2_2', label: 'Domination', tier: 2, angle: 300, category: 'control', xpCost: 100, req: ['ctrl_2'] },
    { id: 'ctrl_ring2_3', label: 'Paralysie', tier: 2, angle: 0, category: 'control', xpCost: 100, req: ['control_1'] },

    // Outer specialization nodes (3 major specs)
    { id: 'spec_duelist', label: 'DUÉLLISTE', tier: 3, angle: 150, category: 'spec', xpCost: 200, req: ['burst_ring2_2', 'burst_ring2_1'], isSpec: true },
    { id: 'spec_saboteur', label: 'SABOTEUR', tier: 3, angle: 30, category: 'spec', xpCost: 200, req: ['sus_ring2_2', 'ctrl_ring2_2'], isSpec: true },
    { id: 'spec_veilranger', label: 'RÔDEUR', tier: 3, angle: 270, category: 'spec', xpCost: 200, req: ['ctrl_ring2_1', 'burst_ring2_3'], isSpec: true },
];

export const CATEGORY_COLORS = {
    core: { main: '#c28e3a', glow: '#c28e3a80', text: '#ffd080' },
    sustain: { main: '#4ade80', glow: '#4ade8060', text: '#86efac' },
    burst: { main: '#f87171', glow: '#f8717160', text: '#fca5a5' },
    control: { main: '#818cf8', glow: '#818cf860', text: '#a5b4fc' },
    spec: { main: '#e879f9', glow: '#e879f960', text: '#f0abfc' },
};

export const CATEGORY_LABELS = {
    sustain: 'RÉSISTANCE',
    burst: 'EXPLOSIVITÉ',
    control: 'CONTRÔLE',
};

// Simplified map mimicking the old format for Avatar compatibility
export const BRANCHES = {
    core: { id: 'core', label: 'CŒUR', color: '#c28e3a', icon: 'lucide:triangle' },
    sustain: { id: 'sustain', label: 'RÉSISTANCE', color: '#4ade80', icon: 'lucide:shield-check' },
    burst: { id: 'burst', label: 'EXPLOSIVITÉ', color: '#f87171', icon: 'lucide:flame' },
    control: { id: 'control', label: 'CONTRÔLE', color: '#818cf8', icon: 'lucide:magnet' },
    spec: { id: 'spec', label: 'SPÉCIALITÉ', color: '#e879f9', icon: 'lucide:star' },
};
