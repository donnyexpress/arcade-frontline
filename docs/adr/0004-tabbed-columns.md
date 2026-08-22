# ADR-0004: Tabbed Columns for Building & Unit Categories

**Date:** 2026-08-20
**Status:** Accepted
**Deciders:** donnyexpress

## Context

v1.30 needed to show 3 production buildings + 2 defensive structures in a 110px-wide left column. With 5 buttons stacked vertically, the column was 660px tall — leaving no room for the 320px-tall phaser map.

User feedback (Aug 21): "The defensive buildings should be laid around the perimeter not at the main construction building."

This created two problems:
1. Vertical space crunch
2. Conceptual confusion: production buildings and defenses have different roles

## Decision

**Group buttons by category with tabs.**

- Left column: `PROD` (3 buildings) | `DEF` (2 structures)
- Right column: `INF` (4 infantry) | `VEH` (4 vehicles)

Each tab shows a count badge. Active tab has faction-colored background.

## Consequences

### Positive
- **Fits in column:** 3 buttons fit where 5 didn't
- **Conceptual clarity:** offense vs defense, infantry vs vehicles
- **Visual hierarchy:** active tab stands out, inactive tabs are dim
- **Extensible:** can add new types per tab without column overflow

### Negative
- **One extra click** to access non-active tab (e.g., DEF)
- **State to track:** which tab is active per column
- **More DOM elements:** tab buttons + content divs

### Neutral
- 2-column layout now feels intentional vs "everything in one list"

## Alternatives Considered

### Option A: Scroll the column
- Pros: All buttons always visible
- Cons: User has to scroll during gameplay, breaks mobile flow
- Why rejected: Mobile players don't want to scroll during a 2-min match

### Option B: Smaller buttons (no tabs)
- Pros: Single view
- Cons: Icons too small to identify at a glance
- Why rejected: 60×60px buttons are hard to read

### Option C: Bottom toolbar
- Pros: Standard RTS layout
- Cons: Eats into the already-tall phaser viewport
- Why rejected: Already squeezed vertically

## Visual Design

```css
/* Active tab uses faction color */
.tab-btn.active.left { background: rgba(230, 57, 70, 0.4); }  /* red */
.tab-btn.active.right { background: rgba(29, 155, 240, 0.4); } /* blue */

/* Inactive tabs are dim */
.tab-btn { background: rgba(0, 0, 0, 0.3); }
```

Tab content uses `data-tab` attribute and is hidden with `.hidden { display: none }`.

## References

- `index.html` line ~470: `<div class="tab-bar">` (left column)
- `index.html` line ~485: `<div class="tab-bar">` (right column)
- `index.html` line ~2630: `UNIT_TABS = { inf: [...], veh: [...] }`
- Decision doc: [`../decisions/building-prerequisites.md`](../decisions/building-prerequisites.md)
