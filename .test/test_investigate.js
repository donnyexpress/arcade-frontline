const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Test 1: Why does the AI have no buildings?
  // Run for 60s
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => {
      for (let j = 0; j < 20; j++) {
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
  }
  
  const s1 = await page.evaluate(() => ({
    time: state.time,
    blueBuildings: state.sides.blue.buildings,
    blueBuildQueue: state.sides.blue.buildingQueue,
    blueQueue: state.sides.blue.queue,
    blueCredits: Math.floor(state.sides.blue.credits),
    redCredits: Math.floor(state.sides.red.credits)
  }));
  console.log('Test 1 - AI state:', JSON.stringify(s1, null, 2));
  
  // Test 2: Why does the test_18 cost not deduct?
  await page.evaluate(() => {
    state.sides.red.credits = 100;
    state.sides.red.buildings = [{type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 100, y: 100}];
  });
  const r2 = await page.evaluate(() => ({
    cost: CFG.WARFACTORY_COST,
    canBuild: canBuild('red', 'warfactory'),
    credits: state.sides.red.credits,
    result: placeBuilding('red', 'warfactory')
  }));
  console.log('Test 2 - cost:', JSON.stringify(r2));
  
  // Test 3: Why doesn't the blue win?
  await page.evaluate(() => {
    state.sides.red.base.hp = 0;
    state.sides.blue.base.hp = 100;
    state.matchOver = false;
    state.winner = null;
  });
  // Force the match-end check
  await page.evaluate(() => {
    if (state.time >= 180) {
      // This won't run because time < 180
    }
  });
  // Manually trigger match end
  const r3 = await page.evaluate(() => {
    endMatch('blue');
    return {
      matchOver: state.matchOver,
      winner: state.winner
    };
  });
  console.log('Test 3 - match end:', JSON.stringify(r3));
  
  await browser.close();
})();
