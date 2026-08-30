# Test Scenarios — Concrete Cases for Each Level

**Date:** 2026-08-30
**Purpose:** List the actual test cases for each V&V level

This is the **catalog of tests** that would exist once the V&V framework is built. No code yet — just the cases.

---

## L0: Static / Config audit (~40 checks)

**Already exists.** See `.test/scenario_robust.js` doesn't run these — they're in `docs/audit/scripts/ci-check.sh`.

| ID | Check | What it catches |
|---|---|---|
| L0-001 | `CFG.STARTING_CREDITS === 200` in code, `200` in docs | Drift |
| L0-002 | `CFG.PASSIVE_INCOME === 6` in code, `6/s` in docs | Drift |
| L0-003 | `CFG.BARRACKS_COST === 100` in code, `100` in docs | Drift |
| ... | ... (all 40+ values) | Drift |
| L0-040 | `BUILDING_TREE.barracks.unlocks ⊆ CFG.UNITS` | Stale building tree |
| L0-041 | `BARRACKS_UNITS === BUILDING_TREE.barracks.unlocks` | Inconsistency |
| L0-042 | All `CFG.UNITS.*` have cost, hp, dmg, range, speed, build | Missing fields |
| L0-043 | All CFG sub-objects have at least 1 field | Empty sub-objects |
| L0-044 | No `// TODO` or `// FIXME` in code | Incomplete code |
| L0-045 | All comments after CFG values start with lowercase | Style consistency |

---

## L1: State contract (~20 tests)

**New file:** `.test/l1_state_contract.js`

| ID | Test | What it catches |
|---|---|---|
| L1-001 | `newState()` returns object with `time, matchOver, winner, sides, units, projectiles, aiNextDecision` | Missing top-level fields |
| L1-002 | `sides.red` and `sides.blue` have identical keys | Asymmetric state |
| L1-003 | `sides.red` has `credits, buildings, units, queue, buildingQueue, turretQueue, base` | Missing side fields |
| L1-004 | `base` has `x, y, hp, maxHp` | Missing base fields |
| L1-005 | `sides.red.credits === CFG.STARTING_CREDITS` | Wrong starting state |
| L1-006 | `units`, `projectiles`, `queue`, `buildingQueue`, `turretQueue` are all empty arrays | Non-empty initial state |
| L1-007 | `time === 0`, `matchOver === false`, `winner === null` | Wrong initial values |
| L1-008 | After `spawnUnit('red', 'rifleman')`, unit has `type: 'rifleman', side: 'red'` | Spawn side wrong |
| L1-009 | Spawned unit is in `state.units`, not `state.sides.red.units` | Wrong array |
| L1-010 | Spawned unit has `hp === maxHp === CFG.UNITS.rifleman.hp` | Wrong HP |
| L1-011 | After `placeBuilding('red', 'barracks')`, `buildingQueue.length === 1` | Queue not updated |
| L1-012 | After `placeBuilding`, `buildingQueue[0].type === 'barracks'` | Wrong queue item |
| L1-013 | After `placeBuilding`, `buildingQueue[0].buildProgress === 0` | Wrong initial progress |
| L1-014 | After `placeBuilding`, `buildingQueue[0].buildTime === CFG.BUILD_TIME` | Wrong build time |
| L1-015 | After `placeBuildingOnMap`, `buildings.length` increases by 1 | Building not placed |
| L1-016 | Placed building has `type, side, x, y, hp, maxHp, constructing: false` | Missing fields |
| L1-017 | Placed building `hp === maxHp === CFG.BARRACKS_HP` | Wrong HP |
| L1-018 | After `placeTurret`, `turretQueue.length === 1` | Turret queue wrong |
| L1-019 | After `placeTurretOnMap`, `turrets.length` increases by 1 | Turret not placed |
| L1-020 | After `endMatch('red')`, `matchOver === true, winner === 'red'` | Match end wrong |

---

## L2: Pure logic (~100 tests)

**New file:** `.test/l2_logic.js`

### Economy tests (15)

