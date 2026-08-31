# AI Defense-First Strategy — Analysis

**Date:** 2026-08-31
**Author:** Mavis
**Status:** Awaiting user approval
**Feature:** AI builds pillbox (defense) first, then barracks, then more defense
**Decision doc:** `docs/decisions/ai-defense-first.md` (math + prompts already done)

## Impact

- **5 files** (`index.html`, `.test/l2_logic.js`, `.test/l4_e2e.js`, `.test/l5_playtest.js`, `.test/personas/_cfg.js`)
- **~50 LoC** of `autoAIBuild` + `updateAI` logic change
- **5 tests** to update (L2:1, L4:2, L5:1, persona cfg:1)
- **0 new files**, **0 art changes**

## Plan

### 1. Change AI build order in `index.html`

**Current order (line 2093):**
```js
if (t >= 10 && !hasActiveBarracks && blueCreds >= CFG.BARRACKS_COST) {
  placeBuilding('blue', 'barracks');
}
```

**New order (defense-first):**
```js
// t >= 5: build first pillbox (75 credits) — even cheaper than barracks (100)
if (t >= 5 && pillboxCount === 0 && blueCreds >= CFG.PILLBOX_COST) {
  placeTurret('blue', 'pillbox');
  return;
}
// t >= 12: build second pillbox once we have 1
if (pillboxCount === 1 && t >= 12 && blueCreds >= CFG.PILLBOX_COST) {
  placeTurret('blue', 'pillbox');
  return;
}
// t >= 15: build barracks once we have 2 pillboxes
if (pillboxCount >= 2 && t >= 15 && !hasActiveBarracks && blueCreds >= CFG.BARRACKS_COST) {
  placeBuilding('blue', 'barracks');
  return;
}
// existing warfactory/techcenter logic continues below
```

### 2. AI unit composition

After building barracks, AI should produce:
- 70% rifleman (cheap, hold ground)
- 20% rocket (anti-vehicle if enemy builds vehicles)
- 10% sniper (long range defense)

Current logic (line 2111+) already picks rocket when player has tanks. Add sniper as a small fraction.

### 3. Pillbox placement

`placeTurretOnMap` already places near base. Verify in test that pillbox lands within range of the base (so it covers the entrance).

## Test Matrix

| Test | What it verifies | Currently | Will need to change |
|------|------------------|-----------|---------------------|
| **L2** `AI builds barracks when affordable` | AI builds barracks after t=10 | PASS | Change to: AI builds **pillbox** first |
| **L4 S6** `AI builds barracks` (4s timeout) | AI builds barracks in 4s | PASS | Change to: AI builds **pillbox** in 4s |
| **L4 S7** `AI builds units` (60s timeout) | AI builds units after barracks | PASS | Change to: AI builds pillbox → barracks → units, may need 90s timeout |
| **L5 Turtle** | Turtle builds 2+ buildings in 30s | FAIL (only 1) | Should now PASS (defense structures count) |
| **L5 Rusher** | Rusher wins decisively | PASS | Should still pass (rush should beat defense) |
| **L5 Idle** | AI beats idle player | PASS | Should still pass (AI defense holds vs idle) |
| **persona _cfg.js** | Mirrors CFG | - | No change to CFG values needed |

**New test (add to L2):**
- `AI builds pillbox first when affordable` — verifies priority order
- `AI builds 2 pillboxes before barracks` — verifies both defenses placed first

## Save Path

**Files to modify:**

1. `/workspace/index.html` (lines 2093-2104) — change AI build priority
2. `/workspace/.test/l2_logic.js` (line 330) — update "AI builds barracks" test
3. `/workspace/.test/l4_e2e.js` (lines 114-128) — update S6 to check pillbox
4. `/workspace/.test/l4_e2e.js` (line 137) — S7 timeout 60s → 90s
5. `/workspace/.test/l5_playtest.js` — update Turtle expectation to allow pillbox

**Files NOT to modify:**
- `.test/personas/_cfg.js` — CFG values unchanged
- `art/*` — no art changes needed
- `docs/decisions/ai-defense-first.md` — already exists, no update needed

## Risks

1. **AI could deadlock if `placeTurret` fails** — same bug we fixed for `placeBuilding` (saved for war factory, needed 160, only had 150). Need to verify pillbox can always be placed when affordable.
2. **Defense too strong → Rusher loses** — L5 Rusher persona will tell us. If Rusher now loses, reduce pillbox to 1 or increase rusher strength.
3. **Defense too weak → still Rusher wins** — L5 Idle persona will tell us. If idle still wins easily, build 3 pillboxes.

## Verification steps (post-implementation)

1. Run `bash .test/run_all.sh` — all 6 levels should pass
2. L5 balance report — Rusher should still win; Turtle should now have pillbox(es)
3. Visually check: `python3 -m http.server 8080` + screenshot at t=20s
4. Commit: `feat(ai): defense-first build order (pillbox x2 → barracks)`
