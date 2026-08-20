const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/workspace/.test/v33_full.png', fullPage: false });
  // Take screenshots of specific elements
  const sb_left = await page.locator('#sidebar-left').screenshot();
  const sb_right = await page.locator('#sidebar-right').screenshot();
  require('fs').writeFileSync('/workspace/.test/v33_sb_left.png', sb_left);
  require('fs').writeFileSync('/workspace/.test/v33_sb_right.png', sb_right);
  await browser.close();
})();
