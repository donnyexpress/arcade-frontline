const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  // Screenshot the unit button area
  const leftCol = await page.locator('#right-col').boundingBox();
  console.log('Right col:', JSON.stringify(leftCol));
  await page.screenshot({ 
    path: '/workspace/.test/unit_btns_zoom2.png',
    clip: { x: leftCol.x, y: leftCol.y, width: leftCol.width, height: leftCol.height }
  });
  
  // Also dump a single button's content as image
  const canvas = await page.evaluate(() => {
    const c = document.querySelector('#right-col .btn-mini-canvas');
    return { width: c.width, height: c.height };
  });
  console.log('Button canvas:', JSON.stringify(canvas));
  
  await browser.close();
})().catch(e => console.error('E:', e.message));
