/**
 * .test/l0_static.js — L0: Static / Config audit wrapper
 *
 * This wraps the existing `docs/audit/scripts/ci-check.sh` script.
 * Just runs the bash script and reports pass/fail.
 *
 * Usage: node .test/l0_static.js
 */

const { execSync } = require('child_process');
const path = require('path');

function main() {
  console.log('🔍 L0: Static / Config Audit (Layer 1)\n');

  const scriptPath = path.resolve(__dirname, '..', 'docs', 'audit', 'scripts', 'ci-check.sh');

  try {
    const output = execSync(`bash ${scriptPath}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    console.log(output);
    console.log('✅ L0 PASSED');
    process.exit(0);
  } catch (err) {
    console.log(err.stdout || '');
    console.log('❌ L0 FAILED');
    process.exit(1);
  }
}

main();
