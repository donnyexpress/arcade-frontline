const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  let consoleErrors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message + '\n' + e.stack));
  page.on('console', msg => { 
    if (msg.type() === 'error') consoleErrors.push('ERR: ' + msg.text().substring(0, 300));
    if (msg.type() === 'warning' && msg.text().includes('Phaser')) consoleErrors.push('WARN: ' + msg.text().substring(0, 200));
  });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Force a complete scenario
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    placeBuilding('red', 'barracks');
    placeBuilding('red', 'warfactory');
    placeBuilding('red', 'techcenter');
  });
  
  // Force advance game time
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      updateBuildings('red', 1);
      updateBuildings('blue', 1);
      updateTurrets('red', 1);
      updateTurrets('blue', 1);
      updateQueue('red', 1);
      updateQueue('blue', 1);
      updateAI(1);
      for (const u of state.units) updateUnit(u, 1);
    });
    await page.waitForTimeout(100);
    const t = await page.evaluate(() => ({
      time: state.time.toFixed(2),
      redBuildings: state.sides.red.buildings.length,
      blueBuildings: state.sides.blue.buildings.length,
      redQueue: state.sides.red.queue.length,
      blueQueue: state.sides.blue.queue.length,
      units: state.units.length,
      credits: Math.floor(state.sides.red.credits)
    }));
    if (i % 3 === 0) console.log(`Step ${i+1}:`, JSON.stringify(t));
  }
  
  // Now queue units and force them to complete
  await page.evaluate(() => {
    queueUnit('red', 'rifleman');
    queueUnit('red', 'rifleman');
    queueUnit('red', 'rifleman');
    queueUnit('red', 'rocket');
    queueUnit('red', 'flame');
  });
  
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      updateQueue('red', 1);
      updateQueue('blue', 1);
      for (const u of state.units) updateUnit(u, 1);
      updateAI(1);
    });
    await page.waitForTimeout(100);
  }
  
  // Check final state
  const final = await page.evaluate(() => ({
    time: state.time.toFixed(2),
    redBuildings: state.sides.red.buildings.map(b => b.type),
    blueBuildings: state.sides.blue.buildings.map(b => b.type),
    redQueue: state.sides.red.queue.map(q => q.unit),
    units: state.units.length,
    unitDetails: state.units.map(u => `${u.side}:${u.type}@${Math.floor(u.x)}`).slice(0, 15)
  }));
  console.log('Final:', JSON.stringify(final, null, 2));
  
  console.log('\n=== ERRORS ===');
  console.log('PageErrors:', errors.length);
  errors.slice(0, 5).forEach(e => console.log(e));
  console.log('ConsoleErrors:', consoleErrors.length);
  consoleErrors.slice(0, 5).forEach(e => console.log(e));
  
  await browser.close();
})();
