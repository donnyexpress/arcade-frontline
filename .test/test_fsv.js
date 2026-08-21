const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Spawn FSV
  await page.evaluate(() => {
    state.units = [];
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5}
    ];
    spawnUnit('red', 'fsv');
    state.units[0].x = 500;
    state.units[0].y = 350;
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/workspace/.test/v67_fsv.png' });
  console.log('FSV spawned, errors:', pageErrors);
  await browser.close();
})();
