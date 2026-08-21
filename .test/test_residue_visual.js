const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Set up: many units and buildings to see the chroma key effect
  await page.evaluate(() => {
    state.sides.red.credits = 10000;
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5}
    ];
    state.sides.red.turrets = [
      {type: 'pillbox', side: 'red', x: 350, y: 120, hp: 120, maxHp: 120, dmg: 10, range: 150, cooldown: 0, constructing: false, buildProgress: 4, buildTime: 4},
      {type: 'turret', side: 'red', x: 380, y: 246, hp: 200, maxHp: 200, dmg: 25, range: 200, cooldown: 0, constructing: false, buildProgress: 4, buildTime: 4}
    ];
    state.sides.red.turretQueue = [];
    state.units = [];
    spawnUnit('red', 'rifleman');
    spawnUnit('red', 'tank');
    spawnUnit('red', 'drone');
    spawnUnit('red', 'heavy');
    state.units.forEach((u, i) => {
      u.x = 200 + i * 80;
      u.y = 450;
    });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/workspace/.test/v63_clean.png' });
  await browser.close();
})();
