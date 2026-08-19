const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  // Inspect the canvas pixel data to see what's being rendered
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('#phaser-game canvas');
    if (!canvas) return 'no canvas';
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return {
      context: gl ? gl.constructor.name : 'none',
      width: canvas.width,
      height: canvas.height,
      styleAlpha: gl ? gl.getContextAttributes().alpha : null,
      premultipliedAlpha: gl ? gl.getContextAttributes().premultipliedAlpha : null,
    };
  });
  console.log('Canvas:', JSON.stringify(canvasInfo, null, 2));
  
  // Wait a few seconds for game to progress
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/workspace/.test/inspect.png' });
  console.log('Screenshot saved');
  await browser.close();
})().catch(e => console.error(e));
