'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const budget = require('../budget-model.js');
const calculator = require('../calculator-core.js');

function calculateArmorLevel(inventoryType, stats) {
  return calculator.calculate({
    mode: 'level',
    itemClass: 4,
    inventoryType,
    quality: 4,
    stats: stats.map(([type, amount]) => ({ type, amount }))
  });
}

test('epic spell power is class-aware from item level 90 onward', () => {
  assert.equal(budget.statMod(45, 5, 4, 89, 4), 55 / 64);
  assert.equal(budget.statMod(45, 5, 4, 90, 4), 55 / 64);
  assert.equal(budget.statMod(45, 5, 4, 277, 4), 55 / 64);
  assert.equal(budget.statMod(45, 5, 4, 277), 55 / 64);

  assert.equal(budget.statMod(45, 17, 4, 89, 2), 55 / 64);
  assert.equal(budget.statMod(45, 17, 4, 90, 2), 45 / 64);
  assert.equal(budget.statMod(45, 17, 4, 277, 2), 45 / 64);
  assert.equal(budget.statMod(45, 17, 4, 277), 45 / 64);
});

test('epic socket costs are continuous and class-aware', () => {
  assert.equal(budget.socketMod(5, 4, 89, 4, 'red_socket'), 20);
  assert.equal(budget.socketMod(5, 4, 90, 4, 'red_socket'), 20);
  assert.equal(budget.socketMod(5, 4, 130, 4, 'red_socket'), 20);
  assert.equal(budget.socketMod(5, 4, 165, 4, 'red_socket'), 30);
  assert.equal(budget.socketMod(5, 4, 200, 4, 'red_socket'), 40);
  assert.equal(budget.socketMod(5, 4, 277, 4, 'red_socket'), 48);

  assert.equal(budget.socketMod(1, 4, 200, 4, 'meta_socket'), 40);
  assert.equal(budget.socketMod(1, 4, 277, 4, 'meta_socket'), 80);

  assert.ok(Math.abs(
    budget.socketMod(14, 4, 200, 4, 'red_socket') - 100 / 3
  ) < 1e-12);
  assert.equal(budget.socketMod(14, 4, 277, 4, 'red_socket'), 48);

  assert.equal(budget.socketMod(17, 4, 200, 2, 'red_socket'), 40);
  assert.equal(budget.socketMod(17, 4, 277, 2, 'red_socket'), 40);
  assert.equal(budget.socketMod(17, 4, 300, 2, 'red_socket'), 40);
  assert.equal(budget.socketMod(17, 4, 277), 40);
});

test('epic armor socket budgets remain monotone through extrapolation', () => {
  const profiles = [
    [4, 5, ['red_socket', 'blue_socket']],
    [4, 1, ['meta_socket', 'red_socket']],
    [4, 14, ['red_socket']],
    [2, 17, ['red_socket']]
  ];

  for (const [itemClass, inventoryType, socketTypes] of profiles) {
    let previous = null;
    for (let level = 1; level <= 300; level++) {
      const value = budget.itemBudgetAtLevel({
        itemClass,
        inventoryType,
        quality: 4,
        level,
        socketTypes
      });
      assert.ok(Number.isFinite(value));
      if (previous !== null) {
        assert.ok(
          value >= previous - 1e-9,
          `class ${itemClass}, slot ${inventoryType}, level ${level}: ` +
            `${value} < ${previous}`
        );
      }
      previous = value;
    }
  }
});

test('representative ilvl 277 plate pieces retain expected residual spread', () => {
  const tunic = calculateArmorLevel(5, [
    [45, 195],
    [7, 139],
    [5, 139],
    [32, 122],
    [36, 106],
    ['yellow_socket', 1],
    ['blue_socket', 1]
  ]);
  const battleplate = calculateArmorLevel(5, [
    [4, 193],
    [7, 209],
    [32, 122],
    [36, 106],
    ['yellow_socket', 1],
    ['blue_socket', 1]
  ]);
  const helmet = calculateArmorLevel(1, [
    [4, 185],
    [7, 209],
    [32, 114],
    [36, 106],
    ['meta_socket', 1],
    ['red_socket', 1]
  ]);
  const shoulders = calculateArmorLevel(3, [
    [4, 147],
    [7, 155],
    [32, 90],
    [36, 82],
    ['red_socket', 1]
  ]);

  assert.equal(tunic.result.level, 275);
  assert.equal(battleplate.result.level, 273);
  assert.equal(helmet.result.level, 273);
  assert.equal(shoulders.result.level, 274);
});

test('uncommon and rare stat/socket rules are unchanged', () => {
  assert.equal(budget.statMod(45, 5, 2, 182, 4), 55 / 64);
  assert.equal(budget.statMod(45, 5, 3, 182, 4), 55 / 64);
  assert.equal(budget.socketMod(5, 2, 182, 4, 'red_socket'), 10);
  assert.ok(Math.abs(
    budget.socketMod(5, 3, 182, 4, 'red_socket') - (20 + 104 / 7)
  ) < 1e-12);
  assert.ok(Math.abs(
    budget.socketMod(14, 3, 182, 4, 'red_socket') - (10 + 52 / 3)
  ) < 1e-12);
});

test('generated epic socketed items round-trip at calibrated levels', () => {
  for (const [itemClass, inventoryType, sockets] of [
    [4, 5, ['red_socket', 'blue_socket']],
    [4, 1, ['meta_socket', 'red_socket']],
    [2, 17, ['red_socket']]
  ]) {
    const result = calculator.calculate({
      mode: 'stats',
      itemClass,
      inventoryType,
      quality: 4,
      level: 277,
      sockets,
      stats: [{ type: 4, percent: 100 }]
    });
    assert.equal(result.ok, true);
    assert.equal(result.result.recalculatedLevel, 277);
  }
});
