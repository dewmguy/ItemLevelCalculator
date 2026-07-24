'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const budgetModel = require('../budget-model.js');
const modelMath = require('../model-math.js');

test('quality rules reproduce production breakpoints exactly', () => {
  assert.equal(budgetModel.qualityMod(4, 99), 0.689 * 99 + 1);
  assert.equal(budgetModel.qualityMod(4, 100), 0.700 * 100 - 2);
  assert.equal(budgetModel.qualityMod(4, 199), 0.700 * 199 - 2);
  assert.equal(budgetModel.qualityMod(4, 200), 1.320 * 200 - 120);
  assert.equal(budgetModel.qualityMod(3, 79), 0.641 * 79 - 4);
  assert.equal(budgetModel.qualityMod(3, 80), 0.674 * 80 - 8);
  assert.equal(budgetModel.qualityMod(2, 129), 0.505 * 129 - 4.5);
  assert.equal(budgetModel.qualityMod(2, 130), 0.801 * 130 - 38.3);
});

test('dynamic and static slot modifiers reproduce production tables', () => {
  assert.equal(budgetModel.slotMod(4, 1, 4, 89), 1);
  assert.equal(budgetModel.slotMod(4, 1, 4, 90), 11 / 16);
  assert.equal(budgetModel.slotMod(4, 1, 4, 200), 1);
  assert.equal(budgetModel.slotMod(4, 16, 2, 79), 3 / 16);
  assert.equal(budgetModel.slotMod(4, 16, 2, 80), 4 / 16);
  assert.equal(budgetModel.slotMod(2, 17, 4, 100), 1);
  assert.equal(budgetModel.slotMod(2, 21, 3, 200), 7 / 16);
});

test('stat modifiers reproduce level, slot, and quality boundaries', () => {
  assert.equal(budgetModel.statMod(7, 5, 4, 89), 1);
  assert.equal(budgetModel.statMod(7, 5, 4, 90), 2 / 3);
  assert.equal(budgetModel.statMod(43, 2, 4, 199), 32 / 16);
  assert.equal(budgetModel.statMod(43, 2, 4, 200), 24 / 16);
  assert.equal(budgetModel.statMod(43, 5, 4, 200), 32 / 16);
  assert.equal(budgetModel.statMod(45, 5, 2, 79), 45 / 64);
  assert.equal(budgetModel.statMod(45, 5, 2, 80), 55 / 64);
  assert.equal(budgetModel.statMod(38, 17, 4, 100), 8 / 16);
});

test('socket slot groups preserve the production distinction from MP5 groups', () => {
  assert.equal(budgetModel.socketMod(14, 4, 100), 10);
  assert.equal(budgetModel.socketMod(12, 4, 100), 10);
  assert.equal(budgetModel.socketMod(12, 4, 89), 20);
});

test('headless level calculation uses the production power-law model', () => {
  const level = budgetModel.calculateLevel({
    itemClass: 4,
    inventoryType: 5,
    quality: 4,
    stats: [
      { type: 4, amount: 53 },
      { type: 3, amount: 53 },
      { type: 32, amount: 53 }
    ],
    exponent: modelMath.DEFAULT_EXPONENT
  });
  const singleStatLevel = budgetModel.calculateLevel({
    itemClass: 4,
    inventoryType: 5,
    quality: 4,
    stats: [{ type: 4, amount: 100 }],
    exponent: modelMath.DEFAULT_EXPONENT
  });

  assert.ok(Math.abs(level - singleStatLevel) <= 2);
});

test('generated weighted stats remain within the reusable item budget', () => {
  const itemBudget = budgetModel.itemBudgetAtLevel({
    itemClass: 2,
    inventoryType: 17,
    quality: 4,
    level: 100
  });
  const attackPower = modelMath.statAmountFromBudget(
    itemBudget,
    budgetModel.statMod(38, 17, 4, 100)
  );
  assert.equal(Math.ceil(attackPower), 136);
});
