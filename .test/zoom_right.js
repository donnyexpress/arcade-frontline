const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  const box = await page.locator('#right-col').boundingBox();
  await page.screenshot({ path: '/workspace/.test/right_zoom.png', clip: box });
  await browser.close();
})().catch(e => console.error('E:', e.message));
