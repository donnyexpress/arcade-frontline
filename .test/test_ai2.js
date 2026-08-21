const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  for (let i = 0; i < 60; i++) {
    const t = await page.evaluate(() => {
      // Advance time by 2 game seconds
      for (let j = 0; j < 20; j++) {
        updateBuildings('red', 0.1);
        updateBuildings('blue', 0.1);
        updateTurrets('red', 0.1);
        updateTurrets('blue', 0.1);
        updateAI(0.1);
        for (const u of state.units) updateUnit(u, 0.1);
        state.time += 0.1;
      }
      return {
        time: state.time.toFixed(2),
        blueBuildings: state.sides.blue.buildings.map(b => ({type: b.type, hp: b.hp, constructing: b.constructing})),
        blueQueue: state.sides.blue.queue.length,
        blueUnits: state.units.filter(u => u.side === 'blue').length,
        blueCredits: Math.floor(state.sides.blue.credits),
        blueAiState: state.sides.blue.aiState
      };
    });
    if (i % 3 === 0) console.log(`T+${(i+1)*2}s:`, JSON.stringify(t));
  }
  
  await browser.close();
})();
