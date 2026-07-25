'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const budgetModel = require('../budget-model.js');
const calculator = require('../calculator-core.js');

const REFERENCE_WEAPONS = [
  {
    name: 'The Hungering Cold',
    listedLevel: 89,
    quality: 4,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 140 },
      { type: 7, amount: 14 },
      { type: 37, amount: 14 }
    ]
  },
  {
    name: "Widow's Remorse",
    listedLevel: 81,
    quality: 4,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 100 },
      { type: 7, amount: 17 },
      { type: 31, amount: 10 }
    ]
  },
  {
    name: "Dal'Rend's Tribal Guardian",
    listedLevel: 63,
    quality: 3,
    inventoryType: 22,
    stats: [
      { type: 'armor', amount: 100 },
      { type: 12, amount: 7 }
    ]
  },
  {
    name: "Bloodlord's Defender",
    listedLevel: 66,
    quality: 4,
    inventoryType: 21,
    stats: [
      { type: 'armor', amount: 80 },
      { type: 7, amount: 15 },
      // The supplied Classic tooltip reports +4; the local emulator
      // SpellDBC row for spell 7517 instead reports +6.
      { type: 12, amount: 4 }
    ]
  },
  {
    name: 'Ardent Guard',
    listedLevel: 245,
    quality: 4,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 522 },
      { type: 4, amount: 58 },
      { type: 7, amount: 76 },
      { type: 12, amount: 31 },
      { type: 13, amount: 14 },
      { type: 'blue_socket', amount: 1 }
    ]
  },
  {
    name: 'The Unbreakable Will',
    listedLevel: 141,
    quality: 4,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 308 },
      { type: 7, amount: 33 },
      { type: 12, amount: 21 }
    ]
  },
  {
    name: 'Talon of Azshara',
    listedLevel: 134,
    quality: 4,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 168 },
      { type: 3, amount: 15 },
      { type: 31, amount: 20 },
      { type: 38, amount: 40 }
    ]
  },
  {
    name: "King's Defender",
    listedLevel: 115,
    quality: 4,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 182 },
      { type: 7, amount: 28 },
      { type: 12, amount: 13 },
      { type: 31, amount: 17 }
    ]
  },
  {
    name: 'Crystalblade of the Draenei',
    listedLevel: 103,
    quality: 3,
    inventoryType: 13,
    stats: [
      { type: 'armor', amount: 195 },
      { type: 7, amount: 18 },
      { type: 12, amount: 13 }
    ]
  }
];

test('weapon armor uses reference-calibrated low-level weights', () => {
  assert.equal(budgetModel.statMod('armor', 13, 4, 89, 2), 3 / 32);
  assert.equal(budgetModel.statMod('armor', 13, 4, 90, 2), 2 / 32);
  assert.equal(budgetModel.statMod('armor', 22, 3, 79, 2), 4 / 32);
  assert.equal(budgetModel.statMod('armor', 22, 3, 80, 2), 2 / 32);

  // Armor-class items retain their existing Bonus Armor valuation.
  assert.equal(budgetModel.statMod('armor', 5, 4, 89, 4), 2 / 32);
  assert.equal(budgetModel.statMod('armor', 5, 3, 79, 4), 3 / 32);
});

test('supplied armor-bearing weapon references stay close to listed levels', () => {
  const residuals = REFERENCE_WEAPONS.map(reference => {
    const result = calculator.calculate({
      mode: 'level',
      itemClass: 2,
      inventoryType: reference.inventoryType,
      quality: reference.quality,
      stats: reference.stats
    });
    assert.equal(result.ok, true, reference.name);
    return Math.abs(result.result.level - reference.listedLevel);
  });

  const meanAbsoluteError = residuals.reduce(
    (sum, residual) => sum + residual,
    0
  ) / residuals.length;
  assert.ok(Math.max(...residuals) <= 7);
  assert.ok(meanAbsoluteError <= 3.5);
});

test('generated weapon armor round-trips across its balance breakpoints', () => {
  for (const [quality, level] of [
    [3, 79],
    [3, 80],
    [4, 89],
    [4, 90],
    [4, 245]
  ]) {
    const result = calculator.calculate({
      mode: 'stats',
      itemClass: 2,
      inventoryType: 13,
      quality,
      level,
      stats: [{ type: 'armor', percent: 100 }]
    });

    assert.equal(result.ok, true);
    assert.ok(result.result.stats[0].amount > 0);
    assert.equal(result.result.recalculatedLevel, level);
  }
});
