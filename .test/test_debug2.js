const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Try queueUnit directly
  const result = await page.evaluate(() => {
    return {
      buildings: state.sides.red.buildings.length,
      hasTurrets: 'turrets' in state.sides.red,
      turrets: state.sides.red.turrets,
      queueUnitTest: queueUnit('red', 'rifleman'),
      isUnitUnlocked: isUnitUnlocked('red', 'rifleman'),
      UNITS: typeof CFG !== 'undefined' ? Object.keys(CFG.UNITS) : 'NO CFG'
    };
  });
  console.log('Test result:', JSON.stringify(result, null, 2));
  console.log('Page errors:', pageErrors);
  await browser.close();
})();
