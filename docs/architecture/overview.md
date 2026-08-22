# Software Architecture Model — Arcade Frontline

**Date:** 2026-08-22
**Status:** Living document
**Audience:** Future contributors, code reviewers, future me

> **The point of this document:** when you read 3582 lines of `index.html`, you should be able to navigate to the right place in <2 minutes. This is a map.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Arcade Frontline                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    BROWSER (single page)                        │  │
│  │                                                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │   HUD      │  │ Left Col   │  │   Phaser   │  │ Right Col  │  │  │
│  │  │  (top)     │  │ (build)    │  │  (game)    │  │  (units)   │  │  │
│  │  │  credits   │  │ PROD/DEF   │  │  1920x600  │  │  INF/VEH   │  │  │
│  │  │  time      │  │  tabs      │  │  canvas    │  │   tabs     │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │                  GAME LOGIC (vanilla JS)                  │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │  │
│  │  │  │  State   │ │  Config  │ │  Combat  │ │  AI      │     │   │  │
│  │  │  │  (data)  │ │ (CFG)    │ │ (damage) │ │ (state)  │     │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │  │
│  │  │  │  Units   │ │ Buildings│ │ Turrets  │ │ Economy  │     │   │  │
│  │  │  │ (logic)  │ │ (place)  │ │ (target) │ │ (credits)│     │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │                  ASSETS (base64)                          │   │  │
│  │  │  • Units grid (3x4) • Buildings grid (3x2)               │   │  │
│  │  │  • UI panels • Background • Button icons                 │   │  │
│  │  │  Total: ~10MB base64 → ~13MB embedded                    │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Layer Model (4 layers)

### Layer 0: Browser DOM (HTML + CSS)
**Purpose:** Static page structure, layout, styles
**Files:** Lines 1-617 of `index.html`
**Responsibilities:**
- CSS Grid layout (4 viewports)
- Button styles, hover, active states
- Tab system (PROD/DEF, INF/VEH)
- Loading screen

**Key sections:**
- `<head>` — meta tags, Phaser CDN
- `<style>` — all CSS
- `<body>` — 4-column grid
- `<canvas id="game">` — Phaser container

### Layer 1: Configuration (CFG)
**Purpose:** All tunable numbers in one place
**Location:** Lines 1279-1334 of `index.html`
**Pattern:** Plain object `const CFG = { ... }`

**Sub-categories:**
| Category | Constants |
|---|---|
| Map | `MAP_WIDTH`, `MAP_HEIGHT` |
| Economy | `STARTING_CREDITS`, `PASSIVE_INCOME`, `KILL_BOUNTY`, `SOFT_CAP`, `MATCH_TIME` |
| Buildings | `BARRACKS_COST`, `BARRACKS_HP`, `WARFACTORY_COST`, ... |
| Defenses | `PILLBOX_COST`, `PILLBOX_HP`, `PILLBOX_DMG`, `PILLBOX_RANGE`, `TURRET_*` |
| Limits | `BUILD_TIME`, `MAX_TURRET_SLOTS`, `MAX_QUEUE`, `MAX_BUILDINGS` |
| Units | `CFG.UNITS.rifleman`, etc. (per-unit config) |
| Production | `BARRACKS_UNITS`, `WARFACTORY_UNITS`, `TECHCENTER_UNITS` |
| AI | `AI_DECISION_INTERVAL` |
| Progression | `PROD_MULT` (array) |

**See:** [`tuning-numbers.md`](tuning-numbers.md) for the full reference

### Layer 2: State (state object)
**Purpose:** Mutable game state
**Location:** Lines 1335-1350 (`newState()`)

