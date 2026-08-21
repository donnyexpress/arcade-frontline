const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Test 1: Without DEBUG flag, player should not auto-build war factory
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    placeBuilding('red', 'barracks');
  });
  
  // Force 60 seconds - player should NOT auto-build
  await page.evaluate(() => {
    for (let j = 0; j < 600; j++) {
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
  
  const r1 = await page.evaluate(() => ({
    redBuildings: state.sides.red.buildings.map(b => b.type),
    redBuildQueue: state.sides.red.buildingQueue.map(q => q.type),
    blueBuildings: state.sides.blue.buildings.map(b => b.type)
  }));
  console.log('After 60s (no DEBUG):', JSON.stringify(r1));
  
  if (r1.redBuildings.length === 1 && r1.redBuildings[0] === 'barracks') {
    console.log('✅ PASS: Player did NOT auto-build war factory (only barracks)');
  } else {
    console.log('❌ FAIL: Player auto-built something:', r1.redBuildings);
  }
  
  // Test 2: With DEBUG_AI_HINTS, player should auto-build
  await page.evaluate(() => {
    window.DEBUG_AI_HINTS = true;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    state.sides.red.credits = 1000;
    placeBuilding('red', 'barracks');
  });
  
  await page.evaluate(() => {
    for (let j = 0; j < 300; j++) {
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
  
  const r2 = await page.evaluate(() => ({
    redBuildings: state.sides.red.buildings.map(b => b.type),
    redBuildQueue: state.sides.red.buildingQueue.map(q => q.type)
  }));
  console.log('After 30s (DEBUG=true):', JSON.stringify(r2));
  
  if (r2.redBuildings.length > 1 || r2.redBuildQueue.length > 0) {
    console.log('✅ PASS: Player auto-built with DEBUG flag');
  } else {
    console.log('❌ FAIL: Player did not auto-build with DEBUG flag');
  }
  
  await browser.close();
})();
