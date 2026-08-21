const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = [];
  let consoleErrors = [];
  page.on('pageerror', e => errors.push('ERR: ' + e.message + '\n' + e.stack));
  page.on('console', msg => { 
    const t = msg.type();
    if (t === 'error') consoleErrors.push('CONS_ERR: ' + msg.text().substring(0, 300));
    if (t === 'warning') consoleErrors.push('CONS_WARN: ' + msg.text().substring(0, 200));
  });
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(5000);
  
  // Watch the game for 30 seconds in real time
  const startTime = Date.now();
  let lastCredits = 0;
  let stuckCount = 0;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const t = await page.evaluate(() => ({
      time: state.time.toFixed(2),
      credits: Math.floor(state.sides.red.credits),
      buildings: state.sides.red.buildings.length,
      units: state.units.length,
      frameRate: scene.game.loop.actualFps ? Math.round(scene.game.loop.actualFps) : 0
    }));
    if (t.credits === lastCredits) stuckCount++;
    else stuckCount = 0;
    lastCredits = t.credits;
    console.log(`R+${i+1}s:`, JSON.stringify(t), `stuck=${stuckCount}`);
  }
  
  console.log('\n--- Page errors ---');
  console.log(errors.slice(0, 10).join('\n'));
  console.log('\n--- Console errors/warnings ---');
  console.log(consoleErrors.slice(0, 10).join('\n'));
  
  await browser.close();
})();
