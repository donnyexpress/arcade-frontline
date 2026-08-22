# Tuning Numbers — The Single Source of Truth

**Date:** 2026-08-22
**Purpose:** Document every constant in `CFG` and link to where it's used
**Audience:** Anyone wanting to balance the game

> **This is the canonical reference.** If you change a number in `index.html`, update this file. If you change a number in this file, the code uses it. There is one source of truth.

---

## Map Dimensions

| Constant | Value | Where used | Notes |
|---|---|---|---|
| `MAP_WIDTH` | 1920 | `worldToScreen`, `placeBuilding` | Total horizontal pixels |
| `MAP_HEIGHT` | 600 | Same | Total vertical pixels |
| `BASE_HP` | 500 | `createSide`, `endMatch` | Main base hit points |

---

## Economy

| Constant | Value | Where used | Notes |
|---|---|---|---|
| `STARTING_CREDITS` | 200 | `createSide` | Player starts with 200 |
| `PASSIVE_INCOME` | 6 | `updateAI`, `updateBuildings` | 6 credits/second per side |
| `KILL_BOUNTY` | 0.25 | (combat code) | Kill reward = 25% of unit cost |
| `SOFT_CAP` | 500 | `updateEconomy` | Excess credits feel wasteful |
| `MATCH_TIME` | 180 | `endMatch` | 3-minute match duration |

**Documentation note:** `KILL_BOUNTY` was undocumented before this audit. It's a key economy mechanic.

---

## Buildings (Production + Defenses)

### Barracks
| Constant | Value | Notes |
|---|---|---|
| `BARRACKS_COST` | 100 | |
| `BARRACKS_HP` | 80 | |

### War Factory
| Constant | Value | Notes |
|---|---|---|
| `WARFACTORY_COST` | 150 | |
| `WARFACTORY_HP` | 100 | |

### Tech Center
| Constant | Value | Notes |
|---|---|---|
| `TECHCENTER_COST` | 250 | |
| `TECHCENTER_HP` | 100 | |

### Pillbox (defense)
| Constant | Value | Notes |
|---|---|---|
| `PILLBOX_COST` | 75 | |
| `PILLBOX_HP` | 120 | |
| `PILLBOX_DMG` | 12 | Damage per attack |
| `PILLBOX_RANGE` | 250 | Attack range in pixels |

### Turret (defense)
| Constant | Value | Notes |
|---|---|---|
| `TURRET_COST` | 150 | (doc previously said 100 — wrong) |
| `TURRET_HP` | 200 | |
| `TURRET_DMG` | 22 | |
| `TURRET_RANGE` | 350 | |

---

## Unit Roster (8 units)

All stats from `CFG.UNITS` in `index.html` line 1296.

| Unit | Cost | HP | DMG | Range | Speed | Build | Special |
|---|---|---|---|---|---|---|---|
| rifleman | 10 | 20 | 4 | 60 | 90 | 1.5s | cheap, fast |
| rocket | 25 | 20 | 12 | 200 | 60 | 2.5s | splash damage |
| flame | 30 | 35 | 18 | 100 | 55 | 3.0s | cone attack |
| fsv | 35 | 50 | 12 | 120 | 95 | 3.0s | HUMVEE scout |
| tank | 40 | 80 | 15 | 140 | 45 | 4.0s | medium |
| sniper | 50 | 25 | 30 | 400 | 40 | 4.5s | long range |
| drone | 60 | 15 | 50 | 80 | 110 | 3.5s | **suicide: true**, 60px AoE |
| heavy | 80 | 180 | 22 | 140 | 30 | 6.0s | slow, tanky |

**Speed unit:** pixels per second (px/s). The doc previously used dimensionless 0.4-0.8 which was unclear.

**Drone AoE:** `BLAST_RADIUS: 60`, `BLAST_DMG: 50` (hardcoded in `updateUnit`, not in CFG).
**Recommendation:** Move to `CFG.DRONE.BLAST_RADIUS` and `CFG.DRONE.BLAST_DMG`.

