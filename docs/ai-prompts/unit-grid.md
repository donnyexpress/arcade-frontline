# AI Prompt: Unit Sprite Grid (3x4)

## v1 (2026-08-19 15:24) — DEPLOYED
**File:** `art/units_blue_3x4.png`, `art/units_red_3x4.png`
**Aspect ratio:** 21:9 (3 cols × 4 rows)
**Resolution:** 1K
**Node ID:** (lost — generated before tool result tracking)

**Prompt (recovered/inferred):**
> "Photographic reference sheet of 8 military units in 3x4 grid, individual backgrounds, 80s retro video game style with slight film grain, lo-fi look, on solid bright green chroma key background (#00FF00). Units: rifleman, rocket soldier, sniper, flamethrower, drone (quadcopter), fire support vehicle (HUMVEE), medium tank, heavy tank. Each unit in 297x297 cell."

**Why this prompt:**
- Single 3x4 grid = one API call instead of 8
- "Photographic reference sheet" triggers the 3x4 reference image aesthetic
- "80s retro video game style" matches Red Alert 2 inspiration
- "Slight film grain, lo-fi" gives the right level of detail
- Solid green chroma key for clean background removal

**Result:**
- Quality: 7/10 (7/8 units clean, FSV corrupted)
- ✅ Rifleman: clean red soldier with rifle
- ✅ Rocket: clean red soldier with rocket launcher
- ✅ Sniper: clean red soldier with sniper
- ✅ Flame: clean red soldier with flame
- ✅ Drone: clean red quadcopter
- ❌ **FSV: TV STATIC NOISE** (this is the famous bug)
- ✅ Tank: clean red medium tank
- ✅ Heavy: clean red heavy tank

**Followups:**
- v1.30p: FSV regenerated as photo HUMVEE (style mismatch)
- v1.30s: Reverted to red pixel HUMVEE
- v1.30t: Used "Red Alert 2 vehicle sprite" hint for better consistency

## v2 (2026-08-20 14:43) — UNUSED
**File:** `art/units_grid_v2.jpg`
**Aspect ratio:** 21:9
**Notes:** 80s video game look, more cartoony. Not used because too cartoony vs. realistic.

## v3 (2026-08-20 14:45) — UNUSED
**File:** `art/units_grid_v3.jpg`
**Aspect ratio:** 21:9
**Notes:** Less defined, more cluttered backgrounds.

## v3_clean (2026-08-20 15:49) — UNUSED
**File:** `art/units_grid_v3_clean.jpg`
**Notes:** Cleaner version of v3. Not used.

## v4 (2026-08-20 16:04) — UNUSED
**File:** `art/units_grid_v4.jpg`
**Aspect ratio:** 21:9
**Notes:** Photo-realistic style, but inconsistent with deployed v1 pixel art.

## v1.30t FSV Regeneration (2026-08-22 02:30) — DEPLOYED
**File:** `art/units_blue_3x4_v6.png` (modified FSV cell)
**Aspect ratio:** 1:1
**Resolution:** 1K

**Prompt:**
> "Single US military HUMVEE fire support vehicle with mounted machine gun, side view facing right, 16-bit pixel art style with slight film grain, 80s retro video game look, similar style to Red Alert 2 vehicle sprites. Isolated on solid bright green chroma key background (#00FF00). Sharp pixel edges, clean lines, retro military game aesthetic."

**Result:** Beautiful pixel art HUMVEE in matching style.

## Pixel Art Tips

When generating pixel art for chroma key:
- ✅ Specify "16-bit pixel art" or "8-bit pixel art"
- ✅ Specify "sharp pixel edges" (no anti-aliasing)
- ✅ Specify "clean lines"
- ❌ Don't say "photorealistic" — produces noise on small areas
- ❌ Don't say "retro pixel art game" alone — too vague

## Chroma Key Color

Always specify the EXACT background color: `solid bright green chroma key background (#00FF00)`

Different colors have different chroma key behaviors:
- `#00FF00` (pure green) — most reliable, built-in tools work
- `#000000` (black) — confuses with dark unit details
- Cyan/blue — needs special handling
