const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    placeBuilding('red', 'barracks');
  });
  
  // Force 60 seconds, check every 10s
  for (let i = 0; i < 6; i++) {
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
      buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, x: Math.floor(b.x), y: Math.floor(b.y)})),
      queue: state.sides.red.buildingQueue.map(q => q.type),
      blueBuildings: state.sides.blue.buildings.length
    }));
    console.log(`T+${(i+1)*10}s:`, JSON.stringify(r));
  }
  
  await browser.close();
})();
