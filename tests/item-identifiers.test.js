'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const IDs = require('../item-identifiers.js');

test('shirt uses AzerothCore miscellaneous armor subclass', () => {
  assert.equal(IDs.isSupportedItemTuple(
    IDs.ItemClass.ARMOR,
    IDs.InventoryType.BODY,
    IDs.ArmorSubclass.MISCELLANEOUS
  ), true);
  assert.equal(IDs.isSupportedItemTuple(
    IDs.ItemClass.ARMOR,
    IDs.InventoryType.BODY,
    IDs.ArmorSubclass.CLOTH
  ), false);
});

test('weapon and armor subclass namespaces remain separate', () => {
  assert.equal(IDs.isSupportedItemTuple(
    IDs.ItemClass.ARMOR,
    IDs.InventoryType.SHIELD,
    IDs.ArmorSubclass.SHIELD
  ), true);
  assert.equal(IDs.isSupportedItemTuple(
    IDs.ItemClass.WEAPON,
    IDs.InventoryType.TWO_HAND_WEAPON,
    IDs.WeaponSubclass.POLEARM
  ), true);
  assert.equal(IDs.isSupportedItemTuple(
    IDs.ItemClass.ARMOR,
    IDs.InventoryType.SHIELD,
    IDs.WeaponSubclass.POLEARM
  ), true);
  assert.notEqual(IDs.ArmorSubclass.SHIELD, undefined);
  assert.notEqual(IDs.WeaponSubclass.POLEARM, undefined);
});

test('only modeled qualities are accepted', () => {
  assert.equal(IDs.isSupportedQuality(IDs.ItemQuality.UNCOMMON), true);
  assert.equal(IDs.isSupportedQuality(IDs.ItemQuality.RARE), true);
  assert.equal(IDs.isSupportedQuality(IDs.ItemQuality.EPIC), true);
  assert.equal(IDs.isSupportedQuality(IDs.ItemQuality.LEGENDARY), false);
});
