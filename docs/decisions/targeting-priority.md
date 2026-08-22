# Decision: Targeting Priority for Units & Turrets

**Date:** 2026-08-21
**Status:** Accepted
**Deciders:** donnyexpress, user feedback

## Context

v1.30 had a bug: units would attack any nearby enemy, with no preference. This led to:
- Units walking past turrets to attack random enemies
- The main base (lowest HP) was sometimes ignored
- Production buildings (high strategic value) were not prioritized

User feedback (2026-08-21): "Defensive buildings should be laid around the perimeter not at the main construction building. Units should attack buildings closer to it."

## Decision

**Smart targeting score (lower = better target):**

```javascript
function targetScore(target, attacker) {
  let score = 0;
  
  // Distance: prefer close targets
  score += distance(attacker, target) / 10;
  
  // Type priority
  if (target.isBase) score -= 1000;          // base = top priority
  if (target.isProductionBuilding) score -= 500; // barracks/war factory/tech center
  if (target.isDefense) score += 200;        // pillbox/turret (lower priority)
  
  // HP: prefer wounded
  score += target.hp / 10;
  
  // Attacker-priority: if target is attacking ME, +500 penalty (don't shoot back)
  // If target is attacking nearby friendly, +100 penalty
  if (target.targetUnit === attacker) score += 500;
  if (isNearby(target.targetUnit, attacker, 200)) score += 100;
  
  return score;
}
```

**Perimeter turret placement:**
- 8 turret slots in zigzag arc, 290-396px from base center
- Each slot tries to attack a target passing near the base
- Smart targeting prevents all 8 turrets from focusing the same target

## Consequences

### Positive
- **Turrets defend the base** instead of chasing random units
- **Base attacks first:** forces opponent to defend their base, not harass
- **Wounded units targeted:** kills finish faster
- **Spread damage:** turrets don't all focus one target

### Negative
- **Slightly complex code:** target score function is 20 lines vs 5
- **Tunable:** wrong weights could make units ignore wounded vs fresh

## Alternatives Considered

### Option A: Nearest target only
- Pros: Simple, predictable
- Cons: Units walk past everything to attack far enemies
- Why rejected: Bad emergent behavior

### Option B: Random target
- Pros: Fair, simple
- Cons: No strategic depth
- Why rejected: Player can't predict or influence outcomes

### Option C: Red Alert 2 exact formula
- Pros: Authenticity
- Cons: Complex, requires extensive playtesting
- Why rejected: Our units are simpler; we don't need exact C&C weights

## References

- `index.html` line ~3170: `function targetScore(target, attacker)`
- `index.html` line ~3200: `function isNearby(unit, point, radius)`
- Perimeter layout: `index.html` line ~2840: `TURRET_SLOTS = [...]`
- User feedback: chat 2026-08-21 "defensive buildings should be laid around the perimeter"
