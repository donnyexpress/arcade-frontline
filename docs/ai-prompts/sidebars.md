# AI Prompt: UI Sidebars (Red Alert 2 Style)

## v1 (2026-08-20 09:00) — UNUSED
**File:** `art/left_sidebar_v1.png`, `art/right_sidebar_v1.png`
**Notes:** First attempt, too dark.

## v2 (2026-08-20 09:30) — UNUSED
**File:** `art/sidebar_v2.png`
**Notes:** Less detail.

## v3 (2026-08-20 10:15) — DEPLOYED
**File:** `art/left_sidebar.png`, `art/right_sidebar.png`
**Aspect ratio:** 9:16 (tall thin)
**Resolution:** 1K
**Node ID:** (lost)

**Prompt (inferred):**
> "Red Alert 2 video game UI side panel, dark metallic with glowing red LED strip down the left edge and small Soviet hammer & sickle emblem in the top-right corner, completely empty inside, no buttons, no text, no labels, no icons, no content, just a decorative frame. 16-bit pixel art style with 80s military aesthetic."

**Variant for blue side:**
> "Red Alert 2 video game UI side panel, dark metallic with glowing blue LED strip down the right edge and small Allied star emblem in the top-left corner, completely empty inside, no buttons, no text, no labels, no icons, no content, just a decorative frame."

**Why this prompt:**
- "Red Alert 2 video game UI" sets the right aesthetic
- "Dark metallic" for the frame
- "Glowing [color] LED strip" for the faction-colored accent
- "Soviet hammer & sickle" / "Allied star" for faction identification
- "Completely empty inside" critical — the AI likes to add "PLAYER 1" text
- "No buttons, no text, no labels" is explicit exclusion

**Result:** Clean sidebars, used for left/right columns of the game UI.

## v4 (2026-08-20 10:30) — DEPLOYED as button panel
**File:** `art/button_panel.png`
**Aspect ratio:** 3:1
**Notes:** Same prompt but shorter for the bottom button panel.

## Common Issues

1. **"PLAYER 1" text:** AI adds player name text → add "no text, no labels" explicitly
2. **Buttons inside frame:** AI adds button graphics → add "no buttons, no icons"
3. **Wrong color:** Asked for red, got yellow → specify "glowing red LED strip" precisely
4. **Too realistic:** Asked for "metallic" got photorealistic chrome → add "16-bit pixel art" or "flat 2D UI"

## Variant Generation

For each sidebar, we generated:
- Left side: red Soviet faction
- Right side: blue Allied faction
- Button panel: neutral metallic

This is 3 separate API calls. Could be combined into one 3-cell image, but quality varied.
