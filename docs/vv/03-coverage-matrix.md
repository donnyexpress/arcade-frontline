# Coverage Matrix — What Each Level Covers

**Date:** 2026-08-30
**Purpose:** Show which code areas are tested by which level, and where the gaps are

---

## Coverage by code area

| Code area | Lines | L0 | L1 | L2 | L3 | L4 | L5 | Coverage |
|---|---|---|---|---|---|---|---|---|
| `CFG.STARTING_CREDITS` | 1284 | ✅ | — | — | — | ✅ | — | 100% |
| `CFG.PASSIVE_INCOME` | 1285 | ✅ | — | ✅ | — | ✅ | — | 100% |
| `CFG.UNITS.*` (each) | 1306-1314 | ✅ | — | ✅ | — | 🟡 | 🟡 | 80% |
| `CFG.BUILDING_TREE` | 1320 | ✅ | — | ✅ | — | — | — | 100% |
| `CFG.DRONE.*` | 1337-1340 | ✅ | — | ✅ | — | — | — | 100% |
| `CFG.TURRET_PLACEMENT.*` | 1344-1350 | ✅ | — | ✅ | — | — | — | 100% |
| `CFG.TARGETING.*` | 1354-1364 | ✅ | — | ✅ | — | — | — | 100% |
| `newState()` | 1411 | — | ✅ | — | — | ✅ | — | 100% |
| `createSide(side)` | 1419 | — | ✅ | — | — | — | — | 100% |
| `spawnUnit()` | 1471 | — | ✅ | ✅ | ✅ | ✅ | 🟡 | 100% |
| `queueUnit()` | 1495 | — | ✅ | ✅ | — | 🟡 | — | 80% |
| `isUnitUnlocked()` | 1450 | — | — | ✅ | — | — | — | 100% |
| `getProdMult()` | 1444 | — | — | ✅ | — | — | — | 100% |
| `canBuild()` | 1552 | — | — | ✅ | — | — | — | 100% |
| `canAffordBuilding()` | 1468 | — | — | ✅ | — | — | — | 100% |
| `buildingCost()` | 1477 | — | — | ✅ | — | — | — | 100% |
| `placeBuilding()` | 1568 | — | — | ✅ | — | ✅ | 🟡 | 100% |
| `placeBuildingOnMap()` | 1888 | — | ✅ | ✅ | ✅ | ✅ | — | 100% |
| `placeTurret()` | 1921 | — | — | ✅ | — | ✅ | — | 100% |
| `placeTurretOnMap()` | 1932 | — | ✅ | ✅ | ✅ | ✅ | — | 100% |
| `findNearestEnemy()` | 1541 | — | — | ✅ | — | 🟡 | — | 80% |
| `findEnemyBaseTarget()` | 1565 | — | — | ✅ | — | 🟡 | — | 80% |
| `updateUnit()` | 1621 | — | — | ✅ | ✅ | 🟡 | 🟡 | 90% |
| `updateBuildings()` | 1849 | — | — | ✅ | — | ✅ | — | 100% |
| `updateQueue()` | 1971 | — | — | ✅ | — | 🟡 | — | 80% |
| `updateTurrets()` | 1995 | — | — | ✅ | — | 🟡 | — | 80% |
| `endMatch()` | 1738 | — | — | ✅ | — | ✅ | 🟡 | 100% |
| `autoAIBuild()` | 1797 | — | — | ✅ | — | ✅ | — | 100% |
| `updateAI()` | 2022 | — | — | ✅ | — | ✅ | 🟡 | 100% |
| `EVENTS`, `on`, `emit` | 1387-1394 | — | — | — | ✅ | ✅ | — | 100% |
| `clearEvents()` | 1394 | — | — | — | ✅ | ✅ | — | 100% |
| `GameScene.registerEventHandlers()` | 2739 | — | — | — | ✅ | ✅ | — | 100% |
| `GameScene.spawnUnitSprite()` | 2673 | — | — | — | ✅ | ✅ | — | 100% |
| `GameScene.addBuildingSprite()` | 2692 | — | — | — | ✅ | ✅ | — | 100% |
| `GameScene.addTurretSprite()` | 2700 | — | — | — | ✅ | ✅ | — | 100% |
| `GameScene.fireProjectile()` | 2719 | — | — | — | ✅ | 🟡 | — | 80% |
| `GameScene.createBaseSprites()` | 2670 | — | — | — | ✅ | ✅ | — | 100% |
| `loop()` (main game loop) | 3211 | — | — | ✅ | — | ✅ | — | 100% |
| `initGame()` | 3285 | — | ✅ | — | — | ✅ | — | 100% |
| HUD updates | 540-545 | — | — | — | — | 🟡 | 🟡 | 50% |
| Button click handlers | 3050-3160 | — | — | — | — | 🟡 | 🟡 | 50% |
| Tabs (PROD/DEF, INF/VEH) | 460-470 | — | — | — | — | 🟡 | 🟡 | 50% |
| Rematch button | 3203 | — | — | — | — | ✅ | 🟡 | 100% |
| Hold to cancel | 3040 | — | — | — | — | ❌ | 🟡 | 0% |
| Window resize | 3490 | — | — | — | — | ❌ | 🟡 | 0% |

