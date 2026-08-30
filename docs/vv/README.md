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

---

## The 6 levels

| Level | Maps to | Type | Tests today | Target |
|---|---|---|---|---|
| L0 | Layer 1 (CFG) | Static audit | 40 | 45 |
| L1 | Layer 2 (State) | State contract | 0 | 20 |
| L2 | Layer 3 (Logic) | Pure logic | 0 | 100 |
| L3 | Layer 2.5 (Bus) | Event bus | 0 | 30 |
| L4 | All layers | E2E scenarios | 32 | 50 |
| L5 | Player UX | Playtest | 0 | 10 |
| **Total** | | | **72** | **255** |

See `00-overview.md` for the full framework.

---

## Documents

| File | What it covers |
|---|---|
| `00-overview.md` | Framework overview, definitions, level descriptions |
| `01-layer-mappings.md` | Each level mapped to architecture layers |
| `02-test-scenarios.md` | Concrete test cases for each level (with IDs) |
| `03-coverage-matrix.md` | What's tested vs what's missing |
| `04-implementation-plan.md` | Order of work, time estimates, risk areas |

---

## Test pyramid

```
        ╱╲
       ╱  ╲         L5: Playtest (manual)
      ╱────╲        Validation
     ╱      ╲
    ╱        ╲      L4: E2E (50 automated)
   ╱──────────╲     Verification
  ╱            ╲
 ╱              ╲   L2: Logic (100) + L3: Bus (30)
╱────────────────╲
│ L0 (45) L1 (20) │  Fast, low-level
─────────────────────
```

---

## Status

- ✅ L0: implemented (40+ checks via `docs/audit/scripts/ci-check.sh`)
- 🟡 L4: implemented (32 scenarios via `.test/scenario_robust.js`)
- ❌ L1, L2, L3, L5: design only

**Next step:** user approves the design, then we build L1 + L2 + L3 first (the highest-value additions).

---

## Quick reference: what to test where

| If you change... | Test at level... | Run command |
|---|---|---|
| `CFG.*` value | L0 | `bash docs/audit/scripts/ci-check.sh` |
| `newState()` shape | L1 | `node .test/l1_state_contract.js` |
| `placeBuilding` logic | L2 | `node .test/l2_logic.js` |
| Event bus subscription | L3 | `node .test/l3_event_bus.js` |
| Whole game flow | L4 | `node .test/scenario_robust.js` |
| Player UX | L5 | Manual playtest |

---

## Open questions for review

1. Is 6 levels the right granularity?
2. Is 255 tests the right target?
3. Which levels to build first?
4. Should CI be in this PR or a follow-up?
