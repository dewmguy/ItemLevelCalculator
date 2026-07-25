'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const budget = require('../budget-model.js');
const calculator = require('../calculator-core.js');

test('rare socket costs retain the lower range and scale continuously', () => {
  assert.equal(budget.socketMod(5, 3, 129), 20);
  assert.equal(budget.socketMod(5, 3, 130), 20);
  assert.equal(budget.socketMod(5, 3, 165), 30);
  assert.equal(budget.socketMod(5, 3, 200), 40);

  assert.equal(budget.socketMod(14, 3, 129), 10);
  assert.equal(budget.socketMod(14, 3, 130), 10);
  assert.equal(budget.socketMod(14, 3, 160), 20);
  assert.ok(Math.abs(budget.socketMod(14, 3, 200) - 100 / 3) < 1e-12);
});

test('ilvl 200 rare chest examples resolve with and without sockets', () => {
  const patina = calculator.calculate({
    mode: 'level',
    itemClass: 4,
    inventoryType: 5,
    quality: 3,
    stats: [
      { type: 7, amount: 67 },
      { type: 5, amount: 55 },
      { type: 36, amount: 78 },
      { type: 45, amount: 91 }
    ]
  });
  const bonegrinder = calculator.calculate({
    mode: 'level',
    itemClass: 4,
    inventoryType: 5,
    quality: 3,
    stats: [
      { type: 4, amount: 70 },
      { type: 7, amount: 91 },
      { type: 32, amount: 70 },
      { type: 'red_socket', amount: 1 },
      { type: 'blue_socket', amount: 1 }
    ]
  });

  assert.equal(patina.ok, true);
  assert.equal(patina.result.level, 200);
  assert.equal(bonegrinder.ok, true);
  assert.equal(bonegrinder.result.level, 200);
});

test('generated ilvl 200 rare chest sockets round-trip at the target level', () => {
  const result = calculator.calculate({
    mode: 'stats',
    itemClass: 4,
    inventoryType: 5,
    quality: 3,
    level: 200,
    sockets: ['red_socket', 'blue_socket'],
    stats: [{ type: 4, percent: 100 }]
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.recalculatedLevel, 200);
  assert.equal(result.equations.socketBudget > 1000, true);
});

test('the clean ilvl 200 socketed rare weapon example resolves exactly', () => {
  const result = calculator.calculate({
    mode: 'level',
    itemClass: 2,
    inventoryType: 17,
    quality: 3,
    stats: [
      { type: 32, amount: 77 },
      { type: 4, amount: 70 },
      { type: 7, amount: 105 },
      { type: 'red_socket', amount: 1 }
    ]
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.level, 200);
});

test('observed rare socket configurations stay monotone in audited ranges', () => {
  const profiles = [
    [4, 1, 3],
    [4, 2, 2],
    [4, 3, 2],
    [4, 5, 3],
    [4, 6, 2],
    [4, 7, 3],
    [4, 8, 2],
    [4, 9, 1],
    [4, 10, 3],
    [4, 11, 1],
    [4, 14, 2],
    [4, 16, 1],
    [4, 20, 3],
    [2, 13, 1],
    [2, 17, 3],
    [2, 21, 2, 129]
  ];

  for (const [
    itemClass,
    inventoryType,
    maximumSockets,
    maximumLevel = 200
  ] of profiles) {
    for (let sockets = 1; sockets <= maximumSockets; sockets++) {
      let previous = null;
      for (let level = 100; level <= maximumLevel; level++) {
        const value = budget.itemBudgetAtLevel({
          itemClass,
          inventoryType,
          quality: 3,
          level,
          socketTypes: Array(sockets).fill('red_socket')
        });
        assert.ok(Number.isFinite(value));
        if (previous !== null) {
          assert.ok(
            value >= previous - 1e-9,
            `class ${itemClass}, slot ${inventoryType}, sockets ${sockets}, ` +
              `level ${level}: ${value} < ${previous}`
          );
        }
        previous = value;
      }
    }
  }
});
