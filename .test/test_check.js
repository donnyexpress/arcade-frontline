const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 99999;
    for (const type of ['rifleman', 'tank', 'heavy', 'drone']) {
      spawnUnit('red', type);
    }
    state.units.forEach((u, i) => {
      u.x = 300 + i * 180;
      u.y = 350;
    });
    if (state.units[0]) state.units[0].hp = 5;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/workspace/.test/v16_final.png' });
  console.log('Done');
  await browser.close();
})().catch(e => console.error('E:', e.message));
