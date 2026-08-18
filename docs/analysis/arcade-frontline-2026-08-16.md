# Arcade Frontline — Design Doc

**Date:** 2026-08-16
**Style:** Option A — Arcade Frontline
**Format:** 2D horizontal-scrolling, 1v CPU, mobile **landscape**
**Theme:** Chunky stylized, bright flat colors, thick outlines, shared roster / color split
**Inspiration:** Red Alert — building-gated production, scaling output per building

---

## Impact

- Mobile-first 1v CPU strategy
- Shared roster, color-only factions
- 4 unit types, Red Alert archetypes (combat-only)
- Light strategy, building-gated unlocks
- 2–3 min match length
- Tap-to-spawn, auto-march, auto-attack
- Landscape orientation (horizontal scroll native)
- Auto-placed buildings (no manual placement)
- Buildings = primary target for base attackers
- More buildings = faster global production

---

## Core Loop

1. Player spends credits to **auto-construct a building** (system picks first empty tile)
2. Each building unlocks a unit type and contributes to global production rate
3. Player taps a unit button → unit spawns at base
4. Unit auto-marches toward enemy base, auto-attacks in range
5. Units reaching the enemy base **attack buildings first** (random target), then the Construction Yard
6. AI does the same from the other side
7. Destroy all enemy buildings, then the enemy base, to win
8. More buildings = higher global production rate = faster unit output

---

## Unit Roster (Red Alert Archetypes, Combat-Only)

| Unit | Red Alert Ref | Cost | HP | Damage | Range | Speed | Role |
|------|---------------|------|----|--------|-------|-------|------|
| Rifleman | Allied GI / Conscript | 10 | 20 | 4 | 1 (melee) | Fast | Cheap infantry, fodder |
| Rocket Soldier | Rocketeer / Rocket Infantry | 25 | 20 | 12 | 4 | Medium | Anti-armor, fragile |
| Medium Tank | Medium Tank / Rhino | 40 | 80 | 15 | 3 | Slow | Frontline backbone |
| Heavy Tank | Heavy Tank / Apocalypse | 80 | 180 | 22 | 3 | Very slow | Tank buster, slow push |
| Flamethrower | Flame Trooper / Pyro | 30 | 35 | 18 (DoT) | 2 (cone) | Medium | Anti-infantry, area denial |
| Sniper | Sniper / British Sniper | 50 | 25 | 30 | 8 (long) | Slow | High single-target dmg, fragile |

**Notes:**
- Range in unit-widths (tunable)
- Speed relative (1.0 = baseline)
- Rocket Soldier: high single-target damage, dies to Riflemen swarm.
- Heavy Tank: counter to Medium Tank stack. Slower push.
- Flamethrower: short range but high damage to grouped infantry. Cone AoE.
- Sniper: longest range, one-shots Riflemen, dies to flanking Riflemen or Tanks.

**Why these 6:** All combat. Engineer and Harvester dropped per request. Flamethrower and Sniper replace them — classic Red Alert anti-infantry and long-range archetypes. Keeps the rock-paper-scissors triangle: Rifleman ↔ Flamethrower, Tank ↔ Rocket Soldier, Heavy Tank ↔ Tank stack, Sniper picks off clumps.

---

## Buildings (Production Hubs)

Buildings are **auto-constructed by the Construction Yard** when purchased. They unlock unit production and stack to increase global output rate. The player taps a building button → the system picks the first empty tile in the placement zone and starts construction automatically. No manual placement.

### Building Roster

| Building | Unlocks | Cost | HP | Footprint |
|----------|---------|------|----|-----------|
| Barracks | Rifleman, Rocket Soldier, Flamethrower | 100 | 80 | 1 tile |
| War Factory | Medium Tank, Heavy Tank, Sniper | 150 | 100 | 1 tile |
| Airfield | (reserved for v2) | 200 | 80 | 1 tile |

**v1 simplification:** No Airfield in v1. All 6 units are gated by Barracks or War Factory.

### Building Placement (Auto)

- **Construction Yard** (the base itself) has an attached **10-tile placement zone** (player: left of base, AI: right of base)
- When player taps a building button:
  1. Credits deducted
  2. **5s build time** starts on the first empty tile (auto-placed, no manual positioning)
  3. Building shows a "constructing" state (scaffolding / wireframe)
  4. After 5s, building becomes active
- If all 10 tiles are occupied, button greys out (max 10 buildings)
- Player can still queue units while a building is constructing — they just wait for it to finish
- Buildings can be **destroyed** by enemy units (see Attack Priority below). HP shown.
- If a building is destroyed, the tile becomes empty again, allowing a new building to be auto-placed there

