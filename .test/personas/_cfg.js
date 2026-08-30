/**
 * .test/personas/_cfg.js — mirror of game CFG for personas
 *
 * Personas run in the Node.js test runner, not the browser. So they need
 * a copy of the game's CFG values. This is kept in sync via the doc-code CI
 * (see docs/audit/scripts/check-doc-code-sync.sh).
 *
 * If you change CFG in index.html, update this file too.
 */

const CFG = {
  // Economy
  STARTING_CREDITS: 200,
  PASSIVE_INCOME: 6,
  SOFT_CAP: 500,

  // Buildings
  BARRACKS_COST: 100,
  BARRACKS_HP: 80,
  WARFACTORY_COST: 150,
  WARFACTORY_HP: 100,
  TECHCENTER_COST: 250,
  TECHCENTER_HP: 100,
  PILLBOX_COST: 75,
  TURRET_COST: 150,
  BUILD_TIME: 5,

  // Units
  UNITS: {
    rifleman:    { name: 'Rifleman',    cost: 10, hp: 20,  dmg: 4,  range: 60,  speed: 90, build: 1.5 },
    rocket:      { name: 'Rocket Sol.', cost: 25, hp: 20,  dmg: 12, range: 200, speed: 60, build: 2.5 },
    flame:       { name: 'Flamethrower',cost: 30, hp: 35,  dmg: 18, range: 100, speed: 55, build: 3.0 },
    fsv:         { name: 'Fire Support',cost: 35, hp: 50,  dmg: 12, range: 120, speed: 95, build: 3.0 },
    tank:        { name: 'Med. Tank',   cost: 40, hp: 80,  dmg: 15, range: 140, speed: 45, build: 4.0 },
    sniper:      { name: 'Sniper',      cost: 50, hp: 25,  dmg: 30, range: 400, speed: 40, build: 4.5 },
    drone:       { name: 'Drone',       cost: 60, hp: 15,  dmg: 50, range: 80,  speed: 110, build: 3.5, suicide: true },
    heavy:       { name: 'Heavy Tank',  cost: 80, hp: 180, dmg: 22, range: 140, speed: 30, build: 6.0 },
  },
};

module.exports = CFG;
