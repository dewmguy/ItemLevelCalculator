(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ItemUncommonWeaponModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_DELAYS = Object.freeze({
    '13:0': 2300,
    '13:4': 2300,
    '13:7': 2200,
    '13:13': 2000,
    '13:15': 1700,
    '15:2': 2700,
    '17:1': 3400,
    '17:5': 3300,
    '17:6': 3200,
    '17:8': 3300,
    '17:10': 2700,
    '21:0': 2400,
    '21:4': 2000,
    '21:7': 1900,
    '21:13': 2600,
    '21:15': 1700,
    '22:0': 2000,
    '22:4': 1500,
    '22:7': 1500,
    '22:13': 2000,
    '22:15': 1600,
    '25:16': 1900,
    '26:3': 2700,
    '26:18': 2900,
    '26:19': 1700
  });

  const DPS_RULES = Object.freeze({
    13: level =>
      0.4042050606136029 +
      0.49734508151683776 * level +
      0.0007876333296000732 * Math.pow(level, 2) -
      0.0000013811950352316454 * Math.pow(level, 3),
    15: level =>
      0.22444917005698017 +
      0.5822163577210446 * level -
      0.0006990769934425673 * Math.pow(level, 2) +
      0.0000024109481894875313 * Math.pow(level, 3),
    17: level =>
      -1.2469017714620838 +
      0.7595359183093786 * level -
      0.00052 * Math.pow(level, 2) +
      0.0000031790771502211193 * Math.pow(level, 3),
    21: level =>
      0.1888986564358558 +
      0.514467630955437 * level +
      0.0001449871791498711 * Math.pow(level, 2) +
      0.0000022300382306673762 * Math.pow(level, 3),
    '21:caster': level =>
      0.4835370552909741 +
      0.8668090226204177 * level -
      0.006599272125728605 * Math.pow(level, 2) +
      0.000020415414066691894 * Math.pow(level, 3),
    22: level =>
      0.9718419506869891 +
      0.41682208197155196 * level +
      0.001587412068902008 * Math.pow(level, 2) -
      0.0000030964817997803457 * Math.pow(level, 3),
    25: level =>
      2.766343576702119 +
      0.46057309703714083 * level +
      0.0031338924726831943 * Math.pow(level, 2) -
      0.000008297133052168907 * Math.pow(level, 3),
    '26:ranged': level =>
      1.4129016032445012 +
      0.4961550555995297 * level +
      0.00032039463941715415 * Math.pow(level, 2) -
      8.224505599804983e-7 * Math.pow(level, 3),
    '26:wand': level =>
      3.4857134522863866 +
      0.48418168318576166 * level +
      0.005842172301613738 * Math.pow(level, 2) -
      0.000014078423351119631 * Math.pow(level, 3)
  });

  // Representative uncommon caster-staff observations. A single quadratic
  // flattened the low-level series too aggressively, missing Staff of the
  // Hand at ilvl 20 and the WotLK leveling-staff series at ilvl 138+.
  const CASTER_STAFF_DPS_ANCHORS = Object.freeze([
    [1, 1.235672],
    [20, 12.954545],
    [25, 16.842105],
    [40, 28.888889],
    [62, 48.235294],
    [81, 54.852941],
    [99, 56.774194],
    [114, 60],
    [138, 74.5],
    [146, 77.333333],
    [154, 80.5],
    [158, 82.413793],
    [174, 89.333333]
  ].map(anchor => Object.freeze(anchor)));

  function interpolateAnchors(anchors, level) {
    if (!Array.isArray(anchors) || anchors.length < 2 ||
        !Number.isFinite(level)) {
      return null;
    }
    const upperIndex = anchors.findIndex(anchor => anchor[0] >= level);
    const index = upperIndex < 0
      ? anchors.length - 1
      : Math.max(1, upperIndex);
    const lower = anchors[index - 1];
    const upper = anchors[index];
    const span = upper[0] - lower[0];
    return lower[1] + (
      (level - lower[0]) / span
    ) * (upper[1] - lower[1]);
  }

  function dpsRule(inventoryType, subclass, profile) {
    if (inventoryType === 17 &&
        subclass === 10 &&
        profile === 'caster') {
      return {
        name: 'uncommon caster-staff empirical anchors',
        calculate: level => interpolateAnchors(
          CASTER_STAFF_DPS_ANCHORS,
          level
        )
      };
    }
    if ([13, 21].includes(inventoryType) &&
        [4, 7, 15].includes(subclass) &&
        profile === 'caster') {
      return {
        name: 'uncommon caster one-hand polynomial',
        calculate: DPS_RULES['21:caster']
      };
    }
    if (inventoryType === 26) {
      const key = subclass === 19 ? '26:wand' : '26:ranged';
      if (subclass !== 19 && ![3, 18].includes(subclass)) {
        return null;
      }
      return {
        name: subclass === 19
          ? 'uncommon wand polynomial'
          : 'uncommon gun/crossbow polynomial',
        calculate: DPS_RULES[key]
      };
    }
    const calculate = DPS_RULES[inventoryType];
    return typeof calculate === 'function'
      ? {
          name: `uncommon InventoryType ${inventoryType} polynomial`,
          calculate
        }
      : null;
  }

  function damageCoefficient(inventoryType, subclass, level) {
    if (inventoryType === 17) {
      // Clean random-enchantment two-hand weapons use an observed range
      // width of approximately 40% of average swing damage.
      return 0.4;
    }
    // The corresponding one-hand and ranged series cluster at 60%.
    return [13, 15, 21, 22, 25, 26].includes(inventoryType)
      ? 0.6
      : null;
  }

  function calculate({
    level,
    inventoryType,
    subclass,
    profile = null,
    delay = null
  }) {
    if (![level, inventoryType, subclass].every(Number.isFinite) ||
        level < 1) {
      return null;
    }
    const rule = dpsRule(inventoryType, subclass, profile);
    const attackSpeed = Number.isFinite(delay) && delay > 0
      ? delay
      : DEFAULT_DELAYS[`${inventoryType}:${subclass}`];
    const coefficient = damageCoefficient(
      inventoryType,
      subclass,
      level
    );
    if (!rule || !Number.isFinite(attackSpeed) ||
        !Number.isFinite(coefficient)) {
      return null;
    }

    const dps = rule.calculate(level);
    const swingDamage = dps * attackSpeed / 1000;
    const exactMinimum = swingDamage * (1 - coefficient / 2);
    const exactMaximum = swingDamage * (1 + coefficient / 2);
    return {
      dps,
      delay: attackSpeed,
      coefficient,
      minimum: Math.ceil(exactMinimum),
      maximum: Math.ceil(exactMaximum),
      equations: {
        source: rule.name,
        dps,
        swingDamage,
        coefficient,
        exactMinimum,
        exactMaximum,
        roundedMinimum: Math.ceil(exactMinimum),
        roundedMaximum: Math.ceil(exactMaximum)
      }
    };
  }

  return Object.freeze({
    DEFAULT_DELAYS,
    DPS_RULES,
    CASTER_STAFF_DPS_ANCHORS,
    interpolateAnchors,
    damageCoefficient,
    calculate
  });
});
