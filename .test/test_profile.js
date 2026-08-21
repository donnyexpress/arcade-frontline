const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Hook into the game loop to profile
  await page.evaluate(() => {
    let frameCount = 0;
    let lastReport = performance.now();
    const origLoop = window.loop;
    window._profileData = {
      frameTime: 0,
      getImageData: 0,
      drawImage: 0,
      putImageData: 0,
      offsetWidth: 0,
      textContent: 0
    };
    
    // Profile getImageData
    const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(...args) {
      window._profileData.getImageData++;
      return origGetImageData.apply(this, args);
    };
    
    // Profile drawImage
    const origDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(...args) {
      window._profileData.drawImage++;
      return origDrawImage.apply(this, args);
    };
    
    // Profile textContent setter
    const origTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    Object.defineProperty(Node.prototype, 'textContent', {
      ...origTextContent,
      set(v) {
        if (v !== undefined && v !== null) {
          window._profileData.textContent++;
        }
        origTextContent.set.call(this, v);
      }
    });
    
    setInterval(() => {
      console.log('PROFILE:', JSON.stringify(window._profileData));
    }, 5000);
  });
  
  // Wait 30s
  page.on('console', msg => {
    if (msg.text().includes('PROFILE:')) console.log(msg.text());
  });
  
  await page.waitForTimeout(35000);
  
  const final = await page.evaluate(() => window._profileData);
  console.log('Final profile:', JSON.stringify(final));
  
  await browser.close();
})();