---

## Production Multiplier (per active building)

`PROD_MULT: [1, 1.0, 1.4, 1.7, 2.0, 2.2, 2.4, 2.55, 2.7, 2.8, 2.9]`

| Active Buildings | Multiplier |
|---|---|
| 0 | 1.0 |
| 1 | 1.0 |
| 2 | 1.4 |
| 3 | 1.7 |
| 4 | 2.0 |
| 5 | 2.2 |
| 6 | 2.4 |
| 7 | 2.55 |
| 8 | 2.7 |
| 9 | 2.8 |
| 10 | 2.9 |

**Effect:** Each unit's `build` time is divided by the multiplier. More buildings = faster production.

**Documentation note:** This was undocumented before this audit.

---

## Build Order (Tech Tree)

```
                ┌──────────────┐
                │  Main Base   │ (free)
                └──────┬───────┘
                       │ requires: null
                ┌──────▼───────┐
                │   Barracks   │ cost: 100
                └──────┬───────┘
                       │ requires: barracks
                ┌──────▼───────┐
                │ War Factory  │ cost: 150
                └──────┬───────┘
                       │ requires: warfactory
                ┌──────▼───────┐
                │ Tech Center  │ cost: 250
                └──────────────┘

  (no prereq) Pillbox (75)  Turret (150)
```

**Defenses have no tier requirement** — can be built from the start.

---

## Unit Gating (which building unlocks which units)

```javascript
BARRACKS_UNITS:   ['rifleman', 'rocket', 'flame']     // basic infantry
WARFACTORY_UNITS: ['fsv', 'tank']                      // basic vehicles
TECHCENTER_UNITS: ['drone', 'heavy', 'sniper']         // advanced units
```

**Note:** `BUILDINGS_UNLOCK` in the code is **dead code** (per audit H2). Single source of truth is the `*_UNITS` arrays.

---

## Limits

| Constant | Value | Notes |
|---|---|---|
| `BUILD_TIME` | 5 | Seconds to build any production building |
| `MAX_TURRET_SLOTS` | 20 | Per side |
| `MAX_QUEUE` | 4 | Units queued per building |
| `MAX_BUILDINGS` | 10 | Production + defense per side |

---

## AI

| Constant | Value | Notes |
|---|---|---|
| `AI_DECISION_INTERVAL` | 0.5 | AI re-evaluates every 0.5s |

**AI States:** save, defend, push, emergency
**AI always builds:** via `autoAIBuild()`

---

## UI Tabs

```javascript
UNIT_TABS = {
  inf: ['rifleman', 'rocket', 'sniper', 'flame'],
  veh: ['drone', 'fsv', 'tank', 'heavy']
};
```

**Note:** Sniper is in the INF tab even though it's a long-range single-target unit. The split is by *visual* (infantry vs vehicle) not by *role*.

---

## Drone (special)

```javascript
CFG.DRONE = {
  BLAST_RADIUS: 60,    // pixels
  BLAST_DMG: 50,       // base damage at center
  FALLOFF_MIN: 0.5,    // damage at edge is 50% of base
};
```

Formula: `damage = BLAST_DMG * (1 - (dist / BLAST_RADIUS) * (1 - FALLOFF_MIN))`
- At distance 0: 100% damage
- At distance = BLAST_RADIUS: 50% damage
- Beyond: no damage

Used in `updateUnit` for both unit-on-unit and unit-on-structure suicide attacks.

---

## Perimeter Turret Layout

```javascript
CFG.TURRET_PLACEMENT = {
  PERIMETER_OFFSET:   290,    // distance from base center
  PERIMETER_Y_START:  120,    // top of perimeter arc
  PERIMETER_Y_END:    560,    // bottom of perimeter arc
  PERIMETER_SLOT_GAP: 60,     // vertical spacing (zigzag depth = half this)
  COOLDOWN:           1.0,    // seconds between turret shots
};
```

