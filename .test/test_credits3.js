const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  const initial = await page.evaluate(() => ({
    credits: state.sides.red.credits,
    passive: CFG.PASSIVE_INCOME,
    softCap: CFG.SOFT_CAP,
    starting: CFG.STARTING_CREDITS,
    unitsLocked: Object.keys(CFG.UNITS).filter(k => {
      const btn = document.getElementById('unit-' + k);
      return btn && btn.classList.contains('locked');
    })
  }));
  console.log('Initial state:', JSON.stringify(initial));
  
  // Screenshot the initial state
  await page.screenshot({ path: '/workspace/.test/v46_start.png' });
  
  // Try to build barracks immediately
  const b = await page.evaluate(() => {
    const before = state.sides.red.buildings.length;
    const ok = placeBuilding('red', 'barracks');
    return { ok, before, after: state.sides.red.buildings.length, queue: state.sides.red.buildingQueue.length };
  });
  console.log('Place barracks:', JSON.stringify(b));
  
  // Try to queue a rifleman
  const q = await page.evaluate(() => {
    const ok = queueUnit('red', 'rifleman');
    return { ok, queue: state.sides.red.queue.length };
  });
  console.log('Queue rifleman:', JSON.stringify(q));
  
  // Wait and screenshot
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/workspace/.test/v46_playing.png' });
  
  console.log('Errors:', errors);
  await browser.close();
})();
