const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);
  
  // Install profiler
  await page.evaluate(() => {
    window._ops = { textContent: 0, classListAdd: 0, classListRemove: 0, classListToggle: 0, setStyle: 0, getElementById: 0, getImageData: 0, drawImage: 0, offsetWidth: 0, appendChild: 0, removeChild: 0, querySelector: 0 };
    
    const origTC = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
    Object.defineProperty(Node.prototype, 'textContent', {
      ...origTC,
      set(v) {
        window._ops.textContent++;
        origTC.set.call(this, v);
      }
    });
    
    const origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function() {
      window._ops.classListAdd++;
      return origAdd.apply(this, arguments);
    };
    
    const origRemove = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function() {
      window._ops.classListRemove++;
      return origRemove.apply(this, arguments);
    };
    
    const origToggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function() {
      window._ops.classListToggle++;
      return origToggle.apply(this, arguments);
    };
    
    const origGS = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'width');
    Object.defineProperty(CSSStyleDeclaration.prototype, 'width', {
      ...origGS,
      set(v) {
        window._ops.setStyle++;
        origGS.set.call(this, v);
      }
    });
    
    const origGEBI = document.getElementById;
    document.getElementById = function(id) {
      window._ops.getElementById++;
      return origGEBI.call(this, id);
    };
    
    const origQS = document.querySelector;
    document.querySelector = function() {
      window._ops.querySelector++;
      return origQS.apply(this, arguments);
    };
    
    const origGI = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(...args) {
      window._ops.getImageData++;
      return origGI.apply(this, args);
    };
    
    const origDI = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(...args) {
      window._ops.drawImage++;
      return origDI.apply(this, args);
    };
  });
  
  let prevOps = null;
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(5000);
    const t = await page.evaluate(() => ({
      fps: Math.round(scene.game.loop.actualFps),
      ops: {...window._ops}
    }));
    const opsStr = JSON.stringify(t.ops);
    const delta = prevOps ? Object.fromEntries(Object.entries(t.ops).map(([k, v]) => [k, v - (prevOps[k] || 0)])) : t.ops;
    console.log(`T+${(i+1)*5}s fps=${t.fps}:`, JSON.stringify(delta));
    prevOps = t.ops;
  }
  
  await browser.close();
})();
