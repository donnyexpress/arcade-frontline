const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  const result = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    const atlas = s.textures.get('atlas');
    return {
      hasAtlas: !!atlas,
      frameNames: atlas ? Object.keys(atlas.frames) : 'no atlas',
      hasBaseRed: atlas ? atlas.has('base-red') : 'no atlas',
      frameCount: atlas && atlas.frames ? Object.keys(atlas.frames).length : 0,
      // Try a different way to count frames
      customDef: atlas ? !!atlas.customFrames : 'no atlas',
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch(e => console.error(e));