**UI layout (Option 3 — vertical scrollable columns):**
- **Left column (player side):** Single column of 10 building slots, scrollable up/down. The 2 building-type action buttons (Barracks, War Factory) sit at the bottom as fixed buttons. Already-built buildings stack top-to-bottom in the column. Scroll gesture reveals off-screen buildings.
- **Right column (unit production):** Single column of 6 unit production buttons, scrollable if needed. Most-used units (Rifleman) at top, less-used (Sniper) at bottom.
- **Center:** Horizontal battlefield (1920px wide) showing both bases and active combat.
- **Top center:** Credits + match timer.
- **Top corners:** Base HP bars.

**Why vertical scrollable columns:** Each column is only 1 wide, so tile size is maximized — buildings and unit icons are highly readable. Scroll handles overflow gracefully. Matches Red Alert sidebar feel but optimized for mobile landscape thumb reach.

**Why auto-placement:** Reduces UI friction. Player focuses on macro decisions (build units vs. build buildings), not pixel-perfect placement. Matches Red Alert’s lower-friction mobile port feel.

### Attack Priority: Buildings First

When enemy units reach the player’s base, they don’t all swarm the Construction Yard at once. **Buildings are the primary target.**

- An enemy unit that reaches the base **randomly selects a target** from this priority list:
  1. **Any active building** (Barracks, War Factory) — equal random among all active buildings
  2. **Construction Yard (the base itself)** — only if no active buildings remain
- The unit attacks its chosen target until either:
  - Target is destroyed → unit re-rolls from remaining targets
  - Unit dies
- If multiple enemy units reach base, they independently pick targets (no coordination)
- A building under construction (5s window) is **not yet a valid target** — it must complete construction to be attackable

**Strategic implication:**
- Base defense is no longer "swarm the Construction Yard." Defending player loses buildings one by one, each destruction slowing their production
- Attacker goal: reach enemy base, chew through buildings, then kill the Yard
- This is the **Red Alert base-raid feel** — taking out production infrastructure before finishing the kill

### Production Rate Scaling (Red Alert Mechanic)

This is the core Red Alert feel: **more buildings = faster unit production globally.**

| Active Buildings Owned | Global Production Rate Multiplier |
|------------------------|-----------------------------------|
| 1 | 1.0x (baseline) |
| 2 | 1.4x |
| 3 | 1.7x |
| 4 | 2.0x |
| 5 | 2.2x |
| 6 | 2.4x |
| 7 | 2.55x |
| 8 | 2.7x |
| 9 | 2.8x |
| 10 | 2.9x (max) |

**How it works in practice:**
- Each unit has a base **build time** (e.g., Rifleman = 1.5s, Tank = 4s)
- Global rate multiplier divides all build times
- 1 building: Tank takes 4s. 3 buildings: Tank takes ~2.5s.
- Encourages base-building economy. Spam-buildings player snowballs production.

**Why this feels Red Alert:** Classic C&C has harvesters fueling base-building, and more refineries = faster ore processing. Same idea — more production hubs = faster unit output. The arms race is real.

### Strategic Tension

- **Spend on units now** (fast army, weak economy) vs.
- **Save for buildings** (slower start, faster mid-game production)
- A player with 3 active buildings out-produces a player with 1 building + 5 units by minute 2
- Buildings can be **sniped by reaching the enemy base** — losing a building hurts production AND removes a target the AI has to chew through
- A player who reaches the enemy base first can systematically dismantle their production line

---

## Economy

- **Starting credits:** 50
- **Passive income:** +3 credits / second (base only)
- **Kill bounty:** +25% of unit cost (rounded up)
- **Soft cap:** 300 credits (excess still accrues, no overflow loss)
- **Match timer:** 180s (3 min) — if both bases survive, higher HP% wins

**Credit curve check:**
- 180s × 3/s = 540 passive credits if unspent
- Building costs (100/150 each) = major economic sink
- Max 3 buildings = up to 400 credits spent on infrastructure
- Without buildings: you have units but no production scaling
- With 3 buildings: you spend ~400 on structures, then production scales to 1.6x

---

## Battlefield

- **Layout:** Horizontal strip, single lane
- **Map length:** 1920px (mobile landscape, 16:9, no scroll)
- **Base HP:** 500 each
- **Building placement zones:** Player has 3-tile strip on left (next to base), AI has 3-tile strip on right
- **Mid-field:** No neutral structures in v1. Battlefield is a clean highway between bases.
- **Terrain:** Flat ground
- **Orientation:** Landscape. Player base left, enemy base right, everything visible.

**Why no mid-field structures:** Without Engineer/Harvester, there’s no unit to capture them. Cleaner lane keeps the focus on the base-vs-base push.

---

## Factions

- **Red Iron** (player, default) — `#E63946`
- **Blue Volt** (CPU, default) — `#1D9BF0`
- **Only color differs.** Same buildings, same units, same stats.
- **Faction picker** is post-v1. v1: red vs. blue hardcoded.

---

## Match Pacing

