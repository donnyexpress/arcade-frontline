# Decision: Economy Balance

**Date:** 2026-08-21
**Status:** Accepted
**Deciders:** donnyexpress

## Context

Initial economy (v1.0):
- Starting credits: 50
- Passive income: 4/s
- Soft cap: 300

This led to a "freeze" feel: players couldn't build anything in the first 10 seconds because they needed to save up to 100 for a barracks.

User feedback (2026-08-21): "Early game feels frozen — can't do anything until barracks is built"

## Decision

**v1.30i economy:**

| Parameter | Old | New | Why |
|---|---|---|---|
| Starting credits | 50 | **200** | Can immediately queue a barracks |
| Passive income | 4/s | **6/s** | Faster mid-game progression |
| Soft cap | 300 | **500** | Saves up for tech center (250) |
| Barracks cost | 100 | 100 | — |
| War Factory cost | 150 | 150 | — |
| Tech Center cost | 250 | 250 | — |

**Unit costs (unchanged):**
- Rifleman: 10
- Rocket: 25
- Sniper: 35
- Flamethrower: 30
- Drone: 40
- FSV: 35
- Tank: 60
- Heavy: 100

**Building refund on cancel:** 50% of cost (RA2 convention)

## Match Pacing

With these numbers, a typical match:
- 0:00 — start with 200 credits
- 0:02 — first barracks (200 - 100 = 100, then passive 6/s)
- 0:05 — first rifleman spawns (~15s production, costs 10)
- 0:30 — second building (war factory) built
- 1:00 — third building (tech center) built
- 2:00 — match end

## Consequences

### Positive
- **No "freeze" feel:** player has something to do from second 0
- **Build order matters:** 200 = barracks + something, or tech rush
- **Smoother curve:** credits accumulate faster as more buildings exist

### Negative
- **Less economic tension:** player no longer has to carefully save
- **AI vs player:** AI uses same economy, so no asymmetry
- **Match might end faster** if both players rush

## Alternatives Considered

### Option A: Even more starting credits (300)
- Pros: No save-up at all
- Cons: Tech rush too easy
- Why rejected: Removes the barracks-first decision

### Option B: Faster passive income (10/s)
- Pros: Quick ramp
- Cons: Buildings feel meaningless if you can just wait
- Why rejected: Income is part of the strategy, not the substitute

### Option C: Keep old numbers but add "free" units
- Pros: Action from start
- Cons: Confusing — why is this unit free?
- Why rejected: Asymmetric economy is weird

## Refund Rules

When you cancel a building in queue:
- 50% refund if cancelled before construction starts
- 0% refund if cancelled mid-construction (RA2 convention)
- When a building is destroyed by enemy, queued units are removed (50% refund)

```javascript
function cancelQueuedItem(queue, type) {
  const cost = COSTS[type] / 2; // 50% refund
  credits += cost;
  queue.shift(); // remove head
}
```

## References

- `index.html` line ~2610: `STARTING_CREDITS = 200`
- `index.html` line ~2611: `PASSIVE_INCOME = 6`
- `index.html` line ~2612: `CREDIT_SOFT_CAP = 500`
- `index.html` line ~2890: `function refund(percentage)`
- User feedback: chat 2026-08-21 "early game feels frozen"
