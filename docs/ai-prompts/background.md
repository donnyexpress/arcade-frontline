# AI Prompt: Battlefield Background

## v1 (2026-08-19 14:36) — UNUSED
**File:** `art/background_v1.png`
**Notes:** Game screenshot feel, not clean enough.

## v2 (2026-08-19 17:08) — DEPLOYED
**File:** `art/background.png`
**Aspect ratio:** 21:9 (1920x600)
**Resolution:** 1K
**Node ID:** (lost)

**Prompt (recovered/inferred):**
> "Empty clean grass field background texture, panoramic top-down view, only grass and a few small rocks, no trees, no path, no road, no buildings, no structures, no text, no UI elements, no labels, just pure green grass terrain for a strategy game map. 16-bit pixel art style."

**Why this prompt:**
- "Empty" prevents AI from adding stuff
- "No trees, no path, no road" explicit exclusions
- "Pure green grass terrain" gives the strategy-game feel
- "16-bit pixel art" matches the unit style

**Result:** Clean grass with scattered rocks. No trees, no road, no path.

## v3 (2026-08-21 17:54) — UNUSED
**File:** `art/background_clean2.jpg`
**Notes:** Cleaner version generated later. The "no text" was critical — the AI had been adding "PLAYER 1 TURN" text to the corners.

## Background Lessons

Common AI mistakes when generating backgrounds:
- Adding "PLAYER 1 TURN" or "UNITS: 0" text in corners (model thinks it's a game screenshot)
- Adding trees, paths, or "for context" elements
- Adding buildings or vehicles
- Using photographic style when pixel art is needed

**Always add:** "no text, no UI elements, no labels, no buildings, no trees, no path"