**Legend:**
- ✅ Covered
- 🟡 Partially covered (some scenarios, not all)
- ❌ Not covered
- — Not applicable (level doesn't test this)

---

## What's NOT covered (critical gaps)

### Gap 1: Hold to cancel (Layer 0/5)

The "hold button to cancel" feature is a core part of the UX but has zero tests. If we break it (e.g., change hold duration to wrong value), no test would catch it.

**Why it matters:** Players use this all the time to refund misclicks. If it stops working, the game feels broken.

**What to add:**
- L2: Test the cancel logic (50% refund, removes queue head)
- L4: Test the actual hold interaction (pointer down + 500ms + pointer up)

### Gap 2: Window resize (Layer 4)

The game has a Phaser canvas that should resize. If window resize is broken, mobile users rotating their device see a broken layout.

**What to add:**
- L4: Resize window, check canvas dimensions

### Gap 3: Tab switching (Layer 0/5)

The PROD/DEF and INF/VEH tabs are critical UI. If they don't switch, players can't access all buildings.

**What to add:**
- L4: Click each tab, verify visible buttons change

### Gap 4: Combat targeting (Layer 3)

`findNearestEnemy` and `findEnemyBaseTarget` are partially tested. The full priority scoring (500 for attacker, 200 for production, etc.) is not exhaustively tested.

**What to add:**
- L2: 20+ tests covering each scoring component

### Gap 5: Drone AoE math (Layer 3)

The drone's suicide damage falloff (50% at edge, 100% at center) is not tested. If we change the falloff formula, no test catches the regression.

**What to add:**
- L2: 5+ tests for falloff at various distances

### Gap 6: Multiple unit types (Layer 3)

The 32-scenario test only spawns 1 unit type (rifleman). The other 7 unit types are not exercised.

**What to add:**
- L4: Spawn each of 8 unit types, verify it appears

### Gap 7: Building destroyed mid-queue (Layer 3)

When a barracks is destroyed, the units in its production queue are supposed to be refunded 50%. This logic exists but isn't tested.

**What to add:**
- L2: Queue rifleman, destroy barracks, check refund

### Gap 8: Full 180s match (Layer 3/4)

No test runs a full match. The closest is 60s of fast-forwarded game time. The full 180s might have bugs that only show up late.

**What to add:**
- L4: Full match with FORCE_FAST_FORWARD, verify winner is determined

---

## Coverage by test type

| Test type | What it catches | Best level |
|---|---|---|
| **Unit test** (one function, one case) | Logic bugs | L2 |
| **Property test** (invariants across many cases) | Boundary bugs | L2 |
| **Integration test** (multiple functions together) | Wiring bugs | L3, L4 |
| **Smoke test** (whole game runs) | Crash bugs | L4 |
| **Regression test** (specific bug doesn't return) | Re-introduced bugs | L4 |
| **Playtest** (human plays the game) | UX bugs | L5 |
| **Static analysis** (code patterns) | Style/correctness | L0 |

---

## What the matrix doesn't show

**Timing bugs:** Hard to test without a time-travel debugger. Need integration tests (L4) that run actual game frames.

**Race conditions:** Hard to test deterministically. Best caught by L4 with many rematches.

**Browser-specific issues:** Different browsers render Phaser differently. Would need a real browser matrix (L4 across Chrome/Firefox/Safari/Edge).

**Mobile-specific issues:** Touch events behave differently than mouse. Would need real device testing (L5).

---

## Recommended test additions (in priority order)

1. **L2-100 tests for pure logic** (most valuable, hardest to write)
2. **L3-30 tests for event bus** (catches the bugs that broke rematch)
3. **L1-20 tests for state contract** (cheap to write, prevents schema drift)
4. **L4-18 additional E2E scenarios** (fills gaps in current coverage)
5. **L5-10 playtest scripts** (manual, but structured)

After these additions:
- 250+ automated tests
- 10+ manual playtests
- 100% code coverage of pure functions
- ~80% coverage of integration paths

---

## Open questions

1. **How long should L4 full-match test take?** 180s real = 30s with fast-forward. Acceptable.
2. **Should we test on multiple browsers?** Nice-to-have, not critical.
3. **Should L2 tests run in CI?** Yes — they're fast.
4. **Should L4 tests run in CI?** Yes — they're 10-20s, fast enough.
5. **Should L5 playtest be tracked in this doc?** Yes, but results go in a separate findings file.

---

## See also

- `00-overview.md` — V&V framework overview
- `01-layer-mappings.md` — Detailed layer-to-test mapping
- `02-test-scenarios.md` — Concrete test cases for each level
- `04-implementation-plan.md` — Order of implementation
