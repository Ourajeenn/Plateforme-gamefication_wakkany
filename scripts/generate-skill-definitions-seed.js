// scripts/generate-skill-definitions-seed.js
//
// Génère un fichier SQL (supabase/migrations/<timestamp>_seed_skill_definitions.sql)
// à partir de src/data/branches.js, pour que la table skill_definitions
// (créée par 20260618000000_secure_profile_updates.sql) reflète exactement
// les coûts XP et prérequis définis côté front pour l'arbre de compétences.
//
// À relancer chaque fois que branches.js est modifié (nouveau nœud, coût
// changé, etc.) afin que la validation serveur (unlock_skill_secure) reste
// alignée avec ce qui s'affiche dans l'UI.
//
// Usage : node scripts/generate-skill-definitions-seed.js

import { BRANCHES } from '../src/data/branches.js';
import fs from 'fs/promises';
import path from 'path';

function sqlStringArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map((s) => `"${s.replace(/"/g, '\\"')}"`);
  return `'{${escaped.join(',')}}'`;
}

async function main() {
  const rows = [];

  for (const branch of Object.values(BRANCHES)) {
    for (const node of branch.nodes) {
      if (node.id === 'root') continue; // le noeud racine est toujours débloqué, pas besoin de définition
      rows.push(
        `  ('${node.id.replace(/'/g, "''")}', ${Number(node.xp) || 0}, ${sqlStringArray(node.req)})`
      );
    }
  }

  const sql = `-- Généré automatiquement par scripts/generate-skill-definitions-seed.js
-- à partir de src/data/branches.js — NE PAS éditer ce fichier à la main,
-- relancer le script après toute modification de branches.js.

INSERT INTO skill_definitions (skill_id, xp_cost, requires) VALUES
${rows.join(',\n')}
ON CONFLICT (skill_id) DO UPDATE
  SET xp_cost = EXCLUDED.xp_cost,
      requires = EXCLUDED.requires;
`;

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const outPath = path.resolve(
    process.cwd(),
    'supabase/migrations',
    `${timestamp}_seed_skill_definitions.sql`
  );

  await fs.writeFile(outPath, sql, 'utf-8');
  console.log(`✓ Migration générée : ${outPath} (${rows.length} compétences)`);
}

main().catch((err) => {
  console.error('Erreur de génération du seed skill_definitions :', err);
  process.exit(1);
});
