const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Get initial state with prereq labels
  await page.screenshot({ path: '/workspace/.test/v51_initial.png' });
  
  // After 6 seconds (barracks built)
  for (let i = 0; i < 6; i++) {
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
        updateAI(dt);
        for (const u of state.units) updateUnit(u, dt);
        state.time += dt;
      }
    });
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: '/workspace/.test/v51_barracks_built.png' });
  
  await browser.close();
})();
