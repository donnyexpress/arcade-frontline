const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message + '\n' + e.stack));
  page.on('console', msg => { 
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text().substring(0, 300));
  });
  
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  console.log('=== STEP 1: Initial state ===');
  let s = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    redCredits: Math.floor(state.sides.red.credits),
    blueCredits: Math.floor(state.sides.blue.credits),
    redBuildings: state.sides.red.buildings.length,
    blueBuildings: state.sides.blue.buildings.length,
    redQueue: state.sides.red.queue.length,
    units: state.units.length
  }));
  console.log(JSON.stringify(s));
  
  console.log('\n=== STEP 2: Place barracks, war factory, tech center ===');
  s = await page.evaluate(() => {
    state.sides.red.credits = 1000;
    const r1 = placeBuilding('red', 'barracks');
    const r2 = placeBuilding('red', 'warfactory');
    const r3 = placeBuilding('red', 'techcenter');
    return {r1, r2, r3, queue: state.sides.red.buildingQueue.map(b => b.type)};
  });
  console.log(JSON.stringify(s));
  
  await page.waitForTimeout(2000);
  
  console.log('\n=== STEP 3: After 2s - should be building ===');
  s = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    buildings: state.sides.red.buildings.length,
    queue: state.sides.red.buildingQueue.map(b => ({type: b.type, progress: b.buildProgress.toFixed(2)})),
    credits: Math.floor(state.sides.red.credits)
  }));
  console.log(JSON.stringify(s));
  
  await page.waitForTimeout(8000);
  
  console.log('\n=== STEP 4: After 10s - buildings should be complete ===');
  s = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    buildings: state.sides.red.buildings.map(b => ({type: b.type, hp: Math.floor(b.hp)})),
    queue: state.sides.red.buildingQueue.length,
    credits: Math.floor(state.sides.red.credits)
  }));
  console.log(JSON.stringify(s));
  
  console.log('\n=== STEP 5: Queue all unit types ===');
  s = await page.evaluate(() => {
    const units = ['rifleman', 'rocket', 'sniper', 'flame', 'drone', 'fsv', 'tank', 'heavy'];
    const results = {};
    for (const u of units) {
      results[u] = queueUnit('red', u);
    }
    return {results, queue: state.sides.red.queue.map(q => q.unit)};
  });
  console.log(JSON.stringify(s));
  
  await page.waitForTimeout(8000);
  
  console.log('\n=== STEP 6: After 8s - units should be produced ===');
  s = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    units: state.units.length,
    redUnits: state.units.filter(u => u.side === 'red').length,
    blueUnits: state.units.filter(u => u.side === 'blue').length,
    redQueue: state.sides.red.queue.length,
    redBuildings: state.sides.red.buildings.length,
    blueBuildings: state.sides.blue.buildings.length,
    unitTypes: state.units.map(u => `${u.side}:${u.type}:${Math.floor(u.hp)}`).slice(0, 20)
  }));
  console.log(JSON.stringify(s));
  
  await page.screenshot({ path: '/workspace/.test/v48_step6.png' });
  
  console.log('\n=== STEP 7: Wait for combat ===');
  await page.waitForTimeout(15000);
  
  s = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    units: state.units.length,
    redUnits: state.units.filter(u => u.side === 'red').length,
    blueUnits: state.units.filter(u => u.side === 'blue').length,
    redBaseHP: Math.floor(state.sides.red.base.hp),
    blueBaseHP: Math.floor(state.sides.blue.base.hp),
    redCredits: Math.floor(state.sides.red.credits),
    blueCredits: Math.floor(state.sides.blue.credits)
  }));
  console.log(JSON.stringify(s));
  
  await page.screenshot({ path: '/workspace/.test/v48_combat.png' });
  
  console.log('\n=== ERRORS ===');
  console.log(errors.slice(0, 10).join('\n---\n'));
  
  await browser.close();
})();