- **Early game (0–30s):** Both sides save up. First Barracks placed around 10s. First units out around 20s.
- **Mid game (30–90s):** Building arms race. Player with more buildings floods faster. Skirmishes over mid-field structures.
- **Late game (90–180s):** Production peaks at 2.2x. Whoever has better building economy wins. Base races decided.
- **Comeback mechanic:** None in v1. Buildings are the comeback — losing player who steals a building gains rate.

**Target outcome:** 70% of matches decided by base HP, 30% go to timer. If timer dominates, buff building economy or reduce match timer.

---

## Controls (Mobile Landscape)

**UI Option 3 — vertical scrollable columns:**

- **Left column:** Single vertical column of 10 building slots, scrollable. 2 fixed building-type action buttons (Barracks, War Factory) anchored at the bottom of the column. Built buildings stack top-to-bottom. Scroll up/down to reveal off-screen buildings. Each slot shows: building icon, HP bar, construction progress (if building).
- **Right column:** Single vertical column of 6 unit production buttons, scrollable. Most-used units (Rifleman) at top, less-used (Sniper) at bottom. Each button: icon + cost + cooldown overlay + build progress bar. Locked units (no active producing building) greyed out with building icon overlay.
- **Tap unit button:** Queue unit at base. Single global queue (FIFO).
- **Tap building button (bottom-left):** Credits deducted, building auto-constructs on first empty tile in 5s. Button greys out if all 10 tiles occupied.
- **Credits display:** Top center, large number
- **Base HP:** Two bars, top corners (red left, blue right)
- **Match timer:** Top center, under credits
- **Center:** Horizontal battlefield (1920px wide) showing both bases and active combat
- **Game over screen:** Winner banner, rematch button

**Why vertical scrollable columns in landscape:** Maximizes tile size (since columns are 1 wide), keeps battlefield unobstructed in the center, and scrolling handles overflow without cramping the layout. Thumbs tap columns on their respective sides.

---

## AI (CPU Opponent)

**v1 behavior — script-based, no ML:**

- **Build order (scripted opening):**
  1. 0–10s: Save credits
  2. 10s: Build Barracks (cost 100, auto-placed on first empty tile)
  3. 15s: Start producing Riflemen
  4. 40s: Build War Factory (cost 150) if credits allow
  5. 60s: Build 2nd Barracks if credits allow
  6. 80s: Build 3rd building if credits allow
  7. 100s: Build 4th building if ahead
  8. 120s+: Power play — flood Tanks or Heavy Tanks

- **Counter-play:**
  - If player has many Tanks → AI builds Heavy Tanks + Rocket Soldiers
  - If player has many Riflemen → AI builds Medium Tanks + Flamethrowers
  - If player has many Snipers → AI flanks with Riflemen (cheap, fast)
  - If player has 3 buildings → AI commits to a base push to dismantle them

- **Aggression:** 30% rush chance (opens with Barracks + immediate Rifleman flood)
- **Difficulty:** 1 setting in v1. Same HP, same starting credits. Tuning later.

**Counter matrix (loose):**
```
Medium Tank beats: Rifleman, Flamethrower
Heavy Tank beats: Medium Tank
Rocket Soldier beats: Medium Tank, Heavy Tank (high dmg, but fragile)
Rifleman beats: Sniper (cheap flanking), Flamethrower (zerg rush)
Flamethrower beats: Rifleman, Rocket Soldier (cone DoT)
Sniper beats: anything at long range, but dies to flanking Riflemen or Tanks
```

**Honest read:** With no Engineer/Harvester, the economy is simpler — just passive + kill bounties. This keeps the focus on the building-vs-units macro decision and the base raid. Cleaner game, faster to tune.

---

## Win / Lose States

- **Win:** Enemy base HP reaches 0 → victory banner, +1 to local counter
- **Lose:** Player base HP reaches 0 → defeat banner, +1 to local counter
- **Timer:** Both bases > 0 at 180s → compare HP%, higher % wins
- **Quit:** Forfeit, counts as loss, no save state

**No save state in v1.** Match starts → match ends.

---

## Tech Choices (v1 Prototype)

- **Engine:** Vanilla HTML + Canvas2D, single file
- **Why:** Zero deps, instant deploy, easy to tune numbers
- **Resolution:** 1920×1080 design canvas, scale to fit landscape viewport
- **Frame rate:** 60 FPS target, requestAnimationFrame
- **Mobile test:** Chrome DevTools device mode first, real device second
- **Build target:** Single `index.html`, drop in any static host
- **Orientation lock:** Force landscape via CSS media query + screen orientation API

**Out of scope for v1:**
- Sound (silence or basic Web Audio beeps)
- Animations beyond simple movement + building construction
- Multiple maps
- Difficulty settings
- Save/persistence
- Multiplayer
- Airfield building (Drones postponed)

---

## Test Matrix (Tuning Checklist)

