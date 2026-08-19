const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  let errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Spawn a red rifleman
  const result = await page.evaluate(() => {
    const s = game.scene.getScene('GameScene');
    // Need a barracks for rifleman
    state.sides.red.credits = 99999;
    // Build a barracks first
    placeBuildingOnMap('red', 'barracks', 100, 300, 100, 100);
    return {
      ok: true,
      buildings: state.sides.red.buildings.length,
    };
  });
  console.log('Build barracks:', JSON.stringify(result));
  await page.waitForTimeout(500);
  
  // Now spawn
  const result2 = await page.evaluate(() => {
    const u = spawnUnit('red', 'rifleman');
    return {
      spawned: !!u,
      unitCount: state.units.length,
      unit: state.units[0] ? { type: state.units[0].type, side: state.units[0].side, x: state.units[0].x, y: state.units[0].y } : null,
    };
  });
  console.log('Spawn:', JSON.stringify(result2));
  
  await page.waitForTimeout(500);
  
  // Check sprite
  const result3 = await page.evaluate(() => {
    const u = state.units[0];
    if (!u) return { error: 'no unit' };
    // Find the sprite
    const s = game.scene.getScene('GameScene');
    const found = s.unitSprites.find(us => us.unit === u);
    if (!found) return { error: 'no sprite found in unitSprites' };
    return {
      visible: found.sprite.visible,
      alpha: found.sprite.alpha,
      scaleX: found.sprite.scaleX,
      scaleY: found.sprite.scaleY,
      x: found.sprite.x,
      y: found.sprite.y,
      textureKey: found.sprite.texture ? found.sprite.texture.key : null,
      width: found.sprite.width,
      height: found.sprite.height,
      hasTexture: !!found.sprite.texture,
    };
  });
  console.log('Sprite:', JSON.stringify(result3, null, 2));
  
  await page.screenshot({ path: '/workspace/.test/unit_render.png' });
  console.log('Screenshot saved to /workspace/.test/unit_render.png');
  
  if (errors.length) console.log('Errors:', errors);
  await browser.close();
})().catch(e => console.error('E:', e.message));
