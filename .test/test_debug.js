const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // First build barracks
  await page.evaluate(() => {
    state.sides.red.credits = 500;
    placeBuilding('red', 'barracks');
  });
  
  // Force time
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
  
  // Now try to queue a rifleman
  const result = await page.evaluate(() => {
    return {
      buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, constructing: b.constructing})),
      credits: state.sides.red.credits,
      queueResult: queueUnit('red', 'rifleman'),
      queue: state.sides.red.queue,
      isUnitUnlocked: isUnitUnlocked('red', 'rifleman'),
      MAX_QUEUE: CFG.MAX_QUEUE,
      UNITS_rifleman: CFG.UNITS.rifleman
    };
  });
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
})();