| Knob | Default | Effect if too low | Effect if too high |
|------|---------|-------------------|---------------------|
| Credit tick | 3/s | Both starve | Both flood instantly |
| Rifleman cost | 10 | Spam meta | Never built |
| Tank cost | 40 | Tank meta | Tanks never seen |
| Heavy Tank HP | 180 | Dies to Rockets too fast | Unkillable |
| Rocket Soldier dmg | 12 | Outranged by Tanks | One-shots Riflemen |
| Flamethrower dmg | 18 (DoT) | Outranged | Wipes groups too easily |
| Sniper dmg | 30 | Outranged | One-shots Tanks |
| Sniper range | 8 | Outranged by Tanks | Wins lane alone |
| Barracks cost | 100 | Build spam dominates | Nobody builds |
| War Factory cost | 150 | Tanks flood early | Tanks never seen |
| Production multiplier @ 10 bldgs | 2.9x | Building economy weak | Snowball unstoppable |
| Building build time | 5s | Drop-and-spam, no defense window | Feels sluggish |
| Max buildings per side | 10 | Econ capped too low | Too much production |
| Building HP | 80 / 100 | Sniped instantly | Unkillable, stalemate |
| Base HP | 500 | One-shot feel | Timer always wins |
| Match timer | 180s | No climax | Fatigue |
| Kill bounty % | 25% | Kills don’t matter | Snowball |
| Cooldown | 0.5s | Macro doesn’t matter | Feels laggy |

**Tune by feel, not math.** Play 10 matches, note what feels off, change one number, play 10 more.

---

## Save Path

- `index.html` — single-file prototype (landscape, 1920×1080)
- `assets/` — sprite sheets (red/blue unit frames, buildings, base, mid-field structures, background, building buttons)
- `docs/analysis/arcade-frontline-2026-08-16.md` — this doc
- `tests/smoke.html` — visual checks (units spawn, buildings place, production scales, structures capture, base damage)

**Deliverable:** Open `index.html` in a landscape browser, place buildings, queue units, watch red vs. blue with mid-field skirmishes.

---

## Open Questions

- **Orientation:** ✅ **Locked to landscape** (confirmed 2026-08-16).
- **Engineer and Harvester:** ✅ **Removed** (confirmed 2026-08-16). Replaced with Flamethrower and Sniper.
- **Building placement:** ✅ **Auto-placed** (confirmed 2026-08-16). Player taps button, system picks first empty tile.
- **Building attack priority:** ✅ **Buildings first, then base** (confirmed 2026-08-16). Random target selection among active buildings, then Construction Yard.
- **Airfield:** Postponed to v2. No Drones in v1.
- **Sound?** Skipped in v1.
- **Faction picker?** v2. v1 hardcode red=player, blue=CPU.
- **Building max:** 10 per side. Raise if you want bigger economies (currently scales 1.0x→2.9x).
- **UI placement (Option 3):** ✅ **Locked** (confirmed 2026-08-16). Vertical scrollable columns, 1 wide on each side, with building-type buttons anchored at the bottom of the left column.

---

## Next Step

Review this doc. If numbers feel right (or close), say **"Read this file, then implement"** and I’ll build the prototype. If numbers are off, mark the rows in the Test Matrix and I’ll re-tune before coding.

---

## v1.21 (2026-08-17) — Building queue system + Tech Center + Turrets

### New buildings

- **Tech Center (250cr)** — requires War Factory. Unlocks Heavy Tank.
- **Pillbox (75cr)** — defensive turret, light-tank damage, 250 range, 120 HP. Requires Barracks.
- **Turret (150cr)** — defensive turret, medium-tank damage, 350 range, 200 HP. Requires Barracks.

### Building prerequisites (locked)

| Building      | Requires       | Unlocks units                |
|---------------|----------------|------------------------------|
| Barracks      | (none)         | Rifleman, Rocket, Flamethrower |
| War Factory   | Barracks       | Light Tank, Med. Tank, Sniper |
| Tech Center   | War Factory    | Heavy Tank                   |
| Pillbox/Turret| Barracks       | (defensive structure)        |

Player cannot place a building until its prerequisite is built and active. Buttons disable when prereq missing, cost too high, or queue full.

### Light Tank (new unit)

- Cost 35, HP 50, dmg 12, range 120, speed 60, build 3.0s
- Light armor, fast, **countered by Rocket Soldier**
- Built by War Factory

### Building queue system (locked)

- 10 building slots per side; 20 dedicated turret slots
- Slots = **queue visualization** — do NOT show what's already built, only what's pending
- Each building takes 5s to construct (queue progress shown in the slot)
- After a building finishes, the next queued item moves into the actual building array

### Unit queue (locked)

- 4 max queued units (1 building + 3 waiting)
- When multiple of the same unit type are queued, a **count bubble** shows in the slot

### AI changes (v1.21)

