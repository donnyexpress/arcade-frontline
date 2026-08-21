const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  for (let i = 0; i < 30; i++) {
    const t = await page.evaluate(() => {
      // Advance time by 2 game seconds (including credit updates)
      for (let j = 0; j < 20; j++) {
        const dt = 0.1;
        state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
        state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
        autoAIBuild('blue');
        autoAIBuild('red');
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
        blueBuildings: state.sides.blue.buildings.map(b => b.type),
        blueQueue: state.sides.blue.queue.length,
        blueUnits: state.units.filter(u => u.side === 'blue').length,
        blueCredits: Math.floor(state.sides.blue.credits)
      };
    });
    if (i % 2 === 0) console.log(`T+${(i+1)*2}s:`, JSON.stringify(t));
  }
  
  await browser.close();
})();
