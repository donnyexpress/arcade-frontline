const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  const result = await page.evaluate(() => {
    // Setup: 3 blue units, 1 is far and 2 are close to a red unit
    state.units = [];
    spawnUnit('red', 'rifleman');
    state.units[0].x = 1000; state.units[0].y = 300;
    state.units[0].hp = 20;
    
    // 3 blue units at different distances
    spawnUnit('blue', 'rifleman');
    state.units[1].x = 1020; state.units[1].y = 300;  // close, 20px
    spawnUnit('blue', 'rifleman');
    state.units[2].x = 1050; state.units[2].y = 300;  // closer, 50px
    spawnUnit('blue', 'rifleman');
    state.units[3].x = 1500; state.units[3].y = 300;  // far, 500px
    
    // The CLOSE blue unit is currently attacking the red unit
    state.units[1].target = state.units[0];
    
    // Find nearest enemy for red unit
    const target = findNearestEnemy(state.units[0]);
    
    return {
      target: target ? {type: target.type, x: target.x, y: target.y} : null,
      distances: state.units.slice(1).map(u => ({
        distance: Math.hypot(u.x - 1000, u.y - 300),
        isAttackingMe: u.target === state.units[0]
      }))
    };
  });
  console.log('Targeting test:', JSON.stringify(result, null, 2));
  
  await browser.close();
})();
