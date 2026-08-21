const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Use the same forceTime as the comprehensive test
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
  
  await forceTime(60);
  
  const s = await page.evaluate(() => ({
    time: state.time,
    blueBuildings: state.sides.blue.buildings.length,
    blueBuildingTypes: state.sides.blue.buildings.map(b => b.type),
    blueQueue: state.sides.blue.queue.length,
    blueCredits: Math.floor(state.sides.blue.credits)
  }));
  console.log('After 60s:', JSON.stringify(s, null, 2));
  
  await browser.close();
})();
