# ADR-0005: Document All AI Generation Prompts

**Date:** 2026-08-22
**Status:** Accepted
**Deciders:** donnyexpress

## Context

Throughout development, we used the `mcode-tools connector call connector__matrix__generate_image` CLI to generate sprites, backgrounds, and UI panels. After several regeneration attempts (units_grid v1-v4, FSV attempts 1-N), a critical question emerged:

> *"What was the original prompt that generated the deployed units_blue_3x4.png?"*

**Answer:** We couldn't fully recover it. The original generation call happened at 2026-08-19 15:24 — **before** tool result tracking started at 15:55. The bash command output that contained the prompt was lost.

This led to:
- Repeated regeneration attempts with slightly different prompts
- Inconsistent results (the FSV cell became TV static)
- Hours of investigation to find "what was the original prompt"
- The deployed game has 7/8 clean cells + 1 corrupt cell, with no record of why

## Decision

**Every AI generation call must be logged to `docs/ai-prompts/<asset-name>.md` BEFORE the call, with:**
1. The full prompt text
2. The aspect ratio and resolution
3. Why this prompt was chosen
4. Expected output
5. The result (filled in after the call)
6. Links to the output file

## Consequences

### Positive
- **Reproducibility:** any regeneration can use the exact same prompt
- **Failure analysis:** "why did the FSV corrupt?" → look at the prompt log
- **Iteration tracking:** see v1, v2, v3 attempts side by side
- **Onboarding:** new contributors can understand what was tried
- **Cost awareness:** see how many API calls were made

### Negative
- **Upfront work:** must write the doc before generating (not after)
- **Drift risk:** if the doc gets out of sync with the actual generation, it's worse than no doc
- **Encourages over-documentation:** might be tempted to log every tiny iteration

### Neutral
- Adds ~30 seconds per AI generation call

## Implementation

### Format for `docs/ai-prompts/<asset-name>.md`:

```markdown
# AI Prompt: <Asset Name>

## v1 (2026-08-19 15:24) — DEPLOYED
**File:** `art/units_blue_3x4.png`
**Aspect ratio:** 21:9 (3x4 grid)
**Resolution:** 1K

**Prompt:**
> Full prompt text here

**Why this prompt:**
- Wanted 16-bit pixel art style
- 80s retro video game look
- Photographic reference sheet aesthetic
- All 8 units in single 3x4 grid

**Result:** 7/8 units clean, FSV corrupted (TV static)

**Followups:**
- v1.30p: Regenerated FSV separately
- v1.30s: Reverted to original, fixed via chroma key
```

### Where prompts are stored

```
docs/ai-prompts/
├── README.md                  ← This standard
├── unit-grid.md              ← 3x4 unit sprite grid
├── building-grid.md          ← 3x2 building sprite grid
├── sidebars.md               ← Red Alert 2 UI panels
├── buttons.md                ← 4x2 button icons
├── background.md             ← Battlefield terrain
└── fsv-regenerations.md      ← FSV failure + recovery log
```

## Why this matters

The alternative is what we just experienced: **regenerating assets blind** because the original prompt is lost. With this ADR in effect:

1. User asks: "What was the FSV prompt?"
2. Answer: "It's in `docs/ai-prompts/fsv-regenerations.md`"
3. Total time: 5 seconds, not 30 minutes

## Alternatives Considered

### Option A: Don't track prompts, just iterate
- Pros: No upfront work, faster iteration
- Cons: Lost history, can't reproduce, can't debug
- Why rejected: This is what led to the current confusion

### Option B: Track only successful prompts
- Pros: Less noise
- Cons: Loses the "what didn't work" history
- Why rejected: Failures are informative; the FSV TV static IS the lesson

### Option C: Track in code comments
- Pros: Lives near the asset
- Cons: Mixes code and design rationale, hard to find later
- Why rejected: We don't have a code asset — the base64 string IS the asset

## References

- Initial confusion: session messages 2026-08-22 (user: "tell me what you found as the prompt used")
- The FSV failure: `docs/ai-prompts/fsv-regenerations.md`
- Architecture Decision Record template: `TEMPLATE.md`
