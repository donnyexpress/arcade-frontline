# Documentation Code Audit — 2026-08-22

**Auditor:** Mavis
**Scope:** `docs/` (24 files) vs `index.html` (3582 lines)
**Method:** Line-by-line comparison of `CFG` constants and key logic
**Verdict:** **Documentation DRIFT** — 14 discrepancies, 3 critical

---

## Critical Discrepancies (need immediate fix)

### C1. Turret cost mismatch

| Source | Value |
|---|---|
| `docs/design-document.md` | 100 |
| `docs/decisions/economy-balance.md` | (not specified) |
| `docs/adr/0004-tabbed-columns.md` | (not specified) |
| **`index.html` line 1297** | **`TURRET_COST: 150`** |

**Authoritative:** `index.html` (code is what players see). Doc says 100, but in-game cost is 150.
**Fix:** Update `design-document.md` to 150. Add cross-reference to `CFG.TURRET_COST`.

### C2. Sniper cost mismatch

| Source | Value |
|---|---|
| `docs/design-document.md` | 35 |
| **`index.html` line 1309** | **`sniper: { ..., cost: 50, ... }`** |

**Fix:** Doc says 35, code says 50. Update doc to 50.

### C3. Drone cost mismatch

| Source | Value |
|---|---|
| `docs/design-document.md` | 40 |
| **`index.html` line 1310** | **`drone: { ..., cost: 60, ... }`** |

**Fix:** Doc says 40, code says 60. Update doc to 60.

---

## High-Impact Discrepancies (should fix)

### H1. Unit stat drift (multiple)

| Unit | Field | Doc | Code |
|---|---|---|---|
| Rocket | HP | 25 | 20 |
| Rocket | DMG | 18 | 12 |
| Rocket | RNG | 120 | 200 |
| Rocket | SPD | 0.5 | 60 (px/s) |
| Flamethrower | HP | 30 | 35 |
| Flamethrower | DMG | 12 | 18 |
| Flamethrower | RNG | 60 | 100 |
| Sniper | HP | 18 | 25 |
| Sniper | RNG | 200 | 400 |
| Sniper | SPD | 0.4 | 40 |
| Drone | SPD | 0.8 | 110 |
| Heavy Tank | HP | 200 | 180 |
| Heavy Tank | DMG | 40 | 22 |
| Heavy Tank | cost | 100 | 80 |

**Root cause:** Doc was written early in design, code has been tuned.
**Fix:** Replace doc unit table with values from `CFG.UNITS`. The code IS the source of truth.

### H2. BUILDINGS_UNLOCK vs *_UNITS arrays

Two parallel data structures exist:
```javascript
CFG.BUILDINGS_UNLOCK = {
  barracks:   { unlocks: ['rifleman', 'rocket', 'flame'] },     // matches
  warfactory: { unlocks: ['fsv', 'tank', 'sniper'] },            // has sniper
  techcenter: { unlocks: ['heavy'] },                            // MISSING drone, sniper
};
CFG.BARRACKS_UNITS = ['rifleman', 'rocket', 'flame'];             // matches barracks
CFG.WARFACTORY_UNITS = ['fsv', 'tank'];                          // doesn't include sniper
CFG.TECHCENTER_UNITS = ['drone', 'heavy', 'sniper'];              // 3 units
```

**Conflict:** 
- `isUnitUnlocked()` uses `*_UNITS` arrays
- `BUILDINGS_UNLOCK` is unused (no grep hits beyond definition)
- Sniper is unlocked by BOTH warfactory (per BUILDINGS_UNLOCK) AND techcenter (per TECHCENTER_UNITS)
- BUILDINGS_UNLOCK is **dead code** with stale data

**Fix:** Either:
- (A) Remove `BUILDINGS_UNLOCK` entirely — it's misleading and unused
- (B) Make `BUILDINGS_UNLOCK` the single source of truth and derive `*_UNITS` from it

**Recommendation:** Option A. Single source of truth is `CFG.BARRACKS_UNITS/WARFACTORY_UNITS/TECHCENTER_UNITS`. Remove `BUILDINGS_UNLOCK` to prevent future drift.

### H3. Undocumented constants

The code has constants not mentioned in any doc:

