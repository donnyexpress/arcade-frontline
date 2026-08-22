# AI Prompt Log

> **Per ADR-0005:** every AI generation call must be logged here BEFORE the call.

## Why we log prompts

AI image generation is **non-deterministic**. The same prompt can produce:
- Different styles on different runs
- Garbage on edge cases (the FSV was "TV static" once)
- Vastly different art when the model is updated

Without a log, we end up where we did on 2026-08-22: "What was the original prompt that generated the deployed units?"

## How to log a prompt

Before calling `mcode-tools connector call connector__matrix__generate_image`, create or update the relevant file in this directory.

**Template:**

```markdown
# AI Prompt: [Asset Name]

## v[N] (YYYY-MM-DD HH:MM)
**File:** `art/[path].png`
**Aspect ratio:** [ratio]
**Resolution:** [1K | 2K]
**Node ID (after gen):** [auto-fill]

**Prompt:**
> The full prompt text

**Why this prompt:**
- Goal 1
- Goal 2
- Reference: [link to similar prompt or doc]

**Result:**
- Quality: 1-10
- Issues: any problems
- Notes: anything interesting

**Followups:**
- v[N+1]: what changed
```

## Files in this directory

| File | Asset | Status |
|---|---|---|
| [`unit-grid.md`](unit-grid.md) | 3x4 unit sprite grid | Active |
| [`building-grid.md`](building-grid.md) | 3x2 building sprite grid | Active |
| [`sidebars.md`](sidebars.md) | UI sidebars (v1-v4) | Active |
| [`buttons.md`](buttons.md) | 4x2 button icons | Active |
| [`background.md`](background.md) | Battlefield terrain | Active |
| [`fsv-regenerations.md`](fsv-regenerations.md) | FSV failure log | Active |

## Lessons learned

1. **Always save the prompt before the call** — not after, when you've forgotten the wording
2. **Document WHY you chose this prompt** — the prompt itself is useless without context
3. **Log failures** — knowing what DIDN'T work is as valuable as knowing what did
4. **Reference the source image** — link to the file the prompt generated
5. **Note the cost** — track iterations to avoid runaway regeneration

## Cost control

AI image generation isn't free. The mcode-tools connector has per-call costs. Logging prompts helps:
- Reuse prompts (don't regenerate the same thing)
- Identify expensive iterations
- Plan budget for new assets
