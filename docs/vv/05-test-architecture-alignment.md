# Test Architecture Alignment — Refactor

**Date:** 2026-08-30
**Purpose:** Make tests match the 5-layer architecture and eliminate duplication
**Status:** Design only (no code yet)

---

## Audit results

### Duplication found

**149 .test/*.js files**, mostly debugging artifacts:
- 30+ `debug_*.js` files (one-off investigations)
- 30+ `zoom*.js` files (visual debugging)
- 20+ `test_*.js` files (incremental attempts)
- 20+ `final_v*.js` files (one-off validations)

**Only 3 files are actually used**:
- `.test/scenario_robust.js` (32 E2E scenarios)
- `.test/scenario_v3.js` (older 10-scenario version — should delete)
- `.test/scenario_full.js` (older 9-scenario version — should delete)

**Helpers duplicated** in each scenario file:
- `assert(cond, name)`
- `section(name)`
- `waitFor(page, fn, timeout)`

**Architecture mismatch**:
- All tests are at L4 (E2E)
- No L1, L2, L3 tests
- L5 (playtest) is empty

---

## Refactor design

### 1. One test file per architecture layer

| File | Layer | Tests |
|---|---|---|
| `.test/l0_static.js` | Layer 1 (CFG) | Run `ci-check.sh`, parse output |
| `.test/l1_state.js` | Layer 2 (State) | Test `newState()` and state shape |
| `.test/l2_logic.js` | Layer 3 (Logic) | Test each pure function |
| `.test/l3_bus.js` | Layer 2.5 (Bus) | Test event bus mechanics |
| `.test/l4_e2e.js` | All layers | Browser-based E2E (renamed from scenario_robust.js) |
| `.test/l5_playtest.js` | Player experience | Scripted personas (NEW) |

### 2. One helper module, not duplicated

**`.test/helpers.js`** — single source of truth for test utilities:
- `assert(cond, name, detail)` — same API as before
- `section(name)` — log a section header
- `waitFor(page, fn, timeout)` — poll for condition
- `setupState(overrides)` — create clean test state
- `withPhaser(fn)` — run a function in a Phaser context
- `playtest(name, persona)` — run a scripted playtest

### 3. L5 = scripted personas, not manual

Instead of "manual playtest", define 4-5 **scripted personas** that the game can run automatically:

| Persona | Behavior | What it tests |
|---|---|---|
| `rusher` | Build barracks, queue rifleman, send to attack | Aggression works |
| `turtle` | Build everything before attacking | Defense works |
| `techRush` | Skip barracks, rush tech center | Tech path works |
| `randomClicker` | Click all buttons randomly | UI affordance |
| `idle` | Don't click anything, watch AI | AI plays well alone |

Each persona is a function that:
- Takes time dt
- Reads game state
- Returns actions (clicks, queues, etc.)
- The test runner applies those actions

This way L5 is **automated** (per the user's request), not manual.

---

## File structure after refactor

```
.test/
├── helpers.js                  # ONE source of truth for test utilities
├── setup.js                    # Phaser setup, FORCE_FAST_FORWARD, mocks
│
├── l0_static.js                # Layer 1: CFG audit
├── l1_state.js                 # Layer 2: State contract
├── l2_logic.js                 # Layer 3: Pure logic
├── l3_bus.js                   # Layer 2.5: Event bus
├── l4_e2e.js                   # All layers: E2E scenarios
├── l5_playtest.js              # Player experience: scripted personas
│
├── personas/
│   ├── rusher.js               # Build rifleman rush
│   ├── turtle.js               # Max defense
│   ├── tech_rush.js            # Tech center rush
│   ├── random_clicker.js       # Random clicks
│   └── idle.js                 # No actions
│
├── run_all.sh                  # Run all levels
└── phaser.min.js               # Local Phaser (already exists)
```

**Reduction**: 149 files → ~20 files, all named after architecture layer or purpose.

---

## Test scenarios (mapped to architecture)

Every test in the V&V doc maps to a specific layer. Here's the full mapping:

| V&V level | Architecture layer | Test file | What it tests | Count |
|---|---|---|---|---|
| L0 | Layer 1 (CFG) | `l0_static.js` | Config values match docs, no magic numbers | 45 |
| L1 | Layer 2 (State) | `l1_state.js` | State shape, invariants | 20 |
| L2 | Layer 3 (Logic) | `l2_logic.js` | Each pure function (see below) | 100 |
| L2.3 | Layer 3.3 (Production) | (part of l2) | spawnUnit, queueUnit, getProdMult, isUnitUnlocked, canBuild, placeBuilding | 25 |
| L2.4 | Layer 3.4 (Combat) | (part of l2) | findNearestEnemy, findEnemyBaseTarget, updateUnit, endMatch | 25 |
| L2.5 | Layer 3.5 (Buildings) | (part of l2) | updateBuildings, placeBuildingOnMap, placeTurret, placeTurretOnMap, updateTurrets | 25 |
| L2.6 | Layer 3.6 (AI) | (part of l2) | updateAI, autoAIBuild | 25 |
| L3 | Layer 2.5 (Bus) | `l3_bus.js` | Event emission, subscription, lifecycle | 30 |
| L4 | All layers | `l4_e2e.js` | Full game flow in browser | 50 |
| L5 | Player experience | `l5_playtest.js` | Scripted personas | 5 personas × 10 actions = 50 |

---

## L5: Scripted personas (the key insight)

The user said "playtest should be automated via different scripted scenarios inferred from the design."

This means: instead of humans playing, we **simulate** player behavior with scripts.

Each persona is a function:

```javascript
// personas/rusher.js
function rusher(state, dt) {
  const actions = [];
  const side = 'red';
  
  // Always have at least 1 barracks
  if (state.sides[side].buildings.filter(b => b.type === 'barracks').length === 0) {
    if (state.sides[side].credits >= CFG.BARRACKS_COST) {
      actions.push({ type: 'place_building', side, building: 'barracks' });
    }
  }
  
  // Queue rifleman as soon as barracks is active
  if (state.sides[side].buildings.some(b => b.type === 'barracks' && !b.constructing)) {
    if (state.sides[side].queue.length < 3) {
      actions.push({ type: 'queue_unit', side, unit: 'rifleman' });
    }
  }
  
  return actions;
}
```

The playtest runner:

```javascript
// l5_playtest.js
async function runPersona(name, persona, duration) {
  for (let t = 0; t < duration; t++) {
    const state = readState();
    const actions = persona(state, dt);
    for (const action of actions) {
      applyAction(action);
    }
    await waitForNextFrame();
  }
  
  // Record what happened
  return recordMetrics(state, name);
}
```

**Metrics per persona**:
- How many buildings placed
- How many units produced
- Credits at end
- Bases HP
- Win/loss

This is **automated playtest** — no human required.

---

## What each persona validates

| Persona | Tests | Catches |
|---|---|---|
| `rusher` | Rush strategy works, can win with 1 barracks | Rush strategy bugs |
| `turtle` | Defense holds, can win by attrition | Defense bugs |
| `techRush` | Tech center path works, advanced units spawn | Tech path bugs |
| `randomClicker` | All UI buttons work, no crashes on weird inputs | UI robustness |
| `idle` | AI plays correctly without player input | AI bugs |

If `rusher` always wins, game is too easy.
If `turtle` always loses, defense is too weak.
If `idle` wins for AI, AI is too strong.
If `techRush` fails, tech path is broken.

---

## Implementation order (refactored)

1. **Create `.test/helpers.js`** — extract common utilities (1h)
2. **Create `.test/setup.js`** — Phaser setup, FORCE_FAST_FORWARD (1h)
3. **Create `.test/personas/`** — 5 persona scripts (2-3h)
4. **Rename `scenario_robust.js` to `l4_e2e.js`** — use helpers (1h)
5. **Create `l0_static.js`** — wraps existing ci-check.sh (30m)
6. **Create `l1_state.js`** — 20 state contract tests (1-2h)
7. **Create `l2_logic.js`** — 100 pure logic tests (4-6h)
8. **Create `l3_bus.js`** — 30 event bus tests (2-3h)
9. **Create `l5_playtest.js`** — runs all personas, compares results (2-3h)
10. **Create `.test/run_all.sh`** — runs all 6 levels (30m)

**Total**: ~15-20 hours. Same as before but cleaner.

---

## Cleanup of old test files

Delete (with `git rm` so we have a record):
- 30+ `debug_*.js` files
- 30+ `zoom*.js` files
- 20+ `test_*.js` files (keep `test_comprehensive.js` if it's used)
- 20+ `final_v*.js` files
- 10+ `check*.js` files
- `scenario_v3.js`, `scenario_full.js`, `scenario_v2.js`, `scenario_quick.js`

Keep:
- `scenario_robust.js` → rename to `l4_e2e.js`
- `phaser.min.js` (local Phaser)
- `index_test.html` (test version of game)
- `run_scenario.sh` → update to `run_all.sh`
- `test_comprehensive.js` (may be useful, but overlaps with l4)

**Result**: 149 files → 20 files. 87% reduction.

---

## What this buys us

1. **One source of truth for test utilities** (no more copy-paste helpers)
2. **One file per architecture layer** (easy to find tests for a layer)
3. **No debugging artifacts** (clean repo)
4. **L5 is automated** (no human playtest required)
5. **Tests match the architecture** (each test is at the right level)

---

## What I'm explicitly NOT doing

1. **Not keeping old test files** — they have historical value but the user wants a clean refactor
2. **Not testing visual rendering** — Phaser render testing is hard and the E2E already covers it
3. **Not testing Phaser internals** — that's Phaser's problem
4. **Not testing browser compatibility** — single browser (Chromium) is fine for now

---

## Open questions

1. **Delete old files immediately, or move to `.test/archive/`?**
   - Pro archive: historical value
   - Pro delete: clean repo
   - My recommendation: delete (git history preserves them)

2. **L5 personas: how many actions per second?**
   - Real players: 1-2 actions/second
   - Fast scripted: 10+ actions/second
   - Recommendation: vary by persona (rusher is fast, turtle is slow)

3. **Persona "win conditions": what does each try to achieve?**
   - rusher: destroy enemy base in 60s
   - turtle: survive 120s with 5+ turrets
   - techRush: have 3+ heavy tanks by 90s
   - randomClicker: just play 60s
   - idle: do nothing for 180s, see what AI does

4. **Should L5 produce a "balance report"?**
   - E.g., "rusher wins 80% of the time → game is too rush-friendly"
   - Recommendation: yes, simple text output

---

## Next step

You have the refactor design. Before I code, confirm:

1. **Delete the 130+ old test files?** Or archive them?
2. **5 personas is the right number?** Or more/less?
3. **L5 runs in headless browser?** (it has to, to interact with the game)
4. **Should I commit the design first, then the code?**
