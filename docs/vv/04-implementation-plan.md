# Implementation Plan — Building the V&V Framework

**Date:** 2026-08-30
**Purpose:** Order of operations for implementing the V&V framework
**Status:** Plan only — no code yet

---

## Goal

Turn this V&V framework from a design doc into a running test suite.

**Target:** 255 automated tests across 6 levels, running in <30 seconds total.

---

## Constraints

1. **No changes to gameplay.** We're adding tests, not features.
2. **Tests run in CI** (or could, given enough CI time).
3. **Tests are deterministic.** Same input → same output. No flaky tests.
4. **Tests are independent.** Each test sets up its own state.
5. **Tests fail loudly.** A failure tells you exactly what broke.

---

## Architecture of the test suite

```
.test/
├── ci_check.sh                    # existing L0 audit
├── scenario_robust.js             # existing L4 E2E
├── run_scenario.sh                # existing runner
│
├── l1_state_contract.js           # NEW: 20 tests for state shape
├── l2_logic.js                    # NEW: 100 tests for pure functions
├── l3_event_bus.js                # NEW: 30 tests for event bus
├── l4_e2e_extra.js                # NEW: 18 additional E2E scenarios
│
└── helpers/
    ├── test_harness.js            # assertion, waitFor, helpers
    ├── state_factory.js           # create test state with specific config
    └── mock_phaser.js             # stub Phaser for non-E2E tests
```

The harness provides:
- `assert(cond, name)` — like scenario_robust.js
- `waitFor(fn, timeout)` — poll until condition is true
- `setupState(config)` — reset state to a known starting point
- `mockPhaser()` — stub Phaser objects so logic-only tests can run

---

## Phase 1: Test harness (1-2 hours)

**Goal:** Shared infrastructure for all new tests.

**Files:**
- `.test/helpers/test_harness.js` — assertion + waitFor + cleanup
- `.test/helpers/state_factory.js` — state setup with overrides
- `.test/helpers/mock_phaser.js` — Phaser stub

**Why first:** All other phases depend on this.

**Done when:**
- `assert(true, 'X')` passes silently
- `assert(false, 'Y')` fails loudly
- `waitFor` polls every 50ms, times out cleanly
- `setupState({ redCredits: 500 })` returns state with that override

---

## Phase 2: L1 — State contract (1-2 hours)

**Goal:** 20 tests for state shape.

**Files:**
- `.test/l1_state_contract.js`

**Test pattern:**
```javascript
// 1. Setup
state = setupState();

// 2. Action
spawnUnit('red', 'rifleman');

// 3. Assert
assert(state.units[0].side === 'red', 'unit has correct side');
```

**Coverage:** All top-level state fields, all side fields, all unit/building/turret fields.

**Done when:** 20 tests pass, 0 false positives.

---

## Phase 3: L2 — Pure logic (4-6 hours)

**Goal:** 100 tests for pure functions.

**Files:**
- `.test/l2_logic.js`

**Test pattern:**
```javascript
// 1. Setup state with specific values
state = setupState({ redBuildings: [{ type: 'barracks', constructing: false, hp: 100 }] });

// 2. Call function
const canBuildWF = canBuild('red', 'warfactory');

// 3. Assert
assert(canBuildWF === true, 'warfactory can be built with active barracks');
```

**Sub-groups:**
- Economy tests (15)
- Building tests (20)
- Combat tests (25)
- AI tests (25)
- Edge case tests (15)

**Tricky part:** Some functions read `state.time` or run over time. Need to control time in tests.

**Done when:** 100 tests pass. Each one runs in <50ms.

---

## Phase 4: L3 — Event bus (2-3 hours)

**Goal:** 30 tests for the event bus.

**Files:**
- `.test/l3_event_bus.js`

**Test pattern:**
```javascript
// 1. Subscribe
let received = [];
on('unit:spawned', (side, key, x, y) => received.push({side, key, x, y}));

// 2. Emit
state = setupState();
spawnUnit('red', 'rifleman');

// 3. Assert
assert(received.length === 1, 'one event fired');
assert(received[0].key === 'rifleman', 'event has correct payload');
```

**Sub-groups:**
- Bus mechanics (10)
- Event catalog correctness (10)
- Lifecycle (rematch, restart) (5)
- Performance and edge cases (5)

**Done when:** 30 tests pass. Bus is verified for all events.

---

## Phase 5: L4 — Additional E2E (2-3 hours)

**Goal:** 18 more E2E scenarios.

**Files:**
- `.test/l4_e2e_extra.js`

**Test pattern:** Same as `scenario_robust.js`, but new scenarios.

