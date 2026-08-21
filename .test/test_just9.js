const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Run tests 2-8 to get to test 9
  const CFG = await page.evaluate(() => window.CFG || null);
  const SOFT_CAP = CFG ? CFG.SOFT_CAP : 500;
  
  const forceTime = async (seconds) => {
    const chunks = Math.ceil(seconds / 2);
    for (let i = 0; i < chunks; i++) {
      const chunk = Math.min(2, seconds - i * 2);
      await page.evaluate((args) => {
        const s = args.s;
        for (let i = 0; i < s * 10; i++) {
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
      }, { s: chunk });
    }
  };
  
  // TEST 2: Place barracks
  await page.evaluate(() => placeBuilding('red', 'barracks'));
  await forceTime(6);
  
  // TEST 3: All barracks units
  for (const u of ['rifleman', 'rocket', 'flame']) {
    await page.evaluate((unit) => {
      if (!isUnitUnlocked('red', unit)) return;
      if (state.sides.red.queue.length >= CFG.MAX_QUEUE) return;
      if (state.sides.red.credits < CFG.UNITS[unit].cost) return;
      queueUnit('red', unit);
    }, u);
  }
  await forceTime(25);
  
  // TEST 4: Place war factory
  await page.evaluate(() => { state.sides.red.credits = 500; });
  await page.evaluate(() => placeBuilding('red', 'warfactory'));
  await forceTime(6);
  
  // TEST 5: Vehicle units
  for (const u of ['fsv', 'tank']) {
    await page.evaluate((unit) => {
      if (!isUnitUnlocked('red', unit)) return;
      if (state.sides.red.queue.length >= CFG.MAX_QUEUE) return;
      if (state.sides.red.credits < CFG.UNITS[unit].cost) return;
      queueUnit('red', unit);
    }, u);
  }
  await forceTime(20);
  
  // TEST 6: Tech center
  await page.evaluate(() => { state.sides.red.credits = 500; });
  await page.evaluate(() => placeBuilding('red', 'techcenter'));
  await forceTime(6);
  
  // TEST 7: Advanced units
  for (const u of ['sniper', 'drone', 'heavy']) {
    await page.evaluate((unit) => {
      if (!isUnitUnlocked('red', unit)) return;
      if (state.sides.red.queue.length >= CFG.MAX_QUEUE) return;
      if (state.sides.red.credits < CFG.UNITS[unit].cost) return;
      queueUnit('red', unit);
    }, u);
  }
  await forceTime(30);
  
  // TEST 8: Defensive
  await page.evaluate(() => { state.sides.red.credits = 1000; });
  await page.evaluate(() => placeTurret('red', 'pillbox'));
  await page.evaluate(() => placeTurret('red', 'turret'));
  await forceTime(6);
  
  // Check state before test 9
  const before9 = await page.evaluate(() => ({
    time: state.time,
    blueBuildings: state.sides.blue.buildings.length,
    blueBuildQueue: state.sides.blue.buildingQueue.length
  }));
  console.log('Before test 9:', JSON.stringify(before9));
  
  // TEST 9: AI behavior
  await forceTime(60);
  
  const after9 = await page.evaluate(() => ({
    time: state.time,
    blueBuildings: state.sides.blue.buildings.length,
    blueBuildQueue: state.sides.blue.buildingQueue.length,
    blueQueue: state.sides.blue.queue.length
  }));
  console.log('After test 9:', JSON.stringify(after9));
  
  await browser.close();
})();
