'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const IDs = require('../item-identifiers.js');

const entries = object => Object.entries(object);

const expectedItemClasses = {
  WEAPON: 2,
  ARMOR: 4
};

const expectedQualities = {
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  ARTIFACT: 6
};

const expectedInventoryTypes = {
  HEAD: 1,
  NECK: 2,
  SHOULDERS: 3,
  BODY: 4,
  CHEST: 5,
  WAIST: 6,
  LEGS: 7,
  FEET: 8,
  WRISTS: 9,
  HANDS: 10,
  FINGER: 11,
  TRINKET: 12,
  WEAPON: 13,
  SHIELD: 14,
  RANGED: 15,
  CLOAK: 16,
  TWO_HAND_WEAPON: 17,
  TABARD: 19,
  ROBE: 20,
  WEAPON_MAIN_HAND: 21,
  WEAPON_OFF_HAND: 22,
  HOLDABLE: 23,
  THROWN: 25,
  RANGED_RIGHT: 26,
  RELIC: 28
};

const expectedArmorSubclasses = {
  MISCELLANEOUS: 0,
  CLOTH: 1,
  LEATHER: 2,
  MAIL: 3,
  PLATE: 4,
  SHIELD: 6,
  LIBRAM: 7,
  IDOL: 8,
  TOTEM: 9,
  SIGIL: 10
};

const expectedWeaponSubclasses = {
  ONE_HAND_AXE: 0,
  TWO_HAND_AXE: 1,
  BOW: 2,
  GUN: 3,
  ONE_HAND_MACE: 4,
  TWO_HAND_MACE: 5,
  POLEARM: 6,
  ONE_HAND_SWORD: 7,
  TWO_HAND_SWORD: 8,
  STAFF: 10,
  FIST_WEAPON: 13,
  DAGGER: 15,
  THROWN: 16,
  CROSSBOW: 18,
  WAND: 19,
  FISHING_POLE: 20
};

const expectedProfiles = {
  MELEE: 'melee',
  CASTER: 'caster',
  FERAL: 'druid'
};

const expectedArmorCompatibility = {
  1: [1, 2, 3, 4],
  2: [0],
  3: [1, 2, 3, 4],
  4: [0],
  5: [1, 2, 3, 4],
  6: [1, 2, 3, 4],
  7: [1, 2, 3, 4],
  8: [1, 2, 3, 4],
  9: [1, 2, 3, 4],
  10: [1, 2, 3, 4],
  11: [0],
  12: [0],
  14: [6],
  16: [1],
  19: [0],
  20: [1, 2, 3, 4],
  23: [0],
  28: [7, 8, 9, 10]
};

const expectedWeaponCompatibility = {
  13: [0, 4, 7, 13, 15],
  15: [2],
  17: [1, 5, 6, 8, 10],
  21: [0, 4, 7, 13, 15],
  22: [0, 4, 7, 13, 15],
  25: [16],
  26: [3, 18, 19]
};

test('canonical exported enums exactly match the frozen contract', () => {
  assert.deepEqual(IDs.ItemClass, expectedItemClasses);
  assert.deepEqual(IDs.ItemQuality, expectedQualities);
  assert.deepEqual(IDs.InventoryType, expectedInventoryTypes);
  assert.deepEqual(IDs.ArmorSubclass, expectedArmorSubclasses);
  assert.deepEqual(IDs.WeaponSubclass, expectedWeaponSubclasses);
  assert.deepEqual(IDs.WeaponProfile, expectedProfiles);
});

test('identifier collections and compatibility maps are immutable', () => {
  for (const object of [
    IDs,
    IDs.ItemClass,
    IDs.ItemQuality,
    IDs.InventoryType,
    IDs.ArmorSubclass,
    IDs.WeaponSubclass,
    IDs.WeaponProfile,
    IDs.armorCompatibility,
    IDs.weaponCompatibility
  ]) {
    assert.equal(Object.isFrozen(object), true);
  }
  for (const subclassIds of [
    ...Object.values(IDs.armorCompatibility),
    ...Object.values(IDs.weaponCompatibility)
  ]) {
    assert.equal(Object.isFrozen(subclassIds), true);
  }
});

test('supported quality set is exactly uncommon, rare, and epic', () => {
  for (let qualityId = 0; qualityId <= 7; qualityId += 1) {
    assert.equal(
      IDs.isSupportedQuality(qualityId),
      [2, 3, 4].includes(qualityId),
      `quality ${qualityId}`
    );
  }
  assert.equal(IDs.isSupportedQuality('2'), false);
  assert.equal(IDs.isSupportedQuality(null), false);
});

