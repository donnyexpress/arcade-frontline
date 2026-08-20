const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  // Take screenshot of both side columns
  await page.screenshot({ 
    path: '/workspace/.test/both_cols.png',
    clip: { x: 0, y: 0, width: 200, height: 600 }
  });
  await page.screenshot({ 
    path: '/workspace/.test/right_col.png',
    clip: { x: 1080, y: 0, width: 200, height: 600 }
  });
  await browser.close();
})().catch(e => console.error('E:', e.message));
