const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Spawn FSV
  await page.evaluate(() => {
    state.units = [];
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5}
    ];
    spawnUnit('red', 'fsv');
    state.units[0].x = 500;
    state.units[0].y = 350;
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/workspace/.test/v77_fsv_clean.png', clip: { x: 300, y: 250, width: 400, height: 250 } });
  
  // Spawn all 8 units
  await page.evaluate(() => {
    state.units = [];
    const types = ['rifleman', 'rocket', 'sniper', 'flame', 'drone', 'fsv', 'tank', 'heavy'];
    types.forEach((u, i) => {
      spawnUnit('red', u);
      const idx = state.units.length - 1;
      state.units[idx].x = 300 + (i % 4) * 150;
      state.units[idx].y = 250 + Math.floor(i / 4) * 100;
    });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/workspace/.test/v77_all.png', clip: { x: 100, y: 200, width: 700, height: 350 } });
  
  console.log('Errors:', pageErrors);
  await browser.close();
})();
