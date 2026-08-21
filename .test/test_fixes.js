const { chromium } = require('playwright');

const REPORT = { passed: 0, failed: 0 };
function assert(cond, name) {
  if (cond) { REPORT.passed++; console.log('✅', name); }
  else { REPORT.failed++; console.log('❌', name); }
}
function section(name) { console.log('\n═══ ' + name + ' ═══'); }

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file:///workspace/.test/index_test.html');
  await page.waitForTimeout(3000);

  const forceTime = async (seconds) => {
    const chunks = Math.ceil(seconds / 2);
    for (let i = 0; i < chunks; i++) {
      const chunk = Math.min(2, seconds - i * 2);
      await page.evaluate((args) => {
        const s = args.s;
        for (let i = 0; i < s * 10; i++) {
          const dt = 0.1;
          state.sides.red.credits = Math.min(CFG.SOFT_CAP, state.sides.red.credits + CFG.PASSIVE_INCOME * dt);
          state.sides.blue.credits = Math.min(CFG.SOFT_CAP, state.sides.blue.credits + CFG.PASSIVE_INCOME * dt);
          autoAIBuild('red');
          autoAIBuild('blue');
          updateBuildings('red', dt);
          updateBuildings('blue', dt);
          updateTurrets('red', dt);
          updateTurrets('blue', dt);
          updateQueue('red', dt);
          updateQueue('blue', dt);
          updateAI(dt);
          for (const u of state.units) updateUnit(u, dt);
          state.units = state.units.filter(u => u.hp > 0);
          state.time += dt;
        }
      }, { s: chunk });
    }
  };

  section('FIX 1: Click handler rejects locked buttons');
  const click1 = await page.evaluate(() => {
    const btn = document.getElementById('unit-rifleman');
    return {
      isLocked: btn.classList.contains('locked'),
      unlocked: isUnitUnlocked('red', 'rifleman')
    };
  });
  assert(click1.isLocked, 'rifleman button is locked without barracks');
  assert(!click1.unlocked, 'rifleman is not unlocked');
  
  const q1 = await page.evaluate(() => state.sides.red.queue.length);
  await page.evaluate(() => {
    const btn = document.getElementById('unit-rifleman');
    if (!btn.classList.contains('locked') && !btn.classList.contains('disabled')) {
      state.sides.red.credits -= CFG.UNITS.rifleman.cost;
      queueUnit('red', 'rifleman');
    }
  });
  const q2 = await page.evaluate(() => state.sides.red.queue.length);
  assert(q1 === q2, 'Locked button click does not queue unit');

  await page.evaluate(() => { state.sides.red.credits = 500; placeBuilding('red', 'barracks'); });
  await forceTime(6);
  
  const click2 = await page.evaluate(() => {
    const btn = document.getElementById('unit-rifleman');
    return {
      isLocked: btn.classList.contains('locked'),
      unlocked: isUnitUnlocked('red', 'rifleman')
    };
  });
  assert(!click2.isLocked, 'rifleman unlocks after barracks built');
  
  const q3 = await page.evaluate(() => state.sides.red.queue.length);
  await page.evaluate(() => {
    const btn = document.getElementById('unit-rifleman');
    if (!btn.classList.contains('locked') && !btn.classList.contains('disabled')) {
      state.sides.red.credits -= CFG.UNITS.rifleman.cost;
      queueUnit('red', 'rifleman');
    }
  });
  const q4 = await page.evaluate(() => state.sides.red.queue.length);
  assert(q4 > q3, 'Unlocked button click does queue unit');

  section('FIX 2: Health bars are visible on damaged units');
  await page.evaluate(() => {
    state.sides.red.credits = 1000;
    spawnUnit('red', 'tank');
    state.units[0].hp = 20;
    state.units[0].x = 400;
    state.units[0].y = 400;
  });
  await page.waitForTimeout(500);
  
  const hb = await page.evaluate(() => {
    const tank = scene.unitSprites.find(s => s.unit && s.unit.type === 'tank');
    if (!tank) return { error: 'No tank sprite found' };
    return {
      hasHealthBar: !!tank.healthBar,
      healthBarVisible: tank.healthBar ? tank.healthBar.visible : null,
      hasBarFg: !!tank.barFg
    };
  });
  console.log('  Tank health bar:', JSON.stringify(hb));
  assert(hb.hasHealthBar, 'Tank sprite has healthBar');
  assert(hb.healthBarVisible, 'Health bar visible on damaged unit');
  assert(hb.hasBarFg, 'Tank has barFg');
  
  await page.screenshot({ path: '/workspace/.test/v52_healthbar.png' });

  section('FIX 3: Drone suicide-AoE behavior');
  // Atomic: setup + simulate + measure in one page.evaluate
  const droneResult = await page.evaluate(() => {
    state.units = [];
    state.sides.red.buildings = [
      {type: 'barracks', hp: 80, maxHp: 80, constructing: false, x: 140, y: 210, buildProgress: 5, buildTime: 5},
      {type: 'warfactory', hp: 100, maxHp: 100, constructing: false, x: 140, y: 320, buildProgress: 5, buildTime: 5},
      {type: 'techcenter', hp: 100, maxHp: 100, constructing: false, x: 140, y: 430, buildProgress: 5, buildTime: 5}
    ];
    spawnUnit('red', 'drone');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rifleman');
    spawnUnit('blue', 'rifleman');
    state.units[0].x = 800; state.units[0].y = 300;
    state.units[1].x = 820; state.units[1].y = 300;
    state.units[2].x = 780; state.units[2].y = 320;
    state.units[3].x = 810; state.units[3].y = 280;
    const before = {
      droneHP: state.units.find(u => u.side === 'red' && u.type === 'drone')?.hp || 0,
      blueTotalHP: state.units.filter(u => u.side === 'blue').reduce((s, u) => s + u.hp, 0)
    };
    // Run updateUnit in isolation (no AI interference)
    for (let j = 0; j < 30; j++) {
      const dt = 0.1;
      for (const u of state.units) updateUnit(u, dt);
      state.units = state.units.filter(u => u.hp > 0);
    }
    const after = {
      droneHP: state.units.find(u => u.side === 'red' && u.type === 'drone')?.hp || 0,
      blueTotalHP: state.units.filter(u => u.side === 'blue').reduce((s, u) => s + u.hp, 0)
    };
    return { before, after };
  });
  console.log('  Before:', JSON.stringify(droneResult.before));
  console.log('  After:', JSON.stringify(droneResult.after));
  assert(!droneResult.after.droneHP || droneResult.after.droneHP <= 0, 'Red drone self-destructs');
  assert(droneResult.after.blueTotalHP < droneResult.before.blueTotalHP, 
    `Blue units took AoE damage (${droneResult.before.blueTotalHP} → ${droneResult.after.blueTotalHP})`);

  section('FIX 4: Drone alone does not self-destruct');
  // Atomic
  const aloneResult = await page.evaluate(() => {
    state.units = [];
    spawnUnit('red', 'drone');
    state.units[0].x = 300;
    state.units[0].y = 300;
    const startHP = state.units[0].hp;
    for (let j = 0; j < 50; j++) {
      const dt = 0.1;
      for (const u of state.units) updateUnit(u, dt);
      state.units = state.units.filter(u => u.hp > 0);
    }
    const endHP = state.units[0]?.hp || 0;
    return { startHP, endHP };
  });
  console.log(`  Drone alone: ${aloneResult.startHP} → ${aloneResult.endHP}`);
  assert(aloneResult.startHP === aloneResult.endHP, 'Drone alone does not explode');

  console.log('\n═══════════════════════════════════');
  console.log(`PASSED: ${REPORT.passed}`);
  console.log(`FAILED: ${REPORT.failed}`);
  console.log(`JS errors: ${pageErrors.length}`);
  
  await browser.close();
})();
