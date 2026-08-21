const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Test simple: place barracks, wait, check
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    const r = placeBuilding('red', 'barracks');
    return {result: r, queue: state.sides.red.buildingQueue, credits: state.sides.red.credits};
  }).then(r => console.log('After place:', JSON.stringify(r)));
  
  // Force 10 seconds
  await page.evaluate(() => {
    for (let j = 0; j < 100; j++) {
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
  
  const r = await page.evaluate(() => ({
    buildings: state.sides.red.buildings.map(b => b.type),
    queue: state.sides.red.buildingQueue,
    time: state.time
  }));
  console.log('After 10s:', JSON.stringify(r));
  
  await browser.close();
})();
