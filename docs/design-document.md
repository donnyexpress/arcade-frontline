# Arcade Frontline — Game Design Document (GDD)

**Version:** 1.30t
**Last updated:** 2026-08-22
**Status:** Production (live on GitHub Pages)

> **This is the authoritative reference for what Arcade Frontline IS.** For why a decision was made, see `adr/` and `decisions/`. For what was tried, see `ai-prompts/`. For what changed, see `changelog/`.

---

## 🎮 Game Overview

**Title:** Arcade Frontline
**Tagline:** "Tap. Build. March. Win."
**Genre:** 1vCPU 2D side-scrolling strategy
**Platform:** Mobile browser (landscape), desktop browser
**Match length:** 2-3 minutes
**Player count:** 1vCPU

### Inspiration
- **Red Alert 2** — building-gated production, scaling output per building
- **Clash Royale** — chunky stylized art, tap-to-queue, hold-to-cancel
- **Angry Birds** — landscape mobile, accessible controls, 2-3 min sessions

---

## 🎯 Core Loop

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Player spends credits to auto-construct a building        │
│    (system picks the first empty slot)                        │
│ 2. Each building unlocks units and contributes to production │
│ 3. Player taps a unit button → unit queued at production bld │
│ 4. Unit spawns 65px outside the building (±40px Y-spread)    │
│ 5. Unit auto-marches toward enemy base, auto-attacks in range │
│ 6. Units attack priority: base > production > defense        │
│ 7. AI does the same from the other side                      │
│ 8. Destroy all enemy buildings, then the enemy base, to win │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛 Buildings (Production Hubs + Defenses)

### 3 Production Buildings (Tier-gated)

| Tier | Building | Cost | HP | Unlocks | Visual |
|---|---|---|---|---|---|
| 0 | Main Base | 0 (default) | 500 | — | large building |
| 1 | Barracks | 100 | 80 | Rifleman, Rocket, Flamethrower | red brick roof hut |
| 2 | War Factory | 150 | 100 | FSV, Medium Tank | industrial shed + smokestack |
| 3 | Tech Center | 250 | 100 | Sniper, Heavy Tank, Drone | satellite dish + radar |

### 2 Defensive Structures (no tier)

| Structure | Cost | HP | Damage | Range | Behavior |
|---|---|---|---|---|---|
| Pillbox | 75 | 120 | 12 | 250 px | Static, attacks nearest enemy |
| Turret | 150 | 200 | 22 | 350 px | Tracks enemies, smart targeting |

**See:** [`decisions/building-prerequisites.md`](decisions/building-prerequisites.md)

---

## ⚔ Unit Roster (8 types)

### Infantry (from Barracks + Tech Center)

| Unit | Cost | HP | Damage | Range | Speed | Special |
|---|---|---|---|---|---|---|
| Rifleman | 10 | 20 | 4 | 60 | 90 px/s | cheap, fast |
| Rocket Soldier | 25 | 20 | 12 | 200 | 60 px/s | splash damage |
| Flamethrower | 30 | 35 | 18 | 100 | 55 px/s | cone attack |
| Sniper | 50 | 25 | 30 | 400 | 40 px/s | long range, low HP |

### Vehicles (from War Factory + Tech Center)

| Unit | Cost | HP | Damage | Range | Speed | Special |
|---|---|---|---|---|---|---|
| FSV (HUMVEE) | 35 | 50 | 12 | 120 | 95 px/s | scout, fast |
| Medium Tank | 40 | 80 | 15 | 140 | 45 px/s | balanced |
| Heavy Tank | 80 | 180 | 22 | 140 | 30 px/s | slow, tanky |

> **Stats source:** `CFG.UNITS` in `index.html`. See [`architecture/tuning-numbers.md`](architecture/tuning-numbers.md) for the canonical reference.

### Drone (Tech Center)

| Unit | Cost | HP | Damage | Range | Speed | Special |
|---|---|---|---|---|---|---|
| Drone | 60 | 15 | 50 (AoE) | 80 | 110 px/s | suicide at target, 60px radius, 50% falloff |

---

## 💰 Economy

| Parameter | Value | Notes |
|---|---|---|
| Starting credits | 200 | Can build barracks immediately |
| Passive income | 6/s | +1/s per production building |
| Soft cap | 500 | Excess rolls over but feels wasteful |
| Match time | 180s (3 min) | `MATCH_TIME` |
| Kill bounty | 25% of unit cost | `KILL_BOUNTY` |
| Refund on cancel | 50% | RA2 convention |
| Refund on destroy | 50% | For queued units when bld destroyed |

