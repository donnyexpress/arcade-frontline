# Audit Scripts — Doc-Code Consistency

**Purpose:** Catch drift between `index.html` and the docs automatically.

## Quick start

```bash
# Run all checks (used in CI)
bash docs/audit/scripts/ci-check.sh

# Run just the doc-code sync check
bash docs/audit/scripts/check-doc-code-sync.sh

# Check just the auto-generated section
python3 docs/audit/scripts/gen-tuning-numbers.py --check
```

## Scripts

### `ci-check.sh`
Runs both checks below. Exit 0 = all good, exit 1 = drift detected.

### `check-doc-code-sync.sh`
Verifies that values in `CFG` (in `index.html`) match the values documented in `docs/architecture/tuning-numbers.md`.

**Currently checks 40+ constants:**
- All `CFG.*` numeric values (costs, HP, damage, range, etc.)
- All 8 unit stats (cost, HP, dmg, range, speed)

**Output:**
```
=== Doc-Code Sync Check ===
--- Running 40 checks ---
...
=== Summary ===
Passed: 48
Failed: 0
```

If drift is detected, the script tells you which key is out of sync and what the expected vs actual values are.

### `gen-tuning-numbers.py`
Regenerates the `## 🤖 Auto-Generated CFG Reference` section of `tuning-numbers.md` from the `// comments` after each `CFG.*` value in `index.html`.

**How it works:**
1. Parses the `CFG = { ... }` block from `index.html`
2. Reads the `// comment` after each value
3. Groups by section headers (`// ──── SECTION ────`)
4. Outputs a markdown table with Key | Value | Description

**Usage:**
```bash
# Check if doc is in sync (no changes made)
python3 gen-tuning-numbers.py --check

# Print the auto-generated section to stdout
python3 gen-tuning-numbers.py

# Update the doc with the auto-generated section
python3 gen-tuning-numbers.py --write
```

## Pre-commit hook (optional)

To run this on every commit, add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
bash docs/audit/scripts/ci-check.sh || {
  echo "Doc-code drift detected. Run 'bash docs/audit/scripts/ci-check.sh' to see details."
  exit 1
}
```

## Adding a new CFG constant

1. Add to `CFG` in `index.html` with a `// comment` describing it
2. Add a section header if needed: `// ──── MY SECTION ────`
3. Run `python3 gen-tuning-numbers.py --write`
4. Run `bash ci-check.sh` to verify

That's it. The doc stays in sync.

## Adding a new check to `check-doc-code-sync.sh`

Edit the `CHECKS` array. Each line is `KEY|EXPECTED_CF...|...`. The script extracts the value from both `index.html` and the doc and compares.

For complex formats, edit `get_cfg_value` or `get_doc_value` in the script.
