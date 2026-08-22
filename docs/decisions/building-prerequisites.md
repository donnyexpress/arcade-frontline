# Decision: Building Prerequisites Chain

**Date:** 2026-08-16
**Status:** Accepted
**Deciders:** donnyexpress

## Context

Original design (v1.0) had every building always available. This made the game too simple:
- Player could rush tech center → heavy tank immediately
- No build order decisions
- No economic trade-offs

User feedback (initial design): "Building-gated production with prerequisites chain (Barracks → War Factory → Tech Center)"

## Decision

**Three-tier prerequisites:**

| Tier | Building | Cost | Unlocks |
|---|---|---|---|
| 0 | Main Base | 0 (default) | — |
| 1 | Barracks | 100 | Rifleman, Rocket, Flamethrower |
| 2 | War Factory | 150 | FSV, Medium Tank |
| 3 | Tech Center | 250 | Sniper, Heavy Tank, Drone |

**Plus two defensive structures (no tier):**
- Pillbox (75)
- Turret (100)

## Visual Indicator

Locked buildings show:
- 🔒 Icon over the button
- Greyed-out appearance
- Cannot be clicked

```css
.unit-btn.locked {
  opacity: 0.5;
  filter: grayscale(80%);
  pointer-events: none;
}
```

Player sees a tutorial hint: "BUILD BARRACKS TO BEGIN" until they have one.

## Consequences

### Positive
- **Build order matters:** Tech rush = no army, infantry rush = no vehicles
- **Strategy depth:** which tier to prioritize?
- **Visual progression:** see the tech tree grow
- **Longer matches:** 2-3 min instead of 30 sec

### Negative
- **Slower start:** player must wait to build barracks before rifleman
- **Tier confusion:** if barracks destroyed, can no longer build rifleman
- **AI must respect:** AI also goes barracks → war factory → tech center

## Alternatives Considered

### Option A: No prerequisites (v1.0)
- Pros: All units immediately available
- Cons: No strategy
- Why rejected: User wanted "Red Alert-style" building gating

### Option B: All gated behind a single Tech Center
- Pros: Simpler
- Cons: Less satisfying build order
- Why rejected: 3 tiers is the RA2 standard

### Option C: Tech tree with branches
- Pros: More depth
- Cons: Too complex for 2-min match
- Why rejected: Overdesign for this scope

## Why the Drone is from Tech Center (not War Factory)

Originally drone was in War Factory (vehicle section). User feedback (v1.30j): "Drone was confusingly placed with vehicles." We moved it to Tech Center because:
- Drones are high-tech, not industrial
- Tech Center already had Sniper and Heavy Tank
- It encourages players to build Tech Center (drones are useful)

## References

- `index.html` line ~2620: `BARRACKS_UNITS = ['rifleman', 'rocket', 'flame']`
- `index.html` line ~2622: `WARFACTORY_UNITS = ['fsv', 'tank']`
- `index.html` line ~2624: `TECHCENTER_UNITS = ['sniper', 'heavy', 'drone']`
- Tutorial hint: `index.html` line ~750: "TAP BARRACKS TO BEGIN"
- Locked state: `index.html` line ~2660: `function isUnitLocked(unitType)`
