# Arcade Frontline — Documentation Hub

**Status:** v1.30m (Production) · **Last updated:** 2026-08-22

This directory is the **single source of truth** for all Arcade Frontline design, implementation, and content decisions. Use it to answer *why* a decision was made — not just *what* was built.

---

## 🗂 Directory Structure

```
docs/
├── README.md                  ← You are here (index)
│
├── design-document.md        ← Living master design doc (GDD)
│   Updates with every design change. Authoritative for "what the game IS"
│
├── analysis/                  ← Historical design docs (one per phase)
│   ├── 2026-08-16-initial.md         (v1.0 → v1.20)  844 lines
│   ├── 2026-08-19-buildings-bg.md    (v1.21 → v1.29)  77 lines
│   └── 2026-08-22-sprites-chroma.md  (v1.30+)        (new)
│
├── adr/                       ← Architecture Decision Records
│   ├── 0001-vanilla-html-no-build.md
│   ├── 0002-phaser-over-canvas2d.md
│   ├── 0003-base64-embedded-sprites.md
│   ├── 0004-tabbed-columns.md
│   ├── 0005-prompt-history-tracking.md
│   └── TEMPLATE.md
│
├── decisions/                 ← Game design decisions (one per topic)
│   ├── unit-roster.md
│   ├── building-prerequisites.md
│   ├── economy-balance.md
│   ├── targeting-priority.md
│   ├── spawn-outside-building.md
│   └── chroma-key-strategy.md
│
├── ai-prompts/                ← AI generation prompt log
│   ├── README.md               (how prompts are tracked)
│   ├── unit-grid.md            (3x4 unit sprite prompt)
│   ├── building-grid.md        (3x2 building sprite prompt)
│   ├── sidebars.md             (Red Alert 2 UI panels)
│   ├── buttons.md              (4x2 button icons)
│   ├── background.md           (battlefield terrain)
│   └── fsv-regenerations.md    (FSV failure + recovery log)
│
└── changelog/                 ← Version-by-version change log
    ├── v1.0-to-v1.20.md        (initial release)
    ├── v1.21-to-v1.30.md       (sprint 1)
    └── current.md              (latest, auto-generated)
```

---

## 🚀 Quick Links

### For new contributors
1. Read [`design-document.md`](design-document.md) — what the game is
2. Skim [`analysis/2026-08-16-initial.md`](analysis/2026-08-16-initial.md) — how we got here
3. Check [`changelog/current.md`](changelog/current.md) — what's most recent

### For specific questions
- "Why is FSV a HUMVEE?" → [`ai-prompts/fsv-regenerations.md`](ai-prompts/fsv-regenerations.md)
- "Why are turrets in a perimeter arc?" → [`decisions/targeting-priority.md`](decisions/targeting-priority.md)
- "Why Phaser 3 instead of PixiJS?" → [`adr/0002-phaser-over-canvas2d.md`](adr/0002-phaser-over-canvas2d.md)
- "What was the original AI prompt for units?" → [`ai-prompts/unit-grid.md`](ai-prompts/unit-grid.md)

### For decision making
- New design decision? → Use [`adr/TEMPLATE.md`](adr/TEMPLATE.md)
- Want to understand a trade-off? → Check [`decisions/`](decisions/)

---

## 📋 Documentation Standards

### Every change must document:
1. **What** changed (one-line summary)
2. **Why** it changed (the problem it solves)
3. **Alternatives considered** (at least 2 other options with pros/cons)
4. **Trade-offs accepted** (what we gave up to gain the benefit)
5. **Where it lives** (file path, function name)
6. **How to verify** (test cases, expected behavior)

### Where to put new content
| Content type | Location | Example |
|---|---|---|
| "Why this tech?" | `adr/000X-name.md` | `0001-vanilla-html.md` |
| "Why this game design?" | `decisions/topic.md` | `decisions/economy-balance.md` |
| "What was the AI prompt?" | `ai-prompts/asset-name.md` | `ai-prompts/background.md` |
| "What changed in v1.X?" | `changelog/vX-to-vY.md` | `changelog/v1.30-to-v1.31.md` |
| "What was the plan for feature X?" | `analysis/YYYY-MM-DD-topic.md` | `analysis/2026-08-19-buildings.md` |

### Naming conventions
- **Files:** `kebab-case.md`, dated for time-sensitive docs (`2026-08-22-...`)
- **Sections:** `## Title Case` (Markdown `##`)
- **Subsections:** `### Title Case` (Markdown `###`)
- **Cross-references:** Use relative paths: `../design-document.md#unit-roster`

### Tone
- **Direct, not defensive.** State what was decided and why.
- **Show your work.** Include the alternatives you considered.
- **Date everything.** Decisions rot. Mark when they were made.
- **Reference the code.** Don't duplicate; link to `index.html#functionName`.

---

## 🔄 Maintenance

This doc tree is updated:
- **On every commit** that affects gameplay, art, or architecture
- **Before** any new feature is merged
- **After** any user-facing bug fix
- **Weekly** review of `changelog/current.md`

**Rule of thumb:** If you have to explain a design decision in chat, that explanation belongs in a doc. The chat scrolls away; the doc stays.
