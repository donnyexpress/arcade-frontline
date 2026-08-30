/**
 * .test/personas/index.js — scripted playtest personas
 *
 * Each persona is a function that:
 *   - Receives the current game state (injected from the browser)
 *   - Returns a list of actions to take
 *   - Knows about CFG, game rules, and one specific strategy
 *
 * This is "automated playtest" — no human required.
 * Personas are inferred from the design document, not invented randomly.
 */

const CFG = require('./_cfg');

/**
 * Base persona — all personas extend this.
 * Provides common helpers.
 */
class Persona {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.actions = []; // pending actions
  }

  // Helpers for readability
  canAfford(side, cost) {
    return this.state.sides[side].credits >= cost;
  }

  hasBuilding(side, type) {
    return this.state.sides[side].buildings.some(
      b => b.type === type && !b.constructing && b.hp > 0
    );
  }

  hasBuildingInQueue(side, type) {
    return this.state.sides[side].buildingQueue.some(q => q.type === type);
  }

  buildingCount(side) {
    return this.state.sides[side].buildings.filter(b => !b.constructing).length;
  }

  totalBuildings(side) {
    return this.state.sides[side].buildings.length +
           this.state.sides[side].buildingQueue.length;
  }

  inQueue(side, type) {
    return this.state.sides[side].queue.some(q => q.unit === type);
  }

  totalUnits(side) {
    // Units are at top level, not per-side
    return this.state.units ? this.state.units.filter(u => u.side === side).length : 0;
  }

  queueLength(side) {
    return this.state.sides[side].queue.length;
  }

  hasTurrets(side, count) {
    return this.state.sides[side].turrets.length + this.state.sides[side].turretQueue.length >= count;
  }

  // Decide what to do given current state
  decide() {
    throw new Error('Subclass must implement decide()');
  }

  // Return the list of pending actions
  getActions(state) {
    this.state = state;
    this.actions = [];
    this.decide();
    return this.actions;
  }
}

/**
 * Rusher: build barracks + queue rifleman, attack as soon as possible
 * Tests: early game, aggression, win by destroying enemy base
 */
class Rusher extends Persona {
  constructor() {
    super('rusher', 'Build barracks, queue rifleman, attack ASAP');
  }
  decide() {
    const side = 'red';
    // Phase 1: build barracks
    if (!this.hasBuilding(side, 'barracks') && !this.hasBuildingInQueue(side, 'barracks')) {
      if (this.canAfford(side, CFG.BARRACKS_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'barracks' });
      }
      return;
    }
    // Phase 2: queue rifleman when barracks is active
    if (this.hasBuilding(side, 'barracks')) {
      if (this.queueLength(side) < 3 && this.canAfford(side, CFG.UNITS.rifleman.cost)) {
        this.actions.push({ type: 'queue_unit', side, unit: 'rifleman' });
      }
    }
  }
}

/**
 * Turtle: build barracks + war factory + tech center + lots of turrets
 * Tests: defense, attrition, late game survival
 */
class Turtle extends Persona {
  constructor() {
    super('turtle', 'Build everything, max defense, win by attrition');
  }
  decide() {
    const side = 'red';
    // Build order: barracks → war factory → tech center → turrets
    if (!this.hasBuilding(side, 'barracks') && !this.hasBuildingInQueue(side, 'barracks')) {
      if (this.canAfford(side, CFG.BARRACKS_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'barracks' });
      }
      return;
    }
    if (this.hasBuilding(side, 'barracks') &&
        !this.hasBuilding(side, 'warfactory') && !this.hasBuildingInQueue(side, 'warfactory')) {
      if (this.canAfford(side, CFG.WARFACTORY_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'warfactory' });
      }
      return;
    }
    if (this.hasBuilding(side, 'warfactory') &&
        !this.hasBuilding(side, 'techcenter') && !this.hasBuildingInQueue(side, 'techcenter')) {
      if (this.canAfford(side, CFG.TECHCENTER_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'techcenter' });
      }
      return;
    }
    // Once everything is built, queue riflemen and add turrets
    if (this.hasBuilding(side, 'techcenter')) {
      if (this.queueLength(side) < 2 && this.canAfford(side, CFG.UNITS.rifleman.cost)) {
        this.actions.push({ type: 'queue_unit', side, unit: 'rifleman' });
      }
      // Add turrets up to 5
      if (!this.hasTurrets(side, 5) && this.canAfford(side, CFG.TURRET_COST)) {
        this.actions.push({ type: 'place_turret', side, turret: 'turret' });
      }
    }
  }
}

