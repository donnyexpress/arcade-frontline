# ADR-0001: Vanilla HTML + Single-File, No Build Step

**Date:** 2026-08-16
**Status:** Accepted
**Deciders:** donnyexpress

## Context

The game is a mobile-first 2D strategy game targeted at GitHub Pages deployment. It needs to:
- Run on any modern mobile browser with zero install friction
- Be version-controlled as a single artifact
- Be deployable by pushing one file
- Have no build pipeline that could fail or be missed by a contributor

## Decision

**One `index.html` file with everything inline — no bundler, no transpiler, no node_modules.**

- All sprites as base64 data URIs
- Phaser 3 from jsDelivr CDN
- No npm, no webpack, no vite, no PostCSS

## Consequences

### Positive
- **Zero deploy friction:** `git push` = production
- **One file to read:** entire game in `index.html` (~14MB)
- **No "works on my machine":** no environment to mismatch
- **Trivial to host:** GitHub Pages, S3, `python -m http.server` all work
- **Trivial to fork:** copy one file

### Negative
- **14MB HTML file** is hard to diff in code review (mitigated by base64 not changing often)
- **No tree-shaking:** all of Phaser ships even if we use 20%
- **No TypeScript:** bugs caught at runtime, not compile time
- **No HMR:** refresh the page to see changes (acceptable for this scale)

### Neutral
- File is too large to read in one go, but you only read the section you're working on

## Alternatives Considered

### Option A: Vite + React + TypeScript
- Pros: Modern stack, type safety, HMR
- Cons: Build pipeline, requires node, more files, harder to deploy
- Why rejected: Overkill for a single-screen game. The complexity costs more than the benefits.

### Option B: Phaser Editor / Phaser Editor 2
- Pros: Visual editor, code generation
- Cons: Lock-in to proprietary tooling, harder to version control
- Why rejected: We need full control of the code, not a generated scaffold.

### Status quo (use multiple files + CDN)
- Pros: Cleaner code organization
- Cons: More files = more places to break, harder to share
- Why rejected: 14MB is fine for GitHub. Single file is a feature.

## References

- `index.html` line 1: `<!DOCTYPE html>`
- Phaser 3.80.1 from `https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`
- GitHub Pages deploy: `https://donnyexpress.github.io/arcade-frontline/`
