/**
 * .test/l4_e2e.js — L4: End-to-end scenarios
 *
 * Browser-based integration tests. Covers the full stack:
 *   - Page loads
 *   - Phaser initializes
 *   - State created
 *   - Player can build / spawn
 *   - AI builds
 *   - Combat happens
 *   - Match ends
 *   - Rematch works
 *
 * Replaces the old scenario_robust.js. Uses shared helpers.
 *
 * Usage: node .test/l4_e2e.js
 */

const {
  setupBrowser,
  loadGame,
  assert,
  section,
  waitFor,
  printFinalReport,
  resetReport,
} = require('./helpers');

async function main() {
  resetReport();
  console.log('🎮 Arcade Frontline — L4: End-to-End Scenarios\n');

  const { browser, page, pageErrors } = await setupBrowser();
  await loadGame(page);

  // ══════════════════════════════════════════════════════════
  // SCENARIO 1: Initial state
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 1: Initial state');
  const s1 = await page.evaluate(() => ({
    hasState: !!state,
    redBaseHp: state?.sides.red.base.hp,
    blueBaseHp: state?.sides.blue.base.hp,
    baseSprites: scene?.baseSprites.length,
  }));
  assert(s1.hasState, 'State initialized');
  assert(s1.redBaseHp === 500, 'Red base 500 HP');
  assert(s1.blueBaseHp === 500, 'Blue base 500 HP');
  assert(s1.baseSprites === 2, `2 base sprites (got ${s1.baseSprites})`);

  // ══════════════════════════════════════════════════════════
  // SCENARIO 2: Build barracks
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 2: Build barracks');
  const queueBefore = await page.evaluate(() => state.sides.red.buildingQueue.length);
  const bldResult = await page.evaluate(() => placeBuilding('red', 'barracks'));
  const afterQueue = await page.evaluate(() => ({
    queue: state.sides.red.buildingQueue.length,
  }));
  assert(bldResult === true, 'placeBuilding returns true');
  assert(afterQueue.queue === queueBefore + 1, 'Queue grew by 1');

  const placed = await waitFor(page, () =>
    state.sides.red.buildings.some(b => b.type === 'barracks'), 4000
  );
  const s2 = await page.evaluate(() => ({
    buildings: state.sides.red.buildings.filter(b => b.type === 'barracks').length,
    buildingSprites: scene.buildingSprites.length,
  }));
  assert(placed, 'Barracks placed on map');
  assert(s2.buildings >= 1, `1+ barracks in buildings (${s2.buildings})`);
  assert(s2.buildingSprites >= 1, `1+ building sprites (${s2.buildingSprites})`);

  // ══════════════════════════════════════════════════════════
  // SCENARIO 3: Spawn rifleman
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 3: Spawn rifleman');
  const unitBefore = await page.evaluate(() => state.units.length);
  await page.evaluate(() => spawnUnit('red', 'rifleman'));
  await page.waitForTimeout(500);
  const s3 = await page.evaluate(() => ({
    units: state.units.length,
    sprites: scene.unitSprites.length,
  }));
  assert(s3.units > unitBefore, 'Unit added');
  assert(s3.sprites > 0, 'Unit sprite created');

  // ══════════════════════════════════════════════════════════
  // SCENARIO 4: Build pillbox
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 4: Build pillbox (turret)');
  const turretResult = await page.evaluate(() => placeTurret('red', 'pillbox'));
  assert(turretResult === true, 'placeTurret returns true');
  const turretPlaced = await waitFor(page, () =>
    state.sides.red.turrets.length > 0, 4000
  );
  const s4 = await page.evaluate(() => ({
    turrets: state.sides.red.turrets.length,
    turretSprites: scene.turretSprites.length,
  }));
  assert(turretPlaced, 'Pillbox placed on map');
  assert(s4.turretSprites > 0, 'Turret sprite created');

  // ══════════════════════════════════════════════════════════
  // SCENARIO 5: Game time advances
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 5: Game time advances');
  const tStart = await page.evaluate(() => state.time);
  await page.waitForTimeout(2000);
  const tAfter = await page.evaluate(() => state.time);
  assert(tAfter > tStart + 5, `Time advanced 5+ seconds (${tStart.toFixed(2)} → ${tAfter.toFixed(2)})`);

  // ══════════════════════════════════════════════════════════
  // SCENARIO 6: AI builds pillbox (defense-first, added 2026-08-31)
  // Before: AI built barracks at t>=10. Now: AI builds pillbox first.
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 6: AI builds pillbox (defense-first)');
  // Reset AI state, give it credits, force t=6
  await page.evaluate(() => {
    state.sides.blue.buildingQueue = [];
    state.sides.blue.turretQueue = [];
    state.sides.blue.turrets = [];
    state.sides.blue.buildings = state.sides.blue.buildings.filter(b => b.type === 'base');
    state.sides.blue.credits = 200;
    state.time = 6; // AI builds pillbox at t>=5
    state.aiNextDecision = 0;
  });
  const aiBuiltPillbox = await waitFor(page, () =>
    state.sides.blue.turretQueue.some(q => q.type === 'pillbox') ||
    state.sides.blue.turrets.some(t => t.type === 'pillbox'),
    4000
  );
  assert(aiBuiltPillbox, 'AI built pillbox (defense-first)');

  // Verify AI does NOT build barracks or 2nd pillbox at t<12
  // Note: game runs at FORCE_FAST_FORWARD, so we run updateAI synchronously
  // and capture the result before the game loop can advance t.
  const aiNoBarracksYet = await page.evaluate(() => {
    state.sides.blue.buildingQueue = [];
    state.sides.blue.turretQueue = [];
    // Add 1 pillbox so AI sees it
    state.sides.blue.turrets.length = 0;
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.sides.blue.credits = 500;
    state.time = 11; // Still before t=12 (when 2nd pillbox unlocks)
    state.aiNextDecision = 0;
    // Call updateAI once synchronously and snapshot the result
    updateAI(0);
    return {
      t: state.time,
      barracksInQueue: state.sides.blue.buildingQueue.some(q => q.type === 'barracks'),
      pillboxInQueue: state.sides.blue.turretQueue.some(q => q.type === 'pillbox'),
    };
  });
  assert(aiNoBarracksYet.t < 12, `t still <12 right after updateAI (got ${aiNoBarracksYet.t.toFixed(2)})`);
  assert(aiNoBarracksYet.barracksInQueue === false, 'AI does NOT build barracks at t<12 (waiting for 2nd pillbox)');
  assert(aiNoBarracksYet.pillboxInQueue === false, 'AI does NOT build 2nd pillbox at t<12 (gated)');

  // ══════════════════════════════════════════════════════════
  // SCENARIO 6b: AI builds barracks after 2 pillboxes
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 6b: AI builds barracks after 2 pillboxes');
  await page.evaluate(() => {
    state.sides.blue.buildingQueue = [];
    state.sides.blue.turretQueue = [];
    // 2 pillboxes already placed
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.sides.blue.credits = 500;
    state.time = 16; // t>=15 triggers barracks
    state.aiNextDecision = 0;
  });
  const aiBuiltBarracks = await waitFor(page, () =>
    state.sides.blue.buildingQueue.some(q => q.type === 'barracks') ||
    state.sides.blue.buildings.some(b => b.type === 'barracks'),
    4000
  );
  assert(aiBuiltBarracks, 'AI built barracks after 2 pillboxes');

  // ══════════════════════════════════════════════════════════
  // SCENARIO 7: AI builds units
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 7: AI builds units');
  // After bug fix: AI requires barracks active before queueing units.
  // Time needed: barracks build (5s) + wait for credits (10s) + queue + spawn = ~17s
  const aiHasUnits = await waitFor(page, () =>
    state.units.filter(u => u.side === 'blue').length > 0, 60000
  );
  if (!aiHasUnits) {
    const debug = await page.evaluate(() => ({
      time: state.time,
      blueCredits: state.sides.blue.credits,
      blueBuildings: state.sides.blue.buildings.map(b => ({type: b.type, constructing: b.constructing, hp: b.hp})),
      blueQueue: state.sides.blue.queue,
      blueBuildingQueue: state.sides.blue.buildingQueue,
    }));
    console.log('  AI debug:', JSON.stringify(debug, null, 2));
  }
  const s7 = await page.evaluate(() => state.units.filter(u => u.side === 'blue').length);
  assert(aiHasUnits, `AI built units (${s7})`);

  // ══════════════════════════════════════════════════════════
  // SCENARIO 8: Match end
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 8: Match end via base HP=0');
  await page.evaluate(() => { state.sides.blue.base.hp = 0; });
  await page.waitForTimeout(1000);
  const s8 = await page.evaluate(() => ({
    matchOver: state.matchOver,
    winner: state.winner,
    endScreen: document.getElementById('end-screen')?.classList.contains('show'),
  }));
  assert(s8.matchOver, 'Match over');
  assert(s8.winner === 'red', 'Red wins');
  assert(s8.endScreen, 'End screen visible');

  // ══════════════════════════════════════════════════════════
  // SCENARIO 9: Rematch
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 9: Rematch resets everything');
  await page.evaluate(() => document.getElementById('rematch').click());
  await page.waitForTimeout(2000);
  const s9 = await page.evaluate(() => ({
    matchOver: state.matchOver,
    redBaseHp: state.sides.red.base.hp,
    blueBaseHp: state.sides.blue.base.hp,
    redUnits: state.units.filter(u => u.side === 'red').length,
    blueUnits: state.units.filter(u => u.side === 'blue').length,
    baseSprites: scene.baseSprites.length,
    endScreen: document.getElementById('end-screen')?.classList.contains('show'),
  }));
  assert(s9.matchOver === false, 'matchOver reset');
  assert(s9.redBaseHp === 500, 'Red base HP reset');
  assert(s9.blueBaseHp === 500, 'Blue base HP reset');
  assert(s9.redUnits === 0, 'Red units cleared');
  assert(s9.blueUnits === 0, 'Blue units cleared');
  assert(s9.baseSprites === 2, `2 base sprites (${s9.baseSprites})`);
  assert(s9.endScreen === false, 'End screen hidden');

  // ══════════════════════════════════════════════════════════
  // SCENARIO 10: AI works after rematch
  // ══════════════════════════════════════════════════════════
  section('SCENARIO 10: AI works after rematch');
  const aiFull = await waitFor(page, () => {
    const hasActiveBarracks = state.sides.blue.buildings.some(b => !b.constructing && b.type === 'barracks');
    const hasUnits = state.units.filter(u => u.side === 'blue').length > 0;
    return hasActiveBarracks && hasUnits;
  }, 60000);
  if (!aiFull) {
    const debug = await page.evaluate(() => ({
      time: state.time,
      blueCredits: state.sides.blue.credits,
      blueBuildings: state.sides.blue.buildings.map(b => ({type: b.type, constructing: b.constructing, hp: b.hp})),
      blueQueue: state.sides.blue.queue,
    }));
    console.log('  AI debug:', JSON.stringify(debug, null, 2));
  }
  const s10 = await page.evaluate(() => ({
    blueBuildings: state.sides.blue.buildings.map(b => b.type),
    blueUnits: state.units.filter(u => u.side === 'blue').length,
  }));
  assert(s10.blueBuildings.includes('barracks'), 'AI has barracks after rematch');
  assert(s10.blueUnits > 0, `AI built units after rematch (${s10.blueUnits})`);

  await browser.close();

  assert(pageErrors.length === 0, `No page errors (got ${pageErrors.length})`);

  printFinalReport();
  process.exit(0);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
