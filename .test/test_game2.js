const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  // Give the AI time to build + spawn units
  console.log('Waiting 15s for AI to build...');
  await page.waitForTimeout(15000);
  
  // Take screenshot
  await page.screenshot({ path: '/workspace/.test/game_full.png' });
  
  // Check state
  const state = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return {
      units: s.unitSprites.length,
      buildings: s.buildingSprites.length,
      bases: s.baseSprites.length,
      unitScales: s.unitSprites.slice(0, 3).map(u => ({type: u.unit.type, scale: u.sprite.scale, x: u.unit.x, y: u.unit.y})),
    };
  });
  console.log('State:', JSON.stringify(state, null, 2));
  
  await browser.close();
})().catch(e => console.error(e));
