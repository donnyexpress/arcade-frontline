/**
 * .test/l1_state.js — L1: State contract tests (Layer 2)
 *
 * Tests the SHAPE of game state, not the BEHAVIOR.
 * If this fails, the data structure is wrong, which breaks every function
 * that uses it.
 *
 * Usage: node .test/l1_state.js
 */

const { setupBrowser, loadGame, assert, section, printFinalReport, resetReport } = require('./helpers');

async function main() {
  resetReport();
  section('🧪 L1: State Contract (Layer 2)');

  const { browser, page, pageErrors } = await setupBrowser();
  await loadGame(page);

  // L1-001: newState returns object with required top-level fields
  section('L1-001: Top-level state shape');
  const topShape = await page.evaluate(() => {
    const s = newState();
    return {
      keys: Object.keys(s).sort(),
    };
  });
  const expectedTop = ['aiNextDecision', 'credits', 'matchOver', 'projectiles', 'sides', 'time', 'units', 'winner'];
  assert(
    JSON.stringify(topShape.keys) === JSON.stringify(expectedTop),
    'newState() returns required top-level fields',
    `got ${JSON.stringify(topShape.keys)}`
  );

  // L1-002: Both sides are symmetric
  section('L1-002: Side symmetry');
  const sideSymmetry = await page.evaluate(() => {
    const s = newState();
    return {
      redKeys: Object.keys(s.sides.red).sort(),
      blueKeys: Object.keys(s.sides.blue).sort(),
    };
  });
  assert(
    JSON.stringify(sideSymmetry.redKeys) === JSON.stringify(sideSymmetry.blueKeys),
    'sides.red and sides.blue have identical keys',
    `red=${JSON.stringify(sideSymmetry.redKeys)} blue=${JSON.stringify(sideSymmetry.blueKeys)}`
  );

  // L1-003: Side has all required fields
  section('L1-003: Side data fields');
  const sideFields = await page.evaluate(() => {
    const s = newState();
    return Object.keys(s.sides.red).sort();
  });
  const requiredSide = ['aiLastThreatTime', 'aiState', 'aiStateTimer', 'base', 'buildingQueue', 'buildings', 'credits', 'queue', 'side', 'turretQueue', 'turrets'];
  assert(
    JSON.stringify(sideFields) === JSON.stringify(requiredSide),
    'Side has all required fields',
    `got ${JSON.stringify(sideFields)}`
  );

  // L1-004: Base has required fields
  section('L1-004: Base fields');
  const baseFields = await page.evaluate(() => {
    const s = newState();
    return Object.keys(s.sides.red.base).sort();
  });
  assert(
    baseFields.includes('hp') && baseFields.includes('maxHp') && baseFields.includes('x') && baseFields.includes('y'),
    'Base has hp, maxHp, x, y',
    `got ${JSON.stringify(baseFields)}`
  );

  // L1-005: Starting credits match CFG
  section('L1-005: Starting state values');
  const startValues = await page.evaluate(() => {
    const s = newState();
    return {
      redCredits: s.sides.red.credits,
      blueCredits: s.sides.blue.credits,
      redBaseHp: s.sides.red.base.hp,
      blueBaseHp: s.sides.blue.base.hp,
      time: s.time,
      matchOver: s.matchOver,
      winner: s.winner,
    };
  });
  assert(startValues.redCredits === 200, `Red starts with 200 credits (got ${startValues.redCredits})`);
  assert(startValues.blueCredits === 200, `Blue starts with 200 credits (got ${startValues.blueCredits})`);
  assert(startValues.redBaseHp === 500, `Red base has 500 HP (got ${startValues.redBaseHp})`);
  assert(startValues.blueBaseHp === 500, `Blue base has 500 HP (got ${startValues.blueBaseHp})`);
  assert(startValues.time === 0, 'Time starts at 0');
  assert(startValues.matchOver === false, 'Match not over');
  assert(startValues.winner === null, 'No winner');

  // L1-006: All queues start empty
  section('L1-006: Empty initial queues');
  const queueState = await page.evaluate(() => {
    const s = newState();
    return {
      units: s.units.length,
      projectiles: s.projectiles.length,
      redQueue: s.sides.red.queue.length,
      redBuildQueue: s.sides.red.buildingQueue.length,
      redTurretQueue: s.sides.red.turretQueue.length,
    };
  });
  assert(queueState.units === 0, 'Units array is empty');
  assert(queueState.projectiles === 0, 'Projectiles array is empty');
  assert(queueState.redQueue === 0, 'Production queue is empty');
  assert(queueState.redBuildQueue === 0, 'Build queue is empty');
  assert(queueState.redTurretQueue === 0, 'Turret queue is empty');

  // L1-007: After spawnUnit, unit has all required fields
  section('L1-007: Unit shape after spawn');
  const unitFields = await page.evaluate(() => {
    spawnUnit('red', 'rifleman');
    const u = state.units[0];
    return u ? Object.keys(u).sort() : null;
  });
  const requiredUnit = ['attackCooldown', 'baseTarget', 'hp', 'maxHp', 'side', 'spawnFlash', 'speed', 'target', 'type', 'x', 'y'];
  // Some unit types also have 'dmg' and 'range' which should also be there
  assert(
    unitFields !== null && requiredUnit.every(k => unitFields.includes(k)),
    'Unit has all required fields',
    `got ${JSON.stringify(unitFields)}`
  );

  // L1-008: After placeBuilding, queue has correct shape
  section('L1-008: Build queue item shape');
  const buildItem = await page.evaluate(() => {
    // Reset
    state = newState();
    placeBuilding('red', 'barracks');
    return state.sides.red.buildingQueue[0] ? Object.keys(state.sides.red.buildingQueue[0]).sort() : null;
  });
  assert(
    buildItem !== null && buildItem.includes('type') && buildItem.includes('buildProgress') && buildItem.includes('buildTime'),
    'Build queue item has type, buildProgress, buildTime',
    `got ${JSON.stringify(buildItem)}`
  );

  // L1-009: After placeBuildingOnMap, building has correct shape
  section('L1-009: Building shape after placement');
  const buildingFields = await page.evaluate(() => {
    placeBuildingOnMap('red', 'barracks');
    const b = state.sides.red.buildings[0];
    return b ? Object.keys(b).sort() : null;
  });
  const requiredBuilding = ['type', 'side', 'x', 'y', 'hp', 'maxHp'];
  assert(
    buildingFields !== null && requiredBuilding.every(k => buildingFields.includes(k)),
    'Building has type, side, x, y, hp, maxHp',
    `got ${JSON.stringify(buildingFields)}`
  );

  // L1-010: After endMatch, state is updated correctly
  section('L1-010: endMatch updates state');
  const endState = await page.evaluate(() => {
    state = newState();
    endMatch('red');
    return { matchOver: state.matchOver, winner: state.winner };
  });
  assert(endState.matchOver === true, 'matchOver is true after endMatch');
  assert(endState.winner === 'red', 'winner is set');

  // L1-011: No NaN or undefined in state
  section('L1-011: No NaN/undefined in state');
  const stateHealth = await page.evaluate(() => {
    let issues = 0;
    function check(obj, path = '') {
      for (const k in obj) {
        const v = obj[k];
        if (v === undefined) issues++;
        else if (typeof v === 'number' && isNaN(v)) issues++;
        else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          check(v, path + '.' + k);
        }
      }
    }
    check(state);
    return issues;
  });
  assert(stateHealth === 0, `No NaN/undefined in state (got ${stateHealth} issues)`);

  // L1-012: After spawnUnit, hp === maxHp
  section('L1-012: Spawned unit at full HP');
  const fullHp = await page.evaluate(() => {
    state = newState();
    spawnUnit('red', 'rifleman');
    return { hp: state.units[0].hp, maxHp: state.units[0].maxHp };
  });
  assert(fullHp.hp === fullHp.maxHp, 'Spawned unit has hp === maxHp');

  await browser.close();

  assert(pageErrors.length === 0, `No page errors (got ${pageErrors.length})`);

  printFinalReport();
  process.exit(0);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
