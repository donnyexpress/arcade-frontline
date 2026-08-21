const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  let consoleErrors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message + '\n' + e.stack));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push('CONS: ' + msg.text().substring(0, 300)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Use page.evaluate to FORCE the game to advance
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    placeBuilding('red', 'barracks');
  });
  
  // Force advance by calling updateBuildings directly
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => {
      updateBuildings('red', 1);  // Force 1 second of progress
    });
    await page.waitForTimeout(50);
    const t = await page.evaluate(() => ({
      time: state.time.toFixed(2),
      buildings: state.sides.red.buildings.map(b => ({type: b.type, x: Math.floor(b.x), y: Math.floor(b.y), hp: b.hp, maxHp: b.maxHp})),
      queue: state.sides.red.buildingQueue.length
    }));
    if (t.buildings.length > 0 || t.queue === 0) {
      console.log(`After ${i+1} forced updates:`, JSON.stringify(t));
      if (t.buildings.length > 0) break;
    }
  }
  
  await page.screenshot({ path: '/workspace/.test/v50_forced.png' });
  console.log('JS errors:', errors.slice(0, 5));
  console.log('Console errors:', consoleErrors.slice(0, 5));
  await browser.close();
})();
