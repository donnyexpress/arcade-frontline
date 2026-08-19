const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  // Wait for barracks to be built (after ~5s) + riflemen to spawn (1.5s each)
  await page.waitForTimeout(15000);
  await page.screenshot({ path: '/workspace/.test/game_final.png' });
  const state = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return { units: s.unitSprites.length, buildings: s.buildingSprites.length, bases: s.baseSprites.length };
  });
  console.log('Final state:', state);
  await browser.close();
})().catch(e => console.error(e));
