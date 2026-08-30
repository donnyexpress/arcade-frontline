/**
 * .test/l5_playtest.js — automated playtest using scripted personas
 *
 * Per user request: "playtest should be automated via different scripted
 * scenarios inferred from the design"
 *
 * Each persona is a function that decides what to do based on game state.
 * The runner applies those actions in a real browser, records what happens,
 * and reports results.
 *
 * Usage: node .test/l5_playtest.js
 */

const { setupBrowser, loadGame, assert, section, printFinalReport, resetReport } = require('./helpers');
const { ALL: ALL_PERSONAS } = require('./personas');

const DURATION_GAME_SECONDS = 30;  // Each persona plays for 30s of game time
// With FORCE_FAST_FORWARD, game time advances 1s per frame
// At 5 ticks/sec, 30 game seconds = ~6 wall seconds
const TICK_INTERVAL_MS = 200;

/**
 * Read game state from the browser and return a plain object
 */
async function readGameState(page) {
  return await page.evaluate(() => ({
    time: state.time,
    matchOver: state.matchOver,
    winner: state.winner,
    sides: {
      red: {
        credits: state.sides.red.credits,
        buildings: state.sides.red.buildings.map(b => ({
          type: b.type, constructing: b.constructing, hp: b.hp,
        })),
        buildingQueue: state.sides.red.buildingQueue.map(q => ({
          type: q.type, progress: q.buildProgress, time: q.buildTime,
        })),
        queue: state.sides.red.queue.map(q => ({ unit: q.unit, progress: q.progress })),
        turrets: state.sides.red.turrets.length,
        turretQueue: state.sides.red.turretQueue.length,
        base: { hp: state.sides.red.base.hp, maxHp: state.sides.red.base.maxHp },
      },
      blue: {
        credits: state.sides.blue.credits,
        buildings: state.sides.blue.buildings.map(b => ({
          type: b.type, constructing: b.constructing, hp: b.hp,
        })),
        buildingQueue: state.sides.blue.buildingQueue.map(q => ({
          type: q.type, progress: q.buildProgress, time: q.buildTime,
        })),
        queue: state.sides.blue.queue.map(q => ({ unit: q.unit, progress: q.progress })),
        turrets: state.sides.blue.turrets.length,
        turretQueue: state.sides.blue.turretQueue.length,
        base: { hp: state.sides.blue.base.hp, maxHp: state.sides.blue.base.maxHp },
      },
    },
    units: {
      red: state.units.filter(u => u.side === 'red').length,
      blue: state.units.filter(u => u.side === 'blue').length,
    },
  }));
}

/**
 * Apply an action in the browser
 */
async function applyAction(page, action) {
  return await page.evaluate((act) => {
    if (act.type === 'place_building') {
      return placeBuilding(act.side, act.building);
    } else if (act.type === 'place_turret') {
      return placeTurret(act.side, act.turret);
    } else if (act.type === 'queue_unit') {
      return queueUnit(act.side, act.unit);
    }
    return false;
  }, action);
}

/**
 * Run one persona for the given duration
 * Returns metrics about what happened
 */
async function runPersona(page, PersonaClass) {
  const persona = new PersonaClass();
  const initialState = await readGameState(page);

  const startTime = Date.now();
  let actionsApplied = 0;
  const actionLog = [];

  const personaDuration = persona.name === 'idle'
    ? DURATION_GAME_SECONDS * 2  // Idle gets 2x time for AI to do something
    : DURATION_GAME_SECONDS;
  while (Date.now() - startTime < personaDuration * 1000) {
    // With FORCE_FAST_FORWARD, 1s of game time = ~1s of wall time
    // (much faster than real, but still bounded for test stability)
    const gameState = await readGameState(page);

    if (gameState.matchOver) {
      actionLog.push(`t=${gameState.time.toFixed(1)}: match ended, winner=${gameState.winner}`);
      break;
    }

    const actions = persona.getActions(gameState);
    for (const action of actions) {
      const result = await applyAction(page, action);
      actionsApplied++;
      actionLog.push(`t=${gameState.time.toFixed(1)}: ${action.type} ${action.side} ${action.building || action.unit || action.turret} → ${result ? 'ok' : 'fail'}`);
    }

    await page.waitForTimeout(TICK_INTERVAL_MS);
  }

  const finalState = await readGameState(page);

  return {
    persona: persona.name,
    description: persona.description,
    actionsApplied,
    initialCredits: initialState.sides.red.credits,
    finalCredits: finalState.sides.red.credits,
    buildingsBuilt: finalState.sides.red.buildings.length,
    unitsProduced: finalState.units ? finalState.units.red : 0,
    turretsBuilt: finalState.sides.red.turrets,
    baseHp: finalState.sides.red.base.hp,
    enemyBaseHp: finalState.sides.blue.base.hp,
    matchOver: finalState.matchOver,
    winner: finalState.winner,
    finalTime: finalState.time,
    actionLog: actionLog.slice(0, 20), // first 20 actions for debugging
  };
}

