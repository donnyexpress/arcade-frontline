# Changelog: Current (v1.30+)

**Last updated:** 2026-08-22
**Latest commit:** `9efd02d` (v1.30t: Regenerate FSV with original pixel art style)

---

## v1.30t (2026-08-22) — FSV Pixel Art Recovery

**Changed:**
- FSV cell in `units_blue_3x4.png` replaced with pixel art HUMVEE
- Used prompt: "16-bit pixel art style with slight film grain, 80s retro video game look, similar style to Red Alert 2 vehicle sprites"

**Reason:** The original FSV (deployed 2026-08-19) was TV static. Four regeneration attempts later, this is the version that matches the other 7 units' style.

**Result:** FSV is now visually consistent with the rest of the unit grid.

**Live:** https://donnyexpress.github.io/arcade-frontline/

---

## v1.31 — Planning

**Ideas backlog (no commitment):**
- Memory: comprehensive `ai-image-gen-tool` topic with all 7 known prompts
- Document all art asset dimensions in a single reference
- Re-generate the entire 3x4 grid with the new clean prompt to ensure consistency
- Add sound effects (clicks, build sounds, death sounds)
- Add post-game stats screen

**Open questions:**
- Should the game have a tutorial? (Currently just "TAP BARRACKS TO BEGIN")
- Should the AI be more aggressive? (User said "flexible/reactive to early rushes")

---

## Files Modified in v1.30t

| File | Change |
|---|---|
| `art/units_blue_3x4_final2.png` | New FSV cell |
| `art/units_red_3x4_final2.png` | New FSV cell (red) |
| `index.html` | Embedded new atlases |

**Lines changed in index.html:** ~50 (atlas base64 strings)

**Build size:** 14.4MB HTML (Phaser + atlases + code)

---

## Live Status

- **Game URL:** https://donnyexpress.github.io/arcade-frontline/
- **Repository:** https://github.com/donnyexpress/arcade-frontline
- **Status:** Stable, 47/47 tests passing
- **Last deploy:** 2026-08-22 16:30 UTC
