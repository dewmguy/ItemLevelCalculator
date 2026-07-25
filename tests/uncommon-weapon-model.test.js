'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const weapon = require('../uncommon-weapon-model.js');

test('Invasion Blade DPS remains closely approximated', () => {
  const damage = weapon.calculate({
    level: 182,
    inventoryType: 17,
    subclass: 8,
    delay: 3500
  });

  assert.ok(Math.abs(damage.dps - 138.71428571428572) < 0.25);
  assert.equal(damage.minimum, 390);
  assert.equal(damage.maximum, 584);
});

test('uncommon range coefficients follow the observed weapon families', () => {
  assert.equal(weapon.damageCoefficient(17, 8, 182), 0.4);
  assert.equal(weapon.damageCoefficient(13, 8, 182), 0.6);
  assert.equal(weapon.damageCoefficient(26, 19, 182), 0.6);
});

test('damage JSON exposes the source equation and rounding', () => {
  const result = weapon.calculate({
    level: 182,
    inventoryType: 17,
    subclass: 8,
    delay: 3500
  });

  assert.match(result.equations.source, /uncommon/);
  assert.equal(result.minimum, Math.ceil(result.equations.exactMinimum));
  assert.equal(result.maximum, Math.ceil(result.equations.exactMaximum));
});
