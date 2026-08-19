const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  let errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Build everything and spawn everything
  const result = await page.evaluate(() => {
    state.sides.red.credits = 99999;
    // Place buildings
    placeBuildingOnMap('red', 'barracks', 100, 350, 100, 100);
    placeBuildingOnMap('red', 'warfactory', 100, 450, 100, 100);
    placeBuildingOnMap('red', 'techcenter', 100, 250, 100, 100);
    placeBuildingOnMap('blue', 'barracks', 1700, 350, 100, 100);
    placeBuildingOnMap('blue', 'warfactory', 1700, 450, 100, 100);
    placeBuildingOnMap('blue', 'techcenter', 1700, 250, 100, 100);
    // Spawn units
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'rocket');
    spawnUnit('red', 'flame');
    spawnUnit('red', 'sniper');
    spawnUnit('red', 'lighttank');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'heavy');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rocket');
    spawnUnit('blue', 'flame');
    spawnUnit('blue', 'sniper');
    spawnUnit('blue', 'lighttank');
    spawnUnit('blue', 'tank');
    spawnUnit('blue', 'heavy');
    return {
      redBuildings: state.sides.red.buildings.length,
      blueBuildings: state.sides.blue.buildings.length,
      unitCount: state.units.length,
    };
  });
  console.log('Setup:', JSON.stringify(result));
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: '/workspace/.test/full_game.png' });
  console.log('Screenshot saved');
  
  if (errors.length) console.log('Errors:', errors);
  await browser.close();
})().catch(e => console.error('E:', e.message));
