const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERR:', msg.text()); });
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Manually call createBaseSprites and see what happens
  const result = await page.evaluate(() => {
    try {
      const s = game.scene.getScene('GameScene');
      if (!s) return 'no scene';
      if (!s.createBaseSprites) return 'no method';
      s.createBaseSprites();
      return {
        bases: s.baseSprites.length,
        framesExist: s.textures.get('atlas') ? s.textures.get('atlas').frameNames.length : 0,
        baseRedExists: s.textures.get('atlas') ? s.textures.get('atlas').has('base-red') : false,
      };
    } catch (e) {
      return 'ERR: ' + e.message;
    }
  });
  console.log('After manual call:', JSON.stringify(result, null, 2));
  
  await page.screenshot({ path: '/workspace/.test/game_debug.png' });
  await browser.close();
})().catch(e => console.error(e));
