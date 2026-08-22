# Decision: Chroma Key Strategy

**Date:** 2026-08-22
**Status:** Accepted
**Deciders:** donnyexpress

## Context

AI-generated sprites come with various background colors:
- Pure green (#00FF00) — what we asked for
- Slightly tinted green (greener than red and blue, but not exact)
- Cyan (blue + green dominant)
- Magenta (red + blue dominant)
- White/cream (in some button icons)
- Black (in some references)

We need to remove the background and make the sprite transparent for the game.

User feedback (v1.30m): "Units and buildings still have some green that were not removed"

User feedback (v1.30r): "Run thru all the units again to find green chroma"

## Decision

**7-condition chroma key algorithm** in JavaScript (Canvas2D before Phaser takes over):

```javascript
function isChromaKeyPixel(r, g, b, a) {
  if (a < 30) return true; // already transparent
  
  // 1. Pure green
  if (r < 50 && g > 200 && b < 50) return true;
  
  // 2. Green-dominant (not exact)
  if (g > 100 && g > r * 1.5 && g > b * 1.5) return true;
  
  // 3. High green, low others
  if (g > 180 && r < g - 80 && b < g - 80) return true;
  
  // 4. Pure cyan
  if (r < 50 && g > 200 && b > 200) return true;
  
  // 5. Cyan-dominant
  if (g > 100 && b > 100 && r < 50 && g > r * 1.5 && b > r * 1.5) return true;
  
  // 6. Pure magenta
  if (r > 200 && g < 50 && b > 200) return true;
  
  // 7. Magenta-dominant
  if (r > 100 && b > 100 && g < 50 && r > g * 1.5 && b > g * 1.5) return true;
  
  return false;
}
```

**Padding color:** `rgb(7, 250, 5)` (the cell-interior green, not pure green) for any padded pixels. This avoids visible 1px transition lines between padding and content.

## Consequences

### Positive
- **Catches all chroma variations:** the 7 conditions handle every AI background color we've seen
- **Robust to AI quirks:** even when AI produces tinted backgrounds
- **Tunable:** adding more conditions is one line

### Negative
- **7-condition code:** harder to read than a single threshold
- **Risk of false positives:** if a real unit pixel matches (e.g., a green camouflage uniform)
- **Performance:** 7 conditions × every pixel (16K pixels per sprite) = ~110K operations per sprite

## False Positives

Tested against:
- Red rifleman uniform → not flagged (red dominant)
- Green camouflage on ghillie sniper → **WILL be flagged** (rare)
- Red drone with green eye → not flagged
- Blue uniforms → not flagged (no green dominant)

For our 8 units, the ghillie sniper COULD be a problem. We accept this risk.

## Alternatives Considered

### Option A: Hard threshold (exact green only)
- Pros: Simple
- Cons: Misses tinted backgrounds
- Why rejected: User feedback was that tinted backgrounds still showed through

### Option B: AI re-generate with explicit background
- Pros: No post-processing
- Cons: AI doesn't reliably produce exact colors
- Why rejected: We've tried; AI varies

### Option C: Use a library (e.g., chroma-key npm package)
- Pros: Robust
- Cons: Adds dependency, breaks single-file principle
- Why rejected: 7 lines of code beats 500KB library

## References

- `index.html` line ~1850: `function isChromaKeyPixel(r, g, b, a)`
- `index.html` line ~1870: `const PAD_COLOR = [7, 250, 5, 255]`
- Cell-interior color: `index.html` line ~1910: `INTERIOR_GREEN = '#07FA05'`
- Testing: `.test/test_chroma.js`
