# Arcade Frontline — Sprites & Chroma Key (2026-08-22)

## Impact

- Document all AI generation prompts
- Recover FSV sprite to match other 7 units' style
- Validate chroma key catches all background variations
- Establish prompt-tracking standard

## Plan

### 1. Establish prompt log standard (ADR-0005)
- Create `docs/ai-prompts/` directory
- Per-asset markdown files
- Log prompt BEFORE generation call
- Document result AFTER (with quality 1-10 rating)

### 2. Document FSV regeneration history
- 4 attempts (v1.30p, r, s, t)
- Each attempt's prompt, result, and why it was rejected or accepted
- Final state: v1.30t pixel art HUMVEE in matching style

### 3. Validate chroma key
- Test 7-condition chroma key against all 8 unit sprites
- Verify no green/cyan/magenta remains on final assets
- Test padding color matches interior to avoid transition lines

### 4. Update design doc
- Add chroma key strategy section
- Add prompt tracking rationale
- Link to `docs/ai-prompts/` for each asset

## Test Matrix

| Change | Test | Expected |
|---|---|---|
| Prompt log | Each AI call adds doc entry | Yes |
| FSV sprite | Visually inspect in game | Matches other units' style |
| Chroma key | Run `.test/test_chroma.js` | 0 green pixels remain |
| Padding | Edge pixels check | No visible 1px line between padding and content |

## Save Path

- New: `docs/ai-prompts/` directory (5 files + README)
- New: `docs/adr/0005-prompt-history-tracking.md`
- New: `docs/decisions/chroma-key-strategy.md`
- New: `docs/changelog/v1.21-to-v1.30.md` (Sprint 1 history)
- New: `docs/changelog/current.md` (latest work)
- New: `docs/README.md` (documentation hub)
- New: `docs/design-document.md` (master GDD)

## Status

✅ All docs written, ready to commit
