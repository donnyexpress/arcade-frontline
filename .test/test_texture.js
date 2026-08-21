const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  const t = await page.evaluate(() => {
    return {
      has_pillbox_red: scene.textures.exists('pillbox-red'),
      has_turret_red: scene.textures.exists('turret-red'),
      has_pillbox_blue: scene.textures.exists('pillbox-blue'),
      has_turret_blue: scene.textures.exists('turret-blue'),
      has_barracks_red: scene.textures.exists('barracks-red'),
      has_barracks_blue: scene.textures.exists('barracks-blue'),
      allKeys: scene.textures.getTextureKeys().filter(k => k.includes('red') || k.includes('blue'))
    };
  });
  console.log(JSON.stringify(t, null, 2));
  
  await browser.close();
})();
