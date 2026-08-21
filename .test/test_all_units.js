const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  await page.evaluate(() => {
    state.units = [];
    state.sides.red.buildings = [];
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'rocket');
    spawnUnit('red', 'sniper');
    spawnUnit('red', 'flame');
    spawnUnit('red', 'fsv');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'drone');
    spawnUnit('red', 'heavy');
    state.units.forEach((u, i) => {
      u.x = 200 + (i % 4) * 150;
      u.y = 250 + Math.floor(i / 4) * 100;
    });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/workspace/.test/v70_all_units.png', clip: { x: 130, y: 200, width: 700, height: 350 } });
  await browser.close();
})();
