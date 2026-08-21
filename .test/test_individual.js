const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  const unitTypes = ['rifleman', 'rocket', 'sniper', 'flame', 'drone', 'fsv', 'tank', 'heavy'];
  
  for (let i = 0; i < unitTypes.length; i++) {
    const u = unitTypes[i];
    await page.evaluate((args) => {
      const unitType = args.unit;
      state.units = [];
      state.sides.red.credits = 1000;
      state.sides.red.buildings = [
        {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
        {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5},
        {type: 'techcenter', hp: 100, maxHp: 100, constructing: false, x: 140, y: 430, buildProgress: 5, buildTime: 5}
      ];
      spawnUnit('red', unitType);
      const idx = state.units.length - 1;
      state.units[idx].x = 500;
      state.units[idx].y = 350;
    }, {unit: u});
    await page.waitForTimeout(800);
    await page.screenshot({ path: `/workspace/.test/v72_${u}.png`, clip: { x: 350, y: 270, width: 300, height: 200 } });
  }
  
  console.log('Errors:', pageErrors);
  await browser.close();
})();
