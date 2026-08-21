const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Set up
  const r1 = await page.evaluate(() => {
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
    return {
      units: state.units.map(u => ({side: u.side, type: u.type, hp: u.hp, x: u.x, y: u.y}))
    };
  });
  console.log('After spawn:', JSON.stringify(r1, null, 2));
  
  // Force 3 seconds
  await page.evaluate(() => {
    for (let j = 0; j < 30; j++) {
      const dt = 0.1;
      state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
      state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
      autoAIBuild('red');
      autoAIBuild('blue');
      updateBuildings('red', dt);
      updateBuildings('blue', dt);
      updateTurrets('red', dt);
      updateTurrets('blue', dt);
      updateQueue('red', dt);
      updateQueue('blue', dt);
      updateAI(dt);
      for (const u of state.units) updateUnit(u, dt);
      state.units = state.units.filter(u => u.hp > 0);
      state.time += dt;
    }
  });
  
  const r2 = await page.evaluate(() => ({
    units: state.units.map(u => ({side: u.side, type: u.type, hp: u.hp, x: u.x, y: u.y}))
  }));
  console.log('After 3s:', JSON.stringify(r2, null, 2));
  
  await browser.close();
})();
