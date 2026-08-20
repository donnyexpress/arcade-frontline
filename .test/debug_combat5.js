const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.blue.credits = 9999;
    // Place blue barracks in the middle
    state.sides.blue.buildings = [];
    state.sides.blue.buildings.push({
      type: 'barracks',
      side: 'blue',
      x: 1000, y: 300,
      hp: 80, maxHp: 80,
      dmg: 0, range: 0,
      constructing: false
    });
    // Spawn a red rifleman
    state.units.push({
      id: 'test_r1',
      type: 'rifleman',
      side: 'red',
      x: 100, y: 300,
      hp: 20, maxHp: 20,
      dmg: 4, range: 60, speed: 90,
      attackCooldown: 0,
      spawnFlash: 0,
      baseTarget: null,
      target: null
    });
  });
  
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => {
      const red = state.units.find(u => u.id === 'test_r1');
      return {
        rifleman: red ? {x: Math.round(red.x), y: Math.round(red.y), hp: red.hp} : 'gone',
        barracks: state.sides.blue.buildings.map(b => ({hp: b.hp, x: Math.round(b.x)}))
      };
    });
    console.log(`T=${i+1}s:`, JSON.stringify(result));
  }
  await page.screenshot({ path: '/workspace/.test/v41_bug_test.png' });
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
