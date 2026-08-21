const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Force game time to advance and watch AI
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => {
      // Advance time by 5 game seconds
      for (let j = 0; j < 50; j++) {
        updateBuildings('red', 0.1);
        updateBuildings('blue', 0.1);
        updateTurrets('red', 0.1);
        updateTurrets('blue', 0.1);
        updateAI(0.1);
        for (const u of state.units) updateUnit(u, 0.1);
        state.time += 0.1;
      }
    });
    const t = await page.evaluate(() => ({
      time: state.time.toFixed(2),
      blueBuildings: state.sides.blue.buildings.map(b => b.type),
      blueQueue: state.sides.blue.queue.length,
      blueUnits: state.units.filter(u => u.side === 'blue').length,
      redBuildings: state.sides.red.buildings.length,
      redQueue: state.sides.red.queue.length,
      redUnits: state.units.filter(u => u.side === 'red').length
    }));
    if (i % 5 === 0) console.log(`T+${(i+1)*5}s:`, JSON.stringify(t));
  }
  
  console.log('Errors:', errors.slice(0, 3));
  await browser.close();
})();
