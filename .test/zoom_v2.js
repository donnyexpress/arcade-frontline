const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/.test/index_test.html?_t=' + Date.now(), { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  
  // Check what's actually being shown
  const info = await page.evaluate(() => {
    const left = document.getElementById('left-col');
    const right = document.getElementById('right-col');
    return {
      leftBg: getComputedStyle(left).backgroundImage,
      rightBg: getComputedStyle(right).backgroundImage,
    };
  });
  console.log('Left BG:', info.leftBg.substring(0, 100));
  console.log('Right BG:', info.rightBg.substring(0, 100));
  
  // Screenshot just the left column
  await page.screenshot({ 
    path: '/workspace/.test/left_v2.png',
    clip: { x: 0, y: 50, width: 200, height: 700 }
  });
  await page.screenshot({ 
    path: '/workspace/.test/right_v2.png',
    clip: { x: 1080, y: 50, width: 200, height: 700 }
  });
  await browser.close();
})().catch(e => console.error('E:', e.message));
