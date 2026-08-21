const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  await page.evaluate(() => {
    state.units = [];
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5}
    ];
    spawnUnit('red', 'fsv');
    state.units[0].x = 700;
    state.units[0].y = 350;
  });
  await page.waitForTimeout(2000);
  // Zoom into the FSV area
  await page.screenshot({ path: '/workspace/.test/v68_fsv_zoom.png', clip: { x: 200, y: 250, width: 400, height: 200 } });
  await browser.close();
})();