| ID | Test | What it catches |
|---|---|---|
| L2-001 | `getProdMult` with 0 buildings returns 1.0 | Multiplier wrong |
| L2-002 | `getProdMult` with 1 building returns 1.0 | Multiplier wrong |
| L2-003 | `getProdMult` with 5 buildings returns 2.2 | Multiplier wrong |
| L2-004 | `getProdMult` with 10 buildings returns 2.9 | Multiplier wrong |
| L2-005 | `getProdMult` with 11 buildings (over max) returns 2.9 | No overflow |
| L2-006 | `placeBuilding` deducts exactly the cost from credits | Wrong cost |
| L2-007 | `placeBuilding` returns true on success | Wrong return |
| L2-008 | `placeBuilding` returns false when credits < cost | Allows underflow |
| L2-009 | `placeBuilding` returns false when MAX_BUILDINGS reached | Allows overflow |
| L2-010 | `placeBuilding` returns false when canBuild is false | Bypasses prereqs |
| L2-011 | `canAffordBuilding` returns true at exactly cost | Off-by-one |
| L2-012 | `canAffordBuilding` returns false at cost-1 | Off-by-one |
| L2-013 | Passive income at dt=1 adds CFG.PASSIVE_INCOME | Wrong rate |
| L2-014 | Credits cap at CFG.SOFT_CAP | Allows overflow |
| L2-015 | Kill bounty is 25% of unit cost | Wrong bounty |

### Building logic tests (20)

| ID | Test | What it catches |
|---|---|---|
| L2-016 | `canBuild('red', 'barracks')` returns true with no buildings | Wrong prereq |
| L2-017 | `canBuild('red', 'warfactory')` returns false with no buildings | Missing prereq |
| L2-018 | `canBuild('red', 'warfactory')` returns true with active barracks | Wrong prereq |
| L2-019 | `canBuild('red', 'warfactory')` returns false with constructing barracks | Bypasses active check |
| L2-020 | `canBuild('red', 'techcenter')` returns true with active warfactory | Wrong prereq |
| L2-021 | `canBuild` with dead building (hp=0) returns false | Allows dead building |
| L2-022 | `countActiveBuildings` excludes constructing | Wrong count |
| L2-023 | `countActiveBuildings` excludes dead | Wrong count |
| L2-024 | `updateBuildings` increments buildProgress by dt | Wrong time step |
| L2-025 | `updateBuildings` places building when progress >= buildTime | Never places |
| L2-026 | `updateBuildings` removes from queue when placed | Queue leak |
| L2-027 | `buildingQueue` is FIFO (first in, first out) | Order wrong |
| L2-028 | Cancel/refund removes head and refunds 50% | Wrong refund |
| L2-029 | Cannot cancel mid-construction (RA2 convention) | Wrong cancel |
| L2-030 | Multiple buildings can be queued | Queue limit wrong |
| L2-031 | Building limit: MAX_BUILDINGS = 10 | Limit wrong |
| L2-032 | Queue limit: MAX_QUEUE = 4 | Limit wrong |
| L2-033 | Turret limit: MAX_TURRET_SLOTS = 20 | Limit wrong |
| L2-034 | Pillbox costs 75, Turret costs 150 | Cost wrong |
| L2-035 | Turret perimeter placement creates in arc 290-396px | Wrong placement |

### Combat tests (25)

| ID | Test | What it catches |
|---|---|---|
| L2-036 | Rifleman damage = 4 | Wrong damage |
| L2-037 | Rocket has splash damage (AoE) | Missing splash |
| L2-038 | Sniper has long range (400) | Wrong range |
| L2-039 | Drone does 50 damage on suicide | Wrong damage |
| L2-040 | Drone AoE radius = 60 | Wrong radius |
| L2-041 | Drone falloff: 100% at center, 50% at edge | Wrong falloff |
| L2-042 | Tank has 80 HP, 15 damage | Wrong stats |
| L2-043 | Heavy has 180 HP, 22 damage | Wrong stats |
| L2-044 | Flamethrower has cone attack | Missing cone |
| L2-045 | `findNearestEnemy` returns null when no enemies | Crash |
| L2-046 | `findNearestEnemy` returns closest | Wrong target |
| L2-047 | `findNearestEnemy` boosts score for enemies attacking me | Wrong priority |
| L2-048 | `findNearestEnemy` boosts score for enemies attacking nearby friendly | Wrong priority |
| L2-049 | `findNearestEnemy` prefers lower HP | Wrong priority |
| L2-050 | `findEnemyBaseTarget` prefers production buildings | Wrong priority |
| L2-051 | `findEnemyBaseTarget` prefers lower HP | Wrong priority |
| L2-052 | `findEnemyBaseTarget` falls back to base if no buildings | Crash |
| L2-053 | `updateUnit` moves toward target | Not moving |
| L2-054 | `updateUnit` moves red right, blue left | Wrong direction |
| L2-055 | `updateUnit` attacks when in range | Not attacking |
| L2-056 | `updateUnit` respects attack cooldown | Attack spam |
| L2-057 | `updateUnit` removes dead units (hp <= 0) | Memory leak |
| L2-058 | Unit collision: units don't overlap | Overlap allowed |
| L2-059 | Building collision: units don't walk through buildings | Walking through |
| L2-060 | Base collision: units attack base, not pass through | Pass through |

