const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(6000);
  const result = await page.evaluate(() => {
    return {
      hasAI: typeof AI_ICON_IMAGES !== 'undefined',
      keys: Object.keys(AI_ICON_IMAGES || {}),
      riflemanLoaded: AI_ICON_IMAGES?.rifleman ? 'yes' : 'no',
      riflemanDims: AI_ICON_IMAGES?.rifleman ? `${AI_ICON_IMAGES.rifleman.width}x${AI_ICON_IMAGES.rifleman.height}` : 'no'
    };
  });
  console.log('Result:', JSON.stringify(result));
  await browser.close();
})();
