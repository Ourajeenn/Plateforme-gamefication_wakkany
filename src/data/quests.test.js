import { describe, it, expect } from 'vitest';
import { QUESTS } from './quests';
import { BRANCHES } from './branches';

// Tous les nœuds de l'arbre, toutes branches confondues
const allNodes = Object.values(BRANCHES).flatMap((b) => b.nodes);
const nodeIds = new Set(allNodes.map((n) => n.id));

describe('quêtes et arbre de talents', () => {
  it('chaque quête pointe vers un nœud existant (ou vers rien, ou vers ultimate)', () => {
    const broken = QUESTS
      .filter((q) => q.nodeReq && q.nodeReq !== 'ultimate' && !nodeIds.has(q.nodeReq))
      .map((q) => `${q.id} -> ${q.nodeReq}`);
    expect(broken).toEqual([]);
  });

  it('la quête ultimate dispose d\'au moins 2 nœuds marqués ultimate', () => {
    const ultimates = allNodes.filter((n) => n.ultimate);
    expect(ultimates.length).toBeGreaterThanOrEqual(2);
  });

  it('chaque nœud référencé dans req existe', () => {
    const missing = allNodes.flatMap((n) => n.req.filter((r) => !nodeIds.has(r)).map((r) => `${n.id} -> ${r}`));
    expect(missing).toEqual([]);
  });
});