```javascript
state = {
  time: 0,                // game time in seconds
  winner: null,           // 'player' | 'cpu' | null
  endReason: null,        // 'destroyed' | 'timeout' | null
  sides: {
    player: {
      credits: 200,
      buildings: [...],   // each: { type, x, y, hp, maxHp, constructing, ... }
      units: [...],       // each: { type, x, y, hp, maxHp, target, side, ... }
      productionQueue: [], // each: { type, progress, total }
      buildQueue: [],     // each: { type, progress, total }
    },
    cpu: { /* same shape */ }
  }
};
```

**Pattern:** `newState()` returns a fresh state. Mutation happens everywhere else.

### Layer 3: Game Logic (functions)
**Purpose:** All game rules
**Location:** Lines 1335-2181 of `index.html`

**Sub-modules:**

#### 3.1 Side Management (line 1351)
```javascript
createSide(side)         // Initialize player/cpu side data
```

#### 3.2 Spatial (line 1371)
```javascript
getView()                // Current viewport rect
worldToScreen(x, y)      // Map coords → screen pixels
screenToWorld(sx, sy)    // Screen pixels → map coords
```

#### 3.3 Production (line 1396)
```javascript
spawnUnit(side, type)    // Create unit at production building
queueUnit(side, type)    // Add to production queue
getProdMult(side)        // Global production multiplier
isUnitUnlocked(side, type) // Has the right building?
canBuild(side, type)     // Can place this building?
placeBuilding(side, type)
```

#### 3.4 Combat (line 1515)
```javascript
findNearestEnemy(unit)        // Closest enemy in range
findEnemyBaseTarget(unit)     // Pick a base target (smart)
updateUnit(unit, dt)          // Move, attack, drone suicide
endMatch(winnerSide)
```

#### 3.5 Buildings (line 1745)
```javascript
updateBuildings(side, dt)     // Construction progress, queues
placeBuildingOnMap(side, type)
placeTurret(side, type)
placeTurretOnMap(side, type)  // Perimeter placement
updateTurrets(side, dt)       // Smart targeting
```

#### 3.6 AI (line 1958)
```javascript
updateAI(dt)                  // State machine: save/defend/push/emergency
autoAIBuild(side)             // Always queue units
```

### Layer 4: Rendering (Phaser scene)
**Purpose:** Visual representation
**Location:** Lines 2181-2800 of `index.html`

```javascript
class GameScene extends Phaser.Scene {
  preload()  // Load base64 images
  create()   // Set up sprites, atlases
  update()   // Sync logic → visual
  // ... sprite factories
}
```

**Render sub-systems:**
- Background (line 2229)
- Building sprites (line 2392)
- Unit sprites (line 2491)
- Health bars (container with rect graphics)
- Projectiles (lines)
- Particles (explosions)
- Floating text (damage numbers)

### Layer 5: UI (DOM-side)
**Purpose:** Buttons, HUD, tabs
**Location:** Lines 2808-3582 of `index.html`

```javascript
refreshUI()                  // Update credit display, time
findButtonFromTarget(e)      // Which button was clicked?
flashElement(el, cls)        // Visual feedback
getBuildingQueueAndCost()
buildUnitButtons()           // Create INF/VEH buttons
drawSpriteToButtonPreview()  // Render sprite on button
loadAIIcons()                // Load button icon images
```

---

## Data Flow

```
USER TAP
   ↓
[Layer 5: UI] button click handler
   ↓
[Layer 3: Logic] queueUnit / placeBuilding
   ↓
[Layer 2: State] state.sides[side].productionQueue.push(...)
   ↓
[Layer 3: Logic] updateQueue (per frame)
   ↓
[Layer 3: Logic] spawnUnit when progress complete
   ↓
[Layer 2: State] state.sides[side].units.push(...)
   ↓
[Layer 3: Logic] updateUnit (per frame)
   ↓
[Layer 4: Render] syncUnits (per frame)
   ↓
SCREEN
```

