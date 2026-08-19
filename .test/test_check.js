const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  
  // Check textures
  const tex = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    return {
      rifleman: s.textures.exists('rifleman-red') && s.textures.exists('rifleman-blue'),
      drone: s.textures.exists('drone-red') && s.textures.exists('drone-blue'),
      fsv: s.textures.exists('fsv-red') && s.textures.exists('fsv-blue'),
      heavy: s.textures.exists('heavy-red') && s.textures.exists('heavy-blue'),
    };
  });
  console.log('Textures:', JSON.stringify(tex));
  
  // Place buildings & spawn all
  await page.evaluate(() => {
    state.sides.red.credits = 99999;
    state.sides.blue.credits = 99999;
    placeBuildingOnMap('red', 'barracks', 100, 350, 100, 100);
    placeBuildingOnMap('red', 'warfactory', 100, 450, 100, 100);
    placeBuildingOnMap('red', 'techcenter', 100, 250, 100, 100);
    placeBuildingOnMap('blue', 'barracks', 1700, 350, 100, 100);
    placeBuildingOnMap('blue', 'warfactory', 1700, 450, 100, 100);
    placeBuildingOnMap('blue', 'techcenter', 1700, 250, 100, 100);
    for (const side of ['red', 'blue']) {
      for (const t of ['rifleman', 'rocket', 'flame', 'sniper', 'fsv', 'tank', 'drone', 'heavy']) {
        spawnUnit(side, t);
      }
    }
  });
  await page.waitForTimeout(800);
  
  await page.screenshot({ path: '/workspace/.test/v3_full.png' });
  console.log('Screenshot saved');
  console.log('Units:', await page.evaluate(() => state.units.length));
  
  if (errors.length) console.log('Errors:', errors);
  await browser.close();
})().catch(e => console.error('E:', e.message));
