'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const pricing = require('../pricing-model.js');

test('known uncommon weapon anchors are reproduced exactly', () => {
  assert.equal(pricing.sellPrice({
    itemClass: 2,
    inventoryType: 17,
    subclass: 8,
    quality: 2,
    level: 182
  }).copper, 144223);
  assert.equal(pricing.sellPrice({
    itemClass: 2,
    inventoryType: 17,
    subclass: 8,
    quality: 2,
    level: 130
  }).copper, 97870);
});

test('levels between weapon anchors use deterministic linear interpolation', () => {
  assert.equal(pricing.sellPrice({
    itemClass: 2,
    inventoryType: 17,
    subclass: 8,
    quality: 2,
    level: 180
  }).copper, Math.round((140748 + 144223) / 2));
});

test('uncommon random armor uses a monotone empirical base curve', () => {
  const armor = pricing.sellPrice({
    itemClass: 4,
    inventoryType: 5,
    subclass: 4,
    quality: 2,
    level: 182
  });
  assert.equal(armor.copper, 78592);
  assert.match(armor.source, /armor anchors/);
});

test('low-level weapon anchors cover the observed uncommon range', () => {
  const lowWeapon = pricing.sellPrice({
    itemClass: 2,
    inventoryType: 17,
    subclass: 8,
    quality: 2,
    level: 60
  });

  assert.equal(lowWeapon.copper, 48854);
  assert.match(lowWeapon.source, /weapon anchors/);
});
