# Verification & Validation Framework — Arcade Frontline

**Date:** 2026-08-30
**Status:** Design (pre-implementation)
**Purpose:** Define a layered V&V framework that mirrors the 5-layer architecture

---

## Why this matters

The 32-scenario test in `.test/scenario_robust.js` was a **bug-finding tool**, not a V&V framework. It found 3 real bugs but:

- It only tests one path through the game (happy path + rematch)
- It treats the game as a black box — no way to know which layer a failure is in
- It doesn't separate **verification** (does it run correctly?) from **validation** (is it the right game?)
- It doesn't cover the 5 layers of the architecture proportionally

This document defines a proper V&V framework. No code yet — just the plan.

---

## Definitions

**Verification** — Are we building the system right?
- Tests check that the implementation matches the design
- "Does `placeBuilding` deduct the right credits?"
- Deterministic, automated, runs on every commit

**Validation** — Are we building the right system?
- Tests check that the design matches player expectations
- "Can a player actually finish a match in 2-3 minutes?"
- Requires human judgment, runs before each release

**Levels** — Tests at different granularities, each maps to one or more architecture layers.

---

## The 6 Levels of V&V

| Level | Name | Maps to layer | Type | Runs on | Time |
|---|---|---|---|---|---|
| L0 | Static / Config audit | Layer 1 (CFG) | Verification | Every commit | <1s |
| L1 | State contract | Layer 2 (State) | Verification | Every commit | <1s |
| L2 | Pure logic | Layer 3 (Game Logic) | Verification | Every commit | 2-5s |
| L3 | Event bus integration | Layer 2.5 (Bus) | Verification | Every commit | 2-5s |
| L4 | End-to-end scenarios | Layers 0-4 | Verification | Every commit | 10-20s |
| L5 | Playtest / UX | Player experience | Validation | Pre-release | hours |

Each level builds on the lower ones. If L0 fails, L4 will definitely fail. If L4 fails but L0-L3 pass, the bug is in the integration between layers.

---

## L0: Static / Config audit

**Maps to:** Layer 1 (CFG) + `tuning-numbers.md`

**What it checks:**
- Every constant in `CFG` has a comment explaining it
- Every constant in `CFG` is documented in `tuning-numbers.md`
- No magic numbers in functions (every numeric literal has a home in CFG)
- No dead code paths in CFG sub-objects
- BUILDING_TREE matches the *_UNITS arrays

**How to run:** `bash docs/audit/scripts/ci-check.sh`

**Already exists:** Yes (40+ checks, runs in <1s)

**Coverage gaps to add:**
- All `CFG.UNITS.*` fields documented
- All `CFG.TARGETING.*` weights have meaningful names
- All `CFG.DRONE.*` fields have units (pixels, seconds, etc.)

---

## L1: State contract

**Maps to:** Layer 2 (State) + `state` shape

**What it checks:**
- `newState()` produces a state with all required fields
- Every unit has the required fields (`type, side, x, y, hp, maxHp, target, baseTarget, attackCooldown`)
- Every building has the required fields (`type, side, x, y, hp, maxHp, constructing, buildProgress, buildTime`)
- Every turret has the required fields
- Side data is symmetric (red and blue have same structure)
- All queues start empty
- No references to undefined units/buildings in queues

**Why this matters:** Logic functions assume a specific state shape. If the shape is wrong, every function downstream breaks. This is the "schema check" of the game.

**How to run:** New script `.test/l1_state_contract.js`

**Example test:**
```javascript
test('newState() produces a symmetric state', () => {
  const s = newState();
  expect(s.sides.red).toHaveProperty('credits');
  expect(s.sides.blue).toHaveProperty('credits');
  // Both sides must have IDENTICAL keys
  expect(Object.keys(s.sides.red).sort()).toEqual(Object.keys(s.sides.blue).sort());
});
```

---

## L2: Pure logic

**Maps to:** Layer 3 (Game Logic) — each function in isolation

**What it checks:**
- `placeBuilding` deducts the right cost
- `canBuild` returns true/false for every (side, type) combo
- `getProdMult` returns the right value for every building count
- `findNearestEnemy` picks the closest enemy
- `findEnemyBaseTarget` prefers production buildings
- `isUnitUnlocked` correctly checks for active (non-constructing) buildings
- `updateUnit` moves units in the right direction
- `targetScore` returns a lower score for better targets
- All math is deterministic (same input = same output)