/**
 * TechRush: skip barracks, rush tech center, build heavy tanks
 * Tests: tech path, advanced units, alternative strategies
 */
class TechRush extends Persona {
  constructor() {
    super('tech_rush', 'Skip barracks, rush tech center, heavy tanks');
  }
  decide() {
    const side = 'red';
    // Need barracks first (no way to skip it), but skip war factory if possible
    if (!this.hasBuilding(side, 'barracks') && !this.hasBuildingInQueue(side, 'barracks')) {
      if (this.canAfford(side, CFG.BARRACKS_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'barracks' });
      }
      return;
    }
    if (this.hasBuilding(side, 'barracks') &&
        !this.hasBuilding(side, 'warfactory') && !this.hasBuildingInQueue(side, 'warfactory')) {
      if (this.canAfford(side, CFG.WARFACTORY_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'warfactory' });
      }
      return;
    }
    if (this.hasBuilding(side, 'warfactory') &&
        !this.hasBuilding(side, 'techcenter') && !this.hasBuildingInQueue(side, 'techcenter')) {
      if (this.canAfford(side, CFG.TECHCENTER_COST)) {
        this.actions.push({ type: 'place_building', side, building: 'techcenter' });
      }
      return;
    }
    // Queue heavy tanks
    if (this.hasBuilding(side, 'techcenter') &&
        this.queueLength(side) < 2 && this.canAfford(side, CFG.UNITS.heavy.cost)) {
      this.actions.push({ type: 'queue_unit', side, unit: 'heavy' });
    }
  }
}

/**
 * RandomClicker: click every available button randomly
 * Tests: UI robustness, error handling
 */
class RandomClicker extends Persona {
  constructor() {
    super('random_clicker', 'Click every button randomly, no strategy');
    this.tickCount = 0;
  }
  decide() {
    const side = 'red';
    // Random choice among all available actions
    const possibleActions = [];

    if (this.canAfford(side, CFG.BARRACKS_COST) &&
        !this.hasBuildingInQueue(side, 'barracks') && this.totalBuildings(side) < 5) {
      possibleActions.push({ type: 'place_building', side, building: 'barracks' });
    }
    if (this.hasBuilding(side, 'barracks') && this.canAfford(side, CFG.UNITS.rifleman.cost) &&
        this.queueLength(side) < 2) {
      possibleActions.push({ type: 'queue_unit', side, unit: 'rifleman' });
    }
    if (this.hasBuilding(side, 'barracks') && this.canAfford(side, CFG.WARFACTORY_COST) &&
        !this.hasBuildingInQueue(side, 'warfactory')) {
      possibleActions.push({ type: 'place_building', side, building: 'warfactory' });
    }
    if (this.canAfford(side, CFG.TURRET_COST) && !this.hasTurrets(side, 3)) {
      possibleActions.push({ type: 'place_turret', side, turret: 'pillbox' });
    }

    if (possibleActions.length > 0) {
      const action = possibleActions[Math.floor(Math.random() * possibleActions.length)];
      this.actions.push(action);
    }
  }
}

/**
 * Idle: do nothing, watch what AI does
 * Tests: AI plays correctly without player input
 */
class Idle extends Persona {
  constructor() {
    super('idle', 'No actions, observe AI only');
  }
  decide() {
    // Intentionally empty
  }
}

module.exports = {
  Rusher,
  Turtle,
  TechRush,
  RandomClicker,
  Idle,
  ALL: [Rusher, Turtle, TechRush, RandomClicker, Idle],
};
