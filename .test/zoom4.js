const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  
  const info = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    // Call makeBuildingSprite directly
    const testBld = { type: 'barracks', side: 'red', x: 500, y: 500, hp: 80, maxHp: 80, constructing: false, buildProgress: 5, buildTime: 5 };
    const result = s.makeBuildingSprite(testBld);
    return {
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : null,
      spriteVisible: result && result.sprite ? result.sprite.visible : null,
      spriteAlpha: result && result.sprite ? result.sprite.alpha : null,
      textureKey: result && result.sprite ? result.sprite.texture.key : null,
      spriteWidth: result && result.sprite ? result.sprite.width : null,
      spriteHeight: result && result.sprite ? result.sprite.height : null,
    };
  });
  console.log('Direct test:', JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e => console.error('E:', e.message));
