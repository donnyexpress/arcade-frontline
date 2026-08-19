const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, bypassCSP: true });
  const page = await context.newPage();
  // Disable cache
  await page.route('**/*', (route) => route.continue());
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  await page.evaluate(() => {
    state.sides.red.credits = 99999;
    state.sides.blue.credits = 99999;
    for (const type of ['barracks', 'warfactory', 'techcenter']) {
      placeBuildingOnMap('red', type);
    }
    const types = ['rifleman', 'rocket', 'flame', 'sniper', 'fsv', 'tank', 'drone', 'heavy'];
    for (const t of types) spawnUnit('red', t);
    state.units.forEach((u, i) => {
      u.x = 250 + (i % 4) * 250;
      u.y = 280 + Math.floor(i / 4) * 100;
    });
    if (state.units[0]) state.units[0].hp = 3;
    if (state.units[2]) state.units[2].hp = 10;
  });
  await page.waitForTimeout(800);
  
  await page.screenshot({ path: '/workspace/.test/FINAL2.png' });
  console.log('Screenshot saved');
  await browser.close();
})().catch(e => console.error('E:', e.message));
