const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  const result = await page.evaluate(() => {
    return {
      keys: Object.keys(AI_ICON_IMAGES || {}),
      b64Defined: typeof B64_UNIT_RIFLEMAN !== 'undefined',
      b64Len: B64_UNIT_RIFLEMAN ? B64_UNIT_RIFLEMAN.length : 0
    };
  });
  console.log('Result:', result);
  await browser.close();
})();
