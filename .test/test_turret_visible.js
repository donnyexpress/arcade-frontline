const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
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
  
  // Place turrets
  await page.evaluate(() => {
    state.sides.red.credits = 5000;
    for (let i = 0; i < 3; i++) placeTurret('red', 'pillbox');
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
    turretSprites: scene.turretSprites.map(s => ({x: Math.floor(s.sprite.x), y: Math.floor(s.sprite.y), scale: s.sprite.scaleX, visible: s.sprite.visible, alpha: s.sprite.alpha})),
    sceneHasTurret: scene.turretSprites.length
  }));
  console.log('State:', JSON.stringify(t, null, 2));
  
  // Take a zoomed screenshot
  await page.screenshot({ path: '/workspace/.test/v56_turrets.png', clip: { x: 100, y: 100, width: 600, height: 600 } });
  await browser.close();
})();
