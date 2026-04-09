import { BRANCHES } from '../data/branches';

export const getDominantBranch = (unlockedSkillIds) => {
    if (!unlockedSkillIds || unlockedSkillIds.length === 0) return null;

    const counts = { sustain: 0, burst: 0, control: 0 };

    unlockedSkillIds.forEach(id => {
        if (id.startsWith('sus')) counts.sustain++;
        if (id.startsWith('burst')) counts.burst++;
        if (id.startsWith('ctrl') || id.startsWith('control')) counts.control++;
    });

    const max = Math.max(counts.sustain, counts.burst, counts.control);
    if (max === 0) return null;

    return Object.keys(counts).find(key => counts[key] === max);
};

export const checkSkillReqs = (node, unlockedSkillIds) => {
    if (!node.req || node.req.length === 0) return true;
    return node.req.every(reqId => unlockedSkillIds.includes(reqId));
};
