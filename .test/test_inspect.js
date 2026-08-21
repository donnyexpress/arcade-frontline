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
  
  await page.evaluate(() => {
    state.sides.red.credits = 5000;
    for (let i = 0; i < 5; i++) placeTurret('red', i % 2 === 0 ? 'pillbox' : 'turret');
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
  
  const inspect = await page.evaluate(() => {
    return {
      stateTurrets: state.sides.red.turrets.length,
      stateTurretsDetails: state.sides.red.turrets.map(t => ({type: t.type, x: t.x, y: t.y, hp: t.hp, constructing: t.constructing})),
      sceneTurrets: scene.turretSprites.length,
      sceneTurretsDetails: scene.turretSprites.map(s => ({
        x: s.sprite.x, y: s.sprite.y, 
        scale: s.sprite.scaleX, 
        visible: s.sprite.visible,
        alpha: s.sprite.alpha,
        texture: s.sprite.texture?.key,
        textureWidth: s.sprite.texture?.getSourceImage()?.width,
        textureHeight: s.sprite.texture?.getSourceImage()?.height
      }))
    };
  });
  console.log(JSON.stringify(inspect, null, 2));
  
  await browser.close();
})();
