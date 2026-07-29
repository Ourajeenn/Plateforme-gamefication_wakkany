# 🐺 wakkany — Plan d'Amélioration Complet

> Document de référence pour l'upgrade du projet `Avatar-volutif-Progression-visuelle-selon-comp`
> Version : 2.0 | Statut : À implémenter

---

## 📋 TABLE DES MATIÈRES

1. [Branches de Niveau](#1--branches-de-niveau)
2. [Classement Global](#2--classement-global-entre-utilisateurs)
3. [Arbre de Compétences](#3--arbre-de-compétences-style-jeu-vidéo)
4. [Avatar Évolutif](#4--avatar-évolutif)
5. [Système de Quêtes & Énigmes](#5--système-de-quêtes--énigmes)
6. [Liste des Fichiers à Créer / Modifier](#6--liste-des-fichiers-à-créercréer)
7. [Étapes d'Implémentation](#7--étapes-dimplémentation)
8. [Stack Technique](#8--stack-technique)

---

## 1. 🌿 Branches de Niveau

### Concept
Remplacer la progression linéaire (Novice → Champion) par un **arbre ramifié** où le joueur fait des choix qui définissent son archétype.

### Structure des branches

```
Niveau 0 (Départ)
       │
   [Nœud de base]
       │
  ┌────┴────┐
  │         │
[Branche A] [Branche B]
  │         │
┌─┴─┐     ┌─┴─┐
[A1][A2]  [B1][B2]
  │           │
[ULTIMATE A] [ULTIMATE B]
```

### Les 3 voies à implémenter

| Voie | Couleur | Thème | Nœuds |
|------|---------|-------|-------|
| **FORCE** | `#e55c2f` | Combat au corps-à-corps | Frappe → Endurance → Furie / Bouclier → Titan / Bastion |
| **ARCANE** | `#4a9eff` | Magie & Mystique | Étincelle → Concentration → Invocation / Transmutation → Archmage / Alchimiste |
| **OMBRE** | `#b44fff` | Discrétion & Chaos | Discrétion → Piège → Assassinat / Évasion → Fantôme / Ombre Éternelle |

### Règles de déblocage
- [ ] Chaque nœud coûte des **XP** (25 / 50 / 75 / 100 XP par tier)
- [ ] Un nœud ne peut être débloqué que si son **prérequis est acquis**
- [ ] Les **Ultimates** (tier 4) nécessitent leur nœud tier 3 correspondant
- [ ] Le joueur peut investir dans **plusieurs branches** mais pas atteindre plusieurs Ultimates

### Fichiers à modifier
- `src/components/ChampionPath.jsx` → remplacer `LEVEL_DATA` par le système de branches
- `src/data/branches.js` → **NOUVEAU** fichier de configuration

---

## 2. 🏆 Classement Global entre Utilisateurs

### Concept
Un leaderboard partagé en **temps réel** visible par tous les joueurs, classés par XP total et compétences débloquées.

### Vues du classement

#### Vue "Champions" (individuelle)
```
01 🥇 SlayerX      ········· FORCE  ·  2450 XP  ·  Lvl 12
02 🥈 CloudGhost   ········· ARCANE ·  2200 XP  ·  Lvl 11
03 🥉 CodeNinja    ········· OMBRE  ·  2100 XP  ·  Lvl 10
── TOI ──────────────────────────────────────────────────
07    TonNom       ········· FORCE  ·   850 XP  ·  Lvl  5
```

#### Vue "Académies" (équipe/école)
```
1. Tech Academy  ████████████░░  15 400 PTS
2. MIT           ████████████░░  14 200 PTS
3. Polytechnique ███████████░░░  12 800 PTS
```

#### Vue "Branches" (par voie)
```
FORCE  ──────────────── 48 joueurs · avg 1200 XP
ARCANE ──────────────── 35 joueurs · avg 980 XP
OMBRE  ──────────────── 29 joueurs · avg 1100 XP
```

### Données à stocker par joueur
```json
{
  "name": "string",
  "xp": "number",
  "level": "number",
  "skills": ["array of node ids"],
  "dominant_branch": "force | arcane | ombre",
  "quests_completed": "number",
  "school": "string",
  "updated_at": "timestamp"
}
```

### Implémentation avec `window.storage` (shared)
- [ ] Sauvegarder les scores avec `shared: true`
- [ ] Clé de stockage : `score:{username_normalized}`
- [ ] Rafraîchissement automatique toutes les 30 secondes
- [ ] Bouton manuel "↺ Actualiser"
- [ ] Mise en évidence du joueur courant dans la liste

### Fichiers à modifier / créer
- `src/components/Leaderboard.jsx` → refactoriser complètement
- `src/hooks/useLeaderboard.js` → **NOUVEAU** hook

---

## 3. 🌳 Arbre de Compétences — Style Jeu Vidéo

### Concept visuel
Un arbre interactif dessiné en SVG ou CSS Grid, avec connexions visuelles entre les nœuds, animations au survol, et états visuels distincts (locked / available / unlocked).

### États des nœuds

| État | Apparence | Condition |
|------|-----------|-----------|
| 🔒 **Locked** | Grisé, cadenas, opacité 40% | Prérequis non remplis |
| 🔓 **Available** | Bordure colorée pulsante | XP suffisant + prérequis OK |
| ✅ **Unlocked** | Plein, brillant, glow coloré | Débloqué par le joueur |
| ⭐ **Ultimate** | Badge doré + animation spéciale | Nœud de fin de branche |

### Composants à créer

```
SkillTree/
├── SkillTreeContainer.jsx    ← Conteneur global + layout
├── BranchColumn.jsx          ← Colonne par branche (FORCE / ARCANE / OMBRE)
├── SkillNode.jsx             ← Nœud individuel (cercle + icône + nom + coût)
├── SkillConnector.jsx        ← Ligne de connexion entre nœuds
└── SkillTooltip.jsx          ← Tooltip au hover avec description + prérequis
```

### Interactions attendues
- [ ] **Hover** → Tooltip avec description, coût XP, prérequis
- [ ] **Click disponible** → Modale de confirmation "Dépenser X XP ?"
- [ ] **Click locked** → Message "Prérequis: [Nom du nœud]"
- [ ] **Animation déblocage** → Particules + son + flash de lumière
- [ ] **Connexions** → La ligne entre nœuds change de couleur quand les deux sont débloqués

### Données de configuration
```js
// src/data/branches.js
export const BRANCHES = {
  force: {
    id: "force",
    label: "FORCE",
    color: "#e55c2f",
    icon: "⚔️",
    nodes: [
      { id: "f1", name: "Frappe Brute",   xp: 25,  tier: 0, req: [] },
      { id: "f2", name: "Endurance",       xp: 50,  tier: 1, req: ["f1"] },
      { id: "f3a", name: "Furie",          xp: 75,  tier: 2, req: ["f2"], branch: "A" },
      { id: "f3b", name: "Bouclier",       xp: 75,  tier: 2, req: ["f2"], branch: "B" },
      { id: "f4a", name: "TITAN",          xp: 100, tier: 3, req: ["f3a"], ultimate: true },
      { id: "f4b", name: "BASTION",        xp: 100, tier: 3, req: ["f3b"], ultimate: true },
    ]
  },
  // arcane, ombre...
}
```

---

## 4. 🧬 Avatar Évolutif

### Concept
L'avatar change **visuellement** selon les compétences acquises et le niveau atteint. Dessiné en SVG généré dynamiquement, pas d'images externes nécessaires.

### Niveaux de transformation

| Niveau | Nom | XP requis | Apparence |
|--------|-----|-----------|-----------|
| 0 | Novice | 0 | Corps simple, équipement basique, yeux blancs |
| 1 | Chasseur | 100 | Armure légère, arme visible |
| 2 | Vétéran | 250 | Casque, épaules renforcées, yeux colorés selon branche |
| 3 | Champion | 450 | Armure complète, effets visuels, aura légère |
| 4 | LÉGENDE | 700 | Couronne, aura pulsante, effets de particules |

### Variations par branche dominante

| Branche | Couleur yeux | Effet | Arme |
|---------|-------------|-------|------|
| **FORCE** | Rouge-orangé | Flammes aux poings | Épée/Hache |
| **ARCANE** | Bleu électrique | Anneaux runiques orbitaux | Bâton à orbe |
| **OMBRE** | Violet profond | Fumée noire aux pieds | Dague double |
| *Neutre* | Doré | Aucun | Aucune |

### Composant SVG

```jsx
// src/components/Avatar.jsx
function Avatar({ xp, unlockedSkills, username }) {
  const level = getLevel(xp)
  const dominant = getDominantBranch(unlockedSkills)

  return (
    <svg viewBox="0 0 180 180">
      {/* Corps de base — toujours présent */}
      <BaseBody level={level} />

      {/* Armure — niveau 1+ */}
      {level >= 1 && <Armor level={level} branchColor={BRANCHES[dominant]?.color} />}

      {/* Effets de branche — selon dominant */}
      {dominant === "force" && <FireEffect skillCount={unlockedSkills.length} />}
      {dominant === "arcane" && <ArcaneRings skillCount={unlockedSkills.length} />}
      {dominant === "ombre" && <ShadowSmoke skillCount={unlockedSkills.length} />}

      {/* Couronne — niveau 4 uniquement */}
      {level >= 4 && <Crown color={GOLD} />}

      {/* Badge niveau */}
      <LevelBadge level={level} />
    </svg>
  )
}
```

### Fichiers à créer
- `src/components/Avatar.jsx` → **NOUVEAU** composant SVG complet
- `src/components/avatar/BaseBody.jsx` → Corps + tête
- `src/components/avatar/AvatarEffects.jsx` → Effets visuels par branche

---

## 5. 📜 Système de Quêtes & Énigmes

### Concept
Les quêtes ne sont plus de simples checkboxes : chacune contient une **énigme générée par l'IA Claude** que le joueur doit résoudre pour obtenir l'XP. Les quêtes sont **conditionnées par les compétences** débloquées.

### Structure d'une quête

```js
{
  id: "q1",
  title: "Épreuve du Débutant",
  lore: "Le forge-maître t'observe. Prouve ta valeur.",
  branch: "force",           // Quelle branche est concernée
  nodeReq: null,             // Compétence requise (null = aucune)
  difficulty: "Facile",      // Facile / Moyen / Difficile / Expert / Légendaire
  xpReward: 30,              // XP accordé si réussi
  riddleTheme: "force et combat" // Contexte envoyé à l'IA pour générer l'énigme
}
```

### Liste complète des quêtes

| # | Titre | Branche | Prérequis | Difficulté | XP |
|---|-------|---------|-----------|------------|-----|
| 1 | Épreuve du Débutant | Force | Aucun | Facile | 30 |
| 2 | Le Grimoire Perdu | Arcane | Aucun | Facile | 30 |
| 3 | L'Ombre du Passé | Ombre | Aucun | Moyen | 40 |
| 4 | Duel des Champions | Force | `f2 Endurance` | Difficile | 60 |
| 5 | Rituel des Anciens | Arcane | `a2 Concentration` | Difficile | 60 |
| 6 | Contrat du Fantôme | Ombre | `o2 Piège` | Expert | 75 |
| 7 | La Forge Maudite | Force | `f3a Furie` | Expert | 80 |
| 8 | Portail des Étoiles | Arcane | `a3a Invocation` | Expert | 80 |
| 9 | Danse de la Mort | Ombre | `o3a Assassinat` | Expert | 80 |
| 10 | Épreuve Légendaire | Toutes | 2 Ultimates requis | Légendaire | 150 |

### Flux d'une quête

```
[Joueur clique "Lancer"]
         │
         ▼
[Vérification des prérequis]
    Prérequis OK ?
   /           \
 NON           OUI
  │             │
[Message       ▼
 erreur]  [Appel API Claude]
           Génère l'énigme
               │
               ▼
         [Modale affichée]
    ┌─────────────────────┐
    │  ❓ L'énigme...      │
    │  [Input réponse]    │
    │  [Bouton Valider]   │
    └─────────────────────┘
               │
        Réponse correcte ?
       /                \
     NON                OUI
      │                  │
  Tentative + 1     +XP accordé
  Attempts >= 2 →   Quête marquée
  Afficher hint     "Complétée"
```

### Appel API Claude (prompt type)

```js
const prompt = `Tu es un maître des énigmes dans le jeu Wakkany.
Génère une énigme pour: "${quest.title}" (thème: ${quest.riddleTheme}, difficulté: ${quest.difficulty}).

Réponds UNIQUEMENT en JSON valide:
{
  "question": "L'énigme complète en 2-3 phrases mystérieuses",
  "answer": "La réponse en un mot ou courte phrase",
  "hint": "Un indice si le joueur échoue 2 fois"
}`
```

### Composants à créer

```
src/components/quests/
├── QuestPanel.jsx       ← Liste de toutes les quêtes avec états
├── QuestCard.jsx        ← Carte individuelle d'une quête
├── RiddleModal.jsx      ← Modale avec l'énigme générée par IA
└── QuestReward.jsx      ← Animation de récompense XP
```

---

## 6. 📁 Liste des Fichiers à Créer / Modifier

### Fichiers NOUVEAUX à créer

```
src/
├── data/
│   ├── branches.js              ← Config des 3 branches + nœuds
│   ├── quests.js                ← Liste des 10 quêtes
│   └── levels.js                ← Seuils XP + noms des niveaux
│
├── components/
│   ├── Avatar.jsx               ← Avatar SVG évolutif
│   ├── SkillTree.jsx            ← Arbre de compétences visuel
│   ├── quests/
│   │   ├── QuestPanel.jsx
│   │   ├── QuestCard.jsx
│   │   └── RiddleModal.jsx
│   └── leaderboard/
│       ├── Leaderboard.jsx      ← Refactorisé
│       └── ScoreRow.jsx
│
├── hooks/
│   ├── usePlayerData.js         ← Gestion XP / skills / quests locaux
│   ├── useLeaderboard.js        ← Fetch + save scores partagés
│   └── useRiddle.js             ← Appel API Claude + état énigme
│
└── utils/
    ├── xpHelpers.js             ← getLevel(), getXpToNextLevel()...
    └── storageHelpers.js        ← Wrappers window.storage
```

### Fichiers EXISTANTS à modifier

```
src/
├── App.jsx                      ← Ajouter la navigation entre onglets
├── components/
│   ├── ChampionPath.jsx         ← Remplacer par SkillTree + Avatar
│   ├── Leaderboard.jsx          ← Refactoriser complètement
│   └── ProfileSetup.jsx         ← Ajouter champ "École/Académie"
└── index.css                    ← Nouvelles animations CSS
```

---

## 7. 🚀 Étapes d'Implémentation

### Phase 1 — Foundation (Données & Structure)

- [ ] **1.1** Créer `src/data/branches.js` avec les 3 branches complètes
- [ ] **1.2** Créer `src/data/quests.js` avec les 10 quêtes
- [ ] **1.3** Créer `src/data/levels.js` avec seuils et noms
- [ ] **1.4** Créer `src/utils/xpHelpers.js` (getLevel, getXpToNextLevel, getDominantBranch)
- [ ] **1.5** Créer `src/utils/storageHelpers.js` (wrappers async/try-catch)
- [ ] **1.6** Mettre à jour `ProfileSetup.jsx` pour ajouter le champ "École"

### Phase 2 — Avatar Évolutif

- [ ] **2.1** Créer le composant `Avatar.jsx` avec SVG de base
- [ ] **2.2** Implémenter les 5 niveaux de transformation visuelle
- [ ] **2.3** Ajouter les effets par branche (flammes / runes / fumée)
- [ ] **2.4** Intégrer l'avatar dans `ChampionPath.jsx` (remplacer les images)
- [ ] **2.5** Tester l'évolution à chaque seuil XP

### Phase 3 — Arbre de Compétences

- [ ] **3.1** Créer `SkillTree.jsx` avec layout en colonnes
- [ ] **3.2** Créer `SkillNode.jsx` (états: locked / available / unlocked / ultimate)
- [ ] **3.3** Créer les connecteurs SVG entre nœuds
- [ ] **3.4** Implémenter la logique de déblocage (XP + prérequis)
- [ ] **3.5** Ajouter la modale de confirmation de dépense XP
- [ ] **3.6** Ajouter les tooltips au hover
- [ ] **3.7** Ajouter les animations de déblocage (particules + flash)

### Phase 4 — Système de Quêtes & Énigmes

- [ ] **4.1** Créer `QuestPanel.jsx` avec liste des quêtes et états
- [ ] **4.2** Créer `QuestCard.jsx` avec indicateurs de prérequis
- [ ] **4.3** Créer `RiddleModal.jsx` avec état loading / énigme / succès / échec
- [ ] **4.4** Créer `useRiddle.js` — appel API Claude + parsing JSON
- [ ] **4.5** Implémenter la logique d'essais (max 3 tentatives + hint)
- [ ] **4.6** Implémenter la récompense XP + animation
- [ ] **4.7** Implémenter la persistance des quêtes complétées (`window.storage`)

### Phase 5 — Classement Global

- [ ] **5.1** Créer `useLeaderboard.js` (fetch scores partagés)
- [ ] **5.2** Refactoriser `Leaderboard.jsx` — Vue "Champions"
- [ ] **5.3** Ajouter la vue "Académies" (regroupement par école)
- [ ] **5.4** Ajouter la vue "Branches" (stats par voie)
- [ ] **5.5** Implémenter la sauvegarde du score courant (shared storage)
- [ ] **5.6** Surligner le joueur courant dans la liste
- [ ] **5.7** Rafraîchissement automatique toutes les 30s

### Phase 6 — Navigation & Intégration

- [ ] **6.1** Refactoriser `App.jsx` — système d'onglets (Profil / Arbre / Quêtes / Classement)
- [ ] **6.2** Intégrer le hook `usePlayerData.js` dans App pour état global
- [ ] **6.3** Connecter les notifications XP (levelup, skill unlock, quest complete)
- [ ] **6.4** Tests de bout en bout des flux complets
- [ ] **6.5** Optimisations CSS et animations finales

---

## 8. 🛠️ Stack Technique

### Dépendances existantes
- React 18 + Vite
- TailwindCSS
- Iconify

### Nouvelles dépendances nécessaires
```bash
# Aucune nouvelle dépendance requise !
# Tout peut être fait avec React + SVG + CSS natif + API fetch
```

### API externe utilisée
```
POST https://api.anthropic.com/v1/messages
Model: claude-sonnet-4-20250514
Usage: Génération dynamique des énigmes de quêtes
```

### Stockage
```
window.storage (claude.ai artifact storage)
├── Clés personnelles (shared: false)
│   └── player:{username} → { xp, skills[], quests[] }
└── Clés partagées (shared: true)
    └── score:{username} → { name, xp, level, dominant, school, updatedAt }
```

### Variables CSS suggérées
```css
:root {
  --color-gold:   #c28e3a;
  --color-force:  #e55c2f;
  --color-arcane: #4a9eff;
  --color-ombre:  #b44fff;
  --color-dark:   #0d0d0f;
  --color-card:   #111115;
  --color-border: #1a1a22;
}
```

---

## 📊 Résumé des Priorités

| Priorité | Fonctionnalité | Complexité | Impact |
|----------|---------------|------------|--------|
| 🔴 P0 | Branches de niveau (data) | Faible | Très élevé |
| 🔴 P0 | Arbre de compétences visuel | Élevée | Très élevé |
| 🟠 P1 | Avatar évolutif SVG | Élevée | Élevé |
| 🟠 P1 | Quêtes + Énigmes IA | Élevée | Très élevé |
| 🟡 P2 | Classement global | Moyenne | Élevé |
| 🟡 P2 | Navigation par onglets | Faible | Moyen |
| 🟢 P3 | Vues avancées classement | Moyenne | Moyen |
| 🟢 P3 | Animations & polish | Variable | Moyen |

---

*Document généré pour le projet Wakkany — Champion's Path*
*Dernière mise à jour : 2026*
