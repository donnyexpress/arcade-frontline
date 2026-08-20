const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  // Add a red unit and a blue barracks
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.blue.credits = 9999;
    placeBuildingOnMap('red', 'barracks');
    placeBuildingOnMap('blue', 'barracks');
    // Spawn a red rifleman heading towards blue base
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
  
  // Wait and check
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(3000);
    const result = await page.evaluate(() => {
      const red = state.units.find(u => u.id === 'test_r1');
      return {
        rifleman: red ? {x: Math.round(red.x), y: Math.round(red.y), hp: red.hp, 
                           target: red.target?.type || null, 
                           baseTarget: red.baseTarget ? red.baseTarget.kind : null} : 'gone',
        buildings: state.sides.blue.buildings.map(b => ({type: b.type, hp: b.hp, x: Math.round(b.x)})),
        base: {hp: state.sides.blue.base.hp}
      };
    });
    console.log(`T=${(i+1)*3}s:`, JSON.stringify(result));
  }
  await page.screenshot({ path: '/workspace/.test/v40_bug_test.png' });
  console.log('Errors:', errors.slice(0, 10));
  await browser.close();
})();
