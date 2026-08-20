const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message + (e.stack ? '\n' + e.stack : '')));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.blue.credits = 9999;
    // Place a single blue barracks
    state.sides.blue.buildings = [];
    state.sides.blue.buildings.push({
      type: 'barracks', side: 'blue', x: 600, y: 300,
      hp: 80, maxHp: 80, dmg: 0, range: 0, constructing: false
    });
    // Spawn a fast red rifleman
    state.units.push({
      id: 'test_r1', type: 'rifleman', side: 'red',
      x: 100, y: 300, hp: 100, maxHp: 100, dmg: 20, range: 80, speed: 250,
      attackCooldown: 0, spawnFlash: 0, baseTarget: null, target: null
    });
  });
  
  let barracksDestroyed = false;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const red = state.units.find(u => u.id === 'test_r1');
      return {
        rifleman: red ? {x: Math.round(red.x), hp: red.hp} : 'gone',
        barracks: state.sides.blue.buildings.map(b => ({hp: b.hp})),
        base: state.sides.blue.base.hp
      };
    });
    if (result.barracks.length === 0 && !barracksDestroyed) {
      barracksDestroyed = true;
      console.log(`T=${(i+1)*0.5}s: BARRACKS DESTROYED!`);
    }
    if (i % 4 === 0) {
      console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(result));
    }
    if (result.base < 500) {
      console.log(`T=${(i+1)*0.5}s: BASE HIT! HP=${result.base}`);
    }
  }
  await page.screenshot({ path: '/workspace/.test/v41_combat_full.png' });
  console.log('Errors:', errors.slice(0, 3));
  await browser.close();
})();
