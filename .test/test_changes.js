const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Test 1: Background replaced - check if scene.textures has new background
  const bg = await page.evaluate(() => ({
    hasBg: scene.textures.exists('background'),
    width: scene.textures.get('background')?.getSourceImage()?.width
  }));
  console.log('Background:', JSON.stringify(bg));
  
  // Test 2: Unit spawn position - spawn a unit and check position
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [{type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5}];
    spawnUnit('red', 'rifleman');
  });
  const spawn = await page.evaluate(() => {
    const u = state.units[state.units.length - 1];
    return {x: u.x, y: u.y, type: u.type};
  });
  console.log('Spawned unit:', JSON.stringify(spawn));
  // Barracks is at x=140, with displaySize=70, so it extends to x=175
  // New spawn should be at x=140+65=205 (outside building)
  if (spawn.x >= 200) {
    console.log('✅ Unit spawned OUTSIDE building (x=' + spawn.x + ', building extends to 175)');
  } else {
    console.log('❌ Unit spawned too close to building (x=' + spawn.x + ')');
  }
  
  // Test 3: Production building destroyed → queue cleared
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    state.sides.red.buildings = [{type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5}];
    state.sides.red.queue = [
      {unit: 'rifleman', progress: 0, totalTime: 1.5},
      {unit: 'rifleman', progress: 0, totalTime: 1.5},
      {unit: 'rifleman', progress: 0, totalTime: 1.5}
    ];
  });
  // Destroy the barracks (simulate by setting hp=0)
  await page.evaluate(() => {
    state.sides.red.buildings[0].hp = 0;
    // Run one update to trigger the cleanup
    updateBuildings('red', 0.1);
  });
  const after = await page.evaluate(() => ({
    queueLength: state.sides.red.queue.length,
    credits: Math.floor(state.sides.red.credits)
  }));
  console.log('After destroy:', JSON.stringify(after));
  if (after.queueLength === 0) {
    console.log('✅ Queue cleared when barracks destroyed');
  } else {
    console.log('❌ Queue NOT cleared (length=' + after.queueLength + ')');
  }
  
  console.log('Page errors:', pageErrors.slice(0, 3));
  
  // Take a final screenshot
  await page.screenshot({ path: '/workspace/.test/v65_final.png' });
  await browser.close();
})();
