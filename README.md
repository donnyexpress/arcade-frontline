# Arcade Frontline

A mobile 1vCPU 2D side-scrolling strategy game inspired by Red Alert, with chunky cartoon Clash Royale-style art.

## Play

Open `index.html` in any modern browser. On mobile, rotate to landscape and tap buttons to queue units / build structures. Hold a button to cancel and refund.

## Features

- **7 unit types**: Rifleman, Rocket Soldier, Sniper, Flamethrower, Light Tank, Medium Tank, Heavy Tank
- **3 production buildings**: Barracks → War Factory → Tech Center (each requires the previous)
- **2 defensive structures**: Pillbox, Turret
- **AI opponent** with state-machine + Markov decisions
- **Building queue** with cancel/refund
- **Spawn-from-building** animation (units come out of their production building)
- **Top-down isometric view** with chunky cartoon art (all PNGs are embedded as base64 — no external dependencies)

## Controls

- **Tap a unit button** (right column) → queue a unit (max 4 queued)
- **Tap a building button** (left column) → queue a building (max 10 buildings / 20 turrets)
- **Hold a button for ~500ms** → cancel the head of the queue and refund credits
- Units spawn from their producing building (Barracks for infantry, War Factory for tanks, Tech Center for Heavy)

## Files

- `index.html` — single self-contained game file (3.5MB, includes all embedded sprites)
- `docs/analysis/arcade-frontline-2026-08-16.md` — design doc with full history
- `art/` — original sprite PNGs (for reference; not needed at runtime since they're embedded)

## Tech

- Vanilla HTML + Canvas2D, single file, no build step
- All sprites embedded as base64 data URIs (no external requests)
- 60 FPS game loop with `requestAnimationFrame`
- Mobile landscape-first (touch + mouse)

## Deploy to GitHub Pages

1. Push `index.html` to a GitHub repo
2. Settings → Pages → Source: `main` branch, `/` (root)
3. Live at `https://<username>.github.io/<repo-name>/`

Note: a `.nojekyll` file is included so GitHub doesn't process the file through Jekyll (which could break the embedded scripts).
