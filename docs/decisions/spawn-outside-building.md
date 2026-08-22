# Decision: Spawn Units Outside Production Building

**Date:** 2026-08-21
**Status:** Accepted
**Deciders:** donnyexpress, user feedback

## Context

v1.30n had a visual bug: units spawned at the production building's center, which meant they appeared INSIDE the building footprint (overlapping the sprite).

User feedback (2026-08-21): "Units should not come out from the construction building. Spawn them outside the building."

## Decision

**Spawn position = building center + 65px (right side for player, left for AI).**

```javascript
function spawnUnit(unit, building) {
  // Old (buggy): spawn at building center
  // const spawnX = building.x;
  // const spawnY = building.y;
  
  // New: spawn 65px outside the building
  const offset = (unit.side === 'player') ? 65 : -65;
  const spawnX = building.x + offset;
  const spawnY = building.y + (Math.random() - 0.5) * 80; // small vertical spread
  
  unit.x = spawnX;
  unit.y = spawnY;
}
```

**Y-spread:** ±40px random offset prevents multiple units from stacking in a single column.

## Consequences

### Positive
- **Visual clarity:** units appear next to building, not overlapping
- **More natural:** looks like units march out the door
- **Better gameplay:** spawned units don't get caught in building collision

### Negative
- **Tuning risk:** 65px might be too close for large buildings
- **Slight randomness:** ±40px spread means position varies (minor visual jitter)

## Alternatives Considered

### Option A: Spawn at building door (specific point)
- Pros: Cleaner look
- Cons: Each building needs a "door" coordinate defined
- Why rejected: Overhead not worth it

### Option B: Spawn at base (always)
- Pros: Simple
- Cons: Not thematic — units should come from their production building
- Why rejected: Loses the "factory" feel

### Option C: Spawn at production queue's saved position
- Pros: Match the click point
- Cons: Confusing — player doesn't know where units will appear
- Why rejected: Unpredictable

## Tuning Notes

- 65px is approximately the building's footprint radius (small buildings)
- ±40px spread is enough to avoid vertical stacking
- AI units spawn mirrored: -65px from building center, going right

## References

- `index.html` line ~2055: `function spawnUnit(unit, bld)`
- Building footprint: `index.html` line ~1980: `BUILDER_FOOTPRINT = { barracks: 70, warFactory: 90, ... }`
- User feedback: chat 2026-08-21 "units should not come out from the construction building"
