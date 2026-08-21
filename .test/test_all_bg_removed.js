const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Spawn all 8 unit types and capture
  const unitTypes = ['rifleman', 'rocket', 'sniper', 'flame', 'drone', 'fsv', 'tank', 'heavy'];
  
  for (const u of unitTypes) {
    await page.evaluate((unitType) => {
      state.units = [];
      state.sides.red.credits = 1000;
      state.sides.red.buildings = [
        {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
        {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5},
        {type: 'techcenter', hp: 100, maxHp: 100, constructing: false, x: 140, y: 430, buildProgress: 5, buildTime: 5}
      ];
      spawnUnit('red', unitType);
      state.units[0].x = 500;
      state.units[0].y = 350;
    }, u);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `/workspace/.test/v75_${u}_no_bg.png`, clip: { x: 350, y: 270, width: 300, height: 200 } });
  }
  
  await browser.close();
})();
