const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Check the unit-rifleman button styles
  const styles = await page.evaluate(() => {
    const btn = document.getElementById('unit-rifleman');
    const cs = getComputedStyle(btn, '::after');
    return {
      classes: btn.className,
      hasLocked: btn.classList.contains('locked'),
      afterContent: cs.content,
      afterPosition: cs.position,
      afterTop: cs.top,
      afterLeft: cs.left,
      afterZIndex: cs.zIndex,
      afterFontSize: cs.fontSize
    };
  });
  console.log('Rifleman button styles:', JSON.stringify(styles, null, 2));
  
  // Zoom in on right column
  await page.screenshot({ path: '/workspace/.test/v47_locked.png', clip: { x: 1140, y: 0, width: 140, height: 720 } });
  await browser.close();
})();
