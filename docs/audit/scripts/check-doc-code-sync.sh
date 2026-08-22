#!/usr/bin/env bash
# check-doc-code-sync.sh
# Verifies that docs/architecture/tuning-numbers.md is in sync with the CFG object in index.html
#
# Exit codes:
#   0 = in sync (no issues)
#   1 = mismatches found
#   2 = script error
#
# Usage:
#   ./check-doc-code-sync.sh
#   ./check-doc-code-sync.sh --verbose   (show all checks, not just mismatches)

set -euo pipefail

VERBOSE=false
if [ "${1:-}" = "--verbose" ]; then
  VERBOSE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# scripts/ → audit/ → docs/ → repo_root (3 levels up)
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
INDEX="$REPO_ROOT/index.html"
DOC="$REPO_ROOT/docs/architecture/tuning-numbers.md"

if [ ! -f "$INDEX" ]; then
  echo "❌ ERROR: index.html not found at $INDEX" >&2
  exit 2
fi
if [ ! -f "$DOC" ]; then
  echo "❌ ERROR: tuning-numbers.md not found at $DOC" >&2
  exit 2
fi

echo "=== Doc-Code Sync Check ==="
echo "Index: $INDEX"
echo "Doc:   $DOC"
echo ""

# ───────────────────────────────────────────────────────────
# Helper: extract a value from CFG
# ───────────────────────────────────────────────────────────
get_cfg_value() {
  local key="$1"
  # Try simple key (e.g. "STARTING_CREDITS: 200")
  local result=$(grep -E "^[[:space:]]*${key}:[[:space:]]+[0-9]" "$INDEX" | head -1 | sed -E "s/^[[:space:]]*${key}:[[:space:]]+([0-9.]+).*/\1/")
  if [ -n "$result" ]; then
    echo "$result"
    return
  fi
  # Try with comma (e.g. "BLAST_RADIUS: 60,")
  result=$(grep -E "^[[:space:]]*${key}:[[:space:]]+[0-9.]+," "$INDEX" | head -1 | sed -E "s/^[[:space:]]*${key}:[[:space:]]+([0-9.]+),.*/\1/")
  if [ -n "$result" ]; then
    echo "$result"
    return
  fi
  echo "NOT_FOUND"
}

# ───────────────────────────────────────────────────────────
# Helper: extract a value from the doc
# ───────────────────────────────────────────────────────────
get_doc_value() {
  local key="$1"
  # Search the doc for "| `key`" or "key:" patterns
  # Look for inline code like `STARTING_CREDITS: 200` or table row | STARTING_CREDITS | 200 |
  local result=$(grep -oE "\`${key}\` \| [0-9.]+" "$DOC" | head -1 | sed -E "s/.* \| ([0-9.]+)/\1/")
  if [ -n "$result" ]; then
    echo "$result"
    return
  fi
  # Try JS-style declarations like "BLAST_RADIUS: 60," or "BLAST_RADIUS:    60,"
  result=$(grep -E "^[[:space:]]*${key}:[[:space:]]+[0-9.]+," "$DOC" | head -1 | sed -E "s/^[[:space:]]*${key}:[[:space:]]+([0-9.]+),.*/\1/")
  if [ -n "$result" ]; then
    echo "$result"
    return
  fi
  # Try "key: 60," as inline prose
  result=$(grep -oE "${key}:[[:space:]]+[0-9.]+" "$DOC" | head -1 | sed -E "s/${key}:[[:space:]]+([0-9.]+)/\1/")
  if [ -n "$result" ]; then
    echo "$result"
    return
  fi
  # Try in prose like "PERIMETER_OFFSET (290)"
  result=$(grep -oE "${key} \(([0-9.]+)\)" "$DOC" | head -1 | sed -E "s/${key} \(([0-9.]+)\)/\1/")
  if [ -n "$result" ]; then
    echo "$result"
    return
  fi
  echo "NOT_FOUND"
}

# ───────────────────────────────────────────────────────────
# Define checks: key | expected_in_code | expected_in_doc
# ───────────────────────────────────────────────────────────
# Format: "KEY|CFG_VALUE|DOC_VALUE|DESCRIPTION"
CHECKS=(
  # Economy
  "STARTING_CREDITS|200|200|Starting credits"
  "PASSIVE_INCOME|6|6|Passive income per second"
  "KILL_BOUNTY|0.25|0.25|Kill bounty (fraction of unit cost)"
  "SOFT_CAP|500|500|Credit soft cap"
  "MATCH_TIME|180|180|Match time in seconds"

  # Buildings
  "BARRACKS_COST|100|100|Barracks cost"
  "BARRACKS_HP|80|80|Barracks HP"
  "WARFACTORY_COST|150|150|War Factory cost"
  "WARFACTORY_HP|100|100|War Factory HP"
  "TECHCENTER_COST|250|250|Tech Center cost"
  "TECHCENTER_HP|100|100|Tech Center HP"
  "PILLBOX_COST|75|75|Pillbox cost"
  "PILLBOX_HP|120|120|Pillbox HP"
  "PILLBOX_DMG|12|12|Pillbox damage"
  "PILLBOX_RANGE|250|250|Pillbox range"
  "TURRET_COST|150|150|Turret cost"
  "TURRET_HP|200|200|Turret HP"
  "TURRET_DMG|22|22|Turret damage"
  "TURRET_RANGE|350|350|Turret range"

  # Limits
  "BUILD_TIME|5|5|Building construction time"
  "MAX_TURRET_SLOTS|20|20|Max turrets per side"
  "MAX_QUEUE|4|4|Max queued units per building"
  "MAX_BUILDINGS|10|10|Max buildings per side"

  # Drone (nested in CFG.DRONE)
  "BLAST_RADIUS|60|60|Drone blast radius"
  "BLAST_DMG|50|50|Drone blast base damage"
  "FALLOFF_MIN|0.5|0.5|Drone min damage multiplier (at edge)"

  # Turret placement (nested in CFG.TURRET_PLACEMENT)
  "PERIMETER_OFFSET|290|290|Perimeter distance from base"
  "PERIMETER_Y_START|120|120|Perimeter top Y"
  "PERIMETER_Y_END|560|560|Perimeter bottom Y"
  "PERIMETER_SLOT_GAP|60|60|Perimeter slot spacing"

  # Combat radii (nested in CFG.COMBAT)
  "SELF_RADIUS|14|14|Unit collision radius"
  "BUILDING_RADIUS|22|22|Building collision radius"
  "BASE_RADIUS|30|30|Base collision radius"

  # Targeting (nested in CFG.TARGETING)
  "ATTACKING_ME_BONUS|500|500|Attack-me bonus score"
  "ATTACKING_FRIENDLY_BONUS|100|100|Attack-friendly bonus score"
  "FRIENDLY_NEARBY_RADIUS|200|200|Friendly nearby detection radius"
  "PRODUCTION_BONUS|200|200|Production building bonus"
  "BASE_PROXIMITY_BONUS|500|500|Base proximity bonus"
  "TURRET_BASE_TERRITORY_BONUS|50|50|Turret base territory bonus"

  # AI
  "AI_DECISION_INTERVAL|0.5|0.5|AI decision interval (seconds)"
)

