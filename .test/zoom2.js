const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 99999;
    state.sides.blue.credits = 99999;
    for (const type of ['barracks', 'warfactory', 'techcenter']) {
      placeBuildingOnMap('red', type);
    }
  });
  await page.waitForTimeout(800);
  
  // Get building positions
  const info = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return {
      bldgSprites: s.buildingSprites.map(b => ({
        type: b.bld.type,
        x: b.sprite ? b.sprite.x : 'none',
        y: b.sprite ? b.sprite.y : 'none',
        scale: b.sprite ? b.sprite.scaleX : 0,
        textureKey: b.sprite ? b.sprite.texture.key : 'none',
        visible: b.sprite ? b.sprite.visible : false,
      })),
      baseSprites: s.baseSprites ? s.baseSprites.map(b => ({
        side: b.side,
        x: b.sprite.x,
        y: b.sprite.y,
        scale: b.sprite.scaleX,
        textureKey: b.sprite.texture.key,
      })) : [],
    };
  });
  console.log('Info:', JSON.stringify(info, null, 2));
  await page.screenshot({ path: '/workspace/.test/v20_bldgs.png' });
  await browser.close();
})().catch(e => console.error('E:', e.message));