- Markov now includes light tank and sniper production actions
- Heavy tank now requires Tech Center (`hasActiveTechCenter` check)
- State machine + Markov: state decides spend-vs-save, Markov picks which unit
- Tech Center built at t > 90 OR in pushing state, when war factory active
- Pillbox / Turret are player-only in v1.21; AI does not build them yet (defer to v1.22)

### Test results

- `sim_v26.js`: All prereq checks pass (war factory blocked without barracks, etc.)
- `sim_v24.js`: Barracks unlocks rifleman/rocket/flame after 5s
- `sim_v26.js`: Tech center correctly unlocks heavy tank
- Turret attack test: pillbox deals 12 dmg per 1s shot, kills rifleman in 2 hits
- Queue cap test: stops at 4 (MAX_QUEUE)


---

## v1.22 (2026-08-17) — Input hardening + cancel/refund

### Issues fixed

1. **Mobile touch repeat on unit panel**: removed redundant `mousedown`/`touchstart` listeners on `right-slots`; only `click` fires. A single mobile tap = one queue.
2. **Tap debounce**: 250ms debounce window after a successful queue prevents accidental double-taps from registering twice.
3. **Synthetic mouse suppression**: a `touchstart` flag on the slot element causes a paired `mousedown` (which mobile browsers synthesize after touchend) to be ignored.

### Cancel + refund

- **Tap = build/queue.** **Hold ≥ 500ms = cancel head of queue.**
- Unit cancel: **full credit refund** (cancels any queued unit, not just the head)
- Building cancel: **50% credit refund** (deconstruction fee discourages spam)
- Cancelled element flashes red for 300ms.
- A hold-consumed flag suppresses the synthetic `click` that would normally fire after `mouseup`, so a held-and-released button doesn't ALSO place a build.

### Inline build progress (no more slot list)

- The 10-slot left column is **gone** — slots were redundant with the action buttons
- Each action button now has an inline progress bar that fills as the head of its queue builds
- A small queue-count badge appears in the top-right when count > 1
- Pillbox/Turret buttons share the same pattern with their own 20-slot queue

### Layout fix

- Action button height reduced 64px → 56px
- 5 buttons × 56px = 280px of content; comfortably fits a 360px landscape phone
- Removed orphaned `left-up`/`left-down` scroll arrows (column no longer scrolls)

### Test results

- `sim_v23.js`: 4 riflemen queued, 1 cancelled with 10cr refund
- `sim_v23.js`: Building queue cancel returns 50/100 credits (barracks refund)
- Pillbox + turret both queue when barracks active

---

## v1.23 (2026-08-17) — Bug fixes & construction visualization

### Issues fixed

1. **"Building animation applied to all when 1 building is constructed"**
   The `buildingQueue` is shared across barracks/warfactory/techcenter (one global
   queue, not per-type). Previously every building button toggled its `building`
   class based on `queueArr.length > 0`, which made ALL buttons show as "building"
   whenever any item was queued.
   **Fix:** the `building` class is now only set on the button whose type matches
   the queue's HEAD. Other buttons only show the queue count badge if the same
   type is queued 2+ times.

2. **Building construction should have animation on the map**
   The 5s "construction" was happening invisibly in the queue. Now the map shows
   ghost scaffolds with diagonal stripes at the FUTURE positions of queued
   buildings — the crank line moves up as the build progresses, then the scaffold
   becomes the real building once popped. Turret queue shows ghost turret
   outlines with progress arcs.

3. **Unit production and building can queue even if not enough credit**
   Credit check was already in place (`placeBuilding` and click handlers). The
   problem was that a rejected click did NOTHING visible, so the user assumed
   it queued. Added `flashElement(btn, 'denied')` which triggers a red shake
   animation on the button when the queue attempt is rejected (insufficient
   credits, queue full, or missing prereq). Visual feedback now matches the
   behavior.

4. **Sniper require the tech building to be built before activation**
   Previously sniper was in `WARFACTORY_UNITS` (only required war factory).
   Moved to `TECHCENTER_UNITS` along with heavy tank. Updated AI's `produce_sniper`
   to gate on `hasActiveTechCenter`. Verified via sim: sniper locked until tech
   center is built.

### Test results

- `sim_sniper.js`: rifleman true (after barracks), tank true (after warfactory),
  sniper/heavy false until tech center built, then both true
- Building button "building" class now matches queue HEAD only
- All 4 issues fixed without breaking existing tests

---

## v1.24 (2026-08-17) — Chunky cartoon art style

### Art style overhaul

The game was previously rendered with simple flat circles and rectangles. Now
it matches the locked **Option B "Arcade Frontline"** style — Clash Royale meets
Command & Conquer. Chunky shapes, thick black outlines, bright flat colors.

### Visual changes

**Background**
- Sky gradient: warm yellow horizon → soft blue (sunset feel)
- Grass band with rolling hill silhouettes in distance
- Chunky pixel-style dirt blocks at the bottom (like old 2D RTS games)
- Grass brush strokes along the dirt edge

