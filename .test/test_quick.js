const { chromium } = require('playwright');
(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  console.log('Browser launched');
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('ERR:', e.message));
  page.on('crash', () => console.log('CRASH!'));
  console.log('Navigating...');
  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('Loaded');
  await page.waitForTimeout(3000);
  console.log('Waited 3s');
  
  await page.evaluate(() => { state.sides.red.credits = 500; });
  console.log('Set credits');
  await page.click('#btn-barracks');
  console.log('Clicked barracks');
  await page.waitForTimeout(6000);
  console.log('Waited 6s');
  await page.click('#unit-rifleman');
  console.log('Clicked rifleman');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/workspace/.test/game_with_units.png' });
  console.log('Screenshot saved');
  
  await browser.close();
  console.log('Done');
})().catch(e => console.error('FAIL:', e.message));
