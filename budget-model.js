(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports
      ? require('./model-math.js')
      : root.ItemModelMath,
    typeof module === 'object' && module.exports
      ? require('./random-property-points.js')
      : root.ItemRandomPropertyPoints
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ItemBudgetModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (
  modelMath,
  randomPropertyPoints
) {
  'use strict';

  if (!modelMath) {
    throw new Error('ItemModelMath is required by ItemBudgetModel.');
  }
  if (!randomPropertyPoints) {
    throw new Error(
      'ItemRandomPropertyPoints is required by ItemBudgetModel.'
    );
  }

  const MAXIMUM_ITEM_LEVEL = 300;
  const EPIC_SOCKET_CALIBRATION_LEVEL = 277;
  const WEAPON_INVENTORY_TYPES = Object.freeze(
    new Set([13, 15, 17, 21, 22, 25, 26])
  );

  function firstMatchingRule(quality, level, rules) {
    const match = rules.find(rule =>
      rule.quality === quality &&
      level >= rule.min
    );
    return match?.mod ?? null;
  }

  const QUALITY_RULES = Object.freeze({
    4: Object.freeze([
      { min: 200, multiplier: 1.320, base: -120 },
      { min: 100, multiplier: 0.700, base: -2 },
      { min: 1, multiplier: 0.689, base: 1 }
    ]),
    3: Object.freeze([
      { min: 136, multiplier: 0.880, base: -39.25 },
      { min: 80, multiplier: 0.674, base: -8 },
      { min: 1, multiplier: 0.641, base: -4 }
    ]),
    2: Object.freeze([
      { min: 130, multiplier: 0.801, base: -38.3 },
      { min: 80, multiplier: 0.505, base: -4.5 },
      { min: 1, multiplier: 0.495, base: -2.85 }
    ])
  });

  const QUALITY_NAMES = Object.freeze({
    2: 'uncommon',
    3: 'rare',
    4: 'epic'
  });

  const ARMOR_SLOT_RULES = Object.freeze({
    1: [
      { quality: 4, min: 200, mod: 16 / 16 },
      { quality: 4, min: 90, mod: 11 / 16 },
      { quality: 4, min: 1, mod: 16 / 16 },
      { quality: 3, min: 1, mod: 16 / 16 },
      { quality: 2, min: 1, mod: 16 / 16 }
    ],
    2: [
      { quality: 4, min: 200, mod: 4 / 16 },
      { quality: 4, min: 90, mod: 3 / 16 },
      { quality: 4, min: 1, mod: 4 / 16 },
      { quality: 3, min: 1, mod: 4 / 16 },
      { quality: 2, min: 1, mod: 4 / 16 }
    ],
    3: [
      { quality: 4, min: 200, mod: 8 / 16 },
      { quality: 4, min: 90, mod: 6 / 16 },
      { quality: 4, min: 1, mod: 8 / 16 },
      { quality: 3, min: 1, mod: 8 / 16 },
      { quality: 2, min: 1, mod: 8 / 16 }
    ],
    6: [
      { quality: 4, min: 200, mod: 8 / 16 },
      { quality: 4, min: 90, mod: 6 / 16 },
      { quality: 4, min: 1, mod: 8 / 16 },
      { quality: 3, min: 1, mod: 8 / 16 },
      { quality: 2, min: 1, mod: 8 / 16 }
    ],
    7: [
      { quality: 4, min: 200, mod: 16 / 16 },
      { quality: 4, min: 90, mod: 12 / 16 },
      { quality: 4, min: 1, mod: 16 / 16 },
      { quality: 3, min: 1, mod: 16 / 16 },
      { quality: 2, min: 1, mod: 16 / 16 }
    ],
    8: [
      { quality: 4, min: 200, mod: 8 / 16 },
      { quality: 4, min: 90, mod: 6 / 16 },
      { quality: 4, min: 1, mod: 8 / 16 },
      { quality: 3, min: 1, mod: 8 / 16 },
      { quality: 2, min: 1, mod: 8 / 16 }
    ],
    9: [
      { quality: 4, min: 200, mod: 4 / 16 },
      { quality: 4, min: 90, mod: 3 / 16 },
      { quality: 4, min: 1, mod: 4 / 16 },
      { quality: 3, min: 1, mod: 4 / 16 },
      { quality: 2, min: 1, mod: 4 / 16 }
    ],
    10: [
      { quality: 4, min: 200, mod: 8 / 16 },
      { quality: 4, min: 90, mod: 6 / 16 },
      { quality: 4, min: 1, mod: 8 / 16 },
      { quality: 3, min: 1, mod: 8 / 16 },
      { quality: 2, min: 1, mod: 8 / 16 }
    ],
    11: [
      { quality: 4, min: 200, mod: 4 / 16 },
      { quality: 4, min: 90, mod: 3 / 16 },
      { quality: 4, min: 1, mod: 4 / 16 },
      { quality: 3, min: 1, mod: 4 / 16 },
      { quality: 2, min: 1, mod: 4 / 16 }
    ],
    12: [
      { quality: 4, min: 90, mod: 6 / 16 },
      { quality: 4, min: 1, mod: 8 / 16 },
      { quality: 3, min: 80, mod: 11 / 16 },
      { quality: 3, min: 1, mod: 8 / 16 },
      { quality: 2, min: 1, mod: 8 / 16 }
    ],
    14: [
      { quality: 4, min: 90, mod: 3 / 16 },
      { quality: 4, min: 1, mod: 4 / 16 },
      { quality: 3, min: 1, mod: 4 / 16 },
      { quality: 2, min: 1, mod: 4 / 16 }
    ],
    16: [
      { quality: 4, min: 90, mod: 3 / 16 },
      { quality: 4, min: 1, mod: 4 / 16 },
      { quality: 3, min: 1, mod: 4 / 16 },
      { quality: 2, min: 80, mod: 4 / 16 },
      { quality: 2, min: 1, mod: 3 / 16 }
    ]
  });

  const STATIC_SLOT_MODS = Object.freeze({
    4: Object.freeze({
      4: 1 / 32,
      5: 16 / 16,
      19: 1 / 32,
      20: 16 / 16,
      23: 3 / 16,
      28: 1 / 32
    }),
    2: Object.freeze({
      13: 7 / 16,
      15: 16 / 16,
      17: 16 / 16,
      21: 7 / 16,
      22: 7 / 16,
      25: 5 / 16,
      26: 5 / 16
    })
  });

  const UNIT_STAT_MODS = Object.freeze({
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    12: 1,
    13: 1,
    14: 1,
    15: 1,
    21: 1,
    31: 1,
    32: 1,
    35: 1,
    36: 1,
    37: 1,
    44: 1,
    arcane_res: 1,
    fire_res: 1,
    nature_res: 1,
    frost_res: 1,
    shadow_res: 1
  });

  function qualityMod(quality, level) {
    if ([2, 3, 4].includes(quality)) {
      return randomPropertyPoints.formulaPoints(quality, level, 17);
    }
    const rule = QUALITY_RULES[quality]?.find(candidate => level >= candidate.min);
    return rule ? rule.multiplier * level + rule.base : null;
  }

  function slotMod(itemClass, inventoryType, quality, level) {
    const dynamicRules = itemClass === 4 ? ARMOR_SLOT_RULES[inventoryType] : null;
    if (dynamicRules) {
      return firstMatchingRule(quality, level, dynamicRules);
    }
    return STATIC_SLOT_MODS[itemClass]?.[inventoryType] ?? null;
  }

  function accessorySlot(inventoryType) {
    return [2, 11, 12, 23].includes(inventoryType);
  }

  function socketAccessorySlot(inventoryType) {
    return [2, 11, 14, 23].includes(inventoryType);
  }

  function effectiveItemClass(itemClass, inventoryType) {
    if (itemClass === 2 || itemClass === 4) {
      return itemClass;
    }
    return WEAPON_INVENTORY_TYPES.has(inventoryType) ? 2 : 4;
  }

  function progressiveSocketMod(inventoryType, level) {
    const accessory = socketAccessorySlot(inventoryType);
    const base = accessory ? 10 : 20;
    const slope = accessory ? 1 / 3 : 2 / 7;
    return base + Math.max(0, level - 130) * slope;
  }

  function epicSocketMod(
    socketType,
    itemClass,
    inventoryType,
    level
  ) {
    const at200 = progressiveSocketMod(inventoryType, Math.min(level, 200));
    if (level <= 200) {
      return at200;
    }

    const resolvedClass = effectiveItemClass(itemClass, inventoryType);
    if (resolvedClass === 2) {
      return 40;
    }

    const targetAt277 = socketType === 'meta_socket' ? 80 : 48;
    return at200 + (
      targetAt277 - at200
    ) * (
      level - 200
    ) / (
      EPIC_SOCKET_CALIBRATION_LEVEL - 200
    );
  }

  function socketMod(
    inventoryType,
    quality,
    level,
    itemClass = null,
    socketType = null
  ) {
    if (quality === 3) {
      return progressiveSocketMod(inventoryType, level);
    }
    if (quality === 4) {
      return epicSocketMod(
        socketType,
        itemClass,
        inventoryType,
        level
      );
    }

    const accessory = socketAccessorySlot(inventoryType);
    const rules = accessory
      ? [
          { quality: 2, min: 1, mod: 5 }
        ]
      : [
          { quality: 2, min: 1, mod: 10 }
        ];
    return firstMatchingRule(quality, level, rules);
  }

  function statMod(
    statType,
    inventoryType,
    quality,
    level,
    itemClass = null
  ) {
    if (Object.prototype.hasOwnProperty.call(UNIT_STAT_MODS, statType)) {
      return UNIT_STAT_MODS[statType];
    }

    if (['meta_socket', 'red_socket', 'blue_socket', 'yellow_socket'].includes(statType)) {
      return socketMod(
        inventoryType,
        quality,
        level,
        itemClass,
        statType
      );
    }

    switch (String(statType)) {
      case 'armor':
        return firstMatchingRule(quality, level, [
          { quality: 4, min: 1, mod: 2 / 32 },
          { quality: 3, min: 80, mod: 2 / 32 },
          { quality: 3, min: 1, mod: 3 / 32 },
          { quality: 2, min: 1, mod: 3 / 32 }
        ]);
      case '7':
        return firstMatchingRule(quality, level, [
          { quality: 4, min: 90, mod: 2 / 3 },
          { quality: 4, min: 1, mod: 1 },
          { quality: 3, min: 80, mod: 2 / 3 },
          { quality: 3, min: 1, mod: 1 },
          { quality: 2, min: 80, mod: 2 / 3 },
          { quality: 2, min: 1, mod: 1 }
        ]);
      case '38':
        return 8 / 16;
      case '43':
        if (quality === 2) {
          // Random-suffix allocations price MP5 at 2.5 common-cost points:
          // the single-stat "of Concentration" allocation is 4000/10000.
          return 40 / 16;
        }
        return firstMatchingRule(quality, level, accessorySlot(inventoryType)
          ? [
              { quality: 4, min: 200, mod: 24 / 16 },
              { quality: 4, min: 1, mod: 32 / 16 },
              { quality: 3, min: 80, mod: 32 / 16 },
              { quality: 3, min: 1, mod: 48 / 16 },
              { quality: 2, min: 1, mod: 48 / 16 }
            ]
          : [
              { quality: 4, min: 1, mod: 32 / 16 },
              { quality: 3, min: 80, mod: 32 / 16 },
              { quality: 3, min: 1, mod: 92 / 32 },
              { quality: 2, min: 1, mod: 92 / 32 }
            ]);
      case '45':
        if (quality === 4 &&
            level >= 90 &&
            effectiveItemClass(itemClass, inventoryType) === 4) {
          return 55 / 64;
        }
        return firstMatchingRule(quality, level, [
          { quality: 4, min: 90, mod: 45 / 64 },
          { quality: 4, min: 1, mod: 55 / 64 },
          { quality: 3, min: 1, mod: 55 / 64 },
          { quality: 2, min: 80, mod: 55 / 64 },
          { quality: 2, min: 1, mod: 45 / 64 }
        ]);
      case '46':
        if (quality === 2) {
          // The single-stat "of Regeneration" suffix uses the same
          // 4000/10000 allocation as MP5.
          return 40 / 16;
        }
        return firstMatchingRule(quality, level, accessorySlot(inventoryType)
          ? [
              { quality: 4, min: 200, mod: 4 / 16 },
              { quality: 4, min: 90, mod: 8 / 16 },
              { quality: 4, min: 1, mod: 16 / 16 },
              { quality: 3, min: 1, mod: 32 / 16 },
              { quality: 2, min: 1, mod: 32 / 16 }
            ]
          : [
              { quality: 4, min: 200, mod: 8 / 16 },
              { quality: 4, min: 90, mod: 16 / 16 },
              { quality: 4, min: 1, mod: 32 / 16 },
              { quality: 3, min: 1, mod: 64 / 16 },
              { quality: 2, min: 1, mod: 64 / 16 }
            ]);
      case '47':
        return 12 / 16;
      case '48':
        return firstMatchingRule(quality, level, [2, 11, 12, 14].includes(inventoryType)
          ? [
              { quality: 4, min: 200, mod: 4 / 64 },
              { quality: 4, min: 1, mod: 21 / 64 },
              { quality: 3, min: 1, mod: 21 / 64 },
              { quality: 2, min: 80, mod: 21 / 64 },
              { quality: 2, min: 1, mod: 1 }
            ]
          : [
              { quality: 4, min: 1, mod: 21 / 64 },
              { quality: 3, min: 1, mod: 21 / 64 },
              { quality: 2, min: 80, mod: 21 / 64 },
              { quality: 2, min: 1, mod: 1 }
            ]);
      default:
        return null;
    }
  }

  function budgetCapacityAtLevel({
    itemClass,
    inventoryType,
    quality,
    level,
    exponent = modelMath.DEFAULT_EXPONENT
  }) {
    if ([2, 3, 4].includes(quality)) {
      const capacity = randomPropertyPoints.formulaPoints(
        quality,
        level,
        inventoryType
      );
      return modelMath.isFinitePositive(capacity) ? capacity : null;
    }

    const effectiveQualityMod = qualityMod(quality, level);
    const effectiveSlotMod = slotMod(itemClass, inventoryType, quality, level);
    if (!modelMath.isFinitePositive(effectiveQualityMod) ||
        !modelMath.isFinitePositive(effectiveSlotMod) ||
        !modelMath.isFinitePositive(exponent)) {
      return null;
    }
    return effectiveQualityMod * Math.pow(
      effectiveSlotMod,
      1 - 1 / exponent
    );
  }

  function dbcReferenceCapacityAtLevel({
    inventoryType,
    quality,
    level
  }) {
    return quality === 2
      ? randomPropertyPoints.uncommonPoints(level, inventoryType)
      : null;
  }

  function itemBudgetAtLevel({
    itemClass,
    inventoryType,
    quality,
    level,
    socketTypes = [],
    exponent = modelMath.DEFAULT_EXPONENT
  }) {
    const capacity = budgetCapacityAtLevel({
      itemClass,
      inventoryType,
      quality,
      level,
      exponent
    });
    if (!modelMath.isFinitePositive(capacity)) {
      return null;
    }

    let budget = Math.pow(capacity, exponent);
    for (const socketType of socketTypes) {
      const effectiveSocketMod = statMod(
        socketType,
        inventoryType,
        quality,
        level,
        itemClass
      );
      if (!modelMath.isFinitePositive(effectiveSocketMod)) {
        return null;
      }
      budget -= Math.pow(effectiveSocketMod, exponent);
    }
    return budget;
  }

  function calculateLevel({
    itemClass,
    inventoryType,
    quality,
    stats,
    exponent = modelMath.DEFAULT_EXPONENT,
    maximumLevel = MAXIMUM_ITEM_LEVEL
  }) {
    for (let level = 1; level <= maximumLevel; level++) {
      const capacity = budgetCapacityAtLevel({
        itemClass,
        inventoryType,
        quality,
        level,
        exponent
      });
      if (!modelMath.isFinitePositive(capacity)) {
        continue;
      }

      let totalStatBudget = 0;
      let valid = true;
      for (const stat of stats) {
        const effectiveStatMod = statMod(
          stat.type,
          inventoryType,
          quality,
          level,
          itemClass
        );
        if (!modelMath.isFinitePositive(effectiveStatMod) ||
            !modelMath.isFinitePositive(stat.amount)) {
          valid = false;
          break;
        }
        totalStatBudget += modelMath.statBudget(
          stat.amount,
          effectiveStatMod,
          exponent
        );
      }
      if (!valid) {
        return null;
      }

      const threshold = Math.pow(capacity, exponent);
      if (threshold >= totalStatBudget) {
        return level;
      }
    }
    return null;
  }

  return Object.freeze({
    MAXIMUM_ITEM_LEVEL,
    QUALITY_NAMES,
    QUALITY_RULES,
    ARMOR_SLOT_RULES,
    STATIC_SLOT_MODS,
    qualityMod,
    slotMod,
    statMod,
    socketMod,
    budgetCapacityAtLevel,
    dbcReferenceCapacityAtLevel,
    itemBudgetAtLevel,
    calculateLevel
  });
});
