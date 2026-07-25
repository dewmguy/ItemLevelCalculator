(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports
      ? require('./random-property-points.js')
      : root.ItemRandomPropertyPoints
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ItemWeaponSpecializationModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (
  randomPropertyPoints
) {
  'use strict';

  if (!randomPropertyPoints) {
    throw new Error(
      'ItemRandomPropertyPoints is required by ItemWeaponSpecializationModel.'
    );
  }

  const PRE_WRATH_MAXIMUM_ITEM_LEVEL = 165;
  const PRE_WRATH_SPELL_POWER_PER_SACRIFICED_DPS = 4;
  const STANDARD_SPELL_POWER_CAPACITY_MULTIPLIER = 12 / 5;
  const FERAL_ATTACK_POWER_PER_DPS = 14;
  const FERAL_ATTACK_POWER_OFFSET = 767;
  const FERAL_WEAPON_INVENTORY_TYPES = Object.freeze(
    [13, 17, 21, 22]
  );
  const CASTER_ONE_HAND_SUBCLASSES = Object.freeze(
    [4, 7, 15]
  );

  function isDruidWeapon(inventoryType) {
    return FERAL_WEAPON_INVENTORY_TYPES.includes(inventoryType);
  }

  function isCasterWeapon(inventoryType, subclass) {
    return (
      inventoryType === 17 &&
      subclass === 10
    ) || (
      [13, 21].includes(inventoryType) &&
      CASTER_ONE_HAND_SUBCLASSES.includes(subclass)
    );
  }

  function feralAttackPower(weaponDps, extraDps = 0) {
    if (![weaponDps, extraDps].every(Number.isFinite)) {
      return 0;
    }
    return Math.max(
      0,
      Math.trunc(
        (weaponDps + extraDps) * FERAL_ATTACK_POWER_PER_DPS
      ) - FERAL_ATTACK_POWER_OFFSET
    );
  }

  function standardSpellPowerCeiling(level, quality) {
    const fullWeaponCapacity = randomPropertyPoints.formulaPoints(
      quality,
      level,
      17
    );
    if (!Number.isFinite(fullWeaponCapacity)) {
      return null;
    }
    return Math.max(
      0,
      Math.round(
        fullWeaponCapacity * STANDARD_SPELL_POWER_CAPACITY_MULTIPLIER
      )
    );
  }

  function casterBaseSpellPower({
    level,
    quality,
    defaultWeaponDps,
    casterWeaponDps
  }) {
    if (![level, quality].every(Number.isFinite) || level < 1) {
      return null;
    }
    const ceiling = standardSpellPowerCeiling(level, quality);
    if (!Number.isFinite(ceiling)) {
      return null;
    }

    // WotLK caster weapons use a standardized base spell-power series. The
    // local 3.3.5 item corpus follows 12/5 of the full-weapon random-property
    // capacity across uncommon, rare, and epic weapons.
    if (level > PRE_WRATH_MAXIMUM_ITEM_LEVEL) {
      return ceiling;
    }

    // Vanilla/TBC items are less standardized. Only the observed DPS
    // sacrifice becomes free spell power; ordinary spell power remains part
    // of the editable stat budget. Capping the credit prevents noisy DPS
    // regressions from exceeding the standardized weapon ceiling.
    if (![defaultWeaponDps, casterWeaponDps].every(Number.isFinite)) {
      return null;
    }
    const sacrificedDps = Math.max(
      0,
      defaultWeaponDps - casterWeaponDps
    );
    const dpsCredit = Math.round(
      sacrificedDps * PRE_WRATH_SPELL_POWER_PER_SACRIFICED_DPS
    );
    return Math.min(dpsCredit, ceiling);
  }

  return Object.freeze({
    PRE_WRATH_MAXIMUM_ITEM_LEVEL,
    PRE_WRATH_SPELL_POWER_PER_SACRIFICED_DPS,
    STANDARD_SPELL_POWER_CAPACITY_MULTIPLIER,
    FERAL_ATTACK_POWER_PER_DPS,
    FERAL_ATTACK_POWER_OFFSET,
    FERAL_WEAPON_INVENTORY_TYPES,
    CASTER_ONE_HAND_SUBCLASSES,
    isDruidWeapon,
    isCasterWeapon,
    feralAttackPower,
    standardSpellPowerCeiling,
    casterBaseSpellPower
  });
});
