const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', m => { const t = m.text(); if (t.includes('[MB]')) console.log('L:', t.slice(0,200)); });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  await page.evaluate(() => {
    state.sides.red.credits = 99999;
    placeBuildingOnMap('red', 'barracks');
  });
  await page.waitForTimeout(800);
  
  // Check
  const r = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return s.buildingSprites.length;
  });
  console.log('Building sprites count:', r);
  await browser.close();
})().catch(e => console.error('E:', e.message));
