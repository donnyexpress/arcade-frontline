const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Set credits, place barracks
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    placeBuilding('red', 'barracks');
  });
  
  // Wait for the game to advance enough for the building to complete
  // Use page.waitForFunction to wait until the building appears
  await page.waitForFunction(() => state.sides.red.buildings.length > 0, { timeout: 60000 });
  
  const t = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    buildings: state.sides.red.buildings.map(b => ({type: b.type, x: Math.floor(b.x), y: Math.floor(b.y), hp: b.hp, maxHp: b.maxHp, constructing: b.constructing})),
    buildingSprites: scene.buildingSprites.map(s => ({bldType: s.bld.type, x: Math.floor(s.sprite.x), y: Math.floor(s.sprite.y), visible: s.sprite.visible, alpha: s.sprite.alpha, scale: s.sprite.scaleX})),
    baseRed: {x: state.sides.red.base.x, y: state.sides.red.base.y}
  }));
  console.log('Building info:', JSON.stringify(t, null, 2));
  
  await page.screenshot({ path: '/workspace/.test/v49_built.png' });
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
