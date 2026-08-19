const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => { state.sides.red.credits = 500; });
  await page.click('#btn-barracks');
  await page.waitForTimeout(5500);
  await page.click('#unit-rifleman');
  await page.waitForTimeout(2000);
  await page.click('#unit-rifleman');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/workspace/.test/game_units_walking.png' });
  console.log('Done');
  await browser.close();
})().catch(e => console.error('E:', e.message));