**Why this matters:** L2 catches bugs in pure functions. No Phaser, no UI, no time. Just `f(x) === y`.

**How to run:** New script `.test/l2_logic.js` — runs each function with controlled inputs, checks output.

**Example test:**
```javascript
test('getProdMult scales correctly', () => {
  expect(getProdMultForCount(0)).toBe(1.0);
  expect(getProdMultForCount(1)).toBe(1.0);
  expect(getProdMultForCount(2)).toBe(1.4);
  expect(getProdMultForCount(5)).toBe(2.2);
});

test('canBuild(wf) requires active barracks', () => {
  const s = { sides: { red: { buildings: [] } } };
  state = s;
  expect(canBuild('red', 'warfactory')).toBe(false);
  
  state.sides.red.buildings.push({ type: 'barracks', constructing: true, hp: 100 });
  expect(canBuild('red', 'warfactory')).toBe(false); // still constructing
  
  state.sides.red.buildings[0].constructing = false;
  expect(canBuild('red', 'warfactory')).toBe(true);
});
```

**Coverage gaps to add:**
- 100+ unit-test-like checks for each pure function
- Property-based tests: "for any state, placeBuilding always deducts exactly the cost"
- Boundary tests: "what happens at MAX_BUILDINGS?"

---

## L3: Event bus integration

**Maps to:** Layer 2.5 (Event Bus)

