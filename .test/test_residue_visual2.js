const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(8000);  // Wait long for textures
  
  // Set up using proper building placement
  await page.evaluate(() => {
    state.sides.red.credits = 10000;
    placeBuilding('red', 'barracks');
    placeBuilding('red', 'warfactory');
  });
  
  // Force time for buildings to be placed
  for (let i = 0; i < 12; i++) {
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
        state.units = state.units.filter(u => u.hp > 0);
        state.time += dt;
      }
    });
    await page.waitForTimeout(200);
  }
  
  // Now spawn units
  await page.evaluate(() => {
    state.sides.red.credits = 10000;
    state.sides.red.turrets = [];
    state.sides.red.turretQueue = [];
    placeTurret('red', 'pillbox');
    placeTurret('red', 'turret');
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'drone');
    spawnUnit('red', 'heavy');
    state.units.forEach((u, i) => {
      u.x = 250 + i * 100;
      u.y = 450;
    });
  });
  
  // Force more time for turrets to be placed
  for (let i = 0; i < 5; i++) {
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
        state.units = state.units.filter(u => u.hp > 0);
        state.time += dt;
      }
    });
    await page.waitForTimeout(200);
  }
  
  await page.screenshot({ path: '/workspace/.test/v64_clean.png' });
  await browser.close();
})();
