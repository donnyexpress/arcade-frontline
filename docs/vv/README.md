# V&V Framework — Verification & Validation

**Date:** 2026-08-30
**Status:** Design (pre-implementation)
**Purpose:** Define a layered verification & validation framework that mirrors the 5-layer architecture

---

## Why this exists

The 32-scenario test in `.test/scenario_robust.js` was great for finding bugs but it's a single black-box test. We need:

1. **Verification** at every layer (not just end-to-end)
2. **Validation** that the game is fun/usable (not just runs)
3. **Test pyramid** — many small tests, few large ones
4. **Fast feedback** — tests run in <30s, not 5+ minutes
5. **No duplication** — one source of truth for helpers, one file per layer
6. **Automated playtest** — scripted personas, not manual

---

## The 6 levels

| Level | Maps to | Type | Tests today | Target | File |
|---|---|---|---|---|---|
| L0 | Layer 1 (CFG) | Static audit | 40 | 45 | `l0_static.js` |
| L1 | Layer 2 (State) | State contract | 0 | 20 | `l1_state.js` |
| L2 | Layer 3 (Logic) | Pure logic | 0 | 100 | `l2_logic.js` |
| L3 | Layer 2.5 (Bus) | Event bus | 0 | 30 | `l3_bus.js` |
| L4 | All layers | E2E scenarios | 32 | 50 | `l4_e2e.js` |
| L5 | Player experience | **Scripted personas** | 0 | 5 personas | `l5_playtest.js` |
| **Total** | | | **72** | **250+** | |

---

## File structure (after refactor)

```
.test/
├── helpers.js              ONE source of truth (assert, section, waitFor, setupState)
├── setup.js                Phaser setup, FORCE_FAST_FORWARD, mocks
│
├── l0_static.js            Layer 1: CFG audit (wraps ci-check.sh)
├── l1_state.js             Layer 2: State contract
├── l2_logic.js             Layer 3: Pure logic (100 tests)
├── l3_bus.js               Layer 2.5: Event bus
├── l4_e2e.js               All layers: E2E (renamed from scenario_robust.js)
├── l5_playtest.js          Player: scripted personas
│
├── personas/
│   ├── rusher.js           Build rifleman rush
│   ├── turtle.js           Max defense
│   ├── tech_rush.js        Tech center rush
│   ├── random_clicker.js   Random UI inputs
│   └── idle.js             No actions, watch AI
│
├── run_all.sh              Run all 6 levels
└── phaser.min.js           Local Phaser
```

**Current state**: 149 files (mostly debugging artifacts)
**Target state**: ~20 files (clean, organized by architecture)

---

## The key innovation: scripted personas (L5)

The user said "playtest should be automated via different scripted scenarios inferred from the design."

**L5 is NOT manual playtest.** L5 is **scripted personas** that simulate player behavior:

```javascript
// personas/rusher.js
function rusher(state, dt) {
  const actions = [];
  const side = 'red';
  
  // If no barracks, build one
  if (!hasBuilding(side, 'barracks')) {
    if (canAfford(side, 'barracks')) {
      actions.push({ type: 'place_building', side, building: 'barracks' });
    }
  }
  
  // If barracks active, queue rifleman
  if (hasActiveBuilding(side, 'barracks')) {
    actions.push({ type: 'queue_unit', side, unit: 'rifleman' });
  }
  
  return actions;
}
```

The playtest runner reads state, calls the persona, applies actions, records results. **No human required.**

| Persona | Strategy | Tests |
|---|---|---|
| `rusher` | Rifleman rush | Aggression, early game, win condition |
| `turtle` | Build everything, defend | Defense, attrition, late game |
| `techRush` | Skip barracks, rush tech | Tech path, advanced units |
| `randomClicker` | Click all buttons randomly | UI robustness, error handling |
| `idle` | Do nothing | AI plays alone, AI difficulty |

**Output per persona**: win/loss, units built, credits spent, time to victory.

---

## How L5 is "inferred from the design"

The personas come from analyzing `docs/design-document.md` and `docs/decisions/`:

| Design decision | Becomes persona |
|---|---|
| Building prerequisites (Barracks → War Factory → Tech Center) | `techRush` (skips the prereq chain) |
| AI difficulty (currently hardcoded) | `idle` (no player input → AI wins?) |
| Perimeter turret defense | `turtle` (max turrets) |
| Production queue + cancel | `randomClicker` (click every button) |
| 2-3 minute match length | All personas have a time target |

**This is design-driven testing**, not random exploration.

---

## Documents

| File | What it covers |
|---|---|
| `README.md` | This file — index |
| `00-overview.md` | Framework, levels, definitions |
| `01-layer-mappings.md` | Each level → specific code locations |
| `02-test-scenarios.md` | Concrete test cases (with IDs) |
| `03-coverage-matrix.md` | What's tested vs gaps |
| `04-implementation-plan.md` | Order of work, time estimates |
| `05-test-architecture-alignment.md` | **Refactor plan: dedupe, scripted personas** |

---

## Status

- ✅ L0: implemented (40+ checks via `docs/audit/scripts/ci-check.sh`)
- 🟡 L4: implemented (32 scenarios via `scenario_robust.js` — needs rename to l4_e2e.js)
- ❌ L1, L2, L3, L5: design only

**Cleanup needed**: 130+ debugging artifacts in `.test/` should be deleted.

**Next step**: user approves the refactor, then we build L1 + L2 + L3 + L5.

---

## Open questions

1. **Delete 130+ old test files?** Or move to `.test/archive/`?
2. **5 personas enough?** Or more/less?
3. **Persona "win conditions":** rusher wins by destroying base in 60s — too easy? too hard?
4. **L5 runs in headless browser?** (yes, to interact with the game)
