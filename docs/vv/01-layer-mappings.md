# Layer Mappings — V&V Levels to Architecture

**Date:** 2026-08-30
**Purpose:** Map each V&V level to the specific architecture layers and code locations

---

## The 5-layer architecture (recap)

From `docs/architecture/overview.md`:

| Layer | Name | Location in `index.html` | What it does |
|---|---|---|---|
| 0 | Browser DOM | Lines 1-617 | HTML, CSS, layout |
| 1 | Configuration (CFG) | Lines 1279-1385 | All tunable numbers |
| 2 | State | Lines 1390-1410 | Mutable game data |
| 2.5 | Event Bus | Lines 1387-1394 | Logic ↔ Render bridge |
| 3 | Game Logic | Lines 1411-3260 | Functions that mutate state |
| 4 | Render | Lines 3260+ (Phaser) | Phaser scene, sprites |
| 5 | UI (DOM-side) | Lines 2800+ | Buttons, HUD, tabs |

The V&V framework has 6 levels (L0-L5). Each level covers specific layers.

---

## L0: Static / Config audit → Layer 1

| What | Where | How |
|---|---|---|
| CFG values match docs | `index.html` line 1279-1385, `docs/architecture/tuning-numbers.md` | `gen-tuning-numbers.py --check` |
| No magic numbers in code | `index.html` line 1411+ | grep + manual review |
| BUILDING_TREE matches *_UNITS | `index.html` line 1320-1330 | automated check |
| All CFG fields commented | `index.html` line 1279-1385 | lint |
| BUILDING_TREE.unlocks ⊆ CFG.UNITS | `index.html` line 1320-1330 | automated check |

**Key insight:** A change to Layer 1 (CFG) should be visible in L0 audit within the same commit.

---

## L1: State contract → Layer 2

| What | Where | How |
|---|---|---|
| `newState()` returns valid state | `index.html` line 1411 (newState) | direct call, inspect |
| All state.sides[side] have same keys | `index.html` line 1419-1430 (createSide) | Object.keys comparison |
| Units have all required fields | where state.units is populated | spawnUnit test, then inspect |
| Buildings have all required fields | where state.sides[side].buildings is populated | placeBuildingOnMap test |
| Turrets have all required fields | where state.sides[side].turrets is populated | placeTurretOnMap test |
| Queues start empty | `newState()` | check after creation |
| No `null` or `undefined` in state | all of state | recursive walk |

**Why separate from L2:** L1 is about the **shape** of state. L2 is about what functions do **to** state.

**Example check:**
```javascript
// L1: Are both sides symmetric?
const s = newState();
const redKeys = Object.keys(s.sides.red).sort();
const blueKeys = Object.keys(s.sides.blue).sort();
assert(redKeys === blueKeys, 'Sides are symmetric');

// L1: Are all required fields present in a unit?
spawnUnit('red', 'rifleman');
const u = state.units[0];
assert(u.side, 'Unit has side');
assert(u.type, 'Unit has type');
assert(u.x !== undefined, 'Unit has x');
assert(u.y !== undefined, 'Unit has y');
assert(u.hp, 'Unit has hp');
assert(u.maxHp, 'Unit has maxHp');
assert(u.attackCooldown !== undefined, 'Unit has attackCooldown');
assert(u.target !== undefined, 'Unit has target (may be null)');
```

---

## L2: Pure logic → Layer 3

Each function in Layer 3 should be testable in isolation. Map each function to a test:

