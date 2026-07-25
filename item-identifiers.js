(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ItemIdentifiers = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ItemClass = Object.freeze({
    WEAPON: 2,
    ARMOR: 4
  });

  const ItemQuality = Object.freeze({
    UNCOMMON: 2,
    RARE: 3,
    EPIC: 4,
    LEGENDARY: 5,
    ARTIFACT: 6
  });

  // AzerothCore InventoryType IDs. These are not EquipmentSlots IDs.
  const InventoryType = Object.freeze({
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
  });

  const ArmorSubclass = Object.freeze({
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
  });

  const WeaponSubclass = Object.freeze({
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
  });

  // A calculator profile is deliberately separate from AzerothCore identity.
  const WeaponProfile = Object.freeze({
    DEFAULT: 'default',
    CASTER: 'caster',
    DRUID: 'druid',
    // Compatibility aliases for older callers.
    MELEE: 'default',
    FERAL: 'druid'
  });

  const armorCompatibility = Object.freeze({
    [InventoryType.HEAD]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.NECK]: Object.freeze([0]),
    [InventoryType.SHOULDERS]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.BODY]: Object.freeze([0]),
    [InventoryType.CHEST]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.WAIST]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.LEGS]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.FEET]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.WRISTS]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.HANDS]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.FINGER]: Object.freeze([0]),
    [InventoryType.TRINKET]: Object.freeze([0]),
    [InventoryType.SHIELD]: Object.freeze([6]),
    [InventoryType.CLOAK]: Object.freeze([1]),
    [InventoryType.TABARD]: Object.freeze([0]),
    [InventoryType.ROBE]: Object.freeze([1, 2, 3, 4]),
    [InventoryType.HOLDABLE]: Object.freeze([0]),
    [InventoryType.RELIC]: Object.freeze([7, 8, 9, 10])
  });

  const weaponCompatibility = Object.freeze({
    [InventoryType.WEAPON]: Object.freeze([0, 4, 7, 13, 15]),
    [InventoryType.RANGED]: Object.freeze([2]),
    [InventoryType.TWO_HAND_WEAPON]: Object.freeze([1, 5, 6, 8, 10]),
    [InventoryType.WEAPON_MAIN_HAND]: Object.freeze([0, 4, 7, 13, 15]),
    [InventoryType.WEAPON_OFF_HAND]: Object.freeze([0, 4, 7, 13, 15]),
    [InventoryType.THROWN]: Object.freeze([16]),
    [InventoryType.RANGED_RIGHT]: Object.freeze([3, 18, 19])
  });

  function isSupportedQuality(qualityId) {
    return [
      ItemQuality.UNCOMMON,
      ItemQuality.RARE,
      ItemQuality.EPIC
    ].includes(qualityId);
  }

  function isSupportedItemTuple(itemClassId, inventoryTypeId, subclassId) {
    if (![itemClassId, inventoryTypeId, subclassId].every(Number.isInteger)) {
      return false;
    }

    const compatibility = itemClassId === ItemClass.ARMOR
      ? armorCompatibility
      : itemClassId === ItemClass.WEAPON
        ? weaponCompatibility
        : null;

    return Boolean(compatibility?.[inventoryTypeId]?.includes(subclassId));
  }

  return Object.freeze({
    ItemClass,
    ItemQuality,
    InventoryType,
    ArmorSubclass,
    WeaponSubclass,
    WeaponProfile,
    armorCompatibility,
    weaponCompatibility,
    isSupportedQuality,
    isSupportedItemTuple
  });
});
