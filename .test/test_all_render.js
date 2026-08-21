const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  const unitTypes = ['rifleman', 'rocket', 'sniper', 'flame', 'drone', 'fsv', 'tank', 'heavy'];
  
  for (const side of ['red', 'blue']) {
    await page.evaluate((args) => {
      const side = args.side;
      const types = args.types;
      state.units = [];
      types.forEach((u, i) => {
        spawnUnit(side, u);
        const idx = state.units.length - 1;
        state.units[idx].x = 300 + (i % 4) * 150;
        state.units[idx].y = 250 + Math.floor(i / 4) * 100;
      });
    }, {side, types: unitTypes});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `/workspace/.test/v71_${side}_units.png`, clip: { x: 100, y: 200, width: 700, height: 350 } });
  }
  
  console.log('Errors:', pageErrors);
  await browser.close();
})();
