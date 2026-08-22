# AI Prompt: FSV Regeneration History

> **The most-iterated asset in the project.** This file documents all FSV regeneration attempts to prevent future me from redoing the same work.

## The Problem

The original 3x4 unit grid (`units_blue_3x4.png`, generated 2026-08-19 15:24) had:
- ✅ 7/8 units clean and crisp
- ❌ 1/8 units (FSV) corrupted with **TV static noise** (white/black pixel speckle)

User feedback on v1.30o: "The fire support vehicle unit still has green lines"

User feedback on v1.30p: "Replace corrupted FSV sprite with new HUMVEE image"

User feedback on v1.30r: "Revert to original, but remove green lines"

User feedback on v1.30s: "Use original image that was pushed out previously. it had more consistent art, but need to remove the green lines"

User feedback on v1.30t: "Use back the previous prompt to generate the images. tell me what you found as the prompt used"

**Result:** The original prompt was lost. FSV went through 4 regeneration attempts.

---

## Attempt 1 (v1.30p) — 2026-08-21
**File:** `art/fsv_v4_style.jpg`
**Approach:** Generate single HUMVEE with photo-realistic prompt

**Prompt:**
> "Single US military HUMVEE fire support vehicle with mounted machine gun, side view facing right, photo-realistic style, on solid bright green chroma key background. Sharp details, modern military vehicle."

**Result:** Beautiful photo HUMVEE, but style MISMATCH with the pixel art other units. User wanted consistency.

**Status:** Reverted.

---

## Attempt 2 (v1.30r) — 2026-08-22
**File:** `art/fsv_blue_extracted.png` (the corrupted original)
**Approach:** Keep original FSV cell, add chroma key handling for the green bleed

**Implementation:** Added cyan + magenta chroma key conditions to the renderer.

**Result:** Still had visible green lines.

**Status:** Reverted.

---

## Attempt 3 (v1.30s) — 2026-08-22
**File:** `art/fsv_red_pixel.jpg` → `fsv_blue_pixel_clean.png`
**Approach:** Generate single red HUMVEE in pixel art style, hue-shift to blue

**Prompt:**
> "Single US military HUMVEE fire support vehicle with mounted machine gun, side view facing right, 16-bit pixel art style with slight film grain, 80s retro video game look, similar style to Red Alert 2 vehicle sprites. Isolated on solid bright green chroma key background (#00FF00)."

**Result:** Beautiful pixel art HUMVEE, matches the deployed style.

**Status:** Deployed as v1.30s.

---

## Attempt 4 (v1.30t) — 2026-08-22
**File:** `art/units_blue_3x4_final2.png` (modified FSV cell)
**Approach:** Replace just the FSV cell in the existing 3x4 grid

**Implementation:** Generated red pixel HUMVEE, hue-shifted to blue, then placed in the (1,1) cell of the existing grid.

**Result:** Consistent with the other 7 units.

**Status:** **CURRENTLY DEPLOYED.**

---

## Lessons Learned

1. **The original 3x4 grid was 90% good.** One cell failing is the AI's behavior, not a sign to regenerate everything.
2. **Pixel art > photo for consistency.** Once we have a style, stay in it.
3. **Hue shift is reliable** for blue→red conversion when the source is pixel art.
4. **Chroma key is robust** but the AI source can have unexpected background tints (green, cyan, magenta).
5. **ALWAYS save the prompt** before calling. We lost 30+ minutes of work because of this.

---

## Prevention for Future

Per ADR-0005: every future AI generation call must be logged in `docs/ai-prompts/`. The original 3x4 prompt is gone, but the v1.30t approach (single-cell replacement) is now documented.