**8 slots in a zigzag arc** at 290-350px from the base center. Even slots at base+PERIMETER_OFFSET, odd slots at base+PERIMETER_OFFSET+PERIMETER_SLOT_GAP/2 (zigzag).

---

## Targeting Score (smart targeting)

All weights in `CFG.TARGETING`. Two functions: `findNearestEnemy` (unit-vs-unit) and `findEnemyBaseTarget` (unit-vs-building).

```javascript
CFG.TARGETING = {
  // findNearestEnemy (unit-vs-unit)
  ATTACKING_ME_BONUS:       500,    // +500 if enemy is attacking me
  ATTACKING_FRIENDLY_BONUS: 100,    // +100 if enemy is attacking a nearby friendly
  FRIENDLY_NEARBY_RADIUS:   200,    // pixels
  LOW_HP_WEIGHT:            0.5,    // multiplier on (50 - target.hp)
  LOW_HP_REF_HP:            50,     // HP at which low-HP bonus = 0

  // findEnemyBaseTarget (unit-vs-building)
  PRODUCTION_BONUS:         200,    // +200 for barracks/warfactory/techcenter
  LOW_BUILDING_HP_WEIGHT:   0.5,    // multiplier on (200 - building.hp)
  LOW_BUILDING_HP_REF:      200,    // HP at which low-HP bonus = 0
  BASE_PROXIMITY_BONUS:     500,    // base score offset (closer = higher)

  // updateTurrets
  TURRET_BASE_TERRITORY_BONUS: 50,  // +50 for any unit in turret range
};
```

**Higher score = better target** (opposite of what was originally documented).

**Effective formulas:**

`findNearestEnemy`:
```
score = 1000 - distance
      + (attacking_me ? ATTACKING_ME_BONUS : 0)
      + (attacking_nearby_friendly ? ATTACKING_FRIENDLY_BONUS : 0)
      + (LOW_HP_REF_HP - target.hp) * LOW_HP_WEIGHT
```

`findEnemyBaseTarget`:
```
score = BASE_PROXIMITY_BONUS - distance
      + (production ? PRODUCTION_BONUS : 0)
      + (LOW_BUILDING_HP_REF - building.hp) * LOW_BUILDING_HP_WEIGHT
```

`updateTurrets`:
```
score = 1000 - distance + TURRET_BASE_TERRITORY_BONUS
```

---

## Combat Radii

```javascript
CFG.COMBAT = {
  SELF_RADIUS:     14,    // collision radius for units
  BUILDING_RADIUS: 22,    // collision radius for buildings
  BASE_RADIUS:     30,    // collision radius for bases
  UNIT_RADIUS:     14,    // alias for SELF_RADIUS
};
```

Used in `updateUnit` for standoff-distance calculation when engaging structures.

**Hardcoded in `updateTurrets`.** Should be in `CFG.TARGETING`.

---

## How to Change a Number

1. Open `index.html`, find `const CFG = {`
2. Change the value
3. Update this file
4. Update `design-document.md` if user-facing
5. Commit: `git commit -m "balance: <change>"`
6. Test in-game

**Rule of thumb:** if it's player-visible, the value lives in 3 places:
- `index.html` (the actual code)
- `design-document.md` (GDD)
- `tuning-numbers.md` (this file)

If you find a 4th place (a doc with a stale number), update it too.

## 🤖 Auto-Generated CFG Reference

> **This section is generated by `docs/audit/scripts/gen-tuning-numbers.py`.**
> Do not edit by hand. To update, run: `python3 gen-tuning-numbers.py --write`
> The `// comments` after each value in `index.html` become the Description column.

### General

