# AI Prompt: Unit Button Icons (4x2)

## v1 (2026-08-20 13:00) — DEPLOYED with edits
**File:** `art/ai_button_real.jpg` → `art/ai_button_final.png` (cropped)
**Aspect ratio:** 4:3 (1584x1188 → cropped to 4x2 grid of 360x360)
**Resolution:** 1K

**Prompt (inferred):**
> "Photographic reference sheet of 8 military units, 4x2 grid, individual backgrounds, 80s video game style with slight film grain, lo-fi look. Units: rifleman, RPG soldier, ghillie sniper, flamethrower, quadcopter drone, HUMVEE, M1 Abrams, heavy tank."

**Why this prompt:**
- 4x2 grid for button icons (vs 3x4 for in-game units)
- "Photographic" style for button visuals
- "RPG soldier" → distinctive rocket launcher
- "Ghillie sniper" → camo sniper
- "Quadcopter drone" → drone with multiple rotors
- "M1 Abrams" → specific tank model

**Result:** All 8 unit icons in 360x360 cells.

## v4 (2026-08-20 13:12) — UNUSED
**File:** `art/ai_button_v4.jpg`
**Notes:** Slightly different style, but v1 worked fine.

## Post-Processing

After generation:
1. **Crop** to 4x2 grid of 360x360 cells
2. **Cream background detection** — many cells had white/cream backgrounds (not pure white)
3. **Pad** to uniform 360x360 with black background
4. **Cover mode** rendering: `Math.max(W/img.width, H/img.height)` to fill cell

```python
# Cream background detection
mask = (r > 180) & (g > 170) & (b > 150) & (r > b)
# These pixels are NOT cream — they're the unit
```

## Cell Specifications

| Cell | Unit | Notes |
|---|---|---|
| (0,0) | rifleman | Red soldier with rifle |
| (1,0) | RPG | Red soldier with rocket launcher |
| (2,0) | ghillie | Camo sniper |
| (3,0) | flamethrower | Red soldier with flame |
| (0,1) | drone | Quadcopter with multiple rotors |
| (1,1) | HUMVEE | Military vehicle |
| (2,1) | M1 Abrams | Tank |
| (3,1) | heavy | Heavy tank |
