const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Place a unit and zoom in
  await page.evaluate(() => {
    state.units = [];
    spawnUnit('red', 'rifleman');
    state.units[0].x = 960;
    state.units[0].y = 300;
  });
  await page.waitForTimeout(1000);
  
  // Zoom in on the unit
  await page.screenshot({ path: '/workspace/.test/v60_unit_zoom.png', clip: { x: 200, y: 100, width: 500, height: 400 } });
  await browser.close();
})();