**New scenarios:**
- Cancel queue (hold button)
- Spawn all 8 unit types
- Building destroyed mid-queue
- Drone AoE math
- Turret targeting priority
- Full 180s match
- Player AFK → AI wins
- AI AFK → player wins
- Tab switching
- Window resize
- 50 units on screen
- MAX_BUILDINGS enforcement
- Multiple rematches in a row
- Click during cooldown
- Click with no credits
- Cancel mid-build
- End screen → rematch
- 100 rematches stress test

**Done when:** 18 new scenarios pass, 50 total in L4.

---

## Phase 6: L5 — Playtest protocol (1 hour)

**Goal:** Structured playtest script.

**Files:**
- `docs/vv/05-playtest-protocol.md`

**Not code** — a markdown document that the test facilitator follows.

**Contents:**
- Pre-test setup (URL, browser, etc.)
- 5-second test script
- 30-second test script
- Full match observation
- 2-match retention test
- Post-test questions
- How to record findings

**Done when:** Protocol document is written, ready to use.

---

## Phase 7: Combined runner (1 hour)

**Goal:** One script runs all levels.

**Files:**
- `.test/run_all.sh` — runs L0 through L4 in sequence

**Pattern:**
```bash
#!/usr/bin/env bash
set -e
echo "=== L0: Static/CFG ==="
bash docs/audit/scripts/ci-check.sh

echo "=== L1: State contract ==="
node .test/l1_state_contract.js

echo "=== L2: Pure logic ==="
node .test/l2_logic.js

echo "=== L3: Event bus ==="
node .test/l3_event_bus.js

echo "=== L4: E2E scenarios ==="
node .test/scenario_robust.js
node .test/l4_e2e_extra.js

echo "=== All V&V levels passed ==="
```

**Done when:** One command runs all 255+ tests in <30 seconds.

---

## Phase 8: CI integration (1 hour)

**Goal:** Tests run automatically.

**Options:**
- GitHub Action (need to add `.github/workflows/`)
- Pre-commit hook (local only)
- Local script (manual)

**Recommended:** Pre-commit hook + GitHub Action.

**Done when:** Pushing to main triggers all tests. PRs show pass/fail.

---

## Time estimate

| Phase | Time | Cumulative |
|---|---|---|
| 1. Test harness | 1-2h | 1-2h |
| 2. L1 | 1-2h | 2-4h |
| 3. L2 | 4-6h | 6-10h |
| 4. L3 | 2-3h | 8-13h |
| 5. L4 | 2-3h | 10-16h |
| 6. L5 | 1h | 11-17h |
| 7. Combined runner | 1h | 12-18h |
| 8. CI | 1h | 13-19h |
| **Total** | **~15h** | |

That's about 2 days of focused work. Can be done in 1-2 weeks part-time.

---

## What to build first (if time-constrained)

If you only have 4-6 hours, here's the priority order:

1. **L3 (event bus)** — 2-3h, catches integration bugs
2. **L2 economy + building** — 2-3h, catches math bugs
3. Skip the rest for now

If you have 8-12 hours, add:
- L1 (state contract) — 1-2h
- L4 additional E2E — 2-3h

If you have 15+ hours, do the full plan.

---

## Risk areas

**Risk 1: L2 tests are slow to write.** 100 tests is a lot. Each needs setup, action, assertion. ~5 minutes per test if you're careful. That's 8 hours.

**Risk 2: L2 tests might be flaky.** Time-based tests (e.g., "after 1 second, X happens") are sensitive to timing. Need careful `waitFor` usage.

**Risk 3: L3 tests need careful state setup.** Each event test needs the right state. Forgetting to set up the right state leads to false passes.

**Risk 4: L4 new scenarios need DOM interaction.** Some of the 18 new scenarios (hold to cancel, tab switching) need pointer events. Playwright handles this, but it's slower to write.

**Risk 5: L5 playtest is hard to standardize.** People give different feedback. Need clear questions and structured recording.

---

## What I'm NOT building

- **Visual regression testing** — would need pixel comparison, complex setup
- **Performance benchmarks** — would need a benchmarking harness
- **Cross-browser testing** — would need multiple browser drivers
- **Accessibility testing** — would need a11y tools
- **Network/multiplayer testing** — not applicable yet

If any of these become important, they can be added as L6+ levels.

---

## Next step

You have the design. Before I code, confirm:

1. **Are the 6 levels the right granularity?** (vs 4 or 8)
2. **Is 255 tests the right target?** (vs 100 or 500)
3. **What level(s) should I build first?**
4. **Should I add a CI hook in this PR or follow up?**

Once you confirm, I'll start with Phase 1 (test harness) and work through the plan.
