const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  const state = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return {
      units: s.unitSprites.length,
      bases: s.baseSprites.length,
      baseInfo: s.baseSprites.map(b => ({
        side: b.side,
        x: b.sprite.x,
        y: b.sprite.y,
        scale: b.sprite.scale,
        texture: b.sprite.texture ? b.sprite.texture.key : 'none',
        frame: b.sprite.frame ? b.sprite.frame.name : 'none',
        visible: b.sprite.visible,
        width: b.sprite.displayWidth,
        height: b.sprite.displayHeight,
      })),
    };
  });
  console.log(JSON.stringify(state, null, 2));
  await page.screenshot({ path: '/workspace/.test/game_base.png' });
  await browser.close();
})().catch(e => console.error(e));
