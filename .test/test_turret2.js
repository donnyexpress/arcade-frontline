const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);  // Wait long for textures
  
  // Place turrets
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.turrets = [];
    state.sides.red.turretQueue = [];
    state.sides.red.buildings = [{type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 100, y: 100}];
    placeTurret('red', 'pillbox');
    placeTurret('red', 'pillbox');
  });
  
  // Wait for the textures to load and retry
  await page.waitForTimeout(2000);
  
  // Check textures and sprites
  const t = await page.evaluate(() => ({
    pillbox_red: scene.textures.exists('pillbox-red'),
    turretSprites: scene.turretSprites.length,
    turretSpriteDetails: scene.turretSprites.map(s => ({x: s.sprite.x, y: s.sprite.y, texture: s.sprite.texture?.key, scale: s.sprite.scaleX})),
    stateTurrets: state.sides.red.turrets.length
  }));
  console.log(JSON.stringify(t, null, 2));
  
  await browser.close();
})();
