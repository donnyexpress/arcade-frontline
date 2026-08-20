const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  // Get all the unit button canvases and their content
  const info = await page.evaluate(() => {
    const cnvs = document.querySelectorAll('#right-col .btn-mini-canvas');
    return Array.from(cnvs).map(c => {
      const key = c.parentElement?.dataset?.unitKey;
      const ctx = c.getContext('2d');
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      // Sample a few pixels
      const samples = [];
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * c.width);
        const y = Math.floor(Math.random() * c.height);
        const idx = (y * c.width + x) * 4;
        samples.push([data[idx], data[idx+1], data[idx+2], data[idx+3]]);
      }
      return { key, width: c.width, height: c.height, samples };
    });
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch(e => console.error('E:', e.message));
