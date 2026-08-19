const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  // Give credits, build barracks, queue riflemen
  await page.evaluate(() => { state.sides.red.credits = 500; });
  await page.click('#btn-barracks');
  await page.waitForTimeout(5500);
  await page.click('#unit-rifleman');
  await page.waitForTimeout(2000);
  await page.click('#unit-rifleman');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/workspace/.test/test_units.png' });
  console.log('Done');
  await browser.close();
})().catch(e => console.error('E:', e.message));
