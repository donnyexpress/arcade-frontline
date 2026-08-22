# ADR-0006: Event Bus for Logic-Render Decoupling

**Date:** 2026-08-22
**Status:** Accepted
**Deciders:** donnyexpress

## Context

The game has 9 direct calls from the logic layer (functions at lines 1335-2181) to the Phaser render layer (GameScene at lines 2181+):

```javascript
// In logic:
if (scene) scene.spawnUnitSprite(side, unitKey, spawnX, spawnY);
if (scene) scene.fireProjectile(...);
if (scene) scene.addBuildingSprite(side, bld);
// etc.
```

This is **tight coupling** that makes it impossible to:
- Unit-test logic without a Phaser scene
- Swap renderers (canvas, WebGL2, headless)
- Add a replay system (would re-run render code)
- Add a network sync layer (would need to suppress render on remote side)

The audit at `docs/audit/2026-08-22-doc-code-audit.md` flagged this as an architectural smell.

## Decision

**Add a minimal event bus** between the logic and render layers.

```javascript
const EVENTS = {};
function on(event, handler) { (EVENTS[event] = EVENTS[event] || []).push(handler); }
function emit(event, ...args) { (EVENTS[event] || []).forEach(h => h(...args)); }
function clearEvents() { for (const k in EVENTS) delete EVENTS[k]; }
```

**Logic emits, Render subscribes:**
```javascript
// Before (logic):  if (scene) scene.spawnUnitSprite(...)
// After (logic):   emit('unit:spawned', side, key, x, y);

// Before (render): spawnUnitSprite(side, key, x, y) { ... }
// After (render):  on('unit:spawned', (side, key, x, y) => this.spawnUnitSprite(...));
```

**Why this approach:**
1. **Minimal code** — 4 lines for the bus itself
2. **Zero deps** — no library, no PubSub pattern, no Redux
3. **Fits single-file** — doesn't add files
4. **Familiar** — every JS dev has seen this pattern
5. **Reversible** — can swap to real event emitter later

## Alternatives Considered

### Option A: Use a real event emitter library
- E.g. `eventemitter3` (3KB)
- Pros: typed, well-tested, mature
- Cons: +3KB to the file, new concept, npm dep
- Why rejected: 4 lines of code does the job

### Option B: Inject scene into all logic functions
- Pros: explicit, no hidden state
- Cons: every function signature changes
- Why rejected: invasive, ugly

### Option C: Observer pattern with per-sprite subscribers
- Pros: very granular
- Cons: over-engineered for 9 coupling points
- Why rejected: 9 events is not enough to justify the complexity

### Option D: Reactive state (Redux, MobX, etc.)
- Pros: all state changes are explicit
- Cons: huge rewrite
- Why rejected: game state is small enough that this is overkill

## Event Catalog

See [`../architecture/event-catalog.md`](../architecture/event-catalog.md) for the full list.

| Event | Emitted by | Subscribed by |
|---|---|---|
| `unit:spawned` | `spawnUnit` | `GameScene` |
| `building:placed` | `placeBuildingOnMap` | `GameScene` |
| `turret:placed` | `placeTurretOnMap` | `GameScene` |
| `projectile:fire` | `updateUnit`, `updateTurrets` | `GameScene` |
| `match:restart` | restart button handler | `GameScene` |

## Consequences

### Positive
- **Logic is renderer-agnostic** — can run with no Phaser at all
- **Testable in isolation** — unit tests don't need to mock Phaser
- **Replayable** — record events, replay → identical game state + visual
- **Networkable** — send events over WebSocket, replay on remote
- **Debuggable** — add `console.log` in event handler to trace all visual updates
- **Cheap to add new events** — `emit('foo:bar', ...)` is one line

### Negative
- **One more layer to understand** — devs must read this ADR
- **No type safety** — `emit('foo', 'wrong', 'args')` silently fails
- **Event name typos** are silent — `emit('unt:spawned', ...)` does nothing
- **Listener leaks** — must call `clearEvents()` on restart (or use a context ID)

### Neutral
- 9 coupling points → 9 emit calls + 1 bus
- Logic still uses `scene` reference for non-event things (e.g. update loop)

## Lifecycle

```javascript
// In GameScene.create():
on('unit:spawned', this.handleUnitSpawned);
on('projectile:fire', this.handleProjectileFire);
// ... etc

// In restartMatch() or initGame():
clearEvents();
// Re-register in next GameScene.create()
```

## Future: Type Safety

If event name typos become a problem:
```javascript
const EVENTS = Object.freeze({
  UNIT_SPAWNED: 'unit:spawned',
  BUILDING_PLACED: 'building:placed',
  // ...
});
```

But for now, plain strings are fine.

## References

- `index.html` Layer 2.5: `EVENTS`, `on`, `emit`, `clearEvents` (~5 lines)
- `index.html` Layer 3: 9 `if (scene) scene.foo(...)` → `emit('foo', ...)`
- `index.html` Layer 4: `GameScene.registerEventHandlers()` (~6 lines)
- Audit: [`../audit/2026-08-22-doc-code-audit.md`](../audit/2026-08-22-doc-code-audit.md)
- Analysis: [`../analysis/2026-08-22-event-bus.md`](../analysis/2026-08-22-event-bus.md)
