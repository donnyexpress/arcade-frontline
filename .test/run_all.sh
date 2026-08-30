#!/usr/bin/env bash
# .test/run_all.sh — Run all 6 V&V levels
#
# Usage:
#   ./.test/run_all.sh
#   ./.test/run_all.sh --fast   # skip slow L4/L5
#   ./.test/run_all.sh --ci     # CI mode (no colors, exit on first fail)
#
# Each level corresponds to an architecture layer:
#   L0 → Layer 1 (CFG)
#   L1 → Layer 2 (State)
#   L2 → Layer 3 (Logic)
#   L3 → Layer 2.5 (Event Bus)
#   L4 → All layers (E2E)
#   L5 → Player experience (Scripted personas)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Set NODE_PATH to find global playwright
export NODE_PATH="${NODE_PATH:-}:/usr/local/lib/node_modules"

# Ensure test HTML has local phaser reference
if [ -f .test/index_test.html ] && grep -q "cdn.jsdelivr" .test/index_test.html; then
  echo "Fixing phaser reference in test HTML..."
  sed -i 's|https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js|phaser.min.js|' .test/index_test.html
fi

# Copy latest index.html to test version
cp index.html .test/index_test.html
sed -i 's|https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js|phaser.min.js|' .test/index_test.html

CI_MODE=false
FAST_MODE=false
for arg in "$@"; do
  case $arg in
    --ci) CI_MODE=true ;;
    --fast) FAST_MODE=true ;;
  esac
done

PASSED=0
FAILED=0

run_level() {
  local name="$1"
  local script="$2"
  local slow="$3"  # "slow" or ""

  if [ "$FAST_MODE" = true ] && [ "$slow" = "slow" ]; then
    echo "⏭️  Skipping $name (--fast)"
    return 0
  fi

  echo ""
  echo "═══════════════════════════════════════════════"
  echo "  $name"
  echo "═══════════════════════════════════════════════"
  echo ""

  if node "$script"; then
    PASSED=$((PASSED + 1))
    if [ "$CI_MODE" = true ]; then
      echo "✅ $name PASSED"
    fi
  else
    FAILED=$((FAILED + 1))
    echo "❌ $name FAILED"
    if [ "$CI_MODE" = true ]; then
      echo "CI mode: stopping on first failure"
      exit 1
    fi
  fi
}

# Run all 6 levels
run_level "L0: Static / Config Audit" ".test/l0_static.js"
run_level "L1: State Contract" ".test/l1_state.js"
run_level "L2: Pure Logic" ".test/l2_logic.js"
run_level "L3: Event Bus" ".test/l3_bus.js"
run_level "L4: End-to-End Scenarios" ".test/l4_e2e.js" "slow"
run_level "L5: Scripted Playtest (Personas)" ".test/l5_playtest.js" "slow"

echo ""
echo "═══════════════════════════════════════════════"
echo "  RESULTS"
echo "═══════════════════════════════════════════════"
echo "  Levels passed: $PASSED / 6"
echo "  Levels failed: $FAILED"
echo "═══════════════════════════════════════════════"

if [ $FAILED -gt 0 ]; then
  echo "❌ V&V FAILED"
  exit 1
fi

echo "✅ All V&V levels passed"
