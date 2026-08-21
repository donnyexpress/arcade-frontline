const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  const result = await page.evaluate(() => {
    function info(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {y: Math.round(r.y), h: Math.round(r.height), display: cs.display};
    }
    return {
      leftCol: info(document.getElementById('left-col')),
      leftTabBar: info(document.querySelector('#left-col .tab-bar')),
      leftTabContent: info(document.querySelector('#left-col .tab-content:not(.hidden)')),
      leftFirstBtn: info(document.getElementById('btn-barracks')),
      rightCol: info(document.getElementById('right-col')),
      rightTabBar: info(document.querySelector('#right-col .tab-bar')),
      rightTabContent: info(document.querySelector('#right-col .tab-content:not(.hidden)')),
      rightFirstBtn: info(document.getElementById('unit-rifleman')),
      leftHint: info(document.querySelector('#left-col .col-hint')),
      rightHint: info(document.querySelector('#right-col .col-hint'))
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
