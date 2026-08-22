# ADR Template — Architecture Decision Record

> **How to use this:** Copy this file to `0000-short-name.md` and fill in. Keep it SHORT. The value is in the reasoning, not the prose.

---

## ADR-NNNN: [Short Title of Decision]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
**Deciders:** [who was involved]

### Context

What is the issue we're seeing? What are the forces at play? Why does this decision need to be made *now*?

### Decision

What did we choose? State it clearly in one sentence. Example:
> "We use Phaser 3 loaded from CDN, with all sprites embedded as base64 data URIs."

### Consequences

#### Positive
- Benefit 1
- Benefit 2
- Benefit 3

#### Negative
- Cost 1 (and what we accept by paying it)
- Cost 2

#### Neutral
- Side effect that's neither good nor bad

### Alternatives Considered

#### Option A: [Name]
- Pros: ...
- Cons: ...
- Why rejected: ...

#### Option B: [Name]
- Pros: ...
- Cons: ...
- Why rejected: ...

#### Status quo (do nothing)
- Pros: no change
- Cons: problem persists

### References

- Code: `path/to/file.js#functionName`
- Related ADRs: `0001-other-decision.md`
- External: [link to docs, blog post, etc.]
- Discussion: [link to commit thread or chat]

---

## Examples of good ADRs

A great ADR is **one page**, makes its case in **the first 3 sentences**, and has a clear "why not the alternatives" section. The reader should be able to skim the title + decision + consequences and understand 80% of the value.

A bad ADR is a wall of text that re-explains the codebase, lists every possible alternative, and never says which one was picked.
