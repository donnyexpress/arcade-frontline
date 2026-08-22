# ADR-0002: Phaser 3 Instead of Vanilla Canvas2D

**Date:** 2026-08-19
**Status:** Accepted
**Deciders:** donnyexpress

## Context

Initial prototype (v1.0-v1.20) used raw HTML5 Canvas 2D API. As features grew (sprites, animations, projectiles, particles), the manual code became hard to maintain:
- Sprite loading/positioning/scaling was ~500 lines of repetitive code
- Hit detection was manual rectangle math
- Animation required per-frame manual logic
- Texture management was hand-rolled

The original Canvas2D prototype shipped and worked, but had ~2000 lines of rendering code that was hard to extend.

## Decision

**Adopt Phaser 3.80.1** (via jsDelivr CDN) for the rendering layer. Replace the manual canvas drawing with Phaser scenes.

## Consequences

### Positive
- **Texture caching** built-in: load once, reuse across sprites
- **Per-sprite alpha/scale/rotation** with one line vs twenty
- **Container system** for grouping (base, building, sprite)
- **Scene lifecycle** for the create/update/render loop
- **Camera** support for future scrolling/zooming
- **Health bar** becomes a `Phaser.GameObjects.Container` of rectangles

### Negative
- **14MB → 14.4MB** (Phaser adds ~400KB)
- **Abstraction cost:** bugs in Phaser are harder to debug than your own code
- **Phaser version lock:** 3.80.1, not 4.x (which has breaking changes)
- **Loss of pixel control:** Canvas2D gives you every pixel; Phaser decides how to draw

### Neutral
- Migration was incremental — kept Canvas2D as fallback for non-sprite rendering

## Alternatives Considered

### Option A: PixiJS
- Pros: Lighter, faster for 2D-only
- Cons: Less built-in physics, less game framework
- Why rejected: Phaser has better game-focused tooling (scenes, timers, tweens)

### Option B: Three.js
- Pros: 3D-ready
- Cons: Overkill for 2D, heavier
- Why rejected: 2D sprites + simple camera is all we need

### Option C: Custom WebGL
- Pros: Total control
- Cons: ~5000 lines of boilerplate
- Why rejected: We're making a game, not a renderer

### Status quo (Canvas2D)
- Pros: Already working
- Cons: Adding features was 5x more code than Phaser equivalents
- Why rejected: Complexity was crushing feature velocity

## Migration Path

1. v1.21: Phaser 3 added, base + buildings rendered as Phaser sprites
2. v1.22: Units converted to Phaser sprites (replaced 800 lines of canvas code)
3. v1.25: Health bars as Phaser containers
4. v1.28: Projectiles as Phaser graphics
5. v1.30: Building sprites via Phaser atlas

## References

- `index.html` line ~1994: `class GameScene extends Phaser.Scene`
- `index.html` line ~2170: `this.load.image('background', BACKGROUND_DATA_URL)`
- `index.html` line ~2390: `addBuildingSprite(side, bld)`