| Constant | Value | Doc coverage |
|---|---|---|
| `KILL_BOUNTY` | 0.25 | ❌ Not documented |
| `MATCH_TIME` | 180 (3 min) | Partial (says "2-3 min") |
| `PROD_MULT` | [1, 1.0, 1.4, 1.7, 2.0, 2.2, 2.4, 2.55, 2.7, 2.8, 2.9] | ❌ Not documented |
| `PILLBOX_DMG` | 12 | ❌ Not documented |
| `PILLBOX_RANGE` | 250 | ❌ Not documented |
| `TURRET_DMG` | 22 | ❌ Not documented |
| `TURRET_RANGE` | 350 | ❌ Not documented |
| `BUILD_TIME` | 5 | ❌ Not documented |
| `MAX_TURRET_SLOTS` | 20 | ✅ Documented |

**Fix:** Add a "Tuning Numbers" section to `design-document.md` that links to `CFG`.

---

## Medium-Impact Discrepancies

### M1. Speed unit confusion

| Source | Units | Examples |
|---|---|---|
| Doc | "Speed" (dimensionless, 0.4-0.8) | "Sniper 0.4" |
| Code | "Speed" (px/s, 30-110) | "sniper speed: 40" |

**Fix:** Document uses one unit, code uses another. Update doc to px/s and include the actual numbers.

### M2. FSV naming

| Source | Name | Vehicle type |
|---|---|---|
| Doc | FSV (HUMVEE) | HUMVEE |
| Code | `fsv: { name: 'Fire Support' }` | (name is generic) |

**Fix:** Code uses generic "Fire Support", doc specifies HUMVEE. Align: either change code `name: 'HUMVEE'` or accept that "Fire Support Vehicle" is the formal name.

### M3. Tab contents

| Source | INF tab | VEH tab |
|---|---|---|
| Code | rifleman, rocket, sniper, flame | drone, fsv, tank, heavy |
| Doc | (not specified) | (not specified) |

**Fix:** Doc doesn't specify tab contents. Add a "UI Organization" section.

---

## Low-Impact Discrepancies (nice to fix)

### L1. Building HP in code but unit HP also in code

The `BARRACKS_HP: 80, WARFACTORY_HP: 100, TECHCENTER_HP: 100` are documented. Good.

### L2. BUILD_TIME is 5s per building (constant) but production time per unit is per-unit

`CFG.UNITS.*.build` is the per-unit production time (1.5-6.0 seconds). Documented inconsistently.

### L3. KILL_BOUNTY of 0.25 means killing an enemy gives 25% of their cost as credits

This is a key economy mechanic. Not documented. Should be in `decisions/economy-balance.md`.

---

## What's CORRECT (good job!)

✅ `STARTING_CREDITS: 200` (matches doc)
✅ `PASSIVE_INCOME: 6` (matches doc)
✅ `SOFT_CAP: 500` (matches doc)
✅ `MAX_BUILDINGS: 10` (matches doc)
✅ `MAX_QUEUE: 4` (matches doc)
✅ `MAX_TURRET_SLOTS: 20` (matches doc)
✅ Drone `suicide: true` (matches doc)
✅ Drone `BLAST_RADIUS: 60, BLAST_DMG: 50` (matches doc)
✅ `AI_DECISION_INTERVAL: 0.5` (matches doc)
✅ Pillbox / Turret HP and costs (mostly)
✅ Perimeter turret placement arc 290-396px (matches doc)

---

## Recommended Action Plan

### Phase 1: Critical (today)
1. Fix C1, C2, C3 (turret, sniper, drone costs)
2. Add cross-references from docs to `CFG.*` in code comments

### Phase 2: High (this week)
3. Replace doc unit table with values from `CFG.UNITS`
4. Remove dead code `BUILDINGS_UNLOCK`
5. Add "Tuning Numbers" section to design doc

### Phase 3: Medium (next sprint)
6. Document all `CFG.*` constants in one place
7. Document KILL_BOUNTY mechanic
8. Add UI organization section (tabs)
9. Standardize speed unit (px/s)

### Phase 4: Long-term
10. Add doc-code consistency check to CI
11. Make `CFG` self-documenting (e.g., add `CFG.UNITS.rifleman.desc = "cheap, fast"`)

---

## Lessons

1. **Docs written early DRIFT** — they capture intent, but code gets tuned
2. **Multiple data structures for same thing is risky** — `BUILDINGS_UNLOCK` vs `*_UNITS` would have caused bugs
3. **Constants should be self-documenting** — `speed: 90` is fine; `speed: 0.6` is unclear
4. **Doc-code consistency check is essential** — without it, drift is inevitable

## References

- `index.html` line 1279: `const CFG = { ... }`
- `index.html` line 1330: `BUILDINGS_UNLOCK: { ... }` (dead code)
- `index.html` line 1450: `function isUnitUnlocked(side, unitKey)`
- `docs/design-document.md` Unit Roster section
- `docs/decisions/building-prerequisites.md` Tech Center section
