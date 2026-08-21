const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message + (e.stack ? '\n' + e.stack : '')));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);  // Wait for AI icons to load
  
  // Pre-place barracks, queue war factory ready to finish
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [{
      type: 'barracks', side: 'red', x: 200, y: 300,
      hp: 80, maxHp: 80, constructing: false, buildProgress: 5, buildTime: 5
    }];
    state.sides.red.buildingQueue = [{
      type: 'warfactory', buildProgress: 4.9, buildTime: 5
    }];
  });
  
  // Watch for errors during building completion
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      // Get building sprites count
      const gameScene = window.__gameScene;
      return {
        buildings: state.sides.red.buildings.length,
        queueLen: state.sides.red.buildingQueue.length,
        buildingSprites: gameScene?.buildingSprites?.length || 'no scene',
        time: state.time
      };
    });
    console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(r));
  }
  
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