**Frame loop (60 FPS):**
```javascript
function loop(t) {
  // 1. Update time
  state.time += dt;
  
  // 2. Update logic
  updateBuildings(side, dt);
  updateQueue(side, dt);
  updateTurrets(side, dt);
  updateUnits(side, dt);  // moves, attacks
  updateAI(dt);
  
  // 3. Render
  scene.update();
  
  // 4. UI
  refreshUI();
  
  // 5. Schedule next frame
  requestAnimationFrame(loop);
}
```

---

## Module Boundaries

| Module | Inputs | Outputs | Side Effects |
|---|---|---|---|
| `updateUnit` | unit, dt | none | mutates unit, may call `endMatch` |
| `spawnUnit` | side, type | unit object | mutates state.sides, calls Phaser |
| `updateAI` | dt | none | mutates state.sides[cpu] |
| `placeBuilding` | side, type | building object | mutates state.sides, calls Phaser |
| `isUnitUnlocked` | side, type | boolean | none (pure) |

**Principle:** Most functions take primitive args + return either nothing (mutation) or a value. Phaser calls are isolated to sprite factory functions.

---

## State vs Logic vs Render Separation

```
         STATE              LOGIC              RENDER
        (data)            (rules)            (visual)
           │                  │                  │
           │  read by  ──────►│                  │
           │                  │  read by  ──────►│
           │                  │                  │
           │  mutate by ◄─────│                  │
           │                  │  mutate by ◄─────│
           │                  │                  │
```

**Key invariant:** Logic should not depend on Render. If we swapped Phaser for PixiJS, only the Render layer changes.

In practice, this is **partially violated** — `spawnUnit` calls `scene.addUnitSprite()` directly. A cleaner architecture would have the Render layer subscribe to state changes.

---

## Architectural Smells (current)

1. **State + Logic + Render coupling** in `spawnUnit`, `placeBuilding`
   - Fix: emit events, render subscribes

2. **Two parallel data structures** for production (`BUILDINGS_UNLOCK` dead + `*_UNITS` used)
   - Fix: remove `BUILDINGS_UNLOCK` (see audit H2)

3. **Magic numbers in functions** instead of CFG
   - Examples: `60` (BLAST_RADIUS), `50` (BLAST_DMG), `0.5` (AI interval)
   - Fix: move to `CFG` with descriptive names

4. **Dead code** that survives (BUILDINGS_UNLOCK, possibly more)
   - Fix: lint for unused exports

5. **No tests for tuning changes** (only integration tests)
   - Fix: add unit tests for `getProdMult`, `isUnitUnlocked`, `targetScore`

---

## Future Architecture Improvements

### If/when game complexity grows:

1. **Event bus** — decouple logic from render
   ```javascript
   events.on('unitSpawned', unit => scene.addUnitSprite(unit));
   events.on('unitDied', unit => scene.removeUnitSprite(unit));
   ```

2. **Component system** for units (Movement, Combat, Health components)
   ```javascript
   unit.components = [Movement, Combat, Health];
   unit.update(dt) { this.components.forEach(c => c.update(dt)); }
   ```

3. **State machine for unit behavior** (move, attack, dead)
   ```javascript
   unit.state = 'moving';
   unit.transition('attacking', condition);
   ```

4. **Scriptable AI** (behavior tree, utility AI)
   - Current: state machine + if/else
   - Better: declarative tree

5. **Modular file structure** (even if we keep single-file deploy)
   - Develop in `src/` with separate files
   - Build step to concatenate to `index.html`

---

## References

- Layer 0 (DOM): `index.html` lines 1-617
- Layer 1 (CFG): `index.html` lines 1279-1334
- Layer 2 (State): `index.html` lines 1335-1350
- Layer 3 (Logic): `index.html` lines 1335-2181
- Layer 4 (Render): `index.html` lines 2181-2800
- Layer 5 (UI): `index.html` lines 2808-3582
- Audit findings: [`../audit/2026-08-22-doc-code-audit.md`](../audit/2026-08-22-doc-code-audit.md)
- Doc standards: [`../README.md`](../README.md)