**Bases (Construction Yard)**
- Castle tower with crenellations on top
- Arched door, faction-colored body (red/blue) with darker shadow inside
- Flag pole + faction flag on top
- Bold "BASE" label, HP bar with thick outline

**Buildings (Barracks / War Factory / Tech Center)**
- **Barracks**: triangular roof, two windows, door, faction color
- **War Factory**: flat roof with smokestack + smoke puffs, large window
- **Tech Center**: dome with antenna + dish, circular window
- All with thick black outlines, HP bars above

**Infantry units**
- Helmet (round dome) in faction color
- Helmet strap (darker shade)
- Skin-toned face
- Body in faction color
- Different weapons per type:
  - **Rifleman**: standard rifle
  - **Rocket Soldier**: long launcher with red rocket tip
  - **Flamethrower**: tank on back + nozzle
  - **Sniper**: long rifle with scope

**Tank units**
- Chunky rounded body in faction-tinted color
- Tread wheels (4-5 small black circles along bottom)
- Turret (smaller rounded rect) in faction color
- Long black barrel pointing toward enemy
- Heavy tank: bigger body + longer barrel
- Light tank: smaller, faster silhouette

**Turrets**
- **Pillbox**: sandbag base (two-tone brown) + small barrel
- **Turret**: concrete dome (gray) + longer barrel

**Projectiles**
- Chunky bullet with motion trail (faded line behind)

**UI**
- HUD: dark brown gradient with thick border
- Action buttons: thick black border, drop-shadow effect, 3D press feel
- HP bars: thicker, with outline

### Implementation

All rendering is now in named functions:
- `drawBackground()` — sky, grass, hills, dirt
- `drawBase(side)` — castle
- `drawBuilding(bld, side)` — barracks/war factory/tech center
- `drawTurret(turret, side)` — pillbox/turret
- `drawUnit(u)` — soldier or tank

Shared helpers:
- `fillWithOutline(drawFn, fillStyle, outlineW)` — fill + black stroke
- `roundRectPath(x, y, w, h, r)` — rounded rectangle path

### Test result

- `sim_render.js`: render() executes without exceptions across 5 unit types
  and 3 building types

---

## v1.25 (2026-08-17) — Top-down view, distinct silhouettes, building previews

### Issues fixed

1. **Battlefield viewed semi top-down**
   The view is now top-down at an angle. Bases and buildings show their roof/face
   (ellipse for the top surface, rectangle for the front face). Background is
   mostly green grass with a thin sky strip + hill silhouettes at the very top
   (instead of side-on sky+grass split).

2. **Pillbox/turret overlap fixed**
   Turrets now spread in a 5-column × 4-row grid in front of the base (colW=28,
   rowH=32). No more overlapping Y positions.

3. **Units come out of factory/barracks**
   `spawnUnit(side, unitKey)` now finds the correct building (barracks for
   infantry, war factory for tanks, tech center for heavy) and spawns the unit
   just in front of that building. Falls back to base spawn if no building.

4. **Distinct unit silhouettes**
   - **Rifleman**: standard body, short rifle
   - **Rocket Soldier**: big backpack, long launcher with red rocket tip
   - **Flamethrower**: large fuel tank on back, nozzle with small flame
   - **Sniper**: low body, long rifle with scope + binoculars on head
   - **Light Tank**: small oval hull, short barrel
   - **Medium Tank**: standard oval hull + turret
   - **Heavy Tank**: bigger hull, double barrel
   Each has visibly different proportions and accessories.

5. **Distinct building silhouettes**
   - **Barracks**: pitched roof with two peaks, 3 windows
   - **War Factory**: sawtooth roof, smokestack with smoke, vehicle bay door
   - **Tech Center**: cylindrical body with dome + antenna with dish
   - **Pillbox**: two-tone sandbag base
   - **Turret**: gray concrete dome

6. **Buttons show building/unit design**
   Replaced emoji icons with mini canvas previews that draw the actual
   top-down silhouette at 64×32 px. Each button now shows a recognizable
   preview of what it builds.

### New code

- `drawTank(u, main, dark, light)` — top-down tank render
- `drawInfantry(u, main, dark, light, skin)` — top-down infantry with type-specific gear
- `drawMiniUnit(c, type, x, y)` — button preview for units
- `renderBuildingPreview(canvas, bldType)` — button preview for buildings
- `renderUnitPreview(canvas, unitKey)` — async render after DOM insertion
- `spawnFlash: 0.3` on new units — white ring fades out over 0.3s as spawn feedback

### Test result

- `sim_render2.js`: 7 unit types (rifleman, rocket, flame, sniper, tank, heavy,
  lighttank) + 3 building types all render without exceptions
- `sim_spawn.js`: rifleman spawns at x=140 (in front of barracks at x=110);
  tank spawns at x=190 (in front of war factory at x=160). Spawn-from-building
  logic confirmed working.