| Function | Location | What to test |
|---|---|---|
| `getProdMult(side)` | line 1444 | Right multiplier for 0/1/5/10 buildings |
| `isUnitUnlocked(side, type)` | line 1450 | True when right building active, false otherwise |
| `canBuild(side, type)` | line 1552 | True for barracks, false for wf without barracks, etc. |
| `canAffordBuilding(side, type)` | line 1468 | True when credits >= cost, false otherwise |
| `buildingCost(type)` | line 1477 | Returns correct CFG value |
| `countActiveBuildings(side)` | line 1496 | Excludes constructing buildings |
| `placeBuilding(side, type)` | line 1568 | Deducts cost, adds to queue |
| `placeBuildingOnMap(side, type)` | line 1888 | Adds to buildings[], emits event |
| `placeTurret(side, type)` | line 1921 | Deducts cost, adds to turret queue |
| `placeTurretOnMap(side, type)` | line 1932 | Adds to turrets[], emits event |
| `spawnUnit(side, type)` | line 1471 | Adds to state.units, emits event |
| `queueUnit(side, type)` | line 1495 | Adds to side.queue, deducts cost |
| `updateBuildings(side, dt)` | line 1849 | Increments buildProgress, places on completion |
| `updateQueue(side, dt)` | line 1971 | Increments progress, spawns on completion |
| `updateTurrets(side, dt)` | line 1995 | Decrements cooldown, attacks target |
| `updateUnit(unit, dt)` | line 1621 | Moves, attacks, suicide |
| `findNearestEnemy(unit)` | line 1541 | Picks closest, boosts attackers |
| `findEnemyBaseTarget(unit)` | line 1565 | Prefers production, low HP |
| `endMatch(winnerSide)` | line 1738 | Sets matchOver, winner |
| `autoAIBuild(side)` | line 1797 | Builds barracks first, then wf, etc. |
| `updateAI(dt)` | line 2022 | State machine transitions |

**Property tests** (test invariants, not just cases):

| Property | Function | Test |
|---|---|---|
| Credits never negative | placeBuilding | After 100 placeBuilding calls, credits >= 0 |
| Queue never exceeds MAX | queueUnit | After 100 calls, length == MAX_QUEUE |
| Units never have hp > maxHp | updateUnit | After 1000 frames, hp <= maxHp |
| Both sides equal building count | AI fairness | 1000 ticks → same ±1 buildings |

**Boundary tests:**

| Boundary | Function | Test |
|---|---|---|
| 0 buildings | getProdMult | Returns 1.0 |
| MAX_BUILDINGS | getProdMult | Returns 2.9 (last in array) |
| 0 credits | canAfford | Returns false for everything |
| Exactly at cost | canAfford | Returns true |
| 0 HP | match end | matchOver = true |
| Negative HP | match end | still handles correctly |
| All units dead | match end | still works (winner by buildings) |

---

## L3: Event bus → Layer 2.5

| What | Where | How |
|---|---|---|
| Bus exists | `index.html` line 1387-1394 | typeof EVENTS, on, emit, clearEvents |
| Handlers fire | on/emit | emit('foo', arg) → handler(arg) called |
| Multiple handlers | on/emit | All handlers called in order |
| clearEvents | clearEvents | All handlers removed |
| Idempotent re-register | registerEventHandlers | Calling twice doesn't double-subscribe |

**Event catalog** (from `docs/architecture/event-catalog.md`):

| Event | Emitted by | Tests |
|---|---|---|
| `unit:spawned` | `spawnUnit` | Payload shape, fires once per spawn |
| `building:placed` | `placeBuildingOnMap` | Payload shape, fires once per placement |
| `turret:placed` | `placeTurretOnMap` | Payload shape |
| `projectile:fire` | `updateUnit`, `updateTurrets` | Payload shape, fires per attack |
| `match:restart` | `initGame` | Fires on rematch, has subscribers |

**Event flow tests:**

| Scenario | Setup | Expected |
|---|---|---|
| spawn 1 unit | subscribers set | 1 unit:spawned event, handler called 1x |
| rematch | subscribers + spawn | handler called once (not 2x for double-sub) |
| 100 spawns in 1 frame | subscribers | 100 events fire, all handlers called |
| Handler throws | subscribers + bad handler | other handlers still fire, game doesn't crash |

---

## L4: End-to-end → All layers

