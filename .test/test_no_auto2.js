const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Test 1: Without DEBUG, player should NOT auto-build war factory
  // Put barracks in a protected state (high HP, no AI nearby)
  const r1 = await page.evaluate(() => {
    // Set up: red has barracks, blue has nothing
    state.sides.red.credits = 5000;
    state.sides.blue.credits = 0;
    state.units = [];
    state.sides.red.buildings = [{type: 'barracks', hp: 1000, maxHp: 1000, x: 140, y: 210, constructing: false}];
    state.sides.red.buildingQueue = [];
    state.sides.blue.buildings = [];
    state.sides.blue.buildingQueue = [];
    state.sides.blue.units = [];
    // Suppress AI by giving blue no credits
    state.sides.blue.credits = 0;
    // Force 30s with no AI interference
    for (let j = 0; j < 300; j++) {
      const dt = 0.1;
      state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
      autoAIBuild('red');
      autoAIBuild('blue');
      updateBuildings('red', dt);
      updateBuildings('blue', dt);
      state.time += dt;
    }
    return {
      redBuildings: state.sides.red.buildings.map(b => b.type),
      redBuildQueue: state.sides.red.buildingQueue.map(q => q.type),
      time: state.time
    };
  });
  console.log('Test 1 (no DEBUG):', JSON.stringify(r1));
  
  if (r1.redBuildings.length === 1 && r1.redBuildQueue.length === 0) {
    console.log('✅ PASS: Player did NOT auto-build (no war factory)');
  } else {
    console.log('❌ FAIL: Player auto-built:', r1.redBuildings, r1.redBuildQueue);
  }
  
  // Test 2: With DEBUG=true, player should auto-build war factory
  const r2 = await page.evaluate(() => {
    window.DEBUG_AI_HINTS = true;
    state.sides.red.credits = 5000;
    state.sides.red.buildings = [{type: 'barracks', hp: 1000, maxHp: 1000, x: 140, y: 210, constructing: false}];
    state.sides.red.buildingQueue = [];
    state.sides.blue.credits = 0;
    state.sides.blue.buildings = [];
    state.sides.blue.buildingQueue = [];
    // Force 30s
    for (let j = 0; j < 300; j++) {
      const dt = 0.1;
      state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
      autoAIBuild('red');
      autoAIBuild('blue');
      updateBuildings('red', dt);
      updateBuildings('blue', dt);
      state.time += dt;
    }
    return {
      redBuildings: state.sides.red.buildings.map(b => b.type),
      redBuildQueue: state.sides.red.buildingQueue.map(q => q.type),
      time: state.time
    };
  });
  console.log('Test 2 (DEBUG=true):', JSON.stringify(r2));
  
  if (r2.redBuildings.length > 1 || r2.redBuildQueue.includes('warfactory')) {
    console.log('✅ PASS: Player DID auto-build with DEBUG');
  } else {
    console.log('❌ FAIL: Player did not auto-build with DEBUG');
  }
  
  await browser.close();
})();
