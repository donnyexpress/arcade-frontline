# Event Catalog

**Purpose:** Single source of truth for all events the game emits.

> When you see `emit('foo:bar', ...)` in the code, this file explains what it does, who listens, and what the payload is.

---

## Event format

Events are strings in `kebab:namespace` format. Handlers receive positional arguments:

```javascript
emit('unit:spawned', side, unitKey, x, y);

// Subscribe:
on('unit:spawned', (side, unitKey, x, y) => {
  // do something
});
```

**Namespace conventions:**
- `unit:*` — unit lifecycle events
- `building:*` — building lifecycle events
- `turret:*` — turret lifecycle events
- `projectile:*` — projectile/visual effects
- `match:*` — match-level events (start, end, restart)

---

## Catalog

### `unit:spawned`

**Emitted by:** `spawnUnit(side, unitKey)` in Layer 3
**Payload:** `(side: 'red'|'blue', unitKey: string, x: number, y: number)`
**Subscribers:**
- `GameScene.spawnUnitSprite` (Phaser renderer)

When a unit is created in `state.sides[side].units`, this event fires so the render layer can create the corresponding sprite.

---

### `unit:died`

**Emitted by:** (NOT YET EMITTED — see [Future events](#future-events))
**Payload:** `(unit: UnitObject)`
**Subscribers:** (none yet)

Should fire when a unit's HP drops to 0. Would allow:
- Death animation
- Sound effect
- Bounty credit (currently happens BEFORE death in some code paths)

---

### `building:placed`

**Emitted by:** `placeBuildingOnMap(side, type)` in Layer 3
**Payload:** `(side: 'red'|'blue', bld: BuildingObject)`
**Subscribers:**
- `GameScene.addBuildingSprite` (Phaser renderer)

---

### `building:destroyed`

**Emitted by:** (NOT YET EMITTED)
**Payload:** `(side: 'red'|'blue', bld: BuildingObject)`
**Subscribers:** (none yet)

---

### `turret:placed`

**Emitted by:** `placeTurretOnMap(side, type)` in Layer 3
**Payload:** `(side: 'red'|'blue', t: TurretObject)`
**Subscribers:**
- `GameScene.addTurretSprite` (Phaser renderer)

---

### `projectile:fire`

**Emitted by:** `updateUnit` and `updateTurrets` in Layer 3
**Payload:** `(x: number, y: number, tx: number, ty: number, color: number)`
**Subscribers:**
- `GameScene.fireProjectile` (Phaser renderer — draws a line)

`color` is a hex int (`0xff8800` for drone, `0xff6666` for red turret, etc.)

---

### `match:restart`

**Emitted by:** restart button handler in Layer 5
**Payload:** `()`
**Subscribers:**
- `GameScene.createBaseSprites` (recreates base sprites after restart)

---

## Future events

These are events that SHOULD exist but aren't emitted yet. They were identified during the refactor but kept out of scope to keep the diff minimal.

| Event | Should fire when | Why it matters |
|---|---|---|
| `unit:died` | unit HP <= 0 | Death animation, sound |
| `building:destroyed` | building HP <= 0 | Demolition animation, refund |
| `unit:damaged` | unit HP < maxHP | Floating damage numbers |
| `building:damaged` | building HP < maxHP | Floating damage numbers |
| `match:end` | winner determined | Win screen animation |
| `credits:changed` | side credits change | Could play a "cha-ching" sound |
| `kill:bounty` | enemy unit killed | Show "+5" floating text |

---

## How to add a new event

1. Decide the event name (`noun:verb_past_tense`)
2. Add an entry to this catalog with payload and subscribers
3. In the logic function, add `emit('noun:verb', arg1, arg2, ...)`
4. In the subscriber (usually GameScene), add `on('noun:verb', handler)`
5. Add a test case in `docs/audit/scripts/check-doc-code-sync.sh` if numeric values changed

## How to debug events

```javascript
// Add this in dev tools console
const originalEmit = emit;
window.emit = function(event, ...args) {
  console.log('[event]', event, ...args);
  return originalEmit(event, ...args);
};
```

This logs every event as it fires. Remove when done debugging.
