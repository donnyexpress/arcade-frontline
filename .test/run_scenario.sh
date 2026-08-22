#!/usr/bin/env bash
# Run scenario test and report results
# Usage: ./run_scenario.sh

set -e
cd "$(dirname "$0")/.."

# Ensure test HTML has local phaser reference
if grep -q "cdn.jsdelivr" .test/index_test.html; then
  echo "Fixing phaser reference in test HTML..."
  sed -i 's|https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js|phaser.min.js|' .test/index_test.html
fi

# Copy latest index.html to test version
cp index.html .test/index_test.html
sed -i 's|https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js|phaser.min.js|' .test/index_test.html

# Run test
echo "Running scenario test..."
NODE_PATH=/usr/local/lib/node_modules node .test/scenario_robust.js

# Get exit code
RESULT=$?
if [ $RESULT -eq 0 ]; then
  echo ""
  echo "✅ Scenario test PASSED"
else
  echo ""
  echo "❌ Scenario test FAILED (exit $RESULT)"
fi
exit $RESULT
