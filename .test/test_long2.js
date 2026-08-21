const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    placeBuilding('red', 'barracks');
  });
  
  // Check every second
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const t = await page.evaluate(() => ({
      time: state.time.toFixed(2),
      buildings: state.sides.red.buildings.length,
      queue: state.sides.red.buildingQueue.length,
      queueProg: state.sides.red.buildingQueue.map(q => q.buildProgress.toFixed(2))
    }));
    console.log(`T+${i+1}s real:`, JSON.stringify(t));
    if (t.buildings > 0) {
      console.log('BUILDING APPEARED!');
      break;
    }
  }
  
  await page.screenshot({ path: '/workspace/.test/v49_built.png' });
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
