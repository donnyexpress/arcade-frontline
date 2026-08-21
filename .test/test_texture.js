const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  const t = await page.evaluate(() => {
    if (!scene) return { error: 'no scene' };
    return {
      has_barracks_red: scene.textures.exists('barracks-red'),
      has_barracks_blue: scene.textures.exists('barracks-blue'),
      has_warfactory_red: scene.textures.exists('warfactory-red'),
      has_buildings_atlas_red: scene.textures.exists('buildings_atlas_red'),
      has_buildings_atlas_blue: scene.textures.exists('buildings_atlas_blue'),
      has_base_red: scene.textures.exists('base-red'),
      buildingSpritesCount: scene.buildingSprites.length,
      textureKeys: scene.textures.getTextureKeys().filter(k => k.includes('barracks') || k.includes('base') || k.includes('building'))
    };
  });
  console.log(JSON.stringify(t, null, 2));
  
  // Place barracks
  await page.evaluate(() => {
    state.sides.red.credits = 9999;
    placeBuilding('red', 'barracks');
  });
  await page.waitForTimeout(8000);
  
  const t2 = await page.evaluate(() => ({
    buildings: state.sides.red.buildings.map(b => ({type: b.type, x: Math.floor(b.x), y: Math.floor(b.y), hp: b.hp})),
    buildingSprites: scene.buildingSprites.map(s => ({bldType: s.bld.type, x: Math.floor(s.sprite.x), y: Math.floor(s.sprite.y), visible: s.sprite.visible}))
  }));
  console.log('After build:', JSON.stringify(t2, null, 2));
  
  console.log('Errors:', errors.slice(0, 5));
  await browser.close();
})();
