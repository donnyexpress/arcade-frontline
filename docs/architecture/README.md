# Architecture Documentation

**Purpose:** Help anyone navigate the 3582-line `index.html` quickly

## Documents

- [`overview.md`](overview.md) — High-level architecture, layer model, data flow
- [`tuning-numbers.md`](tuning-numbers.md) — Single source of truth for all `CFG` constants

## Quick navigation

**"I want to..."**

| Want to... | Look at |
|---|---|
| Add a new unit | `tuning-numbers.md#unit-roster-8-units` + add to `CFG.UNITS` and `BUILDING_TREE.unlocks` |
| Add a new building | `tuning-numbers.md#buildings-production-defenses` + add to `CFG` and `BUILDING_TREE` |
| Change a balance number | `tuning-numbers.md` (find the constant, change it) |
| Add a new AI state | `overview.md#layer-3-game-logic-functions` (find `updateAI`) |
| Add a new UI button | `overview.md#layer-5-ui-dom-side` (find `buildUnitButtons`) |
| Change rendering | `overview.md#layer-4-rendering-phaser-scene` (find `GameScene`) |

## How this stays current

Every time `index.html` changes:
1. Update the relevant section in `tuning-numbers.md`
2. If it's user-facing, update `design-document.md` too
3. Commit with: `git commit -m "balance: <change>"`

**Every quarter**, review:
- Are there constants in `index.html` that aren't in `tuning-numbers.md`?
- Are there constants in `tuning-numbers.md` that aren't in `index.html`?
- Are there values in `design-document.md` that disagree with `index.html`?

## Architectural Smells (current)

See [`overview.md#architectural-smells-current`](overview.md#architectural-smells-current) for known issues.
