const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  // Wait for credits to accumulate
  console.log('Waiting 15s for credits...');
  await page.waitForTimeout(15000);
  
  // Build barracks (cost 100)
  console.log('Building barracks...');
  await page.evaluate(() => {
    const s = state.sides.red;
    s.credits = 200; // give enough credits
  });
  await page.click('#btn-barracks');
  await page.waitForTimeout(6000); // wait for 5s build
  
  // Now queue riflemen
  console.log('Queuing riflemen...');
  for (let i = 0; i < 5; i++) {
    await page.click('#unit-rifleman');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(3000);
  
  // Take screenshot with units on the field
  await page.screenshot({ path: '/workspace/.test/game_with_units.png' });
  console.log('Screenshot with units saved');
  
  // Check state
  const state = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return {
      units: s.unitSprites.length,
      buildings: s.buildingSprites.length,
      unitInfo: s.unitSprites.slice(0, 3).map(u => ({type: u.unit.type, x: u.unit.x, y: u.unit.y, scale: u.sprite.scale})),
    };
  });
  console.log('State:', JSON.stringify(state, null, 2));
  
  await browser.close();
})().catch(e => console.error(e));
