const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(2000);
  
  // Spawn enemy units heading for red base
  await page.evaluate(() => {
    // Spawn enemy rifleman heading for red base (left side)
    state.units.push({
      id: 'enemy1', type: 'rifleman', side: 'blue',
      x: 1700, y: 350, hp: 100, maxHp: 100, dmg: 50, range: 80, speed: 250,
      attackCooldown: 0, spawnFlash: 0, baseTarget: null, target: null
    });
    state.units.push({
      id: 'enemy2', type: 'tank', side: 'blue',
      x: 1700, y: 400, hp: 100, maxHp: 100, dmg: 30, range: 80, speed: 200,
      attackCooldown: 0, spawnFlash: 0, baseTarget: null, target: null
    });
  });
  
  // Watch the game
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      return {
        matchOver: state.matchOver,
        winner: state.winner,
        endScreenVisible: document.getElementById('end-screen')?.classList?.contains('show'),
        redBase: state.sides.red.base.hp,
        blueBase: state.sides.blue.base.hp,
        units: state.units.length,
        buildings: state.sides.red.buildings.length + state.sides.blue.buildings.length
      };
    });
    console.log(`T=${(i+1)*0.5}s:`, JSON.stringify(result));
    if (result.matchOver) {
      console.log('MATCH OVER at T=' + ((i+1)*0.5));
      break;
    }
  }
  await page.screenshot({ path: '/workspace/.test/v42_hang.png' });
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
