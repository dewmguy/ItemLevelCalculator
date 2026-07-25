'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const calculator = require('../calculator-core.js');
const points = require('../random-property-points.js');

test('single-stat generation never recalculates above its target level', () => {
  const inventoryTypes = [17, 10, 11, 13, 26];
  for (const inventoryType of inventoryTypes) {
    for (let level = 10; level <= 300; level += 1) {
      if (points.uncommonPoints(level, inventoryType) <= 0) {
        continue;
      }
      const generated = calculator.calculate({
        mode: 'stats',
        itemClass: [13, 15, 17, 21, 22, 25, 26].includes(inventoryType)
          ? 2
          : 4,
        inventoryType,
        quality: 2,
        level,
        stats: [{ type: 6, percent: 100 }]
      });
      assert.equal(generated.ok, true);
      assert.ok(
        generated.result.recalculatedLevel <= level,
        `slot ${inventoryType}, target ${level}, result ` +
          `${generated.result.recalculatedLevel}`
      );
      assert.equal(
        points.uncommonPoints(
          generated.result.recalculatedLevel,
          inventoryType
        ),
        points.uncommonPoints(level, inventoryType)
      );
    }
  }
});
