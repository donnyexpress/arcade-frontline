#!/usr/bin/env bash
# ci-check.sh — runs all doc-code consistency checks
#
# Use this in CI or as a pre-commit hook to catch drift early.
#
# Exit codes:
#   0 = all checks passed
#   1 = drift detected
#   2 = script error

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "════════════════════════════════════════════════════"
echo "  Arcade Frontline — Doc-Code Consistency CI"
echo "════════════════════════════════════════════════════"
echo ""

FAIL=0

# ───────────────────────────────────────────────────────────
# Check 1: doc-code sync (CFG values match tuning-numbers.md)
# ───────────────────────────────────────────────────────────
echo "▶ Check 1: CFG ↔ tuning-numbers.md"
if ! bash "$SCRIPT_DIR/check-doc-code-sync.sh"; then
  FAIL=1
fi
echo ""

# ───────────────────────────────────────────────────────────
# Check 2: auto-generated section is in sync
# ───────────────────────────────────────────────────────────
echo "▶ Check 2: Auto-generated CFG section"
if command -v python3 >/dev/null 2>&1; then
  if ! python3 "$SCRIPT_DIR/gen-tuning-numbers.py" --check; then
    FAIL=1
  fi
else
  echo "  ⚠️  python3 not available, skipping"
fi
echo ""

# ───────────────────────────────────────────────────────────
# Summary
# ───────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════"
if [ $FAIL -eq 0 ]; then
  echo "  ✅ All checks passed"
  echo "════════════════════════════════════════════════════"
  exit 0
else
  echo "  ❌ Drift detected — see above"
  echo "════════════════════════════════════════════════════"
  exit 1
fi
