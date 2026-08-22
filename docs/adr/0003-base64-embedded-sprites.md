# ADR-0003: Embed All Sprites as Base64 Data URIs

**Date:** 2026-08-19
**Status:** Accepted
**Deciders:** donnyexpress

## Context

The game has 8 units × 2 sides + 6 buildings × 2 sides + UI panels + background = ~40+ sprite images. Options for serving them:
1. **External files:** `art/units.png`, `art/buildings.png`, etc.
2. **Sprite atlas:** single JSON + image file
3. **Base64 in HTML:** all images embedded as `data:image/png;base64,...` strings

## Decision

**Embed all sprites as base64 data URIs directly in the `index.html` `<script>` block.**

## Consequences

### Positive
- **One file to deploy:** no missing assets, no broken links
- **CDN-independent:** works on any static host, even offline (after first load)
- **Cache-friendly:** whole game is one URL, one download
- **No CORS issues:** all assets are same-origin
- **Trivial to share:** email the .html file, it works

### Negative
- **+33% file size:** base64 inflates binary by ~33% (so 10MB PNG → 13.3MB string)
- **No HTTP caching of individual sprites:** browser re-downloads the whole 14MB on every visit
- **Larger initial page load** (~14MB HTML, not ~50KB HTML + ~13MB assets)
- **Diffs are huge:** changing one pixel = 100KB diff in the base64 string

### Neutral
- GitHub Pages can serve 14MB HTML (limit is 100MB per file)

## Size Budget

| Asset | Original | Base64 | % of HTML |
|---|---|---|---|
| Background | 1.8MB | 2.4MB | 17% |
| Units grid (blue+red) | 1.6MB | 2.1MB | 15% |
| Buildings grid (blue+red) | 1.6MB | 2.1MB | 15% |
| UI panels (3 pieces) | 1.0MB | 1.3MB | 9% |
| Button icons (8 units) | 1.5MB | 2.0MB | 14% |
| Building icons (5) | 1.0MB | 1.3MB | 9% |
| Phaser engine | 1.0MB | 1.0MB | 7% |
| Code + other | — | 2.0MB | 14% |
| **Total** | — | **~14MB** | 100% |

## Alternatives Considered

### Option A: External sprite files
- Pros: Standard practice, HTTP cache, smaller HTML
- Cons: Multiple files to deploy, paths can break, CORS issues
- Why rejected: Single-file is a feature, not a bug

### Option B: Sprite atlas (TexturePacker format)
- Pros: Single image + JSON, smaller than individual files
- Cons: Need atlas build step, more complex than 1 file
- Why rejected: We tried this; the per-frame extraction was 200 lines of code

### Option C: WebP / AVIF for smaller base64
- Pros: 30-50% smaller than PNG
- Cons: Browser support inconsistent, AI gen outputs PNG
- Why rejected: Not worth the complexity for a 14MB file

## Optimization Opportunities (Future)

If size becomes a problem:
- [ ] **Switch to WebP** with PNG fallback (would save ~5MB)
- [ ] **Lazy-load** base64 via `fetch()` + blob URL (no initial-size benefit, but cacheable)
- [ ] **Compress** with Brotli at the CDN level (no code change)

For now, 14MB is acceptable for GitHub Pages and modern mobile networks.

## References

- `index.html` line 1014: `const ATLAS_B64_UNITS_BLUE = "iVBORw0KGgo..."`
- `index.html` line 1270: `const BACKGROUND_DATA_URL = 'data:image/png;base64,...'`
- GitHub Pages limit: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#limits
