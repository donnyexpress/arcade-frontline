const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  // Check the units array
  let result = await page.evaluate(() => {
    return {
      unitsCount: state.units.length,
      units: state.units.map(u => ({id: u.id, side: u.side, x: Math.round(u.x), y: Math.round(u.y), hp: u.hp, target: u.target?.id})),
      gameTime: state.time || 0,
      updateLoopRunning: typeof state.units !== 'undefined'
    };
  });
  console.log('Before:', JSON.stringify(result, null, 2));
  
  // Force the game to update by waiting
  await page.waitForTimeout(1000);
  
  result = await page.evaluate(() => {
    return {
      unitsCount: state.units.length,
      units: state.units.map(u => ({id: u.id, side: u.side, x: Math.round(u.x), y: Math.round(u.y), hp: u.hp}))
    };
  });
  console.log('After 1s:', JSON.stringify(result, null, 2));
  
  await browser.close();
})();