**What it checks:**
- Every event in the catalog is emitted at the right place
- Every event is subscribed by the right handler
- Event payloads match the catalog signatures
- No memory leaks (subscribers don't accumulate)
- Bus handles rapid fire (1000 events in 100ms)
- Bus handles errors in handlers (doesn't kill the game)

**Why this matters:** The event bus is the contract between logic and render. If a handler isn't subscribed, the game appears broken (no sprites). If a payload is wrong, the render layer crashes.

**How to run:** New script `.test/l3_event_bus.js`

**Example test:**
```javascript
test('unit:spawned event fires with correct payload', () => {
  const received = [];
  on('unit:spawned', (side, key, x, y) => received.push({side, key, x, y}));
  
  state = newState();
  spawnUnit('red', 'rifleman');
  
  expect(received).toHaveLength(1);
  expect(received[0]).toEqual({side: 'red', key: 'rifleman', x: any, y: any});
});

test('rematch clears stale subscribers', () => {
  let count = 0;
  on('unit:spawned', () => count++);
  on('unit:spawned', () => count++); // double-subscribe
  
  spawnUnit('red', 'rifleman');
  expect(count).toBe(2); // both handlers fire
  
  // initGame should clear bus
  initGame();
  
  spawnUnit('red', 'rifleman');
  expect(count).toBe(2); // NOT 4 (handlers were cleared)
});
```

**Coverage gaps to add:**
- 30+ event tests covering every event × every payload
- Error handling: "if a handler throws, other handlers still fire"
- Performance: "1k events don't slow the game"

---

## L4: End-to-end scenarios

**Maps to:** All layers (the whole stack)

**What it checks:**
- Game loads with Phaser
- Player can build barracks + units
- AI builds barracks + units
- Combat happens
- Match ends
- Rematch works
- Full match plays out

**Why this matters:** This is what players experience. L0-L3 can all pass and the game can still be broken at L4 (e.g., sprite not rendered because of a Phaser config issue).

**How to run:** `.test/scenario_robust.js` (already exists, 32 scenarios)

**Coverage gaps to add:**
- Full match (2-3 min) without manipulation
- Edge cases: what if both players rush? what if player AFKs?
- Stress test: 50 units on screen
- Player interaction: hold to cancel, tap to queue, switch tabs
- Multiple rematches in a row
- Browser tab switching (page visibility)

---

## L5: Playtest / UX validation

**Maps to:** Player experience

**What it checks:**
- Can a new player understand the game in 30 seconds?
- Is the difficulty curve right?
- Is the match length 2-3 minutes?
- Are the unit types distinct enough to learn?
- Are the building icons readable at button size?
- Does the game work on a 5-year-old phone?
- Does the game work with touch (no mouse hover)?
- Is the audio balanced? (if added)
- Does the end screen feel rewarding?
- Does the tutorial hint work?

**Why this matters:** No automated test can tell you if the game is *fun*. This is human judgment.

**How to run:** Manual playtest with 5-10 people, structured observation.

**Already done partially:**
- User feedback during development (via chat)
- Scenario 0: page loads with no errors

**Coverage gaps to add:**
- Structured playtest script
- "5-second test": show a new player the game for 5 seconds, ask what they think it's about
- "30-second test": can a new player produce their first unit?
- Retention test: do players play a 2nd match after the 1st ends?

---

## Test pyramid

```
        ╱╲
       ╱  ╲         L5: Playtest (manual, 5-10 people)
      ╱    ╲        Validation — runs pre-release
     ╱──────╲
    ╱        ╲      L4: E2E scenarios (32 automated)
   ╱          ╲     Verification — every commit
  ╱────────────╲
 ╱              ╲   L2: Pure logic (100+ checks)
╱                ╲  L3: Event bus (30+ checks)
─────────────────────
│ L0: Static/CFG  │  Verification
│ L1: State shape │  Every commit
─────────────────────
```

Most tests are at the bottom (fast, narrow). Fewest at the top (slow, broad). All layers run on every commit.

---

## What we have today

| Level | Status | Tests | Runs on |
|---|---|---|---|
| L0 (Static/CFG) | ✅ Done | 40+ checks | Bash, <1s |
| L1 (State contract) | ❌ Missing | 0 | — |
| L2 (Pure logic) | ❌ Missing | 0 | — |
| L3 (Event bus) | 🟡 Partial | 0 (events are tested in L4 only) | — |
| L4 (E2E scenarios) | ✅ Done | 32 scenarios | Node + Playwright, 10-20s |
| L5 (Playtest) | ❌ Not formalized | Ad-hoc | Manual |

**Total automated checks today:** 40 (L0) + 32 (L4) = 72
**Target after full implementation:** 40 (L0) + 20 (L1) + 100 (L2) + 30 (L3) + 50 (L4) + manual L5 = **240+ automated checks**

---

## Implementation order

If you approve this design, here's the order I'd build them:

1. **L1 (State contract)** — 1-2 hours, catches "I forgot to add a field" bugs
2. **L2 (Pure logic)** — 4-6 hours, catches math/logic bugs at the unit level
3. **L3 (Event bus)** — 2-3 hours, catches "I forgot to subscribe" bugs
4. **L4 expansion** — 2-3 hours, add 20+ more E2E scenarios for edge cases
5. **L5 playtest script** — 1 hour, structured observation template

Total: ~15 hours of test work. The game becomes much more robust.

---

## What I am NOT going to do yet

Per your instruction, this is a **design document only**. No test code yet. The plan above is what I'd build once you approve.

Some questions to resolve before coding:

1. **L2: Where does state live during tests?**
   - Option A: Modify `state` directly (current pattern)
   - Option B: Use a test harness that creates a fresh state per test
   - Option C: Mock the Phaser dependencies (but we're already past that)

2. **L3: How do we test "no memory leak"?**
   - Option A: Count subscribers before/after, expect delta = 0
   - Option B: Run 1000 events, measure heap
   - Option C: Just check that rematch doesn't accumulate

3. **L4: How long should a full-match E2E test be?**
   - Option A: Full 180s match (3 min real time = 30s with FORCE_FAST_FORWARD)
   - Option B: 60s match (1 min real time = 6s with FORCE_FAST_FORWARD)
   - Option C: Just to a known state, not the full duration

4. **L5: How do we record playtest findings?**
   - Option A: Spreadsheet with structured questions
   - Option B: Markdown form with sections
   - Option C: Just notes from the test facilitator

---

## Next step

Your call: approve this design, request changes, or just build L1 + L2 (the most valuable additions) first.

See also:
- `01-layer-mappings.md` — detailed mapping of each level to architecture layers
- `02-test-scenarios.md` — concrete test cases for each level
- `03-coverage-matrix.md` — what each level covers and what's still untested
