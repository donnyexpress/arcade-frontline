const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  for (let i = 0; i < 5; i++) {
    const t = await page.evaluate(() => {
      return {
        fps: Math.round(scene.game.loop.actualFps),
        textureCount: scene.textures.getTextureKeys().length,
        buildingSprites: scene.buildingSprites.length,
        unitSprites: scene.unitSprites.length,
        projectileSprites: scene.projectileSprites.length,
        turretSprites: scene.turretSprites.length,
        baseSprites: scene.baseSprites ? scene.baseSprites.length : 'n/a',
        // Memory: count of canvas elements in DOM
        canvasCount: document.querySelectorAll('canvas').length,
        // List unique texture keys
        textureSample: scene.textures.getTextureKeys().slice(0, 10)
      };
    });
    console.log(`T+${(i+1)*5}s:`, JSON.stringify(t));
    await page.waitForTimeout(5000);
  }
  
  await browser.close();
})();
