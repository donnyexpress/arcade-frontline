const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Place barracks
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    placeBuilding('red', 'barracks');
  });
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/workspace/.test/v45_building.png' });
  await browser.close();
})();
