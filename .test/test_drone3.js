const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Setup AND measure in ONE call
  const r = await page.evaluate(() => {
    state.units = [];
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5},
      {type: 'techcenter', hp: 100, maxHp: 100, constructing: false, x: 140, y: 430, buildProgress: 5, buildTime: 5}
    ];
    spawnUnit('red', 'drone');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rifleman');
    state.units[0].x = 800; state.units[0].y = 300;
    state.units[1].x = 820; state.units[1].y = 300;
    state.units[2].x = 780; state.units[2].y = 320;
    state.units[3].x = 810; state.units[3].y = 280;
    
    const before = {
      droneHP: state.units.find(u => u.side === 'red' && u.type === 'drone')?.hp,
      blueTotalHP: state.units.filter(u => u.side === 'blue').reduce((s, u) => s + u.hp, 0)
    };
    
    // Run updateUnit in isolation (no AI, no spawn)
    for (let j = 0; j < 30; j++) {
      const dt = 0.1;
      for (const u of state.units) updateUnit(u, dt);
      state.units = state.units.filter(u => u.hp > 0);
    }
    
    const after = {
      droneHP: state.units.find(u => u.side === 'red' && u.type === 'drone')?.hp,
      blueTotalHP: state.units.filter(u => u.side === 'blue').reduce((s, u) => s + u.hp, 0)
    };
    
    return { before, after, unitCount: state.units.length };
  });
  console.log('Result:', JSON.stringify(r, null, 2));
  
  await browser.close();
})();
