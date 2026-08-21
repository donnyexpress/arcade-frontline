const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Place barracks and wait for it to finish
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    // Place barracks with buildProgress = buildTime (instant completion)
    const b = {
      type: 'barracks', side: 'red', x: 200, y: 300,
      hp: 80, maxHp: 80, constructing: false,
      buildProgress: 5, buildTime: 5
    };
    state.sides.red.buildings.push(b);
  });
  
  // Now place war factory
  console.log('Placing war factory...');
  const result = await page.evaluate(() => {
    const result = placeBuilding('red', 'warfactory');
    return {
      placed: result,
      buildings: state.sides.red.buildings.length,
      buildings2: state.sides.red.buildings.map(b => b.type),
      queue: state.sides.red.buildingQueue.length
    };
  });
  console.log('Result:', JSON.stringify(result));
  
  // Watch the war factory build
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, prog: b.buildProgress?.toFixed(2)})),
      queue: state.sides.red.buildingQueue.map(q => ({type: q.type, prog: q.buildProgress?.toFixed(2)}))
    }));
    console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(r));
  }
  
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
