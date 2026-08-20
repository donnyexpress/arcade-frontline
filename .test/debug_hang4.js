const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  // Suppress warnings
  page.on('pageerror', e => console.log('PAGE_ERROR:', e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE_ERROR:', msg.text().substring(0, 200));
    if (msg.type() === 'log' && msg.text().includes('UPDATE')) console.log(msg.text());
  });
  
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);  // Wait for game to be ready
  
  // Just check state after some time
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(2000);
    const result = await page.evaluate(() => {
      return {
        time: state.time,
        units: state.units.length,
        redBase: state.sides.red.base.hp,
        blueBase: state.sides.blue.base.hp,
        matchOver: state.matchOver
      };
    });
    console.log(`T=${(i+1)*2}s:`, JSON.stringify(result));
  }
  await browser.close();
})();