test('armor compatibility matrix is exhaustive', () => {
  assert.deepEqual(IDs.armorCompatibility, expectedArmorCompatibility);

  for (const [inventoryTypeId, subclassIds] of entries(expectedArmorCompatibility)) {
    for (const subclassId of subclassIds) {
      assert.equal(
        IDs.isSupportedItemTuple(
          IDs.ItemClass.ARMOR,
          Number(inventoryTypeId),
          subclassId
        ),
        true,
        `armor tuple 4/${inventoryTypeId}/${subclassId}`
      );
    }
  }
});

test('weapon compatibility matrix is exhaustive', () => {
  assert.deepEqual(IDs.weaponCompatibility, expectedWeaponCompatibility);

  for (const [inventoryTypeId, subclassIds] of entries(expectedWeaponCompatibility)) {
    for (const subclassId of subclassIds) {
      assert.equal(
        IDs.isSupportedItemTuple(
          IDs.ItemClass.WEAPON,
          Number(inventoryTypeId),
          subclassId
        ),
        true,
        `weapon tuple 2/${inventoryTypeId}/${subclassId}`
      );
    }
  }
});

test('every absent tuple is rejected within the modeled identifier space', () => {
  const subclassIds = Array.from({ length: 21 }, (_, id) => id);
  const inventoryTypeIds = Array.from({ length: 29 }, (_, id) => id);

  for (const [itemClassId, compatibility] of [
    [IDs.ItemClass.ARMOR, expectedArmorCompatibility],
    [IDs.ItemClass.WEAPON, expectedWeaponCompatibility]
  ]) {
    for (const inventoryTypeId of inventoryTypeIds) {
      for (const subclassId of subclassIds) {
        const expected = compatibility[inventoryTypeId]?.includes(subclassId) ?? false;
        assert.equal(
          IDs.isSupportedItemTuple(itemClassId, inventoryTypeId, subclassId),
          expected,
          `tuple ${itemClassId}/${inventoryTypeId}/${subclassId}`
        );
      }
    }
  }
});

test('class namespace, numeric normalization, and unknown values fail closed', () => {
  assert.equal(IDs.isSupportedItemTuple(0, 13, 0), false);
  assert.equal(IDs.isSupportedItemTuple(3, 13, 0), false);
  assert.equal(IDs.isSupportedItemTuple(5, 13, 0), false);
  assert.equal(IDs.isSupportedItemTuple('2', 13, 0), false);
  assert.equal(IDs.isSupportedItemTuple(2, '13', 0), false);
  assert.equal(IDs.isSupportedItemTuple(2, 13, '0'), false);
  assert.equal(IDs.isSupportedItemTuple(null, null, null), false);

  assert.equal(IDs.isSupportedItemTuple(4, 14, 6), true);
  assert.equal(IDs.isSupportedItemTuple(2, 17, 6), true);
  assert.equal(IDs.isSupportedItemTuple(4, 17, 6), false);
  assert.equal(IDs.isSupportedItemTuple(2, 14, 6), false);
});

test('known AzerothCore tuples without calculator models remain unsupported', () => {
  assert.equal(
    IDs.isSupportedItemTuple(
      IDs.ItemClass.WEAPON,
      IDs.InventoryType.TWO_HAND_WEAPON,
      IDs.WeaponSubclass.FISHING_POLE
    ),
    false
  );
  assert.equal(
    IDs.isSupportedItemTuple(
      IDs.ItemClass.ARMOR,
      IDs.InventoryType.BODY,
      IDs.ArmorSubclass.CLOTH
    ),
    false
  );
  assert.equal(
    IDs.isSupportedItemTuple(
      IDs.ItemClass.ARMOR,
      IDs.InventoryType.BODY,
      IDs.ArmorSubclass.MISCELLANEOUS
    ),
    true
  );
});

test('weapon profiles are independent of identity tuples', () => {
  const staffTuple = [
    IDs.ItemClass.WEAPON,
    IDs.InventoryType.TWO_HAND_WEAPON,
    IDs.WeaponSubclass.STAFF
  ];

  assert.equal(IDs.isSupportedItemTuple(...staffTuple), true);
  assert.deepEqual(Object.values(IDs.WeaponProfile), ['melee', 'caster', 'druid']);
  assert.equal(staffTuple.includes(IDs.WeaponProfile.MELEE), false);
  assert.equal(staffTuple.includes(IDs.WeaponProfile.CASTER), false);
  assert.equal(staffTuple.includes(IDs.WeaponProfile.FERAL), false);
});
