const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  await page.evaluate(() => {
    state.units = [];
    spawnUnit('red', 'fsv');
    state.units[0].x = 500;
    state.units[0].y = 350;
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/workspace/.test/v73_original_fsv_fixed.png', clip: { x: 300, y: 250, width: 400, height: 250 } });
  
  // Also spawn all 8 units
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
  await page.screenshot({ path: '/workspace/.test/v74_all_units_original.png', clip: { x: 100, y: 200, width: 700, height: 350 } });
  
  await browser.close();
})();
