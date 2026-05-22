// src/data/branches.js
export const BRANCHES = {
  heroes: {
    id: "heroes",
    label: "CLAN DES HÉROS",
    color: "#ff5a1f", // orange/red
    icon: "🦸‍♂️",
    nodes: [
      { id: "root", name: "NEXUS", xp: 0, tier: 0, req: [], desc: "Point de départ de votre cursus de talents Wakkany.", x: 5, y: 50, isRoot: true },
      { id: "ecca", name: "GENE-X", xp: 25, tier: 1, req: ["root"], desc: "L'éveil d'un potentiel cosmique latent.", x: 20, y: 20, label: "ÉVEIL" },
      { id: "gitlab", name: "STELLA", xp: 50, tier: 2, req: ["ecca"], desc: "Défier la gravité et traverser l'espace.", x: 38, y: 12, label: "COSMOS" },
      { id: "rhcsa", name: "FLASH", xp: 50, tier: 2, req: ["ecca"], desc: "Réflexes surhumains et vitesse de l'éclair.", x: 38, y: 28, label: "VITESSE" },
      { id: "rhce", name: "AVGER", xp: 75, tier: 3, req: ["rhcsa"], desc: "Technologie de pointe à la Iron Man.", x: 55, y: 28, label: "TECH" },
      { id: "h5a", name: "PHONX", xp: 120, tier: 4, req: ["rhce"], desc: "Pouvoir d'annihilation cosmique et de résurrection.", x: 70, y: 14, label: "PHÉNIX" },
      { id: "h5b", name: "AVTAR", xp: 130, tier: 4, req: ["rhce"], desc: "Fusionner avec la matière noire et l'énergie stellaire.", x: 70, y: 26, label: "AVATAR" },
      { id: "h6", name: "KRYPT", xp: 180, tier: 6, req: ["h5a", "h5b"], desc: "L'invulnérabilité solaire absolue et la force suprême de gravité.", x: 79, y: 18, label: "DIVIN" },
      { id: "sb_hero", name: "SERAP", xp: 220, tier: 7, req: ["h6"], desc: "Séraphin Cosmique - Gardien céleste des portes stellaires.", x: 88, y: 8, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "sb_hero_2", name: "AEGIS", xp: 220, tier: 7, req: ["h6"], desc: "Aegis Stellaire - Bouclier impénétrable de la légion.", x: 88, y: 28, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "sb_hero_3", name: "VALOR", xp: 220, tier: 7, req: ["h6"], desc: "Vaillance Pure - L'épée de lumière qui pourfend les ombres.", x: 96, y: 18, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "boss_hero", name: "SOLARIS", xp: 350, tier: 8, req: ["sb_hero", "sb_hero_2", "sb_hero_3"], desc: "Solaris - Le Soleil Absolu. Purifie tout sur son passage.", x: 106, y: 18, label: "BOSS SUPRÊME", isBoss: true, isSpecialColor: "#ef4444" }
    ]
  },
  warriors: {
    id: "warriors",
    label: "CLAN DES GUERRIERS",
    color: "#c28e3a", // imperial gold
    icon: "⚔️",
    nodes: [
      { id: "ejpt", name: "SPART", xp: 25, tier: 1, req: ["root"], desc: "Discipline de fer et formation rigoureuse.", x: 20, y: 50, label: "DISCIPLINE" },
      { id: "ecppt", name: "KRATS", xp: 50, tier: 2, req: ["ejpt"], desc: "Force dévastatrice et puissance brute de colère.", x: 35, y: 50, label: "RAGE" },
      { id: "ewpt", name: "THOR", xp: 75, tier: 3, req: ["ecppt"], desc: "Manipulation de la foudre asgardienne.", x: 42, y: 62, label: "FOUDRE", isSpecialColor: "#ffcc00" },
      { id: "adrts", name: "ACHIL", xp: 75, tier: 3, req: ["ecppt"], desc: "Précision mortelle et quasi-invulnérabilité.", x: 48, y: 38, label: "LAME" },
      { id: "crtp", name: "WAR", xp: 100, tier: 4, req: ["adrts"], desc: "L'incarnation légendaire du carnage au combat.", x: 62, y: 38, label: "DIEU" },
      { id: "oswp", name: "VALKY", xp: 80, tier: 4, req: ["adrts"], desc: "Vol des guerrières divines guidant les âmes.", x: 55, y: 48, label: "DIVIN", isSpecialColor: "#ffcc00" },
      { id: "cpts", name: "TITAN", xp: 100, tier: 4, req: ["adrts"], desc: "Force colossale qui ébranle les sols de Wakkany.", x: 50, y: 58, label: "TITAN" },
      { id: "emap", name: "MYTH", xp: 80, tier: 4, req: ["adrts"], desc: "Récits héroïques et gloire impériale immortelle.", x: 50, y: 46, label: "GLOIRE", isSpecialColor: "#ffcc00" },
      { id: "rscp", name: "GLORY", xp: 120, tier: 5, req: ["cpts"], desc: "Un nom qui résonnera dans l'éternité du Valhalla.", x: 62, y: 62, label: "ÉTERNEL" },
      { id: "crte", name: "ODIN", xp: 125, tier: 5, req: ["crtp"], desc: "Sagesse suprême et contrôle absolu des runes.", x: 72, y: 32, label: "SAGESSE" },
      { id: "crtm", name: "VALHA", xp: 150, tier: 6, req: ["crte"], desc: "Le paradis éternel des plus braves combattants.", x: 79, y: 38, label: "PARADIS" },
      { id: "oscp", name: "APEX", xp: 130, tier: 5, req: ["crtp"], desc: "Le sommet absolu de la chaîne alimentaire.", x: 72, y: 46, label: "APEX" },
      { id: "oslf", name: "KROWN", xp: 150, tier: 6, req: ["oscp"], desc: "Souveraineté suprême et couronne d'or sur les clans.", x: 79, y: 50, label: "EMPEREUR" },
      { id: "oswe", name: "AURA", xp: 140, tier: 5, req: ["crtp"], desc: "Énergie mystique protégeant l'esprit des guerriers.", x: 72, y: 60, label: "AURA" },
      { id: "osce", name: "DIVIN", xp: 180, tier: 6, req: ["oswe"], desc: "Énergie pure tirée du soleil doré de Wakkany.", x: 79, y: 62, label: "DIVIN" },
      { id: "sb_warrior", name: "FENRIR", xp: 220, tier: 7, req: ["crtm"], desc: "Loup Fenrir - La bête mythologique enchaînée.", x: 88, y: 38, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "sb_warrior_2", name: "DRAUG", xp: 220, tier: 7, req: ["osce"], desc: "Seigneur Draugr - Combattant immortel des cryptes glacées.", x: 88, y: 62, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "sb_warrior_3", name: "BERSK", xp: 220, tier: 7, req: ["oslf"], desc: "Berserker Primordial - L'incarnation de la rage destructrice.", x: 96, y: 50, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "final_boss", name: "ARTÉLYON", xp: 350, tier: 8, req: ["sb_warrior", "sb_warrior_2", "sb_warrior_3"], desc: "Artélyon Primordial - Le Seigneur Suprême des Guerriers.", x: 106, y: 50, label: "BOSS SUPRÊME", isBoss: true, isSpecialColor: "#ef4444" }
    ]
  },
  primitives: {
    id: "primitives",
    label: "CLAN DES PRIMITIFS",
    color: "#34c759", // green
    icon: "🦖",
    nodes: [
      { id: "ejca", name: "JURAS", xp: 25, tier: 1, req: ["root"], desc: "Retour à l'état sauvage originel et instinct animal.", x: 20, y: 80, label: "SAUVAGE" },
      { id: "cdsa", name: "SCALE", xp: 60, tier: 2, req: ["ejca"], desc: "Armure naturelle impénétrable inspirée du Stégosaure.", x: 35, y: 80, label: "BLINDAGE" },
      { id: "d3a", name: "CROC", xp: 75, tier: 3, req: ["cdsa"], desc: "Morsures critiques perforant l'armure la plus dense.", x: 48, y: 74, label: "CROC" },
      { id: "d3b", name: "AGIL", xp: 75, tier: 3, req: ["cdsa"], desc: "Vitesse de déplacement accrue et esquives réflexes.", x: 48, y: 86, label: "AGILITÉ" },
      { id: "d4a", name: "APEX", xp: 100, tier: 4, req: ["d3a"], desc: "Domination territoriale absolue sur tous les prédateurs.", x: 62, y: 74, label: "APEX" },
      { id: "d4b", name: "TITAN", xp: 100, tier: 4, req: ["d3b"], desc: "Secousse sismique colossale capable d'ébranler le sol.", x: 62, y: 86, label: "SÉISME" },
      { id: "d5a", name: "KAIJU", xp: 130, tier: 5, req: ["d4a"], desc: "Libération d'un souffle d'énergie atomique pure.", x: 72, y: 74, label: "SOUFFLE" },
      { id: "d5b", name: "REGEN", xp: 140, tier: 5, req: ["d4b"], desc: "Soigner instantanément les blessures graves en combat.", x: 72, y: 86, label: "VITALITÉ" },
      { id: "d6", name: "BEAST", xp: 180, tier: 6, req: ["d5a", "d5b"], desc: "L'harmonisation spirituelle parfaite avec les monstres géants.", x: 79, y: 82, label: "MAÎTRE" },
      { id: "sb_primitive", name: "CHIMER", xp: 220, tier: 7, req: ["d6"], desc: "Chimère Primal - Fusion génétique des prédateurs.", x: 88, y: 72, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "sb_prim_2", name: "MAMUT", xp: 220, tier: 7, req: ["d6"], desc: "Mammouth de Glace - Béhémoth au pelage de givre éternel.", x: 88, y: 92, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "sb_prim_3", name: "RAPTR", xp: 220, tier: 7, req: ["d6"], desc: "Raptor Alpha - L'intelligence meurtrière et la vitesse pure.", x: 96, y: 82, label: "SEMI-BOSS", isSemiBoss: true },
      { id: "boss_primitive", name: "GOLIATH", xp: 350, tier: 8, req: ["sb_primitive", "sb_prim_2", "sb_prim_3"], desc: "Goliath - Le Titan Terrestre Invaincu. La force primitive à l'état brut.", x: 106, y: 82, label: "BOSS SUPRÊME", isBoss: true, isSpecialColor: "#ef4444" }
    ]
  }
};
