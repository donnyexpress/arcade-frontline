const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Pre-place barracks, queue war factory with buildProgress close to 5
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    state.sides.red.buildings = [{
      type: 'barracks', side: 'red', x: 200, y: 300,
      hp: 80, maxHp: 80, constructing: false, buildProgress: 5, buildTime: 5
    }];
    state.sides.red.buildingQueue = [{
      type: 'warfactory', buildProgress: 4.8, buildTime: 5
    }];
  });
  
  // Watch it finish
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: b.hp, x: Math.round(b.x), y: Math.round(b.y), prog: b.buildProgress?.toFixed(2)})),
      queue: state.sides.red.buildingQueue.map(q => ({type: q.type, prog: q.buildProgress?.toFixed(2)}))
    }));
    console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(r));
    if (r.queue.length === 0 && r.buildings.length === 2) {
      console.log('WAR FACTORY PLACED!');
      break;
    }
  }
  
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
