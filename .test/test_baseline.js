const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(`
    <html><body>
    <canvas id="c" width="800" height="500"></canvas>
    <script>
      let frames = 0;
      let start = performance.now();
      const ctx = document.getElementById('c').getContext('2d');
      function tick() {
        frames++;
        ctx.fillStyle = '#4a8030';
        ctx.fillRect(0, 0, 800, 500);
        ctx.fillStyle = '#fff';
        ctx.font = '20px sans';
        ctx.fillText('Frame: ' + frames, 50, 50);
        if (frames < 100) {
          requestAnimationFrame(tick);
        } else {
          const elapsed = performance.now() - start;
          document.title = 'FPS: ' + (frames / (elapsed/1000)).toFixed(1);
        }
      }
      requestAnimationFrame(tick);
    </script>
    </body></html>
  `);
  await page.waitForTimeout(5000);
  const title = await page.title();
  console.log('Baseline test:', title);
  await browser.close();
})();
