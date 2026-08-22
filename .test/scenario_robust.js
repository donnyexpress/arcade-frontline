const { chromium } = require('playwright');

const PASS = [];
const FAIL = [];
function assert(cond, name, detail) {
  if (cond) { PASS.push(name); console.log('  ✅', name); }
  else { FAIL.push({name, detail}); console.log('  ❌', name, detail || ''); }
}
function section(name) { console.log('\n═══ ' + name + ' ═══'); }

async function waitFor(page, fn, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await page.evaluate(fn);
    if (ok) return true;
    await page.waitForTimeout(50);
  }
  return false;
}

(async () => {
  console.log('🎮 Arcade Frontline — Robust Scenario Test (FORCE_FAST_FORWARD)\n');
  
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome',
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  
  // Inject FORCE_FAST_FORWARD before page loads
  await page.addInitScript(() => {
    window.FORCE_FAST_FORWARD = true;
  });
  
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  // === SCENARIO 1: Initial state ===
  section('SCENARIO 1: Initial state');
  const s1 = await page.evaluate(() => ({
    hasState: !!state,
    time: state.time,
    redCredits: state.sides.red.credits,
    blueCredits: state.sides.blue.credits,
    redBaseHp: state.sides.red.base.hp,
    blueBaseHp: state.sides.blue.base.hp,
    baseSprites: scene.baseSprites.length,
  }));
  console.log('  ', JSON.stringify(s1));
  assert(s1.hasState, 'State initialized');
  assert(s1.redBaseHp === 500, 'Red base 500 HP');
  assert(s1.blueBaseHp === 500, 'Blue base 500 HP');
  assert(s1.baseSprites === 2, `2 base sprites (got ${s1.baseSprites})`);
  
  // === SCENARIO 2: Build barracks ===
  section('SCENARIO 2: Build barracks');
  const queueBefore = await page.evaluate(() => state.sides.red.buildingQueue.length);
  const bldResult = await page.evaluate(() => placeBuilding('red', 'barracks'));
  const afterQueue = await page.evaluate(() => ({
    queue: state.sides.red.buildingQueue.length,
    credits: state.sides.red.credits,
  }));
  console.log('  placeBuilding:', bldResult, JSON.stringify(afterQueue));
  assert(bldResult === true, 'placeBuilding returns true');
  assert(afterQueue.queue === queueBefore + 1, 'Queue grew by 1');
  
  // With FORCE_FAST_FORWARD, BUILD_TIME (5s) completes in 5 frames
  const placed = await waitFor(page, () => 
    state.sides.red.buildings.some(b => b.type === 'barracks'), 4000
  );
  const s2 = await page.evaluate(() => ({
    buildings: state.sides.red.buildings.filter(b => b.type === 'barracks').length,
    buildingSprites: scene.buildingSprites.length,
  }));
  console.log('  After wait:', s2);
  assert(placed, 'Barracks placed on map');
  assert(s2.buildings >= 1, `1+ barracks in buildings (${s2.buildings})`);
  assert(s2.buildingSprites >= 1, `1+ building sprites (${s2.buildingSprites})`);
  
  // === SCENARIO 3: Spawn rifleman ===
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
  
  // === SCENARIO 4: Build pillbox ===
  section('SCENARIO 4: Build pillbox (turret)');
  const turretResult = await page.evaluate(() => placeTurret('red', 'pillbox'));
  assert(turretResult === true, 'placeTurret returns true (Bug #2 fix)');
  const turretPlaced = await waitFor(page, () => 
    state.sides.red.turrets.length > 0, 3000
  );
  const s4 = await page.evaluate(() => ({
    turrets: state.sides.red.turrets.length,
    turretSprites: scene.turretSprites.length,
  }));
  console.log('  ', s4);
  assert(turretPlaced, 'Pillbox placed on map');
  assert(s4.turretSprites > 0, 'Turret sprite created');
  
  // === SCENARIO 5: Game time advances ===
  section('SCENARIO 5: Game time advances (with fast-forward)');
  const tStart = await page.evaluate(() => state.time);
  await page.waitForTimeout(2000);
  const tAfter = await page.evaluate(() => state.time);
  console.log(`  Time: ${tStart.toFixed(2)} → ${tAfter.toFixed(2)}`);
  assert(tAfter > tStart + 5, `Time advanced 5+ seconds (was ${tStart.toFixed(2)}, now ${tAfter.toFixed(2)})`);
  
  // === SCENARIO 6: AI builds barracks ===
  section('SCENARIO 6: AI builds barracks (within 10 game seconds)');
  // Reset AI state
  await page.evaluate(() => {
    state.sides.blue.buildingQueue = [];
    state.sides.blue.buildings = state.sides.blue.buildings.filter(b => b.type === 'base');
    state.sides.blue.credits = 200;
    state.aiNextDecision = 0;
  });
  const aiBuilt = await waitFor(page, () => 
    state.sides.blue.buildingQueue.some(q => q.type === 'barracks') ||
    state.sides.blue.buildings.some(b => b.type === 'barracks'),
    4000
  );
  const aiState = await page.evaluate(() => ({
    queue: state.sides.blue.buildingQueue.map(q => q.type),
    buildings: state.sides.blue.buildings.map(b => b.type),
    time: state.time,
  }));
  console.log('  AI state:', JSON.stringify(aiState));
  assert(aiBuilt, `AI built barracks (queue: ${aiState.queue}, buildings: ${aiState.buildings})`);
  
  // === SCENARIO 7: AI builds units ===
  section('SCENARIO 7: AI builds units');
  // Wait for AI to have barracks active and credits, then build a unit
  const aiHasUnits = await waitFor(page, () => 
    state.units.filter(u => u.side === 'blue').length > 0, 4000
  );
  const s7 = await page.evaluate(() => ({
    blueUnits: state.units.filter(u => u.side === 'blue').length,
  }));
  console.log('  Blue units:', s7.blueUnits);
  assert(aiHasUnits, `AI built units (${s7.blueUnits})`);
  
  // === SCENARIO 8: Match end ===
  section('SCENARIO 8: Match end via base HP=0');
  await page.evaluate(() => { state.sides.blue.base.hp = 0; });
  await page.waitForTimeout(1000);
  const s8 = await page.evaluate(() => ({
    matchOver: state.matchOver,
    winner: state.winner,
    endScreen: document.getElementById('end-screen')?.classList.contains('show'),
  }));
  console.log('  ', s8);
  assert(s8.matchOver, 'Match over');
  assert(s8.winner === 'red', 'Red wins');
  assert(s8.endScreen, 'End screen visible');
  
  // === SCENARIO 9: Rematch ===
  section('SCENARIO 9: Rematch resets everything');
  await page.evaluate(() => document.getElementById('rematch').click());
  await page.waitForTimeout(2000);
  const s9 = await page.evaluate(() => ({
    time: state.time,
    matchOver: state.matchOver,
    redBaseHp: state.sides.red.base.hp,
    blueBaseHp: state.sides.blue.base.hp,
    redUnits: state.units.filter(u => u.side === 'red').length,
    blueUnits: state.units.filter(u => u.side === 'blue').length,
    baseSprites: scene.baseSprites.length,
    buildingSprites: scene.buildingSprites.length,
    unitSprites: scene.unitSprites.length,
    turretSprites: scene.turretSprites.length,
    endScreen: document.getElementById('end-screen')?.classList.contains('show'),
  }));
  console.log('  ', s9);
  assert(s9.matchOver === false, 'matchOver reset');
  assert(s9.redBaseHp === 500, 'Red base HP reset');
  assert(s9.blueBaseHp === 500, 'Blue base HP reset');
  assert(s9.redUnits === 0, 'Red units cleared');
  assert(s9.blueUnits === 0, 'Blue units cleared');
  assert(s9.baseSprites === 2, `2 base sprites (${s9.baseSprites})`);
  assert(s9.buildingSprites === 0, 'Building sprites cleared');
  assert(s9.unitSprites === 0, 'Unit sprites cleared');
  assert(s9.turretSprites === 0, 'Turret sprites cleared');
  assert(s9.endScreen === false, 'End screen hidden');
  
  // === SCENARIO 10: AI works after rematch ===
  section('SCENARIO 10: AI works after rematch');
  // Wait for AI to have barracks active AND at least one unit.
  // AI needs: 5s to build barracks + time to produce unit = ~15s game time
  const aiFull = await waitFor(page, () => {
    const hasActiveBarracks = state.sides.blue.buildings.some(b => !b.constructing && b.type === 'barracks');
    const hasUnits = state.units.filter(u => u.side === 'blue').length > 0;
    return hasActiveBarracks && hasUnits;
  }, 30000);
  const s10 = await page.evaluate(() => ({
    time: state.time,
    blueBuildings: state.sides.blue.buildings.map(b => b.type),
    blueUnits: state.units.filter(u => u.side === 'blue').length,
  }));
  console.log('  ', s10);
  assert(s10.blueBuildings.includes('barracks'), 'AI has barracks after rematch');
  assert(s10.blueUnits > 0, `AI built units after rematch (${s10.blueUnits})`);
  
  // === FINAL ===
  console.log('\n═══════════════════════════════════════');
  console.log('  PASSED:', PASS.length, '  FAILED:', FAIL.length);
  console.log('  Page errors:', pageErrors.length);
  if (pageErrors.length > 0) {
    console.log('\nPage errors:');
    pageErrors.forEach(e => console.log('  -', e));
  }
  if (FAIL.length > 0) {
    console.log('\nFailed assertions:');
    FAIL.forEach(f => console.log('  -', f.name, f.detail || ''));
  }
  
  await page.screenshot({ path: '/workspace/.test/scenario_robust_final.png' });
  await browser.close();
  process.exit(FAIL.length === 0 && pageErrors.length === 0 ? 0 : 1);
})();
