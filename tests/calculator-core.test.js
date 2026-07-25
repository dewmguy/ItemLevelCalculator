'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const calculator = require('../calculator-core.js');

test('item level 182 two-hand uncommon produces 108 Spirit exactly', () => {
  const result = calculator.calculate({
    mode: 'stats',
    itemClass: 2,
    inventoryType: 17,
    quality: 2,
    level: 182,
    stats: [{ type: 6, percent: 100 }]
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.stats[0].amount, 108);
  assert.equal(result.result.recalculatedLevel, 182);
  assert.ok(Math.abs(result.equations.capacity.value - 108.494) < 0.001);
  assert.equal(
    result.equations.capacity.source,
    'quartic fit to RandPropPoints.dbc'
  );
  assert.ok(result.equations.unusedBudget > 0);
});

test('108 Spirit resolves back to item level 182', () => {
  const result = calculator.calculate({
    mode: 'level',
    itemClass: 2,
    inventoryType: 17,
    quality: 2,
    stats: [{ type: 6, amount: 108 }]
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.level, 182);
  assert.equal(result.equations.previousLevel.fits, false);
  assert.equal(result.equations.selectedLevel.fits, true);
});

test('Invasion Blade of the Elder stats remain within two listed levels', () => {
  const result = calculator.calculate({
    mode: 'level',
    itemClass: 2,
    inventoryType: 17,
    quality: 2,
    stats: [
      { type: 7, amount: 85 },
      { type: 5, amount: 56 },
      { type: 43, amount: 22 }
    ]
  });

  assert.equal(result.ok, true);
  assert.ok(Math.abs(result.result.level - 182) <= 2);
  assert.equal(result.equations.selectedLevel.stats[2].statMod, 2.5);
});

test('verbose output exposes each forward allocation equation', () => {
  const result = calculator.calculate({
    mode: 'stats',
    itemClass: 4,
    inventoryType: 5,
    quality: 2,
    level: 100,
    stats: [
      { type: 7, percent: 50 },
      { type: 5, percent: 50 }
    ]
  });

  assert.equal(result.ok, true);
  assert.equal(result.equations.allocations.length, 2);
  for (const allocation of result.equations.allocations) {
    assert.ok(Number.isFinite(allocation.statMod));
    assert.ok(Number.isFinite(allocation.allocatedBudget));
    assert.ok(Number.isFinite(allocation.exactAmount));
    assert.ok(Number.isInteger(allocation.roundedAmount));
    assert.ok(Number.isFinite(allocation.roundedBudget));
  }
  assert.ok(
    result.equations.usedBudget <=
      result.equations.distributableBudget + 1e-9
  );
});

test('JSON validation failures are structured and do not throw', () => {
  const result = calculator.calculate({
    mode: 'stats',
    itemClass: 2,
    inventoryType: 17,
    quality: 2,
    level: 182,
    stats: [{ type: 6, percent: 99 }]
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /not 100/);
});

test('Invasion Blade price uses the canonical uncommon weapon series', () => {
  const result = calculator.calculate({
    mode: 'price',
    itemClass: 2,
    inventoryType: 17,
    subclass: 8,
    quality: 2,
    level: 182
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.result.sell, {
    totalCopper: 144223,
    gold: 14,
    silver: 42,
    copper: 23
  });
  assert.equal(result.result.buy.totalCopper, 721115);
  assert.match(result.result.source, /random-enchantment weapon anchors/);
});

test('Invasion Blade damage is available through verbose JSON mode', () => {
  const result = calculator.calculate({
    mode: 'damage',
    itemClass: 2,
    inventoryType: 17,
    subclass: 8,
    quality: 2,
    level: 182,
    delay: 3500
  });

  assert.equal(result.ok, true);
  assert.ok(Math.abs(result.result.dps - 138.71428571428572) < 0.25);
  assert.equal(result.equations.roundedMinimum, result.result.minimum);
  assert.equal(result.equations.roundedMaximum, result.result.maximum);
});
