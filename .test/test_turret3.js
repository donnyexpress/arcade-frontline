const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Build barracks and turrets properly
  const result = await page.evaluate(() => {
    state.sides.red.credits = 5000;
    placeBuilding('red', 'barracks');
    return { 
      buildings: state.sides.red.buildings,
      canBuild: canBuild('red', 'barracks')
    };
  });
  console.log('After placeBuilding:', JSON.stringify(result, null, 2));
  
  // Force barracks to be active
  await page.evaluate(() => {
    for (let j = 0; j < 60; j++) {
      const dt = 0.1;
      state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
      updateBuildings('red', dt);
      state.time += dt;
    }
    return {
      buildings: state.sides.red.buildings,
      canBuildBarracks: canBuild('red', 'barracks')
    };
  });
  
  const r2 = await page.evaluate(() => ({
    buildings: state.sides.red.buildings.length,
    canBuild: canBuild('red', 'barracks')
  }));
  console.log('After force:', JSON.stringify(r2));
  
  // Now place turrets
  const r3 = await page.evaluate(() => {
    state.sides.red.credits = 5000;
    const t1 = placeTurret('red', 'pillbox');
    const t2 = placeTurret('red', 'pillbox');
    return { t1, t2, queue: state.sides.red.turretQueue };
  });
  console.log('After placeTurret:', JSON.stringify(r3));
  
  // Force turret queue processing
  await page.waitForTimeout(5000);
  
  const r4 = await page.evaluate(() => ({
    turrets: state.sides.red.turrets.length,
    sceneTurrets: scene.turretSprites.length,
    spriteTextures: scene.turretSprites.map(s => s.sprite.texture?.key)
  }));
  console.log('After wait:', JSON.stringify(r4, null, 2));
  
  await browser.close();
})();
