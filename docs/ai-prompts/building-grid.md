# AI Prompt: Building Sprite Grid (3x2)

## v1 (2026-08-19 15:24) — DEPLOYED
**File:** `art/buildings_blue_3x2.png`, `art/buildings_red_3x2.png`
**Aspect ratio:** 3:2 (3 cols × 2 rows)
**Resolution:** 1K
**Node ID:** (lost)

**Prompt (recovered/inferred):**
> "5 military building sprites in 3x2 grid: barracks (red brick roof hut), war factory (industrial shed with smokestack), tech center (satellite dish + radar), pillbox (small concrete bunker), turret (circular gun emplacement). 264x264 cells, on solid bright green chroma key background (#00FF00), 80s military aesthetic."

**Why this prompt:**
- One API call for 5 buildings
- Each building gets 1-2 visual cue words
- "Industrial shed with smokestack" distinguishes war factory from barracks
- "Solid green chroma key" for clean removal

**Result:**
- Quality: 9/10
- All 5 buildings clean and recognizable
- Red version via selective hue shift
- Some buildings have minor white border artifacts (fixed in post)

**Note:** This is a more reliable result than the unit grid. Why?
- Buildings are larger features → AI has more "ink budget" per cell
- "Industrial shed with smokestack" is more specific than "rifleman"
- "Bunker" / "turret" are more concrete than "HUMVEE"

## Cell Layout

```
3x2 grid (3 cols × 2 rows, 264x264 each):
  Row 0: [barracks] [war factory] [tech center]
  Row 1: [pillbox]   [turret]     [empty]
```

Then padded to 297x297 (with interior green 7,250,5) to match unit cells.

## Building Specifications

| Cell | Building | Visual cues | Cost | HP | Unlocks |
|---|---|---|---|---|---|
| (0,0) | barracks | red brick roof hut | 100 | 80 | rifleman, rocket, flame |
| (1,0) | war factory | industrial shed, smokestack | 150 | 100 | fsv, tank |
| (2,0) | tech center | satellite dish + radar | 250 | 100 | drone, heavy, sniper |
| (0,1) | pillbox | small concrete bunker | 75 | 120 | (defensive) |
| (1,1) | turret | circular gun emplacement | 100 | 200 | (defensive) |
| (2,1) | base | (main base, generated separately) | — | 500 | — |
