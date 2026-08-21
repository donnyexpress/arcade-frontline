const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Place a barracks first
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [];
    placeBuilding('red', 'barracks');
  });
  
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      return {
        buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, constructing: b.constructing, buildProgress: b.buildProgress?.toFixed(2), buildTime: b.buildTime})),
        queue: state.sides.red.buildingQueue.map(q => ({type: q.type, progress: q.buildProgress?.toFixed(2), time: q.buildTime})),
        credits: state.sides.red.credits,
        time: state.time
      };
    });
    console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(result));
  }
  
  // Now place war factory
  console.log('\n--- Placing war factory ---');
  await page.evaluate(() => {
    placeBuilding('red', 'warfactory');
  });
  
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      return {
        buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, constructing: b.constructing, buildProgress: b.buildProgress?.toFixed(2), buildTime: b.buildTime})),
        queue: state.sides.red.buildingQueue.map(q => ({type: q.type, progress: q.buildProgress?.toFixed(2), time: q.buildTime})),
        credits: state.sides.red.credits,
        time: state.time
      };
    });
    console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(result));
  }
  
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
