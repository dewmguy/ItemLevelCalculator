const assert = require('node:assert/strict');
const test = require('node:test');

const specialization = require('../weapon-specialization-model.js');
const uncommonWeapon = require('../uncommon-weapon-model.js');

test('druid presentation follows AzerothCore inventory and DPS rules', () => {
  assert.equal(specialization.isDruidWeapon(13), true);
  assert.equal(specialization.isDruidWeapon(17), true);
  assert.equal(specialization.isDruidWeapon(21), true);
  assert.equal(specialization.isDruidWeapon(22), true);
  assert.equal(specialization.isDruidWeapon(15), false);

  assert.equal(specialization.feralAttackPower(54.85), 0);
  assert.equal(specialization.feralAttackPower(54.9), 1);
  assert.equal(specialization.feralAttackPower(100), 633);
});

test('caster eligibility is limited to observed caster weapon families', () => {
  assert.equal(specialization.isCasterWeapon(17, 10), true);
  assert.equal(specialization.isCasterWeapon(13, 4), true);
  assert.equal(specialization.isCasterWeapon(21, 7), true);
  assert.equal(specialization.isCasterWeapon(21, 15), true);
  assert.equal(specialization.isCasterWeapon(17, 8), false);
  assert.equal(specialization.isCasterWeapon(21, 0), false);
  assert.equal(specialization.isCasterWeapon(22, 15), false);
});

test('pre-Wrath caster spell power is a capped four-to-one DPS credit', () => {
  const baseSpellPower = specialization.casterBaseSpellPower({
    level: 115,
    quality: 4,
    defaultWeaponDps: 87.5949377067159,
    casterWeaponDps: 41.49020179014268
  });

  assert.equal(baseSpellPower, 185);
  assert.equal(
    baseSpellPower,
    Math.ceil((87.5949377067159 - 41.49020179014268) * 4)
  );
});

test('floating point noise does not create free pre-Wrath spell power', () => {
  assert.equal(
    specialization.casterBaseSpellPower({
      level: 20,
      quality: 2,
      defaultWeaponDps: 12.9545450001,
      casterWeaponDps: 12.954545
    }),
    0
  );
});

test('pre-Wrath caster credit cannot exceed the weapon ceiling', () => {
  const ceiling = specialization.standardSpellPowerCeiling(154, 4);
  const baseSpellPower = specialization.casterBaseSpellPower({
    level: 154,
    quality: 4,
    defaultWeaponDps: 200,
    casterWeaponDps: 1
  });

  assert.equal(ceiling, 266);
  assert.equal(baseSpellPower, ceiling);
});

test('low-level uncommon caster staff receives credit from its own DPS trade', () => {
  const defaultStaff = uncommonWeapon.calculate({
    level: 20,
    inventoryType: 17,
    subclass: 10,
    profile: 'default'
  });
  const casterStaff = uncommonWeapon.calculate({
    level: 20,
    inventoryType: 17,
    subclass: 10,
    profile: 'caster'
  });
  const baseSpellPower = specialization.casterBaseSpellPower({
    level: 20,
    quality: 2,
    defaultWeaponDps: defaultStaff.dps,
    casterWeaponDps: casterStaff.dps
  });

  assert.ok(casterStaff.dps < defaultStaff.dps);
  assert.ok(Math.abs(casterStaff.dps - 12.954545) < 1e-9);
  assert.equal(baseSpellPower, 4);
});

test('epic caster staff anchors reproduce both Dying Light versions', () => {
  assert.equal(specialization.epicCasterStaffDps(264), 219.047619);
  assert.equal(specialization.epicCasterStaffDps(277), 250);
  assert.ok(specialization.epicCasterStaffDps(276) < 250);
  assert.ok(specialization.epicCasterStaffDps(278) > 250);
  for (let level = 191; level <= 300; level++) {
    assert.ok(
      specialization.epicCasterStaffDps(level) >
        specialization.epicCasterStaffDps(level - 1)
    );
  }
});

test('Wrath caster spell power follows the standardized corpus series', () => {
  assert.equal(
    specialization.casterBaseSpellPower({
      level: 200,
      quality: 4,
      defaultWeaponDps: 0,
      casterWeaponDps: 0
    }),
    405
  );
  assert.equal(
    specialization.casterBaseSpellPower({
      level: 277,
      quality: 4,
      defaultWeaponDps: 0,
      casterWeaponDps: 0
    }),
    836
  );
});
