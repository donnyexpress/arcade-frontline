const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('ERR:', e.message));
  page.on('console', msg => console.log('LOG:', msg.text()));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  
  const result = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return {
      bases: s.baseSprites.length,
      stateSides: state ? Object.keys(state.sides) : 'no state',
      sceneExists: !!s,
      createBaseSpritesExists: typeof s.createBaseSprites === 'function',
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch(e => console.error(e));
