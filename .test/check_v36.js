const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  let logs = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => logs.push(msg.type() + ': ' + msg.text()));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(8000);
  // Check if AI_ICON_IMAGES is loaded
  const result = await page.evaluate(() => {
    return {
      hasAI: typeof AI_ICON_IMAGES !== 'undefined',
      keys: Object.keys(AI_ICON_IMAGES || {}),
      riflemanLoaded: AI_ICON_IMAGES?.rifleman ? 'yes' : 'no'
    };
  });
  console.log('AI_ICON_IMAGES state:', result);
  await page.screenshot({ path: '/workspace/.test/v36_80s_v2.png' });
  await browser.close();
})();
