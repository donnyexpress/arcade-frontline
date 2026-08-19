const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const info = await page.evaluate(() => {
    const canvas = document.querySelector('#phaser-game canvas');
    if (!canvas) return 'no canvas';
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return {
      alpha: gl ? gl.getContextAttributes().alpha : 'no gl',
      premultiplied: gl ? gl.getContextAttributes().premultipliedAlpha : 'no gl',
    };
  });
  console.log('WebGL attrs:', JSON.stringify(info));
  
  // Wait a few seconds for units to spawn
  await page.waitForTimeout(8000);
  await page.screenshot({ path: '/workspace/.test/alpha_test.png' });
  console.log('Screenshot saved');
  await browser.close();
})().catch(e => console.error(e));
