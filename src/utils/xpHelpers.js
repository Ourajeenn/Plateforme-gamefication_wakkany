// src/utils/xpHelpers.js
import { BRANCHES } from '../data/branches';

export const getDominantBranch = (unlockedSkills = []) => {
  if (unlockedSkills.length === 0) return null;

  const counts = {
    heroes: 0,
    warriors: 0,
    dinos: 0,
    cars: 0
  };

  unlockedSkills.forEach(skillId => {
    Object.keys(BRANCHES).forEach(branchId => {
      if (BRANCHES[branchId].nodes.some(node => node.id === skillId)) {
        counts[branchId]++;
      }
    });
  });

  // Find branch with maximum skills
  let dominant = null;
  let max = 0;

  Object.keys(counts).forEach(key => {
    if (counts[key] > max) {
      max = counts[key];
      dominant = key;
    }
  });

  return dominant;
};

export const getXpProgress = (xp) => {
  const currentLevel = [...Object.values(LEVELS || {})].reverse().find(l => xp >= l.xp) || { xp: 0, level: 0 };
  const nextLevel = (LEVELS || [])[currentLevel.level + 1];
  
  if (!nextLevel) return 100;
  
  const range = nextLevel.xp - currentLevel.xp;
  const progress = xp - currentLevel.xp;
  
  return (progress / range) * 100;
};
