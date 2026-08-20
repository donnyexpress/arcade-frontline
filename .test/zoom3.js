const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PE:', e.message));
  page.on('console', m => { const t = m.text(); if (t.includes('BSPR') || t.includes('Error')) console.log('L:', t.slice(0, 200)); });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  
  // Add logging
  await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    const old = s.addBuildingSprite.bind(s);
    s.addBuildingSprite = function(side, bld) {
      const tex = bld.type + '-' + side;
      console.log('[BSPR] addBuildingSprite ' + bld.type + ' side=' + side + ', tex=' + tex + ', exists=' + s.textures.exists(tex));
      const result = old(side, bld);
      console.log('[BSPR] result =', result ? 'OK' : 'NULL');
      return result;
    };
    
    state.sides.red.credits = 99999;
    placeBuildingOnMap('red', 'barracks');
    placeBuildingOnMap('red', 'warfactory');
  });
  await page.waitForTimeout(800);
  await browser.close();
})().catch(e => console.error('E:', e.message));
