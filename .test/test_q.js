const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Build barracks
  await page.evaluate(() => { state.sides.red.credits = 500; placeBuilding('red', 'barracks'); });
  
  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => {
      for (let j = 0; j < 10; j++) {
        const dt = 0.1;
        state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
        state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
        autoAIBuild('red');
        autoAIBuild('blue');
        updateBuildings('red', dt);
        updateBuildings('blue', dt);
        updateTurrets('red', dt);
        updateTurrets('blue', dt);
        updateAI(dt);
        for (const u of state.units) updateUnit(u, dt);
        state.time += dt;
      }
    });
  }
  
  // Queue units
  const r = await page.evaluate(() => {
    queueUnit('red', 'rifleman');
    queueUnit('red', 'rocket');
    queueUnit('red', 'flame');
    return {
      queue: state.sides.red.queue,
      buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, constructing: b.constructing})),
      unitsBefore: state.units.filter(u => u.side === 'red').length
    };
  });
  console.log('After queue:', JSON.stringify(r, null, 2));
  
  // Wait
  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => {
      for (let j = 0; j < 10; j++) {
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
        state.time += dt;
      }
    });
  }
  
  const r2 = await page.evaluate(() => ({
    units: state.units.filter(u => u.side === 'red').map(u => ({type: u.type, x: Math.floor(u.x)})),
    queue: state.sides.red.queue,
    time: state.time
  }));
  console.log('After wait:', JSON.stringify(r2, null, 2));
  
  await browser.close();
})();
