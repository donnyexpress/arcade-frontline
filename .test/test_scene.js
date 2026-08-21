const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Install profiler on scene.update
  await page.evaluate(() => {
    let updateCount = 0;
    let updateTime = 0;
    const origUpdate = scene.update.bind(scene);
    scene.update = function(time, delta) {
      const t0 = performance.now();
      origUpdate(time, delta);
      updateTime += performance.now() - t0;
      updateCount++;
    };
    let lastTime = performance.now();
    setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      const updateFps = updateCount / dt;
      console.log('Scene updates in last 5s:', updateCount, 'avg time:', (updateTime/updateCount).toFixed(2), 'ms', 'rate:', updateFps.toFixed(1), '/s');
      updateCount = 0;
      updateTime = 0;
      lastTime = now;
    }, 5000);
  });
  
  page.on('console', msg => {
    if (msg.text().includes('Scene updates')) console.log(msg.text());
  });
  
  await page.waitForTimeout(30000);
  await browser.close();
})();
