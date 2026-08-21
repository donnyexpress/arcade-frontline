const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => ({
      time: state.time,
      redCredits: state.sides.red.credits,
      matchOver: state.matchOver,
      units: state.units.length
    }));
    console.log(`T=${(i+1)}s:`, JSON.stringify(r));
  }
  
  // Test placing barracks
  console.log('\n--- Placing barracks ---');
  const r1 = await page.evaluate(() => {
    const before = {credits: state.sides.red.credits, buildings: state.sides.red.buildings.length};
    const result = placeBuilding('red', 'barracks');
    const after = {credits: state.sides.red.credits, buildings: state.sides.red.buildings.length};
    return {before, after, result};
  });
  console.log('Place barracks:', JSON.stringify(r1));
  
  // Test queueing a unit
  console.log('\n--- Queueing rifleman ---');
  const r2 = await page.evaluate(() => {
    const before = {credits: state.sides.red.credits, queue: state.sides.red.queue.length};
    const result = queueUnit('red', 'rifleman');
    const after = {credits: state.sides.red.credits, queue: state.sides.red.queue};
    return {before, after, result};
  });
  console.log('Queue rifleman:', JSON.stringify(r2));
  
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
