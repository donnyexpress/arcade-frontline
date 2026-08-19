const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Give credits and build
  await page.evaluate(() => { state.sides.red.credits = 500; });
  await page.click('#btn-barracks');
  await page.waitForTimeout(5500);
  for (let i = 0; i < 5; i++) {
    await page.click('#unit-rifleman');
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(8000);
  
  await page.screenshot({ path: '/workspace/.test/game_units_walking.png' });
  const state = await page.evaluate(() => ({units: game.scene.getScene('GameScene').unitSprites.length}));
  console.log('State:', state);
  await browser.close();
})().catch(e => console.error(e));
