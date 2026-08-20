const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  let logs = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text());
    if (msg.type() === 'log') logs.push('LOG: ' + msg.text());
  });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Spawn lots of units to test combat
  await page.evaluate(() => {
    // Force AI to build lots of units
    for (let i = 0; i < 5; i++) {
      state.sides.red.credits = 9999;
      const types = ['rifleman', 'rocket', 'flame', 'tank', 'heavy'];
      placeBuilding('red', types[i % types.length]);
    }
    for (let i = 0; i < 5; i++) {
      state.sides.blue.credits = 9999;
      const types = ['rifleman', 'rocket', 'flame', 'tank', 'heavy'];
      placeBuilding('blue', types[i % types.length]);
    }
  });
  
  // Wait for combat
  await page.waitForTimeout(20000);
  
  // Get state
  const result = await page.evaluate(() => {
    return {
      redUnits: state.units.filter(u => u.side === 'red').length,
      blueUnits: state.units.filter(u => u.side === 'blue').length,
      redBase: state.sides.red.base.hp,
      blueBase: state.sides.blue.base.hp,
      redBuildings: state.sides.red.buildings.length,
      blueBuildings: state.sides.blue.buildings.length,
      matchOver: state.matchOver
    };
  });
  console.log('After 20s combat:', JSON.stringify(result));
  console.log('Errors:', errors.slice(0, 5));
  
  await page.screenshot({ path: '/workspace/.test/v40_combat.png' });
  await browser.close();
})();