**Match pacing:**
- 0:00 — start with 200 credits
- 0:02 — first barracks (200 - 100 = 100, then passive 6/s)
- 0:05 — first rifleman spawns (~15s production)
- 0:30 — second building (war factory) built
- 1:00 — third building (tech center) built
- 2:00 — match end (typical)

**See:** [`decisions/economy-balance.md`](decisions/economy-balance.md)

---

## 🤖 AI

**Type:** State machine + smart targeting (NOT pure Markov)

**4 states:**
1. **Saving** — accumulate credits for next building
2. **Defending** — base under attack, prioritize defense
3. **Pushing** — enough units to attack, send waves
4. **Emergency** — base HP < 30%, mass defenders

**Smart targeting score:**
```
score = distance/10 + hp/10 - (1000 if base) - (500 if production) + (200 if defense)
       + (500 if target is attacking me) + (100 if target is attacking nearby friendly)
```

**Always produces units:** `autoAIBuild()` runs every 0.5s, queues cheapest available unit

**See:** [`decisions/targeting-priority.md`](decisions/targeting-priority.md)

---

## 🎨 Art Style

- **Pixel art 16-bit** for all units/buildings (Red Alert 2 inspired)
- **Photographic 80s VHS** for button icons
- **Top-down view** of battlefield
- **Faction colors:**
  - Player: blue (HUD, units, buildings)
  - AI: crimson red (HUD, units, buildings)
- **Chroma key strategy:** 7-condition green/cyan/magenta removal (see `decisions/chroma-key-strategy.md`)

**Asset locations:** all base64 embedded in `index.html` (~14MB total)

---

## 📱 Controls (Mobile Landscape)

| Input | Action |
|---|---|
| Tap unit button (right) | Queue unit (max 4) |
| Hold unit button (500ms) | Cancel head of queue + 50% refund |
| Tap building button (left) | Queue building (max 10) |
| Hold building button | Cancel head of queue + 50% refund |
| Tab button (left) | Switch between PROD / DEF |
| Tab button (right) | Switch between INF / VEH |

**No drag, no scroll, no zoom.** Everything fits in landscape viewport.

**See:** [`adr/0004-tabbed-columns.md`](adr/0004-tabbed-columns.md)

---

## 🏆 Win / Lose States

**Win:** Destroy all enemy production buildings + defenses, then destroy the enemy base (HP → 0)

**Lose:** Same conditions, but from the enemy's perspective

**Tie:** If both bases reach 0 HP simultaneously, it's a draw (rare)

**Match-end UI:** Shows final stats, winner, time elapsed, units produced

---

## 🧪 Testing

**Test suite:** `.test/test_comprehensive.js` (47 tests)

**Coverage:**
- Building placement and prerequisites
- Unit production and queues
- Combat (damage, HP, death)
- AI decisions
- Win/lose conditions
- Economy (credits, refunds, soft cap)
- Performance (60 FPS target)
- Visual verification (screenshot tests)

**Test results:** 47/47 passing (as of v1.30m)

---

## 📂 File Structure

```
arcade-frontline/
├── index.html              ← Single self-contained game file (~14MB)
├── art/                    ← Source PNG files (embedded in HTML)
├── .test/                  ← Test suite (47 tests)
├── docs/                   ← This documentation
│   ├── README.md
│   ├── design-document.md  ← (this file)
│   ├── analysis/           ← Historical design docs
│   ├── adr/                ← Architecture Decision Records
│   ├── decisions/          ← Game design decisions
│   ├── ai-prompts/         ← AI generation prompt log
│   └── changelog/          ← Version-by-version changelog
└── README.md
```

---

## 🚀 Deployment

**URL:** https://donnyexpress.github.io/arcade-frontline/
**Platform:** GitHub Pages
**Status:** Public, live

**Deploy steps:**
1. Commit changes to `main`
2. `git push` (auto-deploys via Pages)
3. Cache invalidation: ~5 minutes

---

## 🎯 Future Work (Backlog)

**Not committed, just ideas:**
- Sound effects
- More unit types (artillery, anti-air)
- More defensive structures (tall wall, laser)
- Multi-mission campaign
- Local 2-player mode
- AI difficulty levels
- Tutorial mode
- Replay system

**For implementation rationale, see `adr/` and `decisions/`.**
