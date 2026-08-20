const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', m => { if (m.text().includes('Error') || m.text().includes('state')) console.log('L:', m.text().slice(0,150)); });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(15000);
  // Try after long wait
  const r = await page.evaluate(() => {
    return {
      hasGame: typeof game !== 'undefined',
      gameVal: typeof game,
    };
  });
  console.log(JSON.stringify(r));
  await browser.close();
})().catch(e => console.error('E:', e.message));