# ───────────────────────────────────────────────────────────
# Run checks
# ───────────────────────────────────────────────────────────
PASSED=0
FAILED=0
WARNINGS=()

echo "--- Running $((${#CHECKS[@]})) checks ---"
echo ""

for check in "${CHECKS[@]}"; do
  IFS='|' read -r key cfg_val doc_val desc <<< "$check"

  actual_cfg=$(get_cfg_value "$key")
  actual_doc=$(get_doc_value "$key")

  cfg_ok="❌"
  doc_ok="❌"
  cfg_msg="$actual_cfg"
  doc_msg="$actual_doc"

  if [ "$actual_cfg" = "$cfg_val" ]; then
    cfg_ok="✅"
  fi
  if [ "$actual_doc" = "$doc_val" ]; then
    doc_ok="✅"
  fi

  # Both match expected: pass
  if [ "$actual_cfg" = "$cfg_val" ] && [ "$actual_doc" = "$doc_val" ]; then
    if [ "$VERBOSE" = true ]; then
      printf "  %s %s\n" "$cfg_ok" "$desc ($key: cfg=$actual_cfg doc=$actual_doc)"
    fi
    PASSED=$((PASSED + 1))
  else
    printf "  %s %s\n" "❌" "$desc ($key)"
    printf "       CFG expected: $cfg_val, got: $cfg_msg\n"
    printf "       DOC expected: $doc_val, got: $doc_msg\n"
    FAILED=$((FAILED + 1))
    WARNINGS+=("$key: cfg=$actual_cfg doc=$actual_doc")
  fi
done

# ───────────────────────────────────────────────────────────
# Cross-checks: build unit roster from code, compare to doc
# ───────────────────────────────────────────────────────────
echo ""
echo "--- Cross-checks: Unit Roster ---"

for unit in rifleman rocket flame fsv tank sniper drone heavy; do
  # Extract cost from CFG.UNITS[unit] = { ..., cost: N, ... }
  cost=$(grep -E "^    ${unit}:.*cost: [0-9]+" "$INDEX" | head -1 | sed -E "s/.*cost: ([0-9]+).*/\1/")
  hp=$(grep -E "^    ${unit}:.*hp: [0-9]+" "$INDEX" | head -1 | sed -E "s/.*hp: ([0-9]+).*/\1/")
  dmg=$(grep -E "^    ${unit}:.*dmg: [0-9]+" "$INDEX" | head -1 | sed -E "s/.*dmg: ([0-9]+).*/\1/")
  range=$(grep -E "^    ${unit}:.*range: [0-9]+" "$INDEX" | head -1 | sed -E "s/.*range: ([0-9]+).*/\1/")
  speed=$(grep -E "^    ${unit}:.*speed: [0-9]+" "$INDEX" | head -1 | sed -E "s/.*speed: ([0-9]+).*/\1/")

  if [ -n "$cost" ]; then
    # Look in the doc for the unit's cost in a table row
    doc_cost=$(grep -E "^\| .* \| ${cost} \| " "$DOC" | grep -i "$unit\|rifleman\|rocket\|flame\|fire\|tank\|sniper\|drone\|heavy" | head -1)
    if [ "$VERBOSE" = true ] || [ -z "$doc_cost" ]; then
      if [ -n "$doc_cost" ]; then
        printf "  ✅ %s (cost=%s, hp=%s, dmg=%s, range=%s, speed=%s)\n" "$unit" "$cost" "$hp" "$dmg" "$range" "$speed"
        PASSED=$((PASSED + 1))
      else
        printf "  ⚠️  %s: cost=%s not found in doc tables\n" "$unit" "$cost"
        WARNINGS+=("$unit cost=$cost not in doc")
      fi
    fi
  fi
done

# ───────────────────────────────────────────────────────────
# Summary
# ───────────────────────────────────────────────────────────
echo ""
echo "=== Summary ==="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "❌ Mismatches found. Either:"
  echo "   1. Update index.html to match the documented value"
  echo "   2. Update docs/architecture/tuning-numbers.md to match the code"
  echo ""
  echo "Mismatched keys:"
  for w in "${WARNINGS[@]}"; do
    echo "  - $w"
  done
  exit 1
fi

echo "✅ All checks passed. Docs are in sync with code."
exit 0
