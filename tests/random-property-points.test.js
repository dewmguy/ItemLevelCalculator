'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const points = require('../random-property-points.js');
const budget = require('../budget-model.js');

test('canonical uncommon capacities reproduce the item-level 182 groups', () => {
  assert.deepEqual(points.UNCOMMON[182], [108, 81, 60, 46, 34]);
  assert.equal(points.uncommonPoints(182, 17), 108);
  assert.equal(points.uncommonPoints(182, 10), 81);
  assert.equal(points.uncommonPoints(182, 11), 60);
  assert.equal(points.uncommonPoints(182, 13), 46);
  assert.equal(points.uncommonPoints(182, 26), 34);
});

test('all uncommon capacity groups are monotone through the DBC domain', () => {
  for (let group = 0; group < 5; group += 1) {
    for (let level = 2; level <= 300; level += 1) {
      assert.ok(
        points.UNCOMMON[level][group] >=
          points.UNCOMMON[level - 1][group],
        `group ${group} fell at item level ${level}`
      );
    }
  }
});

test('budget capacity uses inventory-specific fitted DBC curves', () => {
  for (const inventoryType of [17, 10, 11, 13, 26]) {
    const expected = points.formulaPoints(2, 182, inventoryType);
    assert.equal(budget.budgetCapacityAtLevel({
      itemClass: inventoryType >= 13 && inventoryType !== 14 ? 2 : 4,
      inventoryType,
      quality: 2,
      level: 182
    }), expected);
    assert.ok(Math.abs(
      expected - points.uncommonPoints(182, inventoryType)
    ) < 0.6);
  }
});

test('fitted curves cover rare and epic qualities and can extrapolate', () => {
  for (const quality of [2, 3, 4]) {
    assert.ok(points.formulaPoints(quality, 182, 17) > 0);
    assert.ok(
      points.formulaPoints(quality, 400, 17) >
      points.formulaPoints(quality, 300, 17)
    );
  }
});

test('MP5 and HP5 use allocation-derived uncommon weights', () => {
  for (const inventoryType of [2, 5, 11, 17, 23]) {
    assert.equal(budget.statMod(43, inventoryType, 2, 182), 2.5);
    assert.equal(budget.statMod(46, inventoryType, 2, 182), 2.5);
  }
});
