const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('PAGE_ERROR:', e.message));
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text().substring(0, 200)));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  // Patch the loop to log
  await page.evaluate(() => {
    // Add debug logging
    const origUpdateUnit = updateUnit;
    window.updateUnit = function(u, dt) {
      console.log(`[UPDATE] unit ${u.id} x=${u.x.toFixed(0)} y=${u.y.toFixed(0)} hp=${u.hp}`);
      return origUpdateUnit(u, dt);
    };
  });
  
  // Spawn a blue rifleman
  await page.evaluate(() => {
    state.units.push({
      id: 'enemy1', type: 'rifleman', side: 'blue',
      x: 1700, y: 350, hp: 100, maxHp: 100, dmg: 50, range: 80, speed: 250,
      attackCooldown: 0, spawnFlash: 0, baseTarget: null, target: null
    });
    console.log('UNIT ADDED');
  });
  
  await page.waitForTimeout(3000);
  
  const final = await page.evaluate(() => {
    return state.units.map(u => ({id: u.id, x: Math.round(u.x), y: Math.round(u.y)}));
  });
  console.log('FINAL:', JSON.stringify(final));
  
  await browser.close();
})();
