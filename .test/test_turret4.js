const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Build barracks and turrets properly
  await page.evaluate(() => {
    state.sides.red.credits = 5000;
    placeBuilding('red', 'barracks');
  });
  
  // Wait 6s for barracks to build
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
  
  const check1 = await page.evaluate(() => ({
    barracks: state.sides.red.buildings.length > 0,
    buildings: state.sides.red.buildings.length
  }));
  console.log('After barracks build:', JSON.stringify(check1));
  
  // Now place turrets
  await page.evaluate(() => {
    placeTurret('red', 'pillbox');
    placeTurret('red', 'pillbox');
    placeTurret('red', 'turret');
  });
  
  // Force turret queue processing
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
  
  const check2 = await page.evaluate(() => ({
    stateTurrets: state.sides.red.turrets.length,
    sceneTurrets: scene.turretSprites.length,
    spriteTextures: scene.turretSprites.map(s => s.sprite.texture?.key)
  }));
  console.log('After turret force:', JSON.stringify(check2, null, 2));
  
  await browser.close();
})();