| What | Where | How |
|---|---|---|
| Page loads | Layer 0 | HTTP 200, no JS errors |
| Phaser initializes | Layer 4 | `Phaser.Scene` exists, `scene` is set |
| State initialized | Layer 2 | `state` is not null |
| CFG is correct | Layer 1 | `CFG.STARTING_CREDITS === 200` |
| Base sprites created | Layer 4 | `scene.baseSprites.length === 2` |
| HUD shows | Layer 5 | `document.getElementById('credits').textContent === '200'` |
| Buttons visible | Layer 0 | barracks, war factory, tech center, etc. |
| Player can build | Layers 0, 3, 4 | Click button → state changes → sprite appears |
| AI builds | Layer 3 | After 10s, blue has barracks |
| Combat happens | Layers 3, 4 | projectile:fire event fires, sprite draws |
| Match ends | Layers 3, 5 | base HP=0 → end screen shows |
| Rematch works | All layers | state reset, sprites recreated |

**Coverage from `scenario_robust.js`:**

| Existing scenario | What it covers |
|---|---|
| 1: Initial state | Layers 0, 1, 2, 4 |
| 2: Build barracks | Layers 3, 4 |
| 3: Spawn rifleman | Layers 3, 4 |
| 4: Build pillbox | Layers 3, 4 |
| 5: Time advances | Layer 3 (loop function) |
| 6: AI builds barracks | Layer 3 (AI) |
| 7: AI builds units | Layer 3 (AI) |
| 8: Match end | Layers 3, 5 |
| 9: Rematch | All layers |
| 10: Post-rematch AI | Layer 3 |

**Missing scenarios** (gaps to fill):

| Need | What it would test |
|---|---|
| Cancel queue (hold button) | Layer 0, 3, 5 (input handling) |
| Multiple unit types | Layer 3 (8 units × spawn = 8 tests) |
| Building destruction refunds queue | Layer 3 |
| Drone suicide AoE | Layer 3 (combat math) |
| Turret attack priority | Layer 3 (targeting) |
| Fast forward full match (180s) | All layers (integration) |
| Tab switching | Layer 0, 5 |
| Window resize | Layer 4 (Phaser) |
| 50 units on screen | Layer 4 (perf) |
| Click cooldown | Layer 0, 5 |
| Build > MAX_BUILDINGS | Layer 3 (boundary) |

---

## L5: Playtest / UX → Player experience

Not testable by code. Manual, structured.

**Questions for each tester:**

| Question | What we learn |
|---|---|
| "What is this game about?" | Tutorial effectiveness |
| "How do you build a unit?" | UI discoverability |
| "How long did that match feel?" | Pacing |
| "What was your favorite unit?" | Unit balance |
| "Did you know to build barracks first?" | Hint effectiveness |
| "What was confusing?" | UX pain points |
| "Would you play another match?" | Retention |
| "What would you change?" | Improvement ideas |

**Demographics to test:**

- 1 person who's never played RTS games
- 1 person who plays Red Alert regularly
- 1 person who plays mobile games (Clash Royale)
- 1 person who's never seen the game
- 1 person who'll give harsh feedback

**Time per playtest:** 15-20 minutes
**Number of playtests:** 5-8 people
**Total time:** 2-3 hours

---

## What the V&V framework looks like together

```
        L5: Playtest (manual, 5-8 people)
        ╱        ╲
      L4: E2E (32 automated, runs every commit)
      ╱            ╲
    L3: Event bus (30+ tests, runs every commit)
   ╱                 ╲
 L2: Pure logic (100+ tests, runs every commit)
╱                     ╲
L0: Static/CFG (40+ checks, runs every commit)
L1: State contract (20+ tests, runs every commit)
```

When a bug is found, the question is "which layer is broken?"
- L0 fails → CFG value wrong
- L1 fails → State shape wrong
- L2 fails → Pure function wrong
- L3 fails → Event subscription wrong
- L4 fails → Integration issue
- L5 fails → UX issue (not a bug, a design problem)