### AI tests (25)

| ID | Test | What it catches |
|---|---|---|
| L2-061 | AI builds first barracks at t=10 | Wrong timing |
| L2-062 | AI doesn't build if queue has item | Double queue |
| L2-063 | AI doesn't build if already at MAX_BUILDINGS | Overflow |
| L2-064 | AI doesn't build if credits < cost | Allows underflow |
| L2-065 | AI builds warfactory after barracks active | Wrong order |
| L2-066 | AI builds techcenter after warfactory active | Wrong order |
| L2-067 | AI state machine: saving → defending → pushing | Wrong state |
| L2-068 | AI state machine: emergency when base HP < 30% | Wrong trigger |
| L2-069 | AI produces units when barracks active | No production |
| L2-070 | AI saves for war factory (doesn't spend on units) | Wrong savings |
| L2-071 | AI produces rifleman when no enemy units | Wrong choice |
| L2-072 | AI produces rocket when enemy has tanks | Wrong response |
| L2-073 | AI produces flame when enemy has many riflemen | Wrong response |
| L2-074 | AI decision interval = 0.5s | Wrong frequency |
| L2-075 | AI never spawns more than MAX_QUEUE units | Queue overflow |
| L2-076 | AI auto-builds defenses (pillbox/turret) | No defense |
| L2-077 | AI places turrets in perimeter arc | Wrong placement |
| L2-078 | AI turret smart-targeting: prefer attackers | Wrong priority |
| L2-079 | AI turret cooldown = 1s | Wrong cooldown |
| L2-080 | AI handles rematch correctly | State issue |
| L2-081 | AI doesn't crash when state.units is empty | Edge case |
| L2-082 | AI doesn't crash when no buildings | Edge case |
| L2-083 | AI handles player AFK (no units) | Behavior change |
| L2-084 | AI matches player difficulty in real-time | Adaptive |
| L2-085 | AI saves 20 credits buffer for next building | No buffer |

### Edge case tests (15)

| ID | Test | What it catches |
|---|---|---|
| L2-086 | 0 units, both sides → match times out | Crash on empty |
| L2-087 | 100 units on each side → no infinite loop | Perf issue |
| L2-088 | Place building at exactly MAX credits - 1 cost | Boundary |
| L2-089 | Spawn unit at exactly MAX credits - cost | Boundary |
| L2-090 | All buildings destroyed → AI still works | Recovery |
| L2-091 | Both bases at 0 HP simultaneously → draw | Edge case |
| L2-092 | Rematch with no prior match | First time |
| L2-093 | Rematch 100 times in a row → no memory leak | Perf |
| L2-094 | Force state to undefined field → no crash | Robustness |
| L2-095 | Force state.units to have null unit → handled | Robustness |
| L2-096 | Place building when MAX_BUILDINGS reached | Boundary |
| L2-097 | Cancel queue when queue is empty | Edge case |
| L2-098 | Spawn unit for unknown type (e.g., 'banana') | Error handling |
| L2-099 | Building destroyed mid-queue → queue cleanup | Integration |
| L2-100 | Kill bounty at exactly cost → 0.25x of cost | Math |

---

## L3: Event bus (~30 tests)

**New file:** `.test/l3_event_bus.js`

| ID | Test | What it catches |
|---|---|---|
| L3-001 | `EVENTS` is an object | Missing bus |
| L3-002 | `on(event, handler)` adds to subscribers | Doesn't register |
| L3-003 | `emit(event)` calls all subscribers | Doesn't fire |
| L3-004 | `emit(event, a, b, c)` passes args correctly | Wrong args |
| L3-005 | `clearEvents` removes all | Doesn't clear |
| L3-006 | After `clearEvents`, no subscribers | Still subscribed |
| L3-007 | Multiple subscribers for same event | Only first fires |
| L3-008 | Subscribers called in registration order | Wrong order |
| L3-009 | Subscriber throwing doesn't stop others | Stops chain |
| L3-010 | Subscriber that calls emit doesn't infinite loop | Recursion |
| L3-011 | 1000 events in tight loop: all fire | Performance |
| L3-012 | Subscribe to nonexistent event doesn't crash | Robustness |
| L3-013 | Emit to nonexistent event is no-op | Crash |
| L3-014 | `unit:spawned` event has correct signature | Wrong payload |
| L3-015 | `unit:spawned` fires once per spawn | Double-fire |
| L3-016 | `building:placed` event has correct signature | Wrong payload |
| L3-017 | `building:placed` fires once per placement | Double-fire |
| L3-018 | `turret:placed` event has correct signature | Wrong payload |
| L3-019 | `projectile:fire` event has correct signature | Wrong payload |
| L3-020 | `match:restart` event has no args | Wrong args |
| L3-021 | `match:restart` re-registers handlers | Stale handlers |
| L3-022 | `registerEventHandlers` is idempotent | Double-subscribe |
| L3-023 | 100 rematches don't accumulate 100×5 handlers | Leak |
| L3-024 | `unit:spawned` not emitted for queued units | Premature emit |
| L3-025 | `building:placed` not emitted for queued buildings | Premature emit |
| L3-026 | `projectile:fire` only fires when attack happens | Always fires |
| L3-027 | Events fire in microtask (after emit) | Sync issue |
| L3-028 | Events are visible from another module | Encapsulation |
| L3-029 | Event handler context is preserved (this) | Lost this |
| L3-030 | Wildcard events (`unit:*`) work | If implemented |

---

## L4: E2E scenarios (~50 tests, 32 done)

**Existing:** `.test/scenario_robust.js` (32 scenarios)

**Gaps to add (18 new):**

| ID | Test | What it catches |
|---|---|---|
| L4-033 | Click "hold" to cancel queue | Cancel input |
| L4-034 | Spawn all 8 unit types | Missing units |
| L4-035 | Building destroyed mid-build → queue cleanup | Destruction |
| L4-036 | Drone suicide damages multiple enemies | AoE math |
| L4-037 | Turret prefers attacker over random | Targeting |
| L4-038 | Full 180s match (with fast-forward) plays out | End-to-end |
| L4-039 | Player AFK → AI wins | Edge case |
| L4-040 | AI AFK (no units) → player wins | Edge case |
| L4-041 | Switch PROD/DEF tabs | UI tab |
| L4-042 | Switch INF/VEH tabs | UI tab |
| L4-043 | Window resize mid-game | Responsive |
| L4-044 | 50 units on screen, no lag | Performance |
| L4-045 | Build > MAX_BUILDINGS rejected | UI limit |
| L4-046 | Multiple rematches in a row | Stability |
| L4-047 | Click button during cooldown | UI cooldown |
| L4-048 | Click button with no credits | UI affordance |
| L4-049 | Cancel mid-build (hold) | UI cancel |
| L4-050 | End screen → click rematch | UI flow |

---

## L5: Playtest scenarios (~10 manual tests)

**New file:** `docs/vv/05-playtest-protocol.md`

| ID | Test | What we learn |
|---|---|---|
| L5-001 | "5-second test" — show game for 5 seconds, ask "what is this?" | First impression |
| L5-002 | "30-second test" — first-time player produces first unit | Tutorial |
| L5-003 | First match playthrough, observe behavior | Onboarding |
| L5-004 | Two matches in a row, observe retention | Engagement |
| L5-005 | Mobile vs desktop (if possible) | Platform fit |
| L5-006 | Sound on vs off | Audio design |
| L5-007 | Different lighting conditions (if possible) | Visual design |
| L5-008 | "What would you change?" open question | Improvements |
| L5-009 | Watch for frustration points | UX pain |
| L5-010 | Watch for confusion moments | Tutorial gaps |

---

## Test counts summary

| Level | Existing | To add | Total target |
|---|---|---|---|
| L0 | 40 | 5 | 45 |
| L1 | 0 | 20 | 20 |
| L2 | 0 | 100 | 100 |
| L3 | 0 | 30 | 30 |
| L4 | 32 | 18 | 50 |
| L5 | 0 | 10 | 10 |
| **Total** | **72** | **183** | **255** |

When all 255 tests are implemented, the game will be heavily protected against regressions.

---

## Priority order to implement

If I had to pick 3 levels to build first:

1. **L2 (Pure logic)** — Highest value. 100 tests catching the most common bug class.
2. **L3 (Event bus)** — High value. 30 tests for the integration point that broke last time.
3. **L1 (State contract)** — Medium value. 20 tests, but cheap to write.

L0 and L4 are already done. L5 is human work, not code.

---

## What I will not implement

These would be in scope but I'm explicitly skipping them to keep the focus:

- Performance benchmarks (need separate harness)
- Visual regression (would need pixel comparison)
- Network play (no networking yet)
- Save/load (not in game)
- Replay system (future feature)
- Sound (not implemented)

If any of these are priorities, let me know.
