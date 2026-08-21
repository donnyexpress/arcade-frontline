const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Install frame profiler
  await page.evaluate(() => {
    window._frames = 0;
    window._lastT = performance.now();
    const origRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(cb) {
      return origRAF.call(window, (t) => {
        window._frames++;
        cb(t);
      });
    };
    setInterval(() => {
      const now = performance.now();
      const dt = (now - window._lastT) / 1000;
      const fps = window._frames / dt;
      console.log('RAF in last 5s:', window._frames, 'fps:', fps.toFixed(1), 'gameFps:', Math.round(scene.game.loop.actualFps));
      window._frames = 0;
      window._lastT = now;
    }, 5000);
  });
  
  page.on('console', msg => {
    if (msg.text().includes('RAF')) console.log(msg.text());
  });
  
  await page.waitForTimeout(30000);
  await browser.close();
})();
