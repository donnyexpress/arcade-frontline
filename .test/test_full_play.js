const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message + '\n' + e.stack));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Simulate player playing normally
  // t=0: tap barracks
  await page.evaluate(() => placeBuilding('red', 'barracks'));
  console.log('Player placed barracks');
  
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    // Check state and act
    const action = await page.evaluate(() => {
      // Force game time advancement
      for (let j = 0; j < 5; j++) {
        const dt = 0.1;
        state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
        state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
        autoAIBuild('red');
        autoAIBuild('blue');
        updateBuildings('red', dt);
        updateBuildings('blue', dt);
        updateTurrets('red', dt);
        updateTurrets('blue', dt);
        updateAI(dt);
        for (const u of state.units) updateUnit(u, dt);
        state.time += dt;
      }
      return {
        time: state.time.toFixed(2),
        redBuildings: state.sides.red.buildings.length,
        redQueue: state.sides.red.queue.length,
        redUnits: state.units.filter(u => u.side === 'red').length,
        blueBuildings: state.sides.blue.buildings.length,
        blueQueue: state.sides.blue.queue.length,
        blueUnits: state.units.filter(u => u.side === 'blue').length
      };
    });
    // Auto-build war factory and tech center when possible
    await page.evaluate(() => {
      const red = state.sides.red;
      const hasBarracks = red.buildings.some(b => !b.constructing && b.hp > 0 && b.type === 'barracks');
      const hasWarfactory = red.buildings.some(b => !b.constructing && b.hp > 0 && b.type === 'warfactory');
      if (hasBarracks && !hasWarfactory && red.credits >= CFG.WARFACTORY_COST && red.buildingQueue.length === 0) {
        placeBuilding('red', 'warfactory');
      }
      // Queue units aggressively
      if (red.credits >= 20) {
        const queueType = hasWarfactory ? 'tank' : 'rifleman';
        const cost = CFG.UNITS[queueType].cost;
        if (red.credits >= cost + 10) {
          red.credits -= cost;
          queueUnit('red', queueType);
        }
      }
    });
    if (i % 3 === 0) console.log(`T+${(i+1)}s:`, JSON.stringify(action));
  }
  
  console.log('Errors:', errors.slice(0, 3));
  await browser.close();
})();