---

## v1.26 (2026-08-17) — PNG sprite-based art

### What changed

Replaced all vector-drawn units/buildings/turrets/bases with **PNG sprites**
generated as a separate art asset. The sprites are loaded from the
`art/` directory at startup.

### Sprite sheet layout

**`art/sprites-red/` and `art/sprites-blue/`** (4x4 grid, sliced to individual PNGs):
- r0c0 = rifleman
- r0c1 = rocket soldier
- r0c2 = sniper
- r0c3 = flamethrower
- r2c1 = heavy tank (twin barrels)

**`art/sprites-extras/`** (one PNG per type per color):
- base-red.png, base-blue.png — castle base
- barracks-red.png, barracks-blue.png — pitched roof building
- warfactory-red.png, warfactory-blue.png — sawtooth roof with smokestack
- techcenter-red.png, techcenter-blue.png — dome with antenna
- lighttank-red.png, lighttank-blue.png — small tank
- mediumtank-red.png, mediumtank-blue.png — medium tank (top-down)
- pillbox-red.png, pillbox-blue.png — sandbag bunker
- turret-red.png, turret-blue.png — concrete dome

### Sprite loading

`loadSprites(callback)` loads 26 PNGs (13 types × 2 colors) and stores
them in `SPRITES` map keyed as `name-color` (e.g. `rifleman-red`).

### Render integration

- `drawBase(side)` — draws 70px tall base sprite
- `drawBuilding(bld, side)` — draws 50px tall building sprite (barracks/war factory/tech center)
- `drawTurret(turret, side)` — draws 32-36px turret sprite (pillbox/turret)
- `drawUnit(u)` — draws 30-36px unit sprite

### Button preview integration

- `renderUnitPreview(canvas, unitKey)` — draws unit sprite as button icon
- `renderBuildingPreview(canvas, bldType)` — draws building sprite as button icon

### Cleanup

Removed dead code: `drawTank`, `drawInfantry`, `drawMiniUnit`,
`fillWithOutline`, `roundRectOn` (no longer called by render functions).
The HTML file is 2472 lines, 86KB.

### Test result

`sim_sprites3.js` — render() with fake sprite images succeeds for all
unit types (rifleman, tank, heavy) and building types (barracks, war factory).

---

## v1.27 (2026-08-17) — Fixed pillbox/turret double construction

### Bug

`placeTurretOnMap()` set `constructing: true, buildProgress: 0, buildTime: 4` when
popping a turret from the queue. The `updateBuildings()` loop then continued to
increment `buildProgress` on the placed turret, meaning each turret built
**twice**: once in the queue (4s) and once on the map (4s more) = **8s total**.

Buildings worked correctly because `placeBuildingOnMap()` sets
`constructing: false, buildProgress: BUILD_TIME` (already complete).

### Fix

`placeTurretOnMap()` now mirrors `placeBuildingOnMap()`: sets
`constructing: false, buildProgress: 4` so the turret is instantly active
when it pops out of the queue. The queue phase IS the construction phase.

### Verification

- Turret test: queue head `buildProgress` goes 0 → 1 → 2 → 3 → 4, then
  popped to `turrets[]` with `constructing: false, buildProgress: 4`.
  Stays at 4 forever (no extra build time).
- Building test: same behavior, 5s total queue time, instant active.
- Pillbox/turret now takes 4s to build (was 8s before).

---

## v1.28 (2026-08-17) — PNG background + fixed sprite paths

### Issues fixed

1. **Background replaced with PNG**
   The vector-drawn sky/grass/hills/dirt was replaced with `art/background.png`
   (1920×600 cartoon battlefield: green grass with tufts, two dirt patches on
   the left/right thirds, dashed white center line). Falls back to a plain
   green fill if the image hasn't loaded yet.

2. **Sprite path bug — `barracks` had no PNG**
   The sprite list referenced `art/sprites-{color}/r2c2.png` for barracks,
   but those files don't exist (barracks is in `sprites-extras/`). Fixed by
   updating the path to `art/sprites-extras/barracks-{color}.png`.

3. **Missing `tank` sprite (medium tank)**
   The unit type `tank` (medium tank) had no PNG path. Added
   `{ name: 'tank', path: 'art/sprites-extras/mediumtank-{color}.png' }` to
   the sprite list.

4. **Removed unused `mediumtank` key**
   Since the unit type is just `tank`, removed the separate `mediumtank` key.

### Background loader

`BG_IMAGE = { img: null, loaded: false }` — loaded alongside sprites
in `loadSprites()`. Total load count includes +1 for the background.

### Draw integration

`drawBackground()` now just calls `ctx.drawImage(BG_IMAGE.img, 0, 0, MAP_WIDTH, MAP_HEIGHT)`.
Falls back to a solid green fill if the image isn't loaded yet (no flash of unstyled content).

