# Scenario Test Skill

A reproducible scenario test for the Arcade Frontline game that catches regressions in the game loop, event bus, and AI.

## When to use this

- After any change to `index.html`
- After any change to event handlers
- After any change to AI logic
- After any change to building/unit placement
- Before deploying to GitHub Pages

## Quick start

```bash
# Run the test (must use NODE_PATH for global playwright)
NODE_PATH=/usr/local/lib/node_modules node .test/scenario_robust.js

# Expected: 32/32 scenarios pass
```

## How it works

The test uses **headless Chromium with a local copy of Phaser** (not the CDN). It:

1. Loads the test HTML with local phaser.min.js
2. Injects `window.FORCE_FAST_FORWARD = true` BEFORE the page loads
3. Runs 32 scenarios in sequence
4. Reports pass/fail for each

### FORCE_FAST_FORWARD mode

By default, the game loop uses real time (capped at 250ms per frame). In test mode, `FORCE_FAST_FORWARD` makes the game advance 1 second per frame, regardless of actual frame time.

This means:
- BUILD_TIME (5s) completes in 5 frames
- MATCH_TIME (180s) completes in 180 frames
- A 32-scenario test takes ~10-20 seconds instead of 5-10 minutes

## What it catches

| Bug type | How it's caught |
|---|---|
| Event bus broken | Scenarios check for `unit:spawned`, `building:placed`, etc. events |
| State reset broken | Scenario 9 checks rematch resets all values |
| AI logic broken | Scenarios 6, 7, 10 watch AI build queue |
| Race conditions | Scenarios run in real order, catch init/cleanup races |
| Render layer disconnected | Scenarios check sprite counts match state counts |

## Adding new scenarios

Edit `.test/scenario_robust.js` and add:

```javascript
// === SCENARIO N: Description ===
section('SCENARIO N: Description');
// ... assertions ...
assert(condition, 'What this checks');
```

Then run the test to verify your scenario works.

## Files

- `.test/scenario_robust.js` — 32-scenario test
- `.test/scenario_v3.js` — earlier 10-scenario test (kept for reference)
- `.test/phaser.min.js` — local Phaser 3.80.1
- `.test/index_test.html` — game HTML with local Phaser reference

## Maintenance

- Keep the test count above 30 — covers most regressions
- If you change CFG values, update the assertions
- If you add new game features, add at least one scenario for them
