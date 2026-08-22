# Scenario Test Findings — 2026-08-22

**Tester:** Mavis
**Test file:** `/.test/scenario_robust.js` (32 scenarios)
**Verdict:** All 32 scenarios pass after 3 bug fixes

## Bugs found and fixed

### 🐛 Bug #1: Game time runs slow in low-FPS environments

**Symptom:** After 15 seconds of wall time, only 3.3 seconds of game time elapsed (22% real-time speed).

**Root cause:** `loop()` capped dt at 50ms:
```javascript
const dtMs = lastT ? Math.min(50, t - lastT) : 16;
```

When frame rate drops (4 FPS in headless test), each frame takes >50ms but only 50ms of game time is advanced.

**Fix:** Raised cap to 250ms. Added `window.FORCE_FAST_FORWARD` flag for tests that need 1s per frame.

**Impact:** A 3-minute match now takes 3 minutes regardless of frame rate.

**Commit:** part of `c4d9a1e`

---

### 🐛 Bug #2: placeTurret had dead-code check

**Symptom:** Line 1926 had `if (!canBuild(side, 'barracks')) return false;` but `canBuild('barracks')` always returns `true`. The check was a no-op.

**Fix:** Removed the dead-code check, added a comment explaining the correct behavior.

**Commit:** part of `c4d9a1e`

---

### 🐛 Bug #3: Rematch left no event subscribers (regression from event bus refactor)

**Symptom:** After clicking "Rematch", base sprites were not recreated. Event bus was cleared but no one re-subscribed.

**Root cause:** My event bus refactor (#4826c72) added `clearEvents()` before `emit('match:restart')`. But Phaser's `create()` only runs ONCE per scene, so it doesn't re-register handlers. The event fired into the void.

**Fix:** Call `scene.registerEventHandlers()` from `initGame()` to re-subscribe on rematch. Made `registerEventHandlers()` idempotent (uses `_handlersRegistered` flag).

**Commit:** part of `c4d9a1e`

---

## What works correctly

- ✅ Initial state: 200 credits, 500 HP, 2 base sprites
- ✅ placeBuilding queues + emits + spawns sprite
- ✅ spawnUnit creates unit + sprite + emits event
- ✅ placeTurret queues + emits + spawns sprite (no longer has dead-code check)
- ✅ Event bus fires correct events with correct payloads
- ✅ match:restart correctly resets state and re-registers handlers
- ✅ AI builds barracks, war factory, then units
- ✅ Passive income correctly adds 6/s
- ✅ End screen shows on base HP=0
- ✅ Game time advances at real-time rate (or 1s/frame in fast-forward mode)

## How to run the test

```bash
# Fast test (uses FORCE_FAST_FORWARD = 1s per frame)
NODE_PATH=/usr/local/lib/node_modules node .test/scenario_robust.js

# Output: 32/32 passing
```

## What this catches

The 32-scenario suite validates:

1. **Initial state** — credits, HP, sprites, time
2. **Building placement** — queue, sprites, events
3. **Unit spawning** — units, sprites, events
4. **Turret placement** — pillbox, sprites, events
5. **Time progression** — game time advances correctly
6. **AI building** — barracks in queue, then buildings, then units
7. **AI unit production** — units spawn after barracks active
8. **Match end** — base HP=0 → end screen
9. **Rematch** — state reset, sprites recreated
10. **Post-rematch AI** — AI still works after rematch
