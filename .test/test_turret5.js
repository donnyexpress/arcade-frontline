const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let logs = [];
  page.on('console', msg => { if (msg.text().includes('TURRET')) logs.push(msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Patch makeTurretSprite to log
  await page.evaluate(() => {
    const orig = scene.makeTurretSprite.bind(scene);
    scene.makeTurretSprite = function(t) {
      const frameName = t.type === 'pillbox' ? 'pillbox-' + t.side : 'turret-' + t.side;
      const exists = this.textures.exists(frameName);
      console.log('TURRET makeTurretSprite: frame=' + frameName + ' exists=' + exists);
      return orig(t);
    };
  });
  
  // Build barracks
  await page.evaluate(() => {
    state.sides.red.credits = 5000;
    placeBuilding('red', 'barracks');
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
    placeTurret('red', 'pillbox');
    placeTurret('red', 'pillbox');
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
  
  await page.waitForTimeout(2000);
  console.log('=== TURRET LOGS ===');
  logs.forEach(l => console.log(l));
  
  const r = await page.evaluate(() => ({
    stateTurrets: state.sides.red.turrets.length,
    sceneTurrets: scene.turretSprites.length,
    texturesExist: ['pillbox-red', 'turret-red', 'pillbox-blue', 'turret-blue'].map(k => ({k, exists: scene.textures.exists(k)}))
  }));
  console.log('Final:', JSON.stringify(r, null, 2));
  
  await browser.close();
})();
