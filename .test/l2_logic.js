/**
 * .test/l2_logic.js — L2: Pure logic tests (Layer 3)
 *
 * Tests each pure function in the game logic layer.
 * No Phaser, no DOM, no time — just f(x) === y.
 *
 * Each function gets a sub-section with multiple assertions.
 *
 * Usage: node .test/l2_logic.js
 */

const { setupBrowser, loadGame, assert, section, printFinalReport, resetReport } = require('./helpers');

async function main() {
  resetReport();
  section('🧮 L2: Pure Logic (Layer 3)');

  const { browser, page, pageErrors } = await setupBrowser();
  await loadGame(page);

  // ─────────────────────────────────────────────────────────
  // ECONOMY
  // ─────────────────────────────────────────────────────────
  section('L2-Economy: getProdMult and credits');

  const prodMults = await page.evaluate(() => {
    // countActiveBuildings is what getProdMult uses
    const results = [];
    for (let n = 0; n <= 10; n++) {
      state = newState();
      for (let i = 0; i < n; i++) {
        state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
      }
      results.push({ n, mult: getProdMult('red') });
    }
    return results;
  });
  assert(prodMults[0].mult === 1.0, `getProdMult(0) = 1.0 (got ${prodMults[0].mult})`);
  assert(prodMults[1].mult === 1.0, `getProdMult(1) = 1.0 (got ${prodMults[1].mult})`);
  assert(prodMults[2].mult === 1.4, `getProdMult(2) = 1.4 (got ${prodMults[2].mult})`);
  assert(prodMults[5].mult === 2.2, `getProdMult(5) = 2.2 (got ${prodMults[5].mult})`);
  assert(prodMults[10].mult === 2.9, `getProdMult(10) = 2.9 (got ${prodMults[10].mult})`);

  // countActiveBuildings excludes constructing
  const activeCount = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: true, hp: 80 });
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    return countActiveBuildings('red');
  });
  assert(activeCount === 1, `countActiveBuildings excludes constructing (got ${activeCount})`);

  // ─────────────────────────────────────────────────────────
  // BUILDING
  // ─────────────────────────────────────────────────────────
  section('L2-Building: canBuild, buildingCost');

  // canBuild with no buildings
  const canBuildTests = await page.evaluate(() => {
    state = newState();
    return {
      barracks: canBuild('red', 'barracks'),
      warfactory: canBuild('red', 'warfactory'),
      techcenter: canBuild('red', 'techcenter'),
    };
  });
  assert(canBuildTests.barracks === true, 'canBuild barracks with no buildings');
  assert(canBuildTests.warfactory === false, 'cannot build warfactory without barracks');
  assert(canBuildTests.techcenter === false, 'cannot build techcenter without warfactory');

  // canBuild with active barracks
  const canBuildWf = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    return canBuild('red', 'warfactory');
  });
  assert(canBuildWf === true, 'canBuild warfactory with active barracks');

  // canBuild with constructing barracks
  const canBuildWfConstructing = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: true, hp: 80 });
    return canBuild('red', 'warfactory');
  });
  assert(canBuildWfConstructing === false, 'canBuild warfactory false with constructing barracks');

  // canBuild with dead barracks
  const canBuildWfDead = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 0 });
    return canBuild('red', 'warfactory');
  });
  assert(canBuildWfDead === false, 'canBuild warfactory false with dead barracks');

  // buildingCost
  const costs = await page.evaluate(() => ({
    barracks: buildingCost('barracks'),
    warfactory: buildingCost('warfactory'),
    techcenter: buildingCost('techcenter'),
    unknown: buildingCost('banana'),
  }));
  assert(costs.barracks === 100, `barracks cost = 100 (got ${costs.barracks})`);
  assert(costs.warfactory === 150, `warfactory cost = 150 (got ${costs.warfactory})`);
  assert(costs.techcenter === 250, `techcenter cost = 250 (got ${costs.techcenter})`);
  assert(costs.unknown === null, `unknown building returns null (got ${costs.unknown})`);

  // placeBuilding deducts credits
  const placeDeducts = await page.evaluate(() => {
    state = newState();
    const before = state.sides.red.credits;
    placeBuilding('red', 'barracks');
    return {
      before,
      after: state.sides.red.credits,
      queueLen: state.sides.red.buildingQueue.length,
    };
  });
  assert(placeDeducts.after === placeDeducts.before - 100, `Credits deducted 100 (${placeDeducts.before} → ${placeDeducts.after})`);
  assert(placeDeducts.queueLen === 1, 'Building added to queue');

  // placeBuilding returns false when not affordable
  const cantAfford = await page.evaluate(() => {
    state = newState();
    state.sides.red.credits = 50;
    return placeBuilding('red', 'barracks');
  });
  assert(cantAfford === false, 'placeBuilding returns false when not affordable');

  // placeBuilding returns false when MAX_BUILDINGS reached
  const maxBuildings = await page.evaluate(() => {
    state = newState();
    // Fill the queue to MAX_BUILDINGS
    for (let i = 0; i < CFG.MAX_BUILDINGS; i++) {
      state.sides.red.buildingQueue.push({ type: 'barracks', buildProgress: 0, buildTime: 5 });
    }
    return placeBuilding('red', 'barracks');
  });
  assert(maxBuildings === false, 'placeBuilding returns false at MAX_BUILDINGS');

  // ─────────────────────────────────────────────────────────
  // COMBAT
  // ─────────────────────────────────────────────────────────
  section('L2-Combat: findNearestEnemy, findEnemyBaseTarget');

  // findNearestEnemy returns null with no enemies
  const noEnemies = await page.evaluate(() => {
    state = newState();
    spawnUnit('red', 'rifleman');
    return findNearestEnemy(state.units[0]);
  });
  assert(noEnemies === null, 'findNearestEnemy returns null with no enemies');

  // findNearestEnemy picks the closest
  const closestTest = await page.evaluate(() => {
    state = newState();
    // Place red unit at x=100, blue unit at x=300 (further), another at x=150 (closer)
    state.units.push({ side: 'red', type: 'rifleman', x: 100, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 });
    state.units.push({ side: 'blue', type: 'rifleman', x: 300, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 });
    state.units.push({ side: 'blue', type: 'rifleman', x: 150, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 });
    const nearest = findNearestEnemy(state.units[0]);
    return nearest ? nearest.x : null;
  });
  assert(closestTest === 150, `findNearestEnemy picks closest (got x=${closestTest})`);

  // findNearestEnemy boosts score for enemies attacking me
  const attackerPriority = await page.evaluate(() => {
    state = newState();
    const me = { side: 'red', type: 'rifleman', x: 100, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 };
    state.units.push(me);
    // Attacker at x=200 (further)
    const attacker = { side: 'blue', type: 'rifleman', x: 200, y: 300, hp: 20, maxHp: 20, target: me, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 };
    // Bystander at x=110 (closer)
    const bystander = { side: 'blue', type: 'rifleman', x: 110, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 };
    state.units.push(attacker);
    state.units.push(bystander);
    return findNearestEnemy(me) === attacker;
  });
  assert(attackerPriority === true, 'findNearestEnemy prefers attacker despite distance');

  // findEnemyBaseTarget prefers production buildings
  const productionPriority = await page.evaluate(() => {
    state = newState();
    // Red unit attacking
    const me = { side: 'red', type: 'rifleman', x: 1500, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 };
    state.units.push(me);
    // Pillbox (defense, not production) closer
    state.sides.blue.buildings.push({ type: 'pillbox', side: 'blue', x: 1700, y: 300, hp: 120, maxHp: 120, constructing: false });
    // Warfactory (production) further
    state.sides.blue.buildings.push({ type: 'warfactory', side: 'blue', x: 1800, y: 300, hp: 100, maxHp: 100, constructing: false });
    const result = findEnemyBaseTarget(me);
    return result.target ? result.target.type : null;
  });
  assert(productionPriority === 'warfactory', `findEnemyBaseTarget prefers production (got ${productionPriority})`);

  // findEnemyBaseTarget falls back to base
  const fallbackToBase = await page.evaluate(() => {
    state = newState();
    const me = { side: 'red', type: 'rifleman', x: 1500, y: 300, hp: 20, maxHp: 20, target: null, baseTarget: null, attackCooldown: 0, speed: 90, spawnFlash: 0 };
    state.units.push(me);
    const result = findEnemyBaseTarget(me);
    return { kind: result.kind, isBase: result.target === state.sides.blue.base };
  });
  assert(fallbackToBase.kind === 'base', 'findEnemyBaseTarget falls back to base');
  assert(fallbackToBase.isBase === true, 'Returns the actual base object');

  // ─────────────────────────────────────────────────────────
  // UNIT PRODUCTION
  // ─────────────────────────────────────────────────────────
  section('L2-Production: queueUnit, spawnUnit');

  // queueUnit deducts credits
  const queueDeducts = await page.evaluate(() => {
    state = newState();
    // Need active barracks for rifleman to be unlocked
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    const before = state.sides.red.credits;
    queueUnit('red', 'rifleman');
    return { before, after: state.sides.red.credits, queueLen: state.sides.red.queue.length };
  });
  assert(queueDeducts.after === queueDeducts.before - 10, `queueUnit deducts rifleman cost (10): ${queueDeducts.before} → ${queueDeducts.after}`);
  assert(queueDeducts.queueLen === 1, 'queueUnit adds to queue');

  // queueUnit respects MAX_QUEUE
  const queueMax = await page.evaluate(() => {
    state = newState();
    state.sides.red.credits = 1000;
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    for (let i = 0; i < CFG.MAX_QUEUE; i++) {
      queueUnit('red', 'rifleman');
    }
    return {
      queueLen: state.sides.red.queue.length,
      added: queueUnit('red', 'rifleman'),
    };
  });
  // Pull MAX_QUEUE from the browser (where CFG lives)
  const maxQueue = await page.evaluate(() => CFG.MAX_QUEUE);
  assert(queueMax.queueLen === maxQueue, `Queue respects MAX_QUEUE (${queueMax.queueLen} === ${maxQueue})`);
  assert(queueMax.added === undefined, 'queueUnit returns undefined when queue full');

  // Click handler should NOT double-deduct
  // Simulates what the click handler does: validate + queueUnit()
  // Bug fix 2026-08-30: previously the click handler also deducted credits,
  // causing the player to be charged 2x per unit.
  const clickHandlerTest = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    const before = state.sides.red.credits;
    const def = CFG.UNITS.rifleman;
    // This is the click handler logic (post-fix)
    if (!isUnitUnlocked('red', 'rifleman')) return { error: 'not unlocked' };
    if (state.sides.red.queue.length >= CFG.MAX_QUEUE) return { error: 'queue full' };
    if (state.sides.red.credits < def.cost) return { error: 'no money' };
    queueUnit('red', 'rifleman');  // queueUnit deducts internally
    return {
      before,
      after: state.sides.red.credits,
      queueLen: state.sides.red.queue.length,
    };
  });
  assert(clickHandlerTest.after === clickHandlerTest.before - 10,
    `Click handler deducts ONCE: ${clickHandlerTest.before} → ${clickHandlerTest.after} (expected ${clickHandlerTest.before - 10})`);
  assert(clickHandlerTest.queueLen === 1, 'Click handler adds 1 unit to queue');

  // isUnitUnlocked requires active building
  const isUnlocked = await page.evaluate(() => {
    state = newState();
    return {
      // No buildings: nothing unlocked
      rifleman: isUnitUnlocked('red', 'rifleman'),
      fsv: isUnitUnlocked('red', 'fsv'),
      drone: isUnitUnlocked('red', 'drone'),
    };
  });
  assert(isUnlocked.rifleman === false, 'rifleman not unlocked without barracks');
  assert(isUnlocked.fsv === false, 'fsv not unlocked without warfactory');
  assert(isUnlocked.drone === false, 'drone not unlocked without techcenter');

  // With active barracks, rifleman unlocked
  const riflemanUnlocked = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    return isUnitUnlocked('red', 'rifleman');
  });
  assert(riflemanUnlocked === true, 'rifleman unlocked with active barracks');

  // With constructing barracks, NOT unlocked
  const riflemanLocked = await page.evaluate(() => {
    state = newState();
    state.sides.red.buildings.push({ type: 'barracks', constructing: true, hp: 80 });
    return isUnitUnlocked('red', 'rifleman');
  });
  assert(riflemanLocked === false, 'rifleman NOT unlocked with constructing barracks');

  // ─────────────────────────────────────────────────────────
  // AI
  // ─────────────────────────────────────────────────────────
  section('L2-AI: autoAIBuild');

  // AI doesn't build without enough credits
  const aiNoCredits = await page.evaluate(() => {
    state = newState();
    state.sides.blue.credits = 50; // Not enough for barracks (100)
    autoAIBuild('blue');
    return state.sides.blue.buildingQueue.length;
  });
  assert(aiNoCredits === 0, 'AI does not build without enough credits');

  // AI doesn't build at MAX_BUILDINGS
  const aiMax = await page.evaluate(() => {
    state = newState();
    state.sides.blue.credits = 1000;
    for (let i = 0; i < CFG.MAX_BUILDINGS; i++) {
      state.sides.blue.buildings.push({ type: 'barracks', constructing: false, hp: 80 });
    }
    autoAIBuild('blue');
    return state.sides.blue.buildingQueue.length;
  });
  assert(aiMax === 0, 'AI does not build at MAX_BUILDINGS');

  // Defense-first: AI builds pillbox first, not barracks (added 2026-08-31)
  // t=5: pillbox #1 (75 credits)
  // t=12: pillbox #2
  // t=15: barracks (100 credits)

  // t=5: AI builds pillbox (defense first)
  const aiPillbox1 = await page.evaluate(() => {
    state = newState();
    state.sides.blue.credits = 200;
    state.time = 6;
    state.aiNextDecision = 0;
    updateAI(0);
    return {
      hasPillbox: state.sides.blue.turretQueue.some(q => q.type === 'pillbox'),
      hasBarracks: state.sides.blue.buildingQueue.some(q => q.type === 'barracks'),
      credits: state.sides.blue.credits,
    };
  });
  assert(aiPillbox1.hasPillbox === true, 'AI builds pillbox first at t=5 (defense-first)');
  assert(aiPillbox1.hasBarracks === false, 'AI does NOT build barracks before pillbox at t=5');

  // t=11: AI should have 1 pillbox, not build #2 yet (gated by t>=12)
  const aiAt11 = await page.evaluate(() => {
    state = newState();
    state.sides.blue.credits = 500;
    // Place 1 pillbox already
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.time = 11;
    state.aiNextDecision = 0;
    updateAI(0);
    return {
      hasPillboxQueue: state.sides.blue.turretQueue.some(q => q.type === 'pillbox'),
      hasBarracks: state.sides.blue.buildingQueue.some(q => q.type === 'barracks'),
    };
  });
  assert(aiAt11.hasPillboxQueue === false, 'AI does NOT queue 2nd pillbox at t<12');

  // t=12: AI builds 2nd pillbox
  const aiPillbox2 = await page.evaluate(() => {
    state = newState();
    state.sides.blue.credits = 500;
    // Place 1 pillbox already
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.time = 13;
    state.aiNextDecision = 0;
    updateAI(0);
    return {
      hasPillboxQueue: state.sides.blue.turretQueue.some(q => q.type === 'pillbox'),
      hasBarracks: state.sides.blue.buildingQueue.some(q => q.type === 'barracks'),
    };
  });
  assert(aiPillbox2.hasPillboxQueue === true, 'AI builds 2nd pillbox at t>=12 (defense-first)');
  assert(aiPillbox2.hasBarracks === false, 'AI does NOT build barracks before 2nd pillbox');

  // t=15: AI builds barracks after 2 pillboxes
  const aiBuilds = await page.evaluate(() => {
    state = newState();
    state.sides.blue.credits = 500;
    // Place 2 pillboxes already
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.sides.blue.turrets.push({ type: 'pillbox', x: 0, y: 0, hp: 120, dmg: 12, range: 250, lastFire: 0 });
    state.time = 16;
    state.aiNextDecision = 0;
    updateAI(0);
    return {
      hasBarracks: state.sides.blue.buildingQueue.some(q => q.type === 'barracks'),
    };
  });
  assert(aiBuilds.hasBarracks === true, 'AI builds barracks after 2 pillboxes at t>=15');

  // ─────────────────────────────────────────────────────────
  // TURRET
  // ─────────────────────────────────────────────────────────
  section('L2-Turret: placeTurret');

  // placeTurret deducts pillbox cost (75)
  const turretCost = await page.evaluate(() => {
    state = newState();
    const before = state.sides.red.credits;
    placeTurret('red', 'pillbox');
    return { before, after: state.sides.red.credits };
  });
  assert(turretCost.after === turretCost.before - 75, `placeTurret(pillbox) deducts 75 (${turretCost.before} → ${turretCost.after})`);

  // placeTurret deducts turret cost (150)
  const turretTurret = await page.evaluate(() => {
    state = newState();
    const before = state.sides.red.credits;
    placeTurret('red', 'turret');
    return { before, after: state.sides.red.credits };
  });
  assert(turretTurret.after === turretTurret.before - 150, `placeTurret(turret) deducts 150 (${turretTurret.before} → ${turretTurret.after})`);

  // placeTurret respects MAX_TURRET_SLOTS
  const turretMax = await page.evaluate(() => {
    state = newState();
    state.sides.red.credits = 100000;
    for (let i = 0; i < CFG.MAX_TURRET_SLOTS; i++) {
      state.sides.red.turretQueue.push({ type: 'pillbox', buildProgress: 0, buildTime: 4 });
    }
    const result = placeTurret('red', 'pillbox');
    return { result, queueLen: state.sides.red.turretQueue.length };
  });
  const maxTurretSlots = await page.evaluate(() => CFG.MAX_TURRET_SLOTS);
  assert(turretMax.result === false, 'placeTurret returns false at MAX_TURRET_SLOTS');
  assert(turretMax.queueLen === maxTurretSlots, `Queue size unchanged (${turretMax.queueLen} === ${maxTurretSlots})`);

  // ─────────────────────────────────────────────────────────
  // endMatch
  // ─────────────────────────────────────────────────────────
  section('L2-endMatch');

  const endMatch1 = await page.evaluate(() => {
    state = newState();
    endMatch('red');
    return { matchOver: state.matchOver, winner: state.winner };
  });
  assert(endMatch1.matchOver === true, 'matchOver is true');
  assert(endMatch1.winner === 'red', 'winner is red');

  // endMatch is idempotent
  const endMatch2 = await page.evaluate(() => {
    state = newState();
    endMatch('red');
    endMatch('blue'); // Should be ignored
    return { matchOver: state.matchOver, winner: state.winner };
  });
  assert(endMatch2.winner === 'red', 'endMatch is idempotent (first wins)');

  await browser.close();

  assert(pageErrors.length === 0, `No page errors (got ${pageErrors.length})`);

  printFinalReport();
  process.exit(0);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
