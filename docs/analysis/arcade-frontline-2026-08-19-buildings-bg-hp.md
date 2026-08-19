# Arcade Frontline — Buildings, Background, Health Bars, Drone (2026-08-19)

## Impact

- AI-generate building sprites (5 types: barracks/war factory/tech center/pillbox/turret)
- AI-generate improved battlefield background
- Add HP bars to unit sprites (Phaser overlay)
- Add drone to Tech Center production
- Re-anchor unit feet to ground baseline

## Plan

### 1. Building AI generation
- Same workflow as units: image_synthesize with reference to existing building atlas
- Prompt: barracks (red brick roof hut), war factory (industrial shed with smokestack), tech center (satellite dish + radar), pillbox (small concrete bunker), turret (circular gun emplacement)
- Layout: 3×2 grid (3 cols × 2 rows) of 264×264 cells
- Save to art/buildings_3x2.png

### 2. Building crop + pad
- Trim 3px borders per cell
- Pad to 297×297 square using interior green (7,250,5)
- Save 8 files (5 buildings × blue + red)

### 3. Generate red buildings
- Apply same selective blue→crimson hue shift

### 4. Assemble 3×2 grids (blue + red)
- Same 891×594 layout pattern as units

### 5. Update unit previews on buttons
- drawUnitToButton already uses 3x4 image
- No change needed unless button art needs the new crimson — re-verify

### 6. Health bars on units
- Add a `healthBar` Phaser Graphics object per unit
- Draw above the unit sprite (y = unit.y - baseScale * 264 * 0.5)
- Width proportional to hp/maxHp, height ~4px
- Color: green > 50%, yellow 25-50%, red < 25%
- Update in sync loop, redraw on damage

### 7. Drone from Tech Center
- Move `drone` from WARFACTORY_UNITS to TECHCENTER_UNITS
- Update TECHCENTER_UNITS to: ['drone', 'heavy', 'sniper']
- WARFACTORY_UNITS: ['fsv', 'tank']
- Update spawnUnit isInfantry/isHeavy logic if needed

### 8. Ground-anchor units
- Each unit's displaySize varies (70-100 for infantry, 80-100 for tanks)
- Currently sprite is centered on y; need to anchor at feet
- Add `footYOffset` per unit type: where the feet are in the sprite (typically 80-90% from top)
- When making sprite: `sprite.y = unitY - (spriteHeight * (1 - footAnchor))`
- Or compute: `sprite.setOrigin(0.5, footAnchor)` where footAnchor is e.g. 0.85

### 9. New background
- AI-generate: top-down battlefield with green grass texture, blue river or dirt paths, no UI elements
- Tile it across the map (1920×600)
- Use as scene background instead of solid color

## Test Matrix

| Change | Test | Expected |
|---|---|---|
| Buildings | AI gen, crop, pad | 5 buildings at 297×297, no borders |
| Building buttons | Click each | Correct building preview |
| Health bars | Spawn unit, deal damage | Bar visible above sprite, color matches HP |
| Drone from TC | Click drone, build tech center | Drone spawns |
| Ground anchor | Compare infantry vs tank vertical position | All units appear to stand on same line |
| Background | Visual check | New image renders, no UI conflict |

## Save Path

- New art: art/buildings_3x2.png + art/buildings_red_3x2.png
- Embedded base64 in index.html: ATLAS_B64_BUILDINGS_BLUE, ATLAS_B64_BUILDINGS_RED
- HP bar: new `healthBar` field on each unit, rendered in scene update loop
- Drone config: CFG.WARFACTORY_UNITS / CFG.TECHCENTER_UNITS
- Foot anchor: new CFG.UNIT_FOOT_ANCHOR map
- Background: replaces `makeBackground()` ground colors
