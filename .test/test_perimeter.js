const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Build barracks
  await page.evaluate(() => { state.sides.red.credits = 1000; placeBuilding('red', 'barracks'); });
  await page.evaluate(() => {
    for (let j = 0; j < 60; j++) {
      const dt = 0.1;
      state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
      state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
      autoAIBuild('red');
      autoAIBuild('blue');
      updateBuildings('red', dt);
      updateBuildings('blue', dt);
      updateTurrets('red', dt);
      updateTurrets('blue', dt);
      updateQueue('red', dt);
      updateQueue('blue', dt);
      updateAI(dt);
      for (const u of state.units) updateUnit(u, dt);
      state.units = state.units.filter(u => u.hp > 0);
      state.time += dt;
    }
  });
  
  // Place 4 turrets around the perimeter
  await page.evaluate(() => {
    state.sides.red.credits = 2000;
    placeTurret('red', 'pillbox');
    placeTurret('red', 'pillbox');
    placeTurret('red', 'turret');
    placeTurret('red', 'turret');
  });
  await page.evaluate(() => {
    for (let j = 0; j < 50; j++) {
      const dt = 0.1;
      state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
      state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
      autoAIBuild('red');
      autoAIBuild('blue');
      updateBuildings('red', dt);
      updateBuildings('blue', dt);
      updateTurrets('red', dt);
      updateTurrets('blue', dt);
      updateQueue('red', dt);
      updateQueue('blue', dt);
      updateAI(dt);
      for (const u of state.units) updateUnit(u, dt);
      state.units = state.units.filter(u => u.hp > 0);
      state.time += dt;
    }
  });
  
  const t = await page.evaluate(() => ({
    redTurrets: state.sides.red.turrets.map(t => ({type: t.type, x: Math.floor(t.x), y: Math.floor(t.y)})),
    redBuildings: state.sides.red.buildings.map(b => ({type: b.type, x: Math.floor(b.x), y: Math.floor(b.y)})),
    redBase: state.sides.red.base
  }));
  console.log('Red turrets:', JSON.stringify(t.redTurrets, null, 2));
  console.log('Red buildings:', JSON.stringify(t.redBuildings, null, 2));
  console.log('Red base:', JSON.stringify(t.redBase));
  
  // Verify turrets are spread around the perimeter, not stacked near base
  const xs = t.redTurrets.map(t => t.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  console.log(`Turrets X range: ${minX} - ${maxX} (base X is ${t.redBase.x})`);
  
  // Verify turrets are NOT right next to base (which is at x=60)
  const closestToBase = Math.min(...xs.map(x => Math.abs(x - t.redBase.x)));
  console.log(`Closest turret to base: ${closestToBase}px away`);
  
  // Test attacker priority
  await page.evaluate(() => {
    // Place a blue unit attacking a red unit
    state.units = [];
    spawnUnit('red', 'rifleman');
    state.units[0].x = 800; state.units[0].y = 300;
    spawnUnit('blue', 'rifleman');
    state.units[1].x = 850; state.units[1].y = 300;
    spawnUnit('blue', 'rifleman');  // farther attacker
    state.units[2].x = 1500; state.units[2].y = 300;
    // Make the close blue unit target the red unit
    state.units[1].target = state.units[0];
  });
  
  const targetTest = await page.evaluate(() => {
    // Run findNearestEnemy to see what red targets
    return {
      target: findNearestEnemy(state.units[0])?.type
    };
  });
  console.log('Red unit targets (closer attacker):', targetTest.target);
  
  await page.screenshot({ path: '/workspace/.test/v53_perimeter.png' });
  
  await browser.close();
})();
