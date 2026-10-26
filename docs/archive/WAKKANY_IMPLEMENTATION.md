# 🎮 Wakkany Implementation Guide

## Overview

This document outlines the complete implementation of Wakkany V1-V3 features based on the product conception document.

---

## ✨ What Has Been Implemented

### V1 - Quiz Foundation ✅

#### 1. **Questions with Consequences** 📋
- **File**: `src/data/questionsWithConsequences.js`
- **Features**:
  - Questions that affect game state
  - Multiple answers with different impacts
  - Consequence system (resource gains, reputation changes, tech unlocks)
  - Memory system that recalls past decisions in future questions
  - Dynamic situation updates based on player choices

**Example**:
```javascript
// Question influences future situations
"You destroyed a forest at round 4. Now manage the consequences."
```

#### 2. **Game State Manager** 🌍
- **File**: `src/utils/gameStateManager.js`
- **Features**:
  - Tracks world state (prosperity, population, infrastructure)
  - Records player decisions and consequences
  - Memory system: "The world remembers"
  - XP/knowledge progression
  - World mood calculation (flourishing, stable, crisis, uncertain)
  - Game Master context generation

**Usage**:
```javascript
const manager = new GameStateManager('game1');
manager.recordDecision(questionId, answer, consequence);
const context = manager.generateGameMasterContext();
```

#### 3. **Bluff Mechanics** 🎭
- **File**: `src/data/bluffSystem.js`
- **Features**:
  - Setup scenarios with truth and false clues
  - Discussion phase (120 seconds)
  - Voting phase (30 seconds)
  - Truth revelation and scoring
  - AI bluff generation
  - Points: Impostor wins if not voted (+100), Honest players win if vote correctly (+50)

**Example**:
```javascript
const game = new BluffGameManager(players, scenario);
game.startDiscussion();
game.startVoting();
const results = game.revealTruth();
```

#### 4. **Secret Roles** 🎲
- **File**: `src/data/secretRoles.js`
- **Features**:
  - 6 secret roles: Archivist, Impostor, Guide, Explorer, Guardian, Trader
  - Each role has 3 unique objectives
  - Role progress tracking
  - Secret quest generation per role
  - XP rewards for completing role objectives

**Roles**:
- **Archiviste** (📚): Discover historical information
- **Imposteur** (🎭): Disrupt without being caught
- **Guide** (🧭): Help others secretly
- **Explorateur** (🔍): Discover maximum information
- **Gardien** (⚔️): Protect the group
- **Marchand** (🪙): Accumulate wealth

#### 5. **Resource Management** 💎
- **File**: `src/utils/resourceManager.js`
- **Resources**:
  - ❤️ Health (max 100, regen 5/round)
  - 🪙 Coins (max 1000)
  - ⭐ Reputation (max 100)
  - 🧠 Knowledge (max 500)
  - 🔮 Power (max 10)

**Powers** (Strategic abilities):
- 💡 Hint (1 power)
- ❌ Eliminate Answer (2 power)
- 🛡️ Protect Player (2 power)
- 👁️ Spy (3 power + 50 coins)
- 📈 Double Reward (1 power + 100 coins)
- ⚡ Challenge Player (2 power)
- 🔄 Modify Consequence (5 power)

#### 6. **Game Master AI** 🤖
- **File**: `src/utils/gameMasterAI.js`
- **Event Categories**:
  - 🌊 Natural Disasters (high severity)
  - 🤝 Diplomatic Events (medium)
  - 🔍 Mysteries (medium)
  - ⚔️ Conflicts (high)
  - ✨ Wondrous Events (low)

**Features**:
- Mood-based event generation (flourishing → diplomatic, crisis → disasters)
- Consequence application
- Narrative generation
- Decision evaluation
- Suggestions based on player decisions

---

### V2 - Persistent World ✅

#### 7. **Quest System** 📜
- **File**: `src/utils/questManager.js`
- **Two Quest Types**:

**Character Quests** (Personal missions):
- Archive Historian (300 XP)
- The Last Explorer (500 XP)
- Guardian of Light (350 XP)
- Progress tracking per objective
- Badge and skill rewards

**Community Quests** (Global objectives):
- Save the Crops (1000 agriculture questions)
- Restore Ancient Library (500 books)
- Defend the Realm (10-round defense)
- Season-based bonuses
- Territory unlocks

#### 8. **Territory System** 🏰
- **File**: `src/utils/territoryManager.js`
- **Features**:
  - Player kingdoms with custom names
  - 9 buildable structures:
    - 📚 Library (+20% XP)
    - 🔬 Laboratory (discovery chance)
    - 🛒 Market (+50% trading)
    - 🏛️ Temple (+30% reputation)
    - 🏰 Fortress (damage reduction)
    - 🌳 Garden (healing bonus)
    - 🧙 Tower (spell power)
    - ⚔️ Arena (combat bonus)
    - 🔭 Observatory (foresight bonus)

**Management**:
- Per-round production (coins, knowledge, etc.)
- Building upgrades (cost increases exponentially)
- Population happiness tracking
- Resource generation

---

### V3 - Creator Platform (Ready for Implementation) 🚀