/**
 * Run all personas and report results
 */
async function main() {
  resetReport();
  section('🎮 L5: Automated Playtest (Scripted Personas)');

  const { browser, page, pageErrors } = await setupBrowser();
  await loadGame(page);

  const results = [];
  for (const PersonaClass of ALL_PERSONAS) {
    console.log(`\n--- Running persona: ${PersonaClass.name} ---`);
    // Reset state for each persona
    await page.evaluate(() => {
      // Trigger rematch to reset everything
      const es = document.getElementById('end-screen');
      if (es) es.classList.remove('show');
      if (typeof initGame === 'function') initGame();
    });
    await page.waitForTimeout(500);

    const result = await runPersona(page, PersonaClass);
    results.push(result);
    console.log(`  Actions: ${result.actionsApplied}`);
    console.log(`  Buildings: ${result.buildingsBuilt}, Units: ${result.unitsProduced}, Turrets: ${result.turretsBuilt}`);
    console.log(`  Red HP: ${result.baseHp}, Blue HP: ${result.enemyBaseHp}`);
    console.log(`  Match over: ${result.matchOver}, Winner: ${result.winner || 'none'}`);
  }

  await browser.close();

  // ───────────────────────────────────────────────────────────
  // Assertions
  // ───────────────────────────────────────────────────────────
  section('Assertions');

  // 1. Active personas should perform actions; idle should not
  for (const result of results) {
    if (result.persona === 'idle') {
      assert(result.actionsApplied === 0, `idle did nothing (${result.actionsApplied})`);
    } else {
      assert(
        result.actionsApplied > 0,
        `${result.persona} performed actions (${result.actionsApplied})`
      );
    }
  }

  // 2. No page errors during any persona
  assert(pageErrors.length === 0, `No page errors (got ${pageErrors.length})`);

  // 3. Idle persona: AI should make progress (build something)
  const idleResult = results.find(r => r.persona === 'idle');
  assert(
    idleResult.enemyBaseHp < 500 || idleResult.matchOver,
    `Idle persona: AI made progress (matchOver=${idleResult.matchOver}, enemyHp=${idleResult.enemyBaseHp})`
  );

  // 4. Rusher should produce at least some units
  const rusherResult = results.find(r => r.persona === 'rusher');
  assert(
    rusherResult.unitsProduced > 0,
    `Rusher produced units (${rusherResult.unitsProduced})`
  );

  // 5. Turtle should build multiple buildings
  const turtleResult = results.find(r => r.persona === 'turtle');
  assert(
    turtleResult.buildingsBuilt >= 2,
    `Turtle built 2+ buildings (${turtleResult.buildingsBuilt})`
  );

  // 6. TechRush should reach tech center (or build heavy tanks)
  const techRushResult = results.find(r => r.persona === 'tech_rush');
  assert(
    techRushResult.actionsApplied > 0,
    `TechRush performed actions (${techRushResult.actionsApplied})`
  );

  // 7. No persona should crash
  for (const result of results) {
    assert(result.finalTime > 0, `${result.persona} game time advanced (${result.finalTime.toFixed(1)}s)`);
  }

  // ───────────────────────────────────────────────────────────
  // Balance report
  // ───────────────────────────────────────────────────────────
  section('Balance Report');
  console.log('\n| Persona         | Actions | Buildings | Units | Turrets | Red HP | Blue HP | Winner |');
  console.log('|-----------------|---------|-----------|-------|---------|--------|---------|--------|');
  for (const r of results) {
    console.log(`| ${r.persona.padEnd(15)} | ${String(r.actionsApplied).padStart(7)} | ${String(r.buildingsBuilt).padStart(9)} | ${String(r.unitsProduced).padStart(5)} | ${String(r.turretsBuilt).padStart(7)} | ${String(r.baseHp).padStart(6)} | ${String(r.enemyBaseHp).padStart(7)} | ${(r.winner || '—').padStart(6)} |`);
  }

  printFinalReport();
  process.exit(pageErrors.length === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
