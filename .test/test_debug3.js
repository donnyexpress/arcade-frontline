const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Manually call createBaseSprites and see if it works
  const result = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    const before = s.baseSprites.length;
    s.createBaseSprites();
    const after = s.baseSprites.length;
    return { before, after };
  });
  console.log('Manual createBaseSprites:', JSON.stringify(result));
  
  await page.waitForTimeout(500);
  const result2 = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return { bases: s.baseSprites.length };
  });
  console.log('After wait:', JSON.stringify(result2));
  await browser.close();
})().catch(e => console.error(e));
