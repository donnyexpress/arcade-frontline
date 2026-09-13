# Screenshot Fixes — Analysis

**Date:** 2026-09-13
**Author:** Mavis
**Status:** Approved (per user "tackle all and check again")
**Source screenshot:** `.test/snap_ai_realtime.png` (defense-first AI at t=2:33)

## Impact

- **4 distinct issues** to fix in `index.html`
- **1 file modified**, **~80 LoC** of changes
- **0 new files**, **0 art changes**
- **0 tests added** (visual fix — manual verification via screenshot)

## Issues to fix

### 1. "TAP BARRACKS TO BEGIN" hint is misleading

**Current:** Line 542 shows `TAP BARRACKS TO BEGIN →`
**Problem:** Player can't tap the barracks on the map. Player must use sidebar buttons. Also: with defense-first AI, player should build defenses first.

**Fix:**
- Change hint to `TAP PILLBOX (75💰) TO BEGIN DEFENSE →`
- Hide hint when player has 1+ pillbox OR barracks queued

### 2. No HP bars on units/buildings

**Current:** Only bases have HP bars (top corners).
**Problem:** Riflemen, pillboxes, barracks have no visible HP. Player can't tell if anything is damaged.

**Fix:** Add small HP bar above each unit/building. Already have `hp` and `maxHp` in state.

### 3. Pillboxes stacked at same position

**Current:** Both pillboxes at x=1540, y=120 and y=182 (only 60px apart).
**Problem:** They overlap in defensive coverage. Should spread along perimeter.

**Fix:** `placeTurretOnMap` already loops through 8 perimeter slots. The issue is the AI only builds pillbox #1 (slot 0) and #2 (slot 1) which happen to be close. Fix: AI builds with explicit slot indices — pillbox #1 = slot 0, pillbox #2 = slot 4 (spread).

Better fix: change `placeTurretOnMap` to use `turretQueue.length` as slot index, OR have AI specify slot.

Actually the simpler fix: change the slot assignment to use the position in the queue, so each new pillbox gets a different slot.

### 4. Empty vehicle buttons visible

**Current:** Right sidebar shows "INF 4 / VEH 4" tabs. VEH tab buttons are visible but unlocked vehicles aren't built.
**Problem:** VEH buttons should be grayed out until player has war factory.

**Fix:** Already exists: `.action-btn.locked` class with gray styling. Check if `updateActionBtnStates` applies `.locked` class to vehicle buttons when no war factory exists.

Looking at code: line 3131 has `disabled` class for affordability, but `locked` is for prereqs (line 3183 area).

## Plan

### Step 1: Fix hint text and hide condition
File: `index.html`, line 542 + 2952
```js
// Line 542: change to "TAP PILLBOX (75💰) TO BEGIN DEFENSE →"
// Line 2952: hide when player has pillbox or barracks
const hintEl = document.getElementById('tutorial-hint');
if (hintEl && (
  state.sides.red.buildingQueue.length > 0 ||
  state.sides.red.buildings.length > 0 ||
  state.sides.red.turretQueue.length > 0 ||
  state.sides.red.turrets.length > 0
)) {
  hintEl.classList.add('hidden');
}
```

### Step 2: Add HP bars to units/buildings
Find where sprites are drawn for units and buildings. Add a thin HP bar overlay above each.
```js
// In the unit/building draw function:
if (sprite.hp !== sprite.maxHp) {
  const barWidth = 30;
  const barHeight = 3;
  const x = sprite.x - barWidth / 2;
  const y = sprite.y - sprite.height / 2 - 8;
  // Draw red background
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(x, y, barWidth, barHeight);
  // Draw green fill
  const pct = sprite.hp / sprite.maxHp;
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(x, y, barWidth * pct, barHeight);
}
```

### Step 3: Spread pillboxes
File: `index.html`, in `placeTurretOnMap`
```js
// Use turretQueue.length (or actual position) to spread
const slotIndex = (sideData.turrets.length + sideData.turretQueue.length) % 8;
```

### Step 4: Locked button styling
Already exists. Verify by adding explicit check for war factory → vehicle buttons.

## Test Matrix

| What to verify | How |
|----------------|-----|
| Hint text says "TAP PILLBOX" | Visual screenshot |
| Hint hides when player builds | Take screenshot at t=10s after player builds |
| HP bars show on damaged units | Take screenshot of damaged unit |
| Pillboxes spread out | Take screenshot at t=15s |
| Vehicle buttons grayed when no war factory | Visual check |

## Save Path

- `/workspace/index.html` — all changes
- `/workspace/.test/index_test.html` — sync copy
- `/workspace/.test/snap_ai_realtime_after.png` — new screenshot for verification

## Risks

- HP bar drawing might affect performance if many units
- Spreading pillboxes changes defense layout (might be weaker)
- Locked button styling already exists, but might not be applied

## Verification

1. Run L0-L5 V&V tests — must still pass
2. Take new screenshot at t=20s with all fixes
3. Visually compare against original `.test/snap_ai_realtime.png`
