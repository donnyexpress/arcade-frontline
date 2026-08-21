const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  const state = await page.evaluate(() => {
    const tex = scene.textures.get('fsv-red');
    if (!tex) return { error: 'no fsv-red texture' };
    const src = tex.getSourceImage();
    return {
      key: tex.key,
      hasData: !!src,
      width: src?.width,
      height: src?.height,
      // Sample some pixels
      pixelSamples: {
        '0,0': src ? Array.from(src.getContext('2d').getImageData(0, 0, 1, 1).data) : null,
        '100,100': src ? Array.from(src.getContext('2d').getImageData(100, 100, 1, 1).data) : null,
        '150,150': src ? Array.from(src.getContext('2d').getImageData(150, 150, 1, 1).data) : null
      }
    };
  });
  console.log('Texture state:', JSON.stringify(state, null, 2));
  await browser.close();
})();
