const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Set credits to SOFT_CAP - 1 to test if it stops
  await page.evaluate(() => {
    state.sides.red.credits = 299;
  });
  
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => ({
      credits: state.sides.red.credits,
      time: state.time,
      softCap: CFG.SOFT_CAP
    }));
    console.log(`T=${(i+1)}s:`, JSON.stringify(r));
  }
  
  // Now test unit production - try to queue a rifleman
  console.log('\n--- Testing unit queue ---');
  const queueTest = await page.evaluate(() => {
    state.sides.red.credits = 100;
    const result = queueUnit('red', 'rifleman');
    return {result, queue: state.sides.red.queue, credits: state.sides.red.credits};
  });
  console.log('Queue test:', JSON.stringify(queueTest));
  
  // Now try to build a war factory
  console.log('\n--- Testing war factory build ---');
  const wfTest = await page.evaluate(() => {
    state.sides.red.credits = 200;
    state.sides.red.buildings = [];
    state.sides.red.buildingQueue = [];
    // First place barracks
    const bResult = placeBuilding('red', 'barracks');
    // Check if barracks is in queue
    return {bResult, queue: state.sides.red.buildingQueue.map(q => q.type), buildings: state.sides.red.buildings.length};
  });
  console.log('WF test:', JSON.stringify(wfTest));
  
  await browser.close();
})();
