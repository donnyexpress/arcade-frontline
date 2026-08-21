const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Set up: red has barracks, spawn some damaged units
  await page.evaluate(() => {
    state.sides.red.credits = 10000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5}
    ];
    // Spawn damaged units at various positions
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'heavy');
    // Damage them
    state.units[0].hp = 5;   // 25% HP
    state.units[1].hp = 30;  // 37% HP
    state.units[2].hp = 60;  // 33% HP
    // Spread them out
    state.units[0].x = 300;
    state.units[0].y = 400;
    state.units[1].x = 500;
    state.units[1].y = 400;
    state.units[2].x = 700;
    state.units[2].y = 400;
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/workspace/.test/v52_healthbar.png' });
  
  // Check health bar visibility in state
  const state = await page.evaluate(() => ({
    units: state.units.map(u => ({type: u.type, hp: u.hp, maxHp: u.maxHp})),
    unitSprites: scene.unitSprites.map(s => ({
      type: s.unit?.type,
      hasHealthBar: !!s.healthBar,
      healthBarVisible: s.healthBar?.visible,
      barY: s.healthBar?.y,
      barFgScale: s.barFg?.scaleX,
      barFgWidth: s.barFg?.width
    }))
  }));
  console.log('State:', JSON.stringify(state, null, 2));
  
  await browser.close();
})();
