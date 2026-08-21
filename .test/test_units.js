const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Set up: barracks, war factory, tech center
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5},
      {type: 'techcenter', hp: 100, maxHp: 100, constructing: false, x: 140, y: 430, buildProgress: 5, buildTime: 5}
    ];
  });
  
  // Test fsv (warfactory unit)
  const fsvResult = await page.evaluate(() => {
    if (!isUnitUnlocked('red', 'fsv')) return {error: 'fsv not unlocked'};
    if (state.sides.red.queue.length >= CFG.MAX_QUEUE) return {error: 'queue full'};
    if (state.sides.red.credits < CFG.UNITS.fsv.cost) return {error: 'no credits'};
    queueUnit('red', 'fsv');
    return {ok: true, queue: state.sides.red.queue};
  });
  console.log('fsv queue:', JSON.stringify(fsvResult));
  
  // Test drone (techcenter unit)
  const droneResult = await page.evaluate(() => {
    if (!isUnitUnlocked('red', 'drone')) return {error: 'drone not unlocked'};
    if (state.sides.red.queue.length >= CFG.MAX_QUEUE) return {error: 'queue full'};
    if (state.sides.red.credits < CFG.UNITS.drone.cost) return {error: 'no credits'};
    queueUnit('red', 'drone');
    return {ok: true, queue: state.sides.red.queue};
  });
  console.log('drone queue:', JSON.stringify(droneResult));
  
  // Force time
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => {
      for (let j = 0; j < 10; j++) {
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
  }
  
  const final = await page.evaluate(() => ({
    redUnits: state.units.filter(u => u.side === 'red').map(u => ({type: u.type, x: Math.floor(u.x), hp: u.hp})),
    queue: state.sides.red.queue,
    time: state.time
  }));
  console.log('Final state:', JSON.stringify(final, null, 2));
  
  await browser.close();
})();
