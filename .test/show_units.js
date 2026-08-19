const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Place buildings & spawn units
  const result = await page.evaluate(() => {
    state.sides.red.credits = 99999;
    state.sides.blue.credits = 99999;
    placeBuildingOnMap('red', 'barracks', 100, 350, 100, 100);
    placeBuildingOnMap('red', 'warfactory', 100, 450, 100, 100);
    placeBuildingOnMap('red', 'techcenter', 100, 250, 100, 100);
    placeBuildingOnMap('blue', 'barracks', 1700, 350, 100, 100);
    placeBuildingOnMap('blue', 'warfactory', 1700, 450, 100, 100);
    placeBuildingOnMap('blue', 'techcenter', 1700, 250, 100, 100);
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'rocket');
    spawnUnit('red', 'flame');
    spawnUnit('red', 'sniper');
    spawnUnit('red', 'lighttank');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'heavy');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rocket');
    spawnUnit('blue', 'flame');
    spawnUnit('blue', 'sniper');
    spawnUnit('blue', 'lighttank');
    spawnUnit('blue', 'tank');
    spawnUnit('blue', 'heavy');
    return { units: state.units.length };
  });
  console.log('Setup:', JSON.stringify(result));
  await page.waitForTimeout(800);
  
  // Take the FULL screenshot (full map)
  await page.screenshot({ path: '/workspace/.test/units_overview.png', fullPage: false });
  console.log('Overview saved');
  
  await browser.close();
})().catch(e => console.error('E:', e.message));
