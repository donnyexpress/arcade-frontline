const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Place barracks, then war factory
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    placeBuilding('red', 'barracks');
  });
  
  // Watch progress
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/workspace/.test/v45_progress_${i}.png` });
  }
  await browser.close();
})();
