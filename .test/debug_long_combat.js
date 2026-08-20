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
    state.sides.blue.buildings = [];
    state.sides.blue.buildings.push({
      type: 'barracks', side: 'blue', x: 600, y: 300,
      hp: 80, maxHp: 80, dmg: 0, range: 0, constructing: false
    });
    state.units.push({
      id: 'test_r1', type: 'rifleman', side: 'red',
      x: 100, y: 300, hp: 100, maxHp: 100, dmg: 25, range: 80, speed: 250,
      attackCooldown: 0, spawnFlash: 0, baseTarget: null, target: null
    });
  });
  
  let lastState = '';
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => {
      const red = state.units.find(u => u.id === 'test_r1');
      return {
        rifleman: red ? {x: Math.round(red.x), hp: red.hp} : 'gone',
        barracks: state.sides.blue.buildings.length,
        barracksHp: state.sides.blue.buildings[0]?.hp || 'gone',
        base: state.sides.blue.base.hp,
        matchOver: state.matchOver
      };
    });
    const summary = `T=${i+1}s: r=${result.rifleman?.x} bldg=${result.barracks} bldgHp=${result.barracksHp} base=${result.base}`;
    if (summary !== lastState) {
      console.log(summary);
      lastState = summary;
    }
    if (result.matchOver) {
      console.log('MATCH OVER!');
      break;
    }
  }
  await page.screenshot({ path: '/workspace/.test/v41_final_combat.png' });
  console.log('Errors:', errors.slice(0, 3));
  await browser.close();
})();
