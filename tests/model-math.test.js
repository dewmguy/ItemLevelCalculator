'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const math = require('../model-math.js');

test('default exponent encodes a 50% stat split doubling equivalence', () => {
  const expected = Math.log(2) / Math.log(1.5);
  assert.ok(Math.abs(math.DEFAULT_EXPONENT - expected) < 1e-12);
  assert.ok(Math.abs(Math.pow(1.5, math.DEFAULT_EXPONENT) - 2) < 1e-12);
  assert.ok(Math.abs(math.DEFAULT_EXPONENT - Math.log(3) / Math.log(2)) > 0.1);
});

test('forward and inverse stat-budget transforms round trip for weighted stats', () => {
  for (const statAmount of [1, 53, 100, 247]) {
    for (const statMod of [0.5, 0.703125, 1, 3]) {
      const budget = math.statBudget(statAmount, statMod);
      const restored = math.statAmountFromBudget(budget, statMod);
      assert.ok(Math.abs(restored - statAmount) < 1e-10);
    }
  }
});

test('integer reconciliation never exceeds the nonlinear item budget', () => {
  const totalBudget = 1000;
  const exactAmounts = [
    math.statAmountFromBudget(totalBudget * 0.5, 1),
    math.statAmountFromBudget(totalBudget * 0.3, 0.5),
    math.statAmountFromBudget(totalBudget * 0.2, 0.703125)
  ];
  const result = math.reconcileIntegerStatAmounts([
    { exactAmount: exactAmounts[0], statMod: 1 },
    { exactAmount: exactAmounts[1], statMod: 0.5 },
    { exactAmount: exactAmounts[2], statMod: 0.703125 }
  ], totalBudget);

  assert.ok(result);
  assert.ok(result.usedBudget <= totalBudget + 1e-9);
  assert.deepEqual(
    result.amounts.map((amount, index) =>
      amount === Math.floor(exactAmounts[index]) ||
      amount === Math.ceil(exactAmounts[index])
    ),
    [true, true, true]
  );
});

test('feral attack power reproduces the AzerothCore DPS conversion', () => {
  assert.deepEqual(math.FERAL_WEAPON_INVENTORY_TYPES, [13, 17, 21, 22]);
  assert.equal(math.isFeralWeaponInventoryType(17), true);
  assert.equal(math.isFeralWeaponInventoryType(15), false);
  assert.equal(math.feralAttackPowerFromDps(50), 0);
  assert.equal(math.feralAttackPowerFromDps(55), 3);
  assert.equal(math.feralAttackPowerFromDps(63.2819059528), 118);
  assert.equal(math.feralAttackPowerFromDps(60, 5), 143);
  assert.equal(math.feralAttackPowerFromDps(-1), null);
  assert.equal(math.feralAttackPowerFromDps(NaN), null);
});

test('scalar and array subclass exclusions work consistently', () => {
  assert.equal(math.matchesSubclassRule(-10, 8), true);
  assert.equal(math.matchesSubclassRule(-10, 10), false);
  assert.equal(math.matchesSubclassRule([1, 5, -10], 5), true);
  assert.equal(math.matchesSubclassRule([1, 5, -10], 8), false);
  assert.equal(math.matchesSubclassRule([1, 5, -10], 10), false);
});

test('piecewise row selection prefers the requested weapon profile', () => {
  const rows = [
    { type: null, min: 1, max: 300, sub: -10, id: 'melee-default' },
    { type: 'caster', min: 1, max: 300, sub: null, id: 'caster' },
    { type: 'druid', min: 1, max: 300, sub: 10, id: 'feral-staff' }
  ];

  assert.equal(math.findPiecewiseRow(rows, {
    subclassId: 8,
    profile: 'melee',
    level: 100
  }).id, 'melee-default');
  assert.equal(math.findPiecewiseRow(rows, {
    subclassId: 10,
    profile: 'caster',
    level: 100
  }).id, 'caster');
  assert.equal(math.findPiecewiseRow(rows, {
    subclassId: 10,
    profile: 'druid',
    level: 100
  }).id, 'feral-staff');
});

test('named weapon profiles never silently fall back to a generic curve', () => {
  const rows = [
    { type: null, min: 1, max: 300, sub: null, id: 'generic' },
    { type: 'caster', min: 1, max: 300, sub: 10, id: 'caster-staff' }
  ];

  assert.equal(math.findPiecewiseRow(rows, {
    subclassId: 10,
    profile: 'druid',
    level: 100
  }), null);
  assert.equal(math.findPiecewiseRow(rows, {
    subclassId: 10,
    profile: 'melee',
    level: 100
  }).id, 'generic');
});
