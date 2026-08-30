/**
 * .test/helpers.js — shared test utilities
 *
 * Single source of truth for all test helpers. No duplication.
 * Each test file requires this: `const { assert, section, waitFor, ... } = require('./helpers')`
 */

// ───────────────────────────────────────────────────────────
// Reporting
// ───────────────────────────────────────────────────────────

const REPORT = { passed: 0, failed: 0, errors: [], scenarios: [] };

function resetReport() {
  REPORT.passed = 0;
  REPORT.failed = 0;
  REPORT.errors = [];
  REPORT.scenarios = [];
}

function assert(cond, name, detail) {
  if (cond) {
    REPORT.passed++;
    console.log('  ✅', name);
  } else {
    REPORT.failed++;
    REPORT.errors.push({ name, detail });
    console.log('  ❌', name, detail || '');
  }
}

function section(name) {
  console.log('\n═══ ' + name + ' ═══');
  REPORT.scenarios.push(name);
}

function report() {
  return {
    passed: REPORT.passed,
    failed: REPORT.failed,
    errors: REPORT.errors,
    scenarios: REPORT.scenarios,
    ok: REPORT.failed === 0,
  };
}

function printFinalReport() {
  console.log('\n═══════════════════════════════════════');
  console.log('  PASSED:', REPORT.passed, '  FAILED:', REPORT.failed);
  if (REPORT.errors.length > 0) {
    console.log('\nFailed assertions:');
    REPORT.errors.forEach(e => console.log('  -', e.name, e.detail || ''));
  }
  console.log('═══════════════════════════════════════');
}

// ───────────────────────────────────────────────────────────
// Polling
// ───────────────────────────────────────────────────────────

async function waitFor(page, fn, timeoutMs = 5000, intervalMs = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await page.evaluate(fn);
    if (ok) return true;
    await page.waitForTimeout(intervalMs);
  }
  return false;
}

// ───────────────────────────────────────────────────────────
// Browser setup (shared across L1-L5)
// ───────────────────────────────────────────────────────────

async function setupBrowser({ fastForward = true, headless = true } = {}) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({
    headless,
    executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push('console.error: ' + msg.text());
  });

  if (fastForward) {
    await page.addInitScript(() => {
      window.FORCE_FAST_FORWARD = true;
    });
  }

  return { browser, page, pageErrors };
}

async function loadGame(page) {
  // Ensure test HTML uses local phaser (not CDN)
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
}

// ───────────────────────────────────────────────────────────
// State introspection helpers
// ───────────────────────────────────────────────────────────

// These functions are serialized to the browser via page.evaluate.
// They read state and return plain objects.

const STATE_HELPERS = {
  hasBuilding(side, type) {
    return state.sides[side].buildings.some(b => b.type === type && !b.constructing);
  },
  hasBuildingQueued(side, type) {
    return state.sides[side].buildingQueue.some(q => q.type === type);
  },
  unitCount(side) {
    return state.units.filter(u => u.side === side && u.hp > 0).length;
  },
  buildingCount(side, type) {
    return state.sides[side].buildings.filter(b => b.type === type).length;
  },
  baseHp(side) {
    return state.sides[side].base.hp;
  },
  credits(side) {
    return state.sides[side].credits;
  },
  isMatchOver() {
    return state.matchOver;
  },
  winner() {
    return state.winner;
  },
  eventCount() {
    let total = 0;
    for (const k in EVENTS) total += EVENTS[k].length;
    return total;
  },
};

module.exports = {
  // Reporting
  assert,
  section,
  report,
  printFinalReport,
  resetReport,
  // Polling
  waitFor,
  // Browser
  setupBrowser,
  loadGame,
  // State helpers (to be injected into the page)
  STATE_HELPERS,
};
