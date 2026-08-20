const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  // Spawn a SINGLE unit and watch what happens to it
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.blue.credits = 9999;
    // Add buildings immediately
    placeBuildingOnMap('red', 'barracks');
    placeBuildingOnMap('red', 'warfactory');
    placeBuildingOnMap('blue', 'barracks');
    placeBuildingOnMap('blue', 'warfactory');
    // Spawn a red rifleman in middle
    state.units.push({
      id: 'test_rifleman_1',
      type: 'rifleman',
      side: 'red',
      x: 960, y: 300,
      hp: 20, maxHp: 20,
      dmg: 4, range: 60, speed: 90,
      attackCooldown: 0,
      spawnFlash: 0,
      baseTarget: null,
      target: null
    });
  });
  
  // Take screenshots over time
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/workspace/.test/v40_combat_${i}.png` });
    const result = await page.evaluate(() => {
      const redUnits = state.units.filter(u => u.side === 'red');
      const blueUnits = state.units.filter(u => u.side === 'blue');
      const redBuildings = state.sides.red.buildings;
      const blueBuildings = state.sides.blue.buildings;
      return {
        redUnits: redUnits.map(u => ({type: u.type, x: Math.round(u.x), y: Math.round(u.y), hp: u.hp, target: u.target?.type, baseTarget: u.baseTarget?.kind})),
        blueUnits: blueUnits.map(u => ({type: u.type, x: Math.round(u.x), y: Math.round(u.y), hp: u.hp, target: u.target?.type})),
        redBldgs: redBuildings.map(b => ({type: b.type, x: Math.round(b.x), hp: b.hp})),
        blueBldgs: blueBuildings.map(b => ({type: b.type, x: Math.round(b.x), hp: b.hp}))
      };
    });
    console.log(`T=${(i+1)*2}s:`, JSON.stringify(result));
  }
  
  console.log('Errors:', errors.slice(0, 10));
  await browser.close();
})();
