const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 5000;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    state.sides.red.turrets = [];
    state.sides.red.turretQueue = [];
    placeBuilding('red', 'barracks');
    placeBuilding('red', 'warfactory');
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
    // Spawn some units
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'heavy');
    spawnUnit('red', 'drone');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/workspace/.test/v62_full.png' });
  await browser.close();
})();
