const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Get the dimensions of each button in both columns
  const result = await page.evaluate(() => {
    const leftBtns = document.querySelectorAll('#left-col .action-btn');
    const rightBtns = document.querySelectorAll('#right-col .action-btn');
    const leftColRect = document.getElementById('left-col').getBoundingClientRect();
    const rightColRect = document.getElementById('right-col').getBoundingClientRect();
    return {
      leftCol: {x: leftColRect.x, y: leftColRect.y, w: leftColRect.width, h: leftColRect.height},
      rightCol: {x: rightColRect.x, y: rightColRect.y, w: rightColRect.width, h: rightColRect.height},
      leftBtns: Array.from(leftBtns).map(b => {
        const r = b.getBoundingClientRect();
        return {id: b.id, x: r.x, y: r.y, w: r.width, h: r.height};
      }),
      rightBtns: Array.from(rightBtns).map(b => {
        const r = b.getBoundingClientRect();
        return {id: b.id, x: r.x, y: r.y, w: r.width, h: r.height};
      })
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await page.screenshot({ path: '/workspace/.test/v44_align_check.png' });
  await browser.close();
})();
