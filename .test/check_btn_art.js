const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  // Check what the unit button data URL is
  const info = await page.evaluate(() => {
    return {
      unitsUrlStart: UNITS_DATA_URL_RED.substring(0, 50),
      unitsUrlLength: UNITS_DATA_URL_RED.length,
      hasUnitAtlasRedImage: typeof unitAtlasRedImage !== 'undefined' && unitAtlasRedImage !== null,
      unitAtlasRedImageSize: (typeof unitAtlasRedImage !== 'undefined' && unitAtlasRedImage) ? 
        `${unitAtlasRedImage.naturalWidth}x${unitAtlasRedImage.naturalHeight}` : 'none',
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e => console.error('E:', e.message));
