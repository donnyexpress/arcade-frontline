const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text().substring(0, 200)); });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/workspace/.test/v43_tabs_prod.png' });
  
  // Click DEF tab
  await page.click('.tab-btn[data-side="left"][data-tab="def"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/workspace/.test/v43_tabs_def.png' });
  
  // Click VEH tab
  await page.click('.tab-btn[data-side="right"][data-tab="veh"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/workspace/.test/v43_tabs_veh.png' });
  
  console.log('errors:', errors);
  await browser.close();
})();
