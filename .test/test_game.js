#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const candidates = [
  '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
];
let executablePath = candidates.find(c => fs.existsSync(c));
console.log('Chrome:', executablePath);

(async () => {
  const browser = await chromium.launch({ 
    headless: true, executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const requests = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}\n${err.stack}`));
  page.on('requestfailed', req => errors.push(`[requestfailed] ${req.url()} - ${req.failure()?.errorText}`));
  page.on('request', req => requests.push(req.url()));
  page.on('response', res => { if (res.status() >= 400) errors.push(`[http${res.status()}] ${res.url()}`); });

  await page.goto('http://localhost:8765/.test/index_test.html', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Detailed checks
  const info = await page.evaluate(() => {
    return {
      loadingDisplay: document.getElementById('loading')?.style.display,
      loadingExists: !!document.getElementById('loading'),
      phaser: typeof Phaser,
      gameExists: typeof game !== 'undefined',
      canvasExists: !!document.querySelector('#phaser-game canvas'),
      canvasCount: document.querySelectorAll('canvas').length,
      stateExists: typeof state !== 'undefined' && state !== null,
      sceneAccessible: typeof game !== 'undefined' && game?.scene ? !!game.scene.getScene('GameScene') : false,
    };
  });
  console.log('\n=== Page state ===');
  console.log(JSON.stringify(info, null, 2));

  console.log('\n=== Console logs ===');
  logs.forEach(l => console.log(l));

  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(e => console.log(e));
  } else {
    console.log('\n=== No errors ===');
  }

  await page.screenshot({ path: '/workspace/.test/game_test.png' });
  await browser.close();
})().catch(e => { console.error('Test failed:', e); process.exit(1); });