### Verification

- `sim_sprites4.js`: All 26 sprite keys (13 types × 2 colors) load successfully.
- `BG_IMAGE.loaded` becomes true after background.png loads.
- `render()` runs without exceptions with both background and sprites loaded.

---

## v1.29 (2026-08-17) — Embedded PNG sprites (self-contained file)

### The issue

The user reported "still no image" — sprites weren't loading. The relative
path `art/sprites-red/r0c0.png` depends on the user having the `art/` folder
in the right location relative to `index.html`. Different deployment scenarios
(cloud sandbox, file://, web server) might not resolve these paths.

### The fix

**Embed all sprites as base64 data URIs directly in the HTML file.**

- 27 PNGs encoded as base64 (background + 26 unit/building/turret sprites)
- Total embedded size: ~3.5MB
- `EMBEDDED_SPRITES` object at top of script section, containing
  `path -> base64string` mapping
- `loadSprites()` rewritten to:
  - Iterate `EMBEDDED_SPRITES` entries
  - For each path, create an `Image` with `src = "data:image/png;base64," + b64`
  - Map path to sprite key using regex:
    - `sprites-red/r0c0.png` → key `r0c0-red` (rifleman)
    - `sprites-extras/barracks-red.png` → key `barracks-red` (barracks)
    - `background.png` → BG_IMAGE

### Key mapping

| Embedded path | Sprite key | Description |
|---------------|------------|-------------|
| `background.png` | BG_IMAGE | Battlefield background |
| `sprites-{color}/r0c0.png` | `r0c0-{color}` | Rifleman |
| `sprites-{color}/r0c1.png` | `r0c1-{color}` | Rocket soldier |
| `sprites-{color}/r0c2.png` | `r0c2-{color}` | Sniper |
| `sprites-{color}/r0c3.png` | `r0c3-{color}` | Flamethrower |
| `sprites-{color}/r2c1.png` | `r2c1-{color}` | Heavy tank |
| `sprites-extras/mediumtank-{color}.png` | `mediumtank-{color}` | Medium tank |
| `sprites-extras/lighttank-{color}.png` | `lighttank-{color}` | Light tank |
| `sprites-extras/{barracks,base,wafactory,techcenter}-{color}.png` | `{name}-{color}` | Building sprites |
| `sprites-extras/{pillbox,turret}-{color}.png` | `{name}-{color}` | Turret sprites |

### Result

- **2457 lines, 3.5MB** single self-contained HTML file
- No external art/ directory required
- Works with `file://`, web server, or any deployment
- Backward compatible: art/ folder is still included as backup

### Verification

Script-side test confirms 27 paths map to 27 unique sprite keys, including
`BG_IMAGE` for the background.

---

## v1.30 — Phaser 3 migration (2026-08-18)

**Why migrate?** Canvas2D unit sprites kept getting squished/distorted in the
right-column unit buttons (different aspect ratios after CSS scaling). Phaser 3
gives us proper sprite rendering with crisp scaling, depth-sorting by y, and
smoother performance on mobile.

### What changed

1. **Phaser 3.80.1** loaded from CDN (`https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`)
2. **Single sprite atlas** — 1848×1056 PNG with 26 sprites in 7×4 grid of 264×264 cells
3. **Atlas embedded as base64** in HTML (2.7MB) + JSON metadata (frame positions)
4. **Frame extraction** — `cutAllAtlasFrames()` runs in `create()` and uses Phaser's `RenderTexture.draw()` + `saveTexture()` to extract each 264×264 sprite into a separate Phaser texture
5. **Background generation** — drawn procedurally with `RenderTexture` (sky gradient, hills, grass, tufts)
6. **Per-frame sync** — `syncUnits()` / `syncBuildings()` / `syncTurrets()` reconcile state.units/buildings/turrets with Phaser sprites
7. **All v1.29 game logic preserved** — AI, combat, production, queues, building placement all unchanged

### Result

- **2.64MB** total file size (down from 3.5MB)
- Phaser loaded from CDN (1.2MB external)
- Sprites render crisply at any size (no more squishing)
- Mobile performance improved via Phaser's WebGL renderer
- Self-contained except for Phaser CDN

### How to extend

To add a new unit type:
1. Add sprite to atlas at known row/col
2. Add `atlas.json` entry with `{filename, frame: {x, y, w, h}}`
3. Add unit def to `CFG.UNITS` and `CFG.BARRACKS_UNITS` (or `WARFACTORY_UNITS`/`TECHCENTER_UNITS`)
4. Add spawn cell to `getUnitCol()` if needed
5. Update `makeUnitSprite()` display size logic

To add a new building type:
1. Add sprite to atlas
2. Add to `atlas.json`
3. Add to `CFG.BUILDINGS_UNLOCK`
4. Add cost/HP constants to `CFG`
5. Update `makeBuildingSprite()` size logic