| Key | Value | Description |
|---|---|---|
| `MAP_WIDTH` | 1920 | — |
| `MAP_HEIGHT` | 600 | — |
| `BASE_HP` | 500 | — |
| `STARTING_CREDITS` | 200 | enough for barracks + warfactory headroom |
| `PASSIVE_INCOME` | 6 | faster accumulation |
| `KILL_BOUNTY` | 0.25 | — |
| `SOFT_CAP` | 500 | more room to accumulate |
| `MATCH_TIME` | 180 | — |
| `BARRACKS_COST` | 100 | — |
| `BARRACKS_HP` | 80 | — |
| `WARFACTORY_COST` | 150 | — |
| `WARFACTORY_HP` | 100 | — |
| `TECHCENTER_COST` | 250 | — |
| `TECHCENTER_HP` | 100 | — |
| `PILLBOX_COST` | 75 | — |
| `PILLBOX_HP` | 120 | — |
| `PILLBOX_DMG` | 12 | — |
| `PILLBOX_RANGE` | 250 | — |
| `TURRET_COST` | 150 | — |
| `TURRET_HP` | 200 | — |
| `TURRET_DMG` | 22 | — |
| `TURRET_RANGE` | 350 | — |
| `BUILD_TIME` | 5 | — |
| `MAX_TURRET_SLOTS` | 20 | — |
| `MAX_QUEUE` | 4 | — |
| `MAX_BUILDINGS` | 10 | — |
| `AI_DECISION_INTERVAL` | 0.5 | — |

### Drone

| Key | Value | Description |
|---|---|---|
| `DRONE.BLAST_RADIUS` | 60 | pixels |
| `DRONE.BLAST_DMG` | 50 | base damage at center |
| `DRONE.FALLOFF_MIN` | 0.5 | damage at edge is 50% of base |

### Turret Placement

| Key | Value | Description |
|---|---|---|
| `TURRET_PLACEMENT.PERIMETER_OFFSET` | 290 | distance from base center to perimeter line |
| `TURRET_PLACEMENT.PERIMETER_Y_START` | 120 | top of perimeter (out of MAP_HEIGHT=600) |
| `TURRET_PLACEMENT.PERIMETER_Y_END` | 560 | bottom of perimeter |
| `TURRET_PLACEMENT.PERIMETER_SLOT_GAP` | 60 | vertical spacing between turrets |
| `TURRET_PLACEMENT.COOLDOWN` | 1 | seconds between turret shots |

### Targeting

| Key | Value | Description |
|---|---|---|
| `TARGETING.ATTACKING_ME_BONUS` | 500 | +500 if enemy is currently attacking this unit |
| `TARGETING.ATTACKING_FRIENDLY_BONUS` | 100 | +100 if enemy is attacking a nearby friendly |
| `TARGETING.FRIENDLY_NEARBY_RADIUS` | 200 | pixels |
| `TARGETING.LOW_HP_WEIGHT` | 0.5 | multiplier on (50 - target.hp) |
| `TARGETING.LOW_HP_REF_HP` | 50 | HP at which low-HP bonus = 0 |
| `TARGETING.PRODUCTION_BONUS` | 200 | +200 for barracks/warfactory/techcenter |
| `TARGETING.LOW_BUILDING_HP_WEIGHT` | 0.5 | multiplier on (200 - building.hp) |
| `TARGETING.LOW_BUILDING_HP_REF` | 200 | HP at which low-HP bonus = 0 |
| `TARGETING.BASE_PROXIMITY_BONUS` | 500 | +500 for closer buildings (base score offset) |
| `TARGETING.TURRET_BASE_TERRITORY_BONUS` | 50 | +50 for any unit in turret range |

### Combat

| Key | Value | Description |
|---|---|---|
| `COMBAT.SELF_RADIUS` | 14 | collision radius for units |
| `COMBAT.BUILDING_RADIUS` | 22 | collision radius for buildings |
| `COMBAT.BASE_RADIUS` | 30 | collision radius for bases |
| `COMBAT.UNIT_RADIUS` | 14 | alias for SELF_RADIUS |
