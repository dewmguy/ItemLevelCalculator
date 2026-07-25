'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const calculator = require('../calculator-core.js');
const math = require('../model-math.js');

test('negative stats credit the same budget that positive stats consume', () => {
  const exponent = math.DEFAULT_EXPONENT;
  const positive = math.statBudget(10, 1, exponent);
  const negative = math.statBudget(-10, 1, exponent);

  assert.equal(negative, -positive);
  assert.equal(positive + negative, 0);
  assert.equal(
    math.statAmountFromBudget(negative, 1, exponent),
    -10
  );
});

test('signed stat allocations generate penalties and round-trip safely', () => {
  const generated = calculator.calculate({
    mode: 'stats',
    itemClass: 4,
    inventoryType: 9,
    quality: 3,
    level: 22,
    stats: [
      { type: 7, percent: -25 },
      { type: 5, percent: 125 }
    ]
  });

  assert.equal(generated.ok, true);
  assert.ok(generated.result.stats[0].amount < 0);
  assert.ok(generated.result.stats[1].amount > 0);
  assert.ok(generated.result.recalculatedLevel <= 22);
  assert.ok(
    generated.equations.usedBudget <=
      generated.equations.distributableBudget + 1e-9
  );
});

test('supplied armor and weapon penalty patterns are accepted', () => {
  const references = [
    {
      name: 'Mindthrust Bracers',
      listedLevel: 22,
      request: {
        itemClass: 4,
        inventoryType: 9,
        quality: 3,
        stats: [
          { type: 7, amount: -5 },
          { type: 5, amount: 9 }
        ]
      }
    },
    {
      name: 'Ogremage Staff',
      listedLevel: 27,
      request: {
        itemClass: 2,
        inventoryType: 17,
        quality: 2,
        stats: [
          { type: 4, amount: 11 },
          { type: 5, amount: -5 }
        ]
      }
    },
    {
      name: 'Shriveled Heart',
      listedLevel: 45,
      request: {
        itemClass: 4,
        inventoryType: 2,
        quality: 2,
        stats: [
          { type: 4, amount: -5 },
          { type: 7, amount: 13 },
          { type: 6, amount: -5 }
        ]
      }
    }
  ];

  for (const reference of references) {
    const result = calculator.calculate({
      mode: 'level',
      ...reference.request
    });
    assert.equal(result.ok, true, reference.name);
    assert.ok(
      Math.abs(result.result.level - reference.listedLevel) <= 1,
      `${reference.name}: expected about ${reference.listedLevel}, got ` +
        result.result.level
    );
    assert.ok(
      result.equations.selectedLevel.stats.some(stat => stat.budget < 0),
      reference.name
    );
  }
});
