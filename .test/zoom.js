const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(10000);  // wait long enough for retry
  await page.evaluate(() => {
    state.sides.red.credits = 99999;
    state.sides.blue.credits = 99999;
    for (const type of ['barracks', 'warfactory', 'techcenter']) {
      placeBuildingOnMap('red', type);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/workspace/.test/v19_bldgs.png' });
  console.log('Done');
  if (errors.length) console.log('Errors:', errors.slice(0,3));
  await browser.close();
})().catch(e => console.error('E:', e.message));