The foundation for V3 is prepared but awaiting UI implementation:
- User-generated universes
- Custom game rules
- Content marketplace
- Community-driven worlds

---

## 📁 File Structure

```
src/
├── data/
│   ├── questionsWithConsequences.js    # V1: Questions with impacts
│   ├── bluffSystem.js                  # V1: Bluff mechanics
│   └── secretRoles.js                  # V1: Secret roles
├── utils/
│   ├── gameStateManager.js             # V1: World state tracking
│   ├── resourceManager.js              # V1: Resource management
│   ├── gameMasterAI.js                 # V1: AI event generation
│   ├── questManager.js                 # V2: Quest system
│   └── territoryManager.js             # V2: Territory management
├── components/quiz/
│   ├── GameDashboard.jsx               # Dashboard showing world state
│   └── TerritoryView.jsx               # Territory management UI
└── hooks/
    ├── useGameState.js                 # V1 game state hook
    ├── useResources.js                 # Resource management hook
    ├── useQuests.js                    # Quest tracking hook
    └── useTerritory.js                 # Territory management hook
```

---

## 🎮 Usage Examples

### Start a Game with Consequences

```javascript
import { useGameState } from '@/hooks/useGameState';

function GameComponent() {
  const { question, answerQuestion, nextRound, getGameContext } = useGameState('game1');

  const handleAnswer = (answer) => {
    const consequence = question.answers.find(a => a.text === answer).consequence;
    answerQuestion(question.id, answer, consequence);
  };

  return (
    <div>
      <h2>{question?.question}</h2>
      {question?.answers.map(a => (
        <button onClick={() => handleAnswer(a.text)}>{a.text}</button>
      ))}
    </div>
  );
}
```

### Manage Player Resources

```javascript
import { useResources } from '@/hooks/useResources';

function ResourcePanel() {
  const { resources, usePower, addResource } = useResources('player1');

  return (
    <div>
      <p>❤️ Health: {resources?.health}</p>
      <p>🪙 Coins: {resources?.coins}</p>
      <button onClick={() => usePower('hint')}>Use Hint</button>
    </div>
  );
}
```

### Build Territory

```javascript
import { useTerritory } from '@/hooks/useTerritory';

function BuildScreen() {
  const { buildBuilding, getSummary } = useTerritory('player1');

  return (
    <button onClick={() => buildBuilding('library')}>
      Build Library
    </button>
  );
}
```

---

## 🎯 Next Steps to Complete

### Immediate (Ready to Integrate)
- [ ] Connect GameDashboard to quiz gameplay
- [ ] Integrate TerritoryView into main dashboard
- [ ] Add quest UI components
- [ ] Create BluffGame UI component
- [ ] Display world memory in consequences

### Short-term (1-2 weeks)
- [ ] Tournament/Season system
- [ ] School mode (teacher dashboard)
- [ ] Enterprise mode (corporate training)
- [ ] Spectator mode UI
- [ ] Leaderboards with season reset

### Medium-term (V2.5)
- [ ] Mystery mode game component
- [ ] Custom quest creation
- [ ] Clan system integration
- [ ] Social features (guilds, trading)
- [ ] Advanced analytics dashboard

### Long-term (V3)
- [ ] Universe creator tool
- [ ] Content marketplace
- [ ] User-generated quests
- [ ] Custom rules engine
- [ ] Wakkany Africa universe

---

## 🔧 Integration Checklist

- [x] Core game systems created
- [x] State management implemented
- [x] UI components scaffolded
- [x] Hooks created for integration
- [ ] Integration with existing UI
- [ ] Testing & balancing
- [ ] Documentation
- [ ] Deployment

---

## 📊 Key Metrics

- **Total Lines of Code**: ~3,500+
- **Total Components**: 2 UI + 8 core systems
- **Total Hooks**: 4
- **Quest Types**: 8 total (3 character + 3 community + 2 role-based)
- **Events**: 15+ event types
- **Buildings**: 9 territory structures
- **Resources**: 5 types
- **Powers**: 7 abilities
- **Roles**: 6 secret roles

---

## 🎓 Architecture Principles

1. **Separation of Concerns**: Business logic in utils, UI in components
2. **Immutability**: State managed via refs and callbacks
3. **Event-Driven**: Consequences trigger cascading effects
4. **Memory**: "The world remembers" - persistent consequences
5. **Progression**: Multiple paths to victory (XP, coins, reputation)
6. **Narrative**: Everything is driven by story, not mechanics

---

## ⚠️ Important Notes

- All managers are initialized with `new` — consider using Hooks for React integration
- Consequence system is flexible — add more types as needed
- Game Master AI uses random selection — enhance with ML if needed
- Territory production is per-round — implement tick system in main game loop
- All XP/coin rewards are tunable — balance as needed

---

## 🚀 Deployment

To deploy these features:

1. **Stage 1**: Core quiz with consequences
2. **Stage 2**: Territory system
3. **Stage 3**: Quest system
4. **Stage 4**: Advanced features (mysteries, seasons)
5. **Stage 5**: Creator platform

---

**Status**: ✅ Core V1-V2 features complete and ready for integration
**Last Updated**: 2025
