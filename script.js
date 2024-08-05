$(document).ready(function() {
  
  const exponent = Math.log(2) / Math.log(1.5);
  const exponentInverse = 1 / exponent;

  const dataFilter = (quality, lvl, data) => {
    for (const set of data) { if (quality === set.quality && set.min <= lvl) { return set.mod; } }
    return null;
  };

  const armorClass = {
    "2": { name: "Neck", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (3/16) },
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 136, mod: (4/16) },
        { quality: 3, min: 80, mod: (3/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 130, mod: (4/16) }, // final
        { quality: 2, min: 80, mod: (4/16) }, // final
        { quality: 2, min: 1, mod: (4/16) }, // final
      ])
    },
    "6": { name: "Waist", armorMod: (9/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (9/16) },
        { quality: 4, min: 90, mod: (9/16) },
        { quality: 4, min: 1, mod: (10/16) },
        { quality: 3, min: 136, mod: (9/16) },
        { quality: 3, min: 80, mod: (9/16) },
        { quality: 3, min: 1, mod: (10/16) },
        { quality: 2, min: 130, mod: (8/16) }, // final
        { quality: 2, min: 80, mod: (8/16) }, // final
        { quality: 2, min: 1, mod: (8/16) }, // final
      ])
    },
    "8": { name: "Feet", armorMod: (11/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (7/16) },
        { quality: 4, min: 90, mod: (7/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 136, mod: (7/16) },
        { quality: 3, min: 80, mod: (7/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 130, mod: (8/16) }, // final
        { quality: 2, min: 80, mod: (8/16) }, // final
        { quality: 2, min: 1, mod: (8/16) }, // final
      ])
    },
    "10": { name: "Hands", armorMod: (10/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 90, mod: (8/16) },
        { quality: 4, min: 1, mod: (9/16) },
        { quality: 3, min: 136, mod: (6/16) },
        { quality: 3, min: 80, mod: (9/16) },
        { quality: 3, min: 1, mod: (9/16) },
        { quality: 2, min: 130, mod: (8/16) }, // final
        { quality: 2, min: 80, mod: (8/16) }, // final
        { quality: 2, min: 1, mod: (8/16) }, // final
      ])
    },
    "11": { name: "Finger", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (8/16) },
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (3/16) },
        { quality: 3, min: 136, mod: (3/16) },
        { quality: 3, min: 80, mod: (3/16) },
        { quality: 3, min: 1, mod: (3/16) },
        { quality: 2, min: 130, mod: (4/16) }, // final
        { quality: 2, min: 80, mod: (4/16) }, // final
        { quality: 2, min: 1, mod: (4/16) }, // final
      ])
    },
    "12": { name: "Trinket", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (3/16) },
        { quality: 4, min: 90, mod: (5/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 136, mod: (11/16) },
        { quality: 3, min: 80, mod: (11/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 130, mod: (8/16) }, // final
        { quality: 2, min: 80, mod: (8/16) }, // final
        { quality: 2, min: 1, mod: (8/16) }, // final
      ])
    },
    "14": { name: "Shield", armorMod: (16/16), itemClass: 4, subClass: [6],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (8/16) },
        { quality: 4, min: 90, mod: (4/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 136, mod: (4/16) },
        { quality: 3, min: 80, mod: (4/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 130, mod: (4/16) }, // final
        { quality: 2, min: 80, mod: (4/16) }, // final
        { quality: 2, min: 1, mod: (4/16) }, // final
      ])
    },
    "16": { name: "Back", armorMod: (8/16), itemClass: 4, subClass: [1],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (3/16) },
        { quality: 3, min: 136, mod: (3/16) },
        { quality: 3, min: 80, mod: (3/16) },
        { quality: 3, min: 1, mod: (3/16) },
        { quality: 2, min: 130, mod: (4/16) }, // final
        { quality: 2, min: 80, mod: (4/16) }, // final
        { quality: 2, min: 1, mod: (3/16) }, // final
      ])
    },
    "1": { name: "Head", armorMod: (13/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "3": { name: "Shoulder", armorMod: (12/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (8/16) },
    "4": { name: "Shirt", armorMod: 0, itemClass: 4, subClass: [1], slotMod: (1/16) },
    "5": { name: "Chest", armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "7": { name: "Legs", armorMod: (14/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "9": { name: "Wrists", armorMod: (7/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (4/16) },
    "19": { name: "Tabard", armorMod: 0, itemClass: 4, subClass: [0], slotMod: (1/16) },
    "20": { name: "Chest (Robe)", armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "23": { name: "Held Off-hand", armorMod: 0, itemClass: 4, subClass: [0], slotMod: (3/16) },
    "28": { name: "Relic", armorMod: 0, itemClass: 4, subClass: [7, 8, 9, 10], slotMod: (1/16) },
  };
  
  const weaponClass = {
    "13": { name: "One-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "21": { name: "Main-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "22": { name: "Off-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "17": { name: "Two-Hand", slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [1, 5, 8, 6, 10] },
    "15": { name: "Bow", slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [2] },
    "25": { name: "Thrown", slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [16] },
    "26": { name: "Ranged", slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [3, 18, 19] }
  };

  const resistMods = (slot, quality, lvl) => dataFilter(quality, lvl, [
    { quality: 4, min: 200, mod: (12/16) },
    { quality: 4, min: 1, mod: (16/16) },
    { quality: 3, min: 1, mod: (16/16) },
    { quality: 2, min: 130, mod: (16/16) }, // final
    { quality: 2, min: 80, mod: (16/16) }, // final
    { quality: 2, min: 1, mod: (16/16) }, // final
  ]);

  const socketMods = (slot, quality, lvl) => dataFilter(quality, lvl, [
    { quality: 4, min: 200, mod: (25/1) },
    { quality: 4, min: 90, mod: (10/1) },
    { quality: 4, min: 1, mod: (10/1) },
    { quality: 3, min: 130, mod: (25/1) },
    { quality: 3, min: 80, mod: (10/1) },
    { quality: 3, min: 1, mod: (10/1) },
    { quality: 2, min: 130, mod: (30/1) }, // final
    { quality: 2, min: 80, mod: (10/1) }, // final
    { quality: 2, min: 1, mod: (10/1) }, // final
  ]);

  const itemStats = {
    "7": { name: "Stamina", type: 0,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 1, mod: (10/16) },
        { quality: 3, min: 80, mod: (10/16) },
        { quality: 3, min: 1, mod: (16/16) },
        { quality: 2, min: 130, mod: (2/3) }, // final
        { quality: 2, min: 80, mod: (2/3) }, // final
        { quality: 2, min: 1, mod: (16/16) }, // final
      ])
    },
    "45": { name: "Spell Power", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 1, mod: (68/64) },
        { quality: 3, min: 1, mod: (68/64) },
        { quality: 2, min: 130, mod: (55/64) }, // final
        { quality: 2, min: 80, mod: (55/64) }, // final
        { quality: 2, min: 1, mod: (45/64) }, // final
      ])
    },
    "43": { name: "Mana Regen MP5", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 1, mod: (68/16) },
        { quality: 3, min: 1, mod: (68/64) },
        { quality: 2, min: 130, mod: (81/32) }, // final
        { quality: 2, min: 80, mod: (88/32) }, // final
        { quality: 2, min: 1, mod: (77/32) }, // final
      ])
    },
    "46": { name: "Health Regen HP5", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 1, mod: (68/16) },
        { quality: 3, min: 1, mod: (68/16) },
        { quality: 2, min: 1, mod: (68/64) }, // final
      ])
    },
    "48": { name: "Block Value", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl,
        [2, 11, 14].includes(slot)
        ? [ // ammys, rings, shields
          { quality: 4, min: 90, mod: (4/16) },
          { quality: 4, min: 1, mod: (16/16) },
          { quality: 3, min: 1, mod: (16/16) },
          { quality: 2, min: 130, mod: (21/64) }, // final
          { quality: 2, min: 80, mod: (21/64) }, // final
          { quality: 2, min: 1, mod: (16/16) }, // final
        ]
        : [ // everything else
          { quality: 4, min: 90, mod: (4/16) },
          { quality: 4, min: 1, mod: (8/16) },
          { quality: 3, min: 1, mod: (21/64) },
          { quality: 2, min: 130, mod: (21/64) }, // final
          { quality: 2, min: 80, mod: (21/64) }, // final
          { quality: 2, min: 1, mod: (16/16) }, // final
        ]
      )
    },
    "0": { name: "Mana", type: 0, statMod: (32/16) }, // cannot test
    "1": { name: "Health", type: 0, statMod: (32/16) }, // cannot test
    "3": { name: "Agility", type: 0, statMod: (16/16) },
    "4": { name: "Strength", type: 0, statMod: (16/16) },
    "5": { name: "Intellect", type: 0, statMod: (16/16) },
    "6": { name: "Spirit", type: 0, statMod: (16/16) },
    "12": { name: "Defense Rating", type: 1, statMod: (16/16) },
    "13": { name: "Dodge Rating", type: 1, statMod: (16/16) },
    "14": { name: "Parry Rating", type: 1, statMod: (16/16) },
    "15": { name: "Block Rating", type: 1, statMod: (16/16) },
    "21": { name: "Spell Crit Rating", type: 1, statMod: (16/16) },
    "31": { name: "Hit Rating", type: 1, statMod: (16/16) },
    "32": { name: "Crit Rating", type: 1, statMod: (16/16) },
    "35": { name: "Resilience Rating", type: 1, statMod: (16/16) },
    "36": { name: "Haste Rating", type: 1, statMod: (16/16) },
    "37": { name: "Expertise Rating", type: 1, statMod: (16/16) },
    "38": { name: "Attack Power", type: 1, statMod: (8/16) },
    "44": { name: "Armor Penetration Rating", type: 1, statMod: (16/16) },
    "47": { name: "Spell Penetration", type: 1, statMod: (12/16) },
    "armor": { name: "Bonus Armor", type: 3, statMod: 3/32 },
    "arcane_res": { name: "Resist Arcane", type: 0, statMod: resistMods },
    "fire_res": { name: "Resist Fire", type: 0, statMod: resistMods },
    "holy_res": { name: "Resist Holy", type: 0, statMod: resistMods },
    "nature_res": { name: "Resist Nature", type: 0, statMod: resistMods },
    "frost_res": { name: "Resist Frost", type: 0, statMod: resistMods },
    "shadow_res": { name: "Resist Shadow", type: 0, statMod: resistMods },
    "meta_socket": { name: "Meta Socket", color: "meta", type: 2, statMod: socketMods },
    "red_socket": { name: "Red Socket", color: "red", type: 2, statMod: socketMods },
    "blue_socket": { name: "Blue Socket", color: "blue", type: 2, statMod: socketMods },
    "yellow_socket": { name: "Yellow Socket", color: "yellow", type: 2, statMod: socketMods },
  };

  const statPhrases = {
    "12": statAmount => `Increases defense rating by ${statAmount}.`,
    "13": statAmount => `Increases your dodge rating by ${statAmount}.`,
    "14": statAmount => `Increases your parry rating by ${statAmount}.`,
    "15": statAmount => `Increases your shield block rating by ${statAmount}.`,
    "21": statAmount => `Improves critical strike rating by ${statAmount}.`,
    "31": statAmount => `Improves hit rating by ${statAmount}.`,
    "32": statAmount => `Improves critical strike rating by ${statAmount}.`,
    "35": statAmount => `Improves your resilience rating by ${statAmount}.`,
    "36": statAmount => `Improves haste rating by ${statAmount}.`,
    "37": statAmount => `Improves expertise rating by ${statAmount}.`,
    "38": statAmount => `Increases attack power by ${statAmount}.`,
    "43": statAmount => `Restores ${statAmount} mana per 5 sec.`,
    "44": statAmount => `Increases your armor penetration rating by ${statAmount}.`,
    "45": statAmount => `Increases spell power by ${statAmount}.`,
    "46": statAmount => `Restores ${statAmount} health per 5 sec.`,
    "47": statAmount => `Increases spell penetration by ${statAmount}.`,
    "48": statAmount => `Increases the block value of your shield by ${statAmount}.`
  };

  const armorSubClass = {
    "0": { name: "Miscellaneous", tooltip: 0 },
    "1": { name: "Cloth", tooltip: 1 },
    "2": { name: "Leather", tooltip: 1 },
    "3": { name: "Mail", tooltip: 1 },
    "4": { name: "Plate", tooltip: 1 },
    "6": { name: "Shield", tooltip: 0 },
    "7": { name: "Libram", tooltip: 1 }, // paladin
    "8": { name: "Idol", tooltip: 1 }, // druid
    "9": { name: "Totem", tooltip: 1 }, // shaman
    "10": { name: "Sigil", tooltip: 1 } // deathknight
  };

  const weaponSubClass = {
    "0": { name: "Axe", tooltip: 1 },
    "1": { name: "Axe", tooltip: 1 },
    "2": { name: "Bow", tooltip: 0 },
    "3": { name: "Gun", tooltip: 1 },
    "4": { name: "Mace", tooltip: 1 },
    "5": { name: "Mace", tooltip: 1 },
    "6": { name: "Polearm", tooltip: 1 },
    "7": { name: "Sword", tooltip: 1 },
    "8": { name: "Sword", tooltip: 1 },
    "10": { name: "Staff", tooltip: 1 },
    "13": { name: "Fist", tooltip: 1 },
    "15": { name: "Dagger", tooltip: 1 },
    "16": { name: "Thrown", tooltip: 1 },
    "18": { name: "Crossbow", tooltip: 1 },
    "19": { name: "Wand", tooltip: 1 }
  };

  const weaponDamageTypes = {
    "1": { name: "Holy" },
    "2": { name: "Fire" },
    "3": { name: "Nature" },
    "4": { name: "Frost" },
    "5": { name: "Shadow" },
    "6": { name: "Arcane" }
  };
  
  const armorData = {
    6: {
      Cloth: lvl => 2.5281010518232847 + 1.331747228269099 * lvl + 0.00944593034412355 * Math.pow(lvl, 2) - 0.00006849549050619422 * Math.pow(lvl, 3) + 1.2354987243172888e-7 * Math.pow(lvl, 4),
      Leather: lvl => 1.5555029361141006 + 3.0358551084632817 * lvl + 0.010441421831956765 * Math.pow(lvl, 2) - 0.00009593877599476476 * Math.pow(lvl, 3) + 1.8476622137336274e-7 * Math.pow(lvl, 4),
      Mail: lvl => -7.5320987581173 + 9.77641667353662 * lvl - 0.07509546031114869 * Math.pow(lvl, 2) + 0.0008277573203410827 * Math.pow(lvl, 3) - 0.000003968983245793348 * Math.pow(lvl, 4) + 6.374377745994348e-9 * Math.pow(lvl, 5),
      Plate: lvl => 5.102460977820272 + 9.509093276356396 * lvl + 0.07993511436723227 * Math.pow(lvl, 2) - 0.0005654807309686971 * Math.pow(lvl, 3) + 0.0000010185213184327804 * Math.pow(lvl, 4),
      Shield: lvl => -68.32056773225723 + 52.05238254766441 * lvl - 0.2633818416382036 * Math.pow(lvl, 2) + 0.0032416668345449868 * Math.pow(lvl, 3) - 0.000017286124455117578 * Math.pow(lvl, 4) + 2.9484202941863735e-8 * Math.pow(lvl, 5)
    },
    5: {
      Cloth: lvl => 2.5281010518232847 + 1.331747228269099 * lvl + 0.00944593034412355 * Math.pow(lvl, 2) - 0.00006849549050619422 * Math.pow(lvl, 3) + 1.2354987243172888e-7 * Math.pow(lvl, 4),
      Leather: lvl => 1.5555029361141006 + 3.0358551084632817 * lvl + 0.010441421831956765 * Math.pow(lvl, 2) - 0.00009593877599476476 * Math.pow(lvl, 3) + 1.8476622137336274e-7 * Math.pow(lvl, 4),
      Mail: lvl => -7.5320987581173 + 9.77641667353662 * lvl - 0.07509546031114869 * Math.pow(lvl, 2) + 0.0008277573203410827 * Math.pow(lvl, 3) - 0.000003968983245793348 * Math.pow(lvl, 4) + 6.374377745994348e-9 * Math.pow(lvl, 5),
      Plate: lvl => 5.102460977820272 + 9.509093276356396 * lvl + 0.07993511436723227 * Math.pow(lvl, 2) - 0.0005654807309686971 * Math.pow(lvl, 3) + 0.0000010185213184327804 * Math.pow(lvl, 4),
      Shield: lvl => -68.32056773225723 + 52.05238254766441 * lvl - 0.2633818416382036 * Math.pow(lvl, 2) + 0.0032416668345449868 * Math.pow(lvl, 3) - 0.000017286124455117578 * Math.pow(lvl, 4) + 2.9484202941863735e-8 * Math.pow(lvl, 5)
    },
    4: {
      Cloth: lvl => 2.5281010518232847 + 1.331747228269099 * lvl + 0.00944593034412355 * Math.pow(lvl, 2) - 0.00006849549050619422 * Math.pow(lvl, 3) + 1.2354987243172888e-7 * Math.pow(lvl, 4),
      Leather: lvl => 1.5555029361141006 + 3.0358551084632817 * lvl + 0.010441421831956765 * Math.pow(lvl, 2) - 0.00009593877599476476 * Math.pow(lvl, 3) + 1.8476622137336274e-7 * Math.pow(lvl, 4),
      Mail: lvl => -7.5320987581173 + 9.77641667353662 * lvl - 0.07509546031114869 * Math.pow(lvl, 2) + 0.0008277573203410827 * Math.pow(lvl, 3) - 0.000003968983245793348 * Math.pow(lvl, 4) + 6.374377745994348e-9 * Math.pow(lvl, 5),
      Plate: lvl => 5.102460977820272 + 9.509093276356396 * lvl + 0.07993511436723227 * Math.pow(lvl, 2) - 0.0005654807309686971 * Math.pow(lvl, 3) + 0.0000010185213184327804 * Math.pow(lvl, 4),
      Shield: lvl => -68.32056773225723 + 52.05238254766441 * lvl - 0.2633818416382036 * Math.pow(lvl, 2) + 0.0032416668345449868 * Math.pow(lvl, 3) - 0.000017286124455117578 * Math.pow(lvl, 4) + 2.9484202941863735e-8 * Math.pow(lvl, 5)
    },
    3: {
      Cloth: lvl => -1.3423883493277042 + 2.200587627369824 * lvl - 0.023452920240817212 * Math.pow(lvl, 2) + 0.0002057092987396633 * Math.pow(lvl, 3) - 5.346376377648381e-7 * Math.pow(lvl, 4),
      Leather: lvl => -4.3185941880426775 + 5.22367821032947 * lvl - 0.06638307153372526 * Math.pow(lvl, 2) + 0.0005313187225831865 * Math.pow(lvl, 3) - 0.0000013052892289727186 * Math.pow(lvl, 4),
      Mail: lvl => 31.445856660984333 + 8.055343208054605 * lvl - 0.08529020006193702 * Math.pow(lvl, 2) + 0.0007948792659050846 * Math.pow(lvl, 3) - 0.0000021078789263816906 * Math.pow(lvl, 4),
      Plate: lvl => -28.396604349521805 + 16.329061088393786 * lvl - 0.16567265946139803 * Math.pow(lvl, 2) + 0.0014420657876884682 * Math.pow(lvl, 3) - 0.000003730547431550686 * Math.pow(lvl, 4),
      Shield: lvl => -44.06927830732479 + 60.18645188729204 * lvl - 4.54601783641102 * Math.pow(lvl, 2) + 0.19213407170465685 * Math.pow(lvl, 3) - 0.003571960126176484 * Math.pow(lvl, 4) + 0.00003452904159703563 * Math.pow(lvl, 5) - 1.8099081604737638e-7 * Math.pow(lvl, 6) + 4.887914417526831e-10 * Math.pow(lvl, 7) - 5.340719565656609e-13 * Math.pow(lvl, 8)
    },
    2: {
      Cloth: lvl => 8.528248246851293 + 1.13588900743772 * lvl + 0.00018480865552209587 * Math.pow(lvl, 2),
      Leather: lvl => 39.0574346793 + 1.8042785077 * lvl + 0.0014831968 * Math.pow(lvl, 2),
      Mail: lvl => 74.58060541262037 + 3.93396431596397 * lvl + 0.004366253997171184 * Math.pow(lvl, 2),
      Plate: lvl => -8.953978248173765 + 9.748506027592633 * lvl - 0.003686683605302056 * Math.pow(lvl, 2),
      Shield: lvl => 82.22823 + 29.92042 * lvl - 0.01284 * Math.pow(lvl, 2) + 0.00007097724866192495 * Math.pow(lvl, 3)
    }
  };

  const shieldBlockCoefficients = {
    2: lvl => {
      if (lvl >= 130) return 958.2984725669 - 18.2166307096 * lvl + 0.1250629715 * Math.pow(lvl, 2) - 0.0002655468 * Math.pow(lvl, 3);
      if (lvl >= 80) return -16.3908655872 + 0.6897096083 * lvl + 0.0013506088 * Math.pow(lvl, 2);
      if (lvl >= 1) return -3.0432462933 + 0.8825715740 * lvl - 0.0312968732 * Math.pow(lvl, 2) + 0.0007254284 * Math.pow(lvl, 3) - 0.0000046519 * Math.pow(lvl, 4);
    },
    3: lvl => {
      if (lvl >= 154) return 18470.4850615834 - 421.5128438990 * lvl + 3.5991532696 * Math.pow(lvl, 2) - 0.0135272648 * Math.pow(lvl, 3) + 0.0000189300 * Math.pow(lvl, 4);
      if (lvl >= 71) return -29.0000000000 + 1.0000000000 * lvl;
      if (lvl >= 1) return -3.5159255097 + 1.1796186496 * lvl - 0.0464979829 * Math.pow(lvl, 2) + 0.0011133817 * Math.pow(lvl, 3) - 0.0000079076 * Math.pow(lvl, 4);
    },
    4: lvl => {
      if (lvl >= 190) return 364.0853740290 - 1.7727768015 * lvl + 0.0050409241 * Math.pow(lvl, 2);
      if (lvl >= 1) return -36.7178644064 + 2.3738336805 * lvl - 0.0257785254 * Math.pow(lvl, 2) + 0.0002156921 * Math.pow(lvl, 3) - 0.0000005816 * Math.pow(lvl, 4);
    }
  };

  const qualityCoefficients = {
    2: {
      name: 'uncommon',
      calc: lvl => {
        if (lvl >= 130) return qC(lvl,0.801,-38.3); // final
        if (lvl >= 80) return qC(lvl,0.505,-4.5); // final
        if (lvl >= 1) return qC(lvl,0.495,-2.85); // final
      }
    },
    3: {
      name: 'rare',
      calc: lvl => {
        if (lvl >= 136) return qC(lvl,0.86,-41);
        if (lvl >= 80) return qC(lvl,0.625,-1.15);
        if (lvl >= 1) return qC(lvl,0.635,-3.6);
      }
    },
    4: {
      name: 'epic',
      calc: lvl => {
        if (lvl >= 200) return qC(lvl,1.8,-240);
        if (lvl >= 100) return qC(lvl,0.689,4);
        if (lvl >= 1) return qC(lvl,0.689,-1);
      }
    }
  };
  
  function qC(lvl,mult,base) {
    return (lvl * mult) + base;
  }

  function calculateLevel(itemClass, slot, quality, qualityMod) {
    console.error("calculating level from stats");

    let itemLevel = 0;
    let consoleLog = [];

    const array = itemClass == '4' ? armorClass : weaponClass;
    const invType = array[slot];
    const slotMod = invType.slotMod;
    const slotModFunction = typeof slotMod === 'function';

    for (let i = 1; i < 999; i++) {

      let totalStatBudget = 0;
      consoleLog = [];

      $('#stats .group').each(function() {
        const statType = $(this).find('.stat-type').val();
        const statName = itemStats[statType]?.name;
        const statValue = parseFloat($(this).find('.stat-amount').val());
        const statMod = itemStats[statType].statMod;
        const statModFunction = typeof statMod === 'function';
        const effectiveStatMod = statModFunction ? statMod(slot, quality, i) : statMod;

        const statBudget = Math.pow(statValue * effectiveStatMod, exponent);
        totalStatBudget += statBudget;
        
        consoleLog.push(`statType: ${statName}(${statType}), statValue: ${statValue}, statMod: ${effectiveStatMod}, statBudget: ${statBudget}`);
      });

      const effectiveSlotMod = slotModFunction ? slotMod(quality, i) : slotMod;
      const itemBudget = totalStatBudget * effectiveSlotMod;
      const statBudgetIncrement = Math.pow(qualityMod(i+1) * effectiveSlotMod, exponent);

      if (statBudgetIncrement >= itemBudget) {
        consoleLog.push(`qualityMod: ${qualityMod(i+1)}, statBudget: ${totalStatBudget}, slotMod: ${effectiveSlotMod}, itemBudget: ${itemBudget}, itemLevel: ${i}`);
        itemLevel = i;
        break;
      }
    }

    consoleLog.forEach(log => console.log(log));
    return Math.max(itemLevel, 1);
  }

  function calculateStats(itemClass, level, slot, quality, qualityMod) {
    console.error(`calculating stats from level`);

    const statValues = {};
    let statBudget = '';

    const array = itemClass == '4' ? armorClass : weaponClass;
    const invType = array[slot];
    const slotMod = invType.slotMod;
    const slotModFunction = typeof slotMod === 'function';
    const effectiveSlotMod = slotModFunction ? slotMod(quality, level) : slotMod;
    const itemBudget = Math.pow(qualityMod(level) * effectiveSlotMod, exponent) / effectiveSlotMod;

    $('#stats .group').each(function() {
      const statType = $(this).find('.stat-type').val();
      const statName = itemStats[statType]?.name;
      const statPercent = parseFloat($(this).find('.stat-amount').val()) / 100;
      const statMod = itemStats[statType].statMod;
      const statModFunction = typeof statMod === 'function';
      const effectiveStatMod = statModFunction ? statMod(slot, quality, level) : statMod;

      statBudget = itemBudget * statPercent;
      const statValue = Math.pow(statBudget / effectiveStatMod, exponentInverse);
      
      // perform a loop starting from 1 that multiplies 
      
      statValues[statType] = Math.ceil(statValue);
      console.log(`statType: ${statName}(${statType}), statValue: ${statValue}, statMod: ${effectiveStatMod}, statBudget: ${statBudget}`);
    });

    console.log(`qualityMod: ${qualityMod(level)}, statBudget: ${statBudget}, slotMod: ${effectiveSlotMod}, itemBudget: ${itemBudget}, itemLevel: ${level}`);
    return statValues;
  }

  function calculateArmor(slot, type, level, quality, bonus) {
    const slotData = armorClass[slot];
    if (slotData.armorMod > 0) {
      const slotMod = slotData.armorMod;
      const baseValue = armorData[quality][type](level);
      const totalArmor = Math.max(Math.ceil(baseValue * slotMod), 0) + parseFloat(bonus);
      console.warn(`generating armor`);
      console.log(`slotCoefficient: ${slotMod}, baseValue: ${baseValue}, bonusArmor: ${bonus}, totalArmor: ${totalArmor}`);
      return `<div class="${bonus >= 1 ? 'green' : ''}">${totalArmor} Armor</div>`;
    }
    else { return ''; }
  }
  
  function calculateShieldBlock(level, quality) {
    const calculateBlock = shieldBlockCoefficients[quality];
    const baseBlock = calculateBlock(level);
    const totalBlock = baseBlock > 7 ? Math.ceil(baseBlock) : 7;
    console.warn(`generating block value`);
    console.log(`baseBlock: ${baseBlock}, totalBlock: ${totalBlock}`);
    return `<div>${totalBlock} Block</div>`;
  }

  function populateItemSlots(itemClass) {
    const itemSlotObj = $('#item-slot');
    let name = itemClass == '4' ? 'Armor' : 'Weapon';
    let array = itemClass == '4' ? armorClass : weaponClass;
    itemSlotObj.empty().append(`<option value="">Choose ${name} Type</option>`);
    $.each(array, function(key, data) {
      itemSlotObj.append(`<option data-class="${itemClass}" value="${key}">${data.name}</option>`);
    });
  }

  function populateSubClass(subClass, itemClass) {
    const subClassObj = $('#item-subclass');
    subClassObj.empty();
    const array = itemClass == 4 ? armorSubClass : weaponSubClass;

    if (subClass.length === 1) {
      const classKey = subClass[0];
      const classData = array[classKey];
      if (classData) {
        subClassObj.append(`<option value="${classKey}">${classData.name}</option>`);
        subClassObj.prop('disabled', true);
      }
    }
    else {
      subClassObj.append(`<option value="">Choose ${$("#item-slot option:selected").data('class') == 2 ? 'Weapon' : 'Armor'} Type</option>`);
      $.each(subClass, function(_, classKey) {
        let classData = array[classKey];
        if (classData) {
          subClassObj.append(`<option value="${classKey}">${classData.name}</option>`);
        }
      });
      subClassObj.prop('disabled', false);
    }
  }

  function populateWeaponDamageTypes() {
    const damageObj = $('#item-damage1');
    damageObj.empty().append('<option value="">Extra Damage</option>');
    $.each(weaponDamageTypes, function(key, data) {
      damageObj.append(`<option value="${key}">${data.name}</option>`);
    });
  }

  function createStatDropdown(id) {
    let options = '<option value="">Select a Stat</option>';
    $.each(itemStats, function(key, data) {
      if (data.type !== 2) { options += `<option value="${key}">${data.name}</option>`; }
    });
    return `<select id="stat-type-${id}" class="stat-type stat" data-id="${id}">${options}</select>`;
  }

  function createSocketDropdown(id) {
    let options = '<option value="">Select a Socket</option>';
    $.each(itemStats, function(key, data) {
      options += `<option data-color="${data.color}" value="${key}">${data.name} FUCK</option>`;
    });
    return `<select id="stat-type-${id}" class="stat-type socket" data-id="${id}">${options}</select>`;
  }

  function updateStatDropdowns() {
    const selectedStats = [];
    $('.stat-type.stat').each(function() {
      const statValue = $(this).val();
      if (statValue) { selectedStats.push(statValue); }
      const selectObj = $(this);
      selectObj.empty();
      selectObj.append('<option value="">Select a Stat</option>');
      $.each(itemStats, function(key, data) {
        if (data.type !== 2 && (selectedStats.indexOf(key) === -1 || key === statValue)) { selectObj.append(`<option value="${key}">${data.name}</option>`); }
      });
      selectObj.val(statValue);
    });
  }

  function updateSocketDropdowns() {
    const selectedSockets = [];
    $('.stat-type.socket').each(function() {
      const socketValue = $(this).val();
      if (socketValue) { selectedSockets.push(socketValue); }
      const selectObj = $(this);
      selectObj.empty();
      selectObj.append('<option value="">Select a Socket</option>');
      $.each(itemStats, function(key, data) {
        if (data.type === 2 && (selectedSockets.indexOf(key) === -1 || key === socketValue)) { selectObj.append(`<option data-color="${data.color}" value="${key}">${data.name}</option>`); }
      });
      selectObj.val(socketValue);
    });
  }

  let statCount = 0;
  let socketCount = 0;

  function updateStatGroup(type, action) {
    if (action == 'add') {
      if (type == 'stat' && statCount <= 10) {
        const statHtml = `
          <div class="group select" id="stat-group-${statCount}">
            <input type="number" class="stat-amount" data-calc="" id="stat-amount-${statCount}" value="0" />
            ${createStatDropdown(statCount)}
            <div class="delete"><i class="stage1 fa-solid fa-ellipsis-vertical"></i><i class="stage2 fa-regular fa-trash-can"></i></div>
          </div>`;
        $('#stats').append(statHtml);
        updateStatDropdowns();
        statCount++;
      }
      if (type == 'socket' && socketCount <= 3) {
        const statHtml = `
          <div class="group select socket" id="stat-group-${statCount}">
            <input type="number" class="stat-amount" data-calc="" id="stat-amount-${statCount}" value="1" disabled />
            ${createSocketDropdown(socketCount)}
            <div class="delete"><i class="fa-regular fa-trash-can"></i></div>
          </div>`;
        $('#stats').append(statHtml);
        updateSocketDropdowns();
        socketCount++;
      }
    }
    else if (type == 'stat' && action == 'delete') { statCount--; }
    else if (type == 'socket' && action == 'delete') { socketCount--; }
    if (statCount >= 10) { $("#add-stat").hide(); }
    else { $("#add-stat").show(); }
    if (socketCount >= 3) { $("#add-socket").hide(); }
    else { $("#add-socket").show(); }
    sortStats();
  }
  
  function sortStats() {
    const statsObj = $('#stats');
    const stats = statsObj.children().detach();
    const sortedStats = stats.sort(function(a, b) {
      const isSocketA = $(a).hasClass('socket');
      const isSocketB = $(b).hasClass('socket');
      if (isSocketA && !isSocketB) { return -1; }
      else if (!isSocketA && isSocketB) { return 1; }
      else { return 0; }
    });
    statsObj.append(sortedStats);
  }

  function subClassVisible(subClass, classList) {
    return classList[subClass] ? classList[subClass].tooltip : false;
  }
  
  function subClassHTML() {
    const itemClass = $('#item-slot option:selected').data('class');
    const subClass = $('#item-subclass').val();
    let subClassName = '';
    if (subClassVisible(subClass, itemClass === 4 ? armorSubClass : weaponSubClass) === 1) { subClassName = $('#item-subclass option:selected').text(); }
    return subClassName ? `<div class="item-subclass">${subClassName}</div>` : subClassName;
  }
  
  function createTooltipHTML(itemQuality, itemName, itemLevel, durabilityHTML, requiredLevelHTML, sellPriceHTML, bindHTML, uniqueHTML, slotHTML, typeHTML, weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, socketsHTML, greenStatsHTML, itemFlavorHTML) {
    return `
      <div class="item-name ${itemQuality}">${itemName}</div>
      <div class="item-level">Item Level ${itemLevel}</div>
      ${bindHTML}
      ${uniqueHTML}
      <div class="group spread"><div class="item-slot">${slotHTML}</div>${typeHTML}</div>
      ${weaponDamageHTML}
      ${itemArmor}
      ${blockValue}
      <div class="white stats">${whiteStatsHTML}</div>
      <div class="sockets">${socketsHTML}</div>
      ${durabilityHTML}
      ${requiredLevelHTML}
      <div class="green stats">${greenStatsHTML}</div>
      ${itemFlavorHTML}
      ${sellPriceHTML}
    `;
  }

  function getBonusDamage() {
    const damageObj = $('#item-damage1 option:selected');
    const damageMinObj = $('#damageMin1');
    const damageMaxObj = $('#damageMax1');

    const damageMin = parseFloat(damageMinObj.val());
    const damageMax = parseFloat(damageMaxObj.val());

    if (damageObj.val() && damageMin > 0 && damageMax > 0 && damageMax >= damageMin) {
      const damageName = damageObj.text();
      return {
        min: damageMin,
        max: damageMax || null,
        type: damageName,
        display: (damageMax == damageMin || !damageMax) ?
          `<div>+${damageMin} ${damageName} Damage</div>` :
          `<div>+${damageMin} - ${damageMax} ${damageName} Damage</div>`
      };
    }
    return null;
  }

  function calculateDPS(min, max, rate) {
    return ((min + max) / 2) / rate;
  }

  function calculateDamage(min, max, rate, bonus = null) {
    console.error('calculating weapon damage');

    let sumMin = min;
    let sumMax = max;
    let damageHTML = '';

    if (bonus) {
      sumMin += bonus.min;
      sumMax += bonus.max ? bonus.max : bonus.min;
      damageHTML = bonus.display;
    }
    
    const base = max == min ? `${Math.ceil(min)}` : `${Math.ceil(min)} - ${Math.ceil(max)}`;

    const dps = calculateDPS(sumMin, sumMax, rate);
    console.log(`dps: ${dps}`);

    return `
      <div class="group spread">
        <div>${base} Damage</div>
        <div>Speed ${rate.toFixed(2)}</div>
      </div>
      ${damageHTML}
      <div>(${dps.toFixed(2)} damage per second)</div>
    `;
  }

  function sumStatValues() {
    let sum = 0;
    $('.stat-amount').each(function() { sum += parseFloat($(this).val()) || 0; });
    return sum;
  }
  
  function statPhrasing(itemStat, statAmount) {
    const phraseFunction = statPhrases[itemStat];
    return phraseFunction ? phraseFunction(statAmount) : 'broken';
  }
  
  function calculateForm() { // form calculation
    // error check
    let errorDetected = false;

    const calcMethod = $('input[name="calcMethod"]:checked').val();
    if (calcMethod === 'stats' && ($("#item-level").val() <= 0 || sumStatValues() != 100)) {
      $(".stat-amount").addClass('error');
      errorDetected = true;
    }
    
    if (!$('#item-slot').val()) {
      $('#item-slot').addClass('error'); errorDetected = true;
    }
    if (!$('#item-subclass').val()) {
      $('#item-subclass').addClass('error'); errorDetected = true;
    }
    
    if(!$('#item-slot').val() && !$('#item-subclass').val()) { errorDetected = true; }
    
    $('#stats .group').each(function() {
      const statTypeObj = $(this).find('.stat-type');
      const statType = statTypeObj.val();
      const statValueObj = $(this).find('.stat-amount');
      const statValue = parseFloat(statValueObj.val());
      if(statType && !statValue) {
        statValueObj.addClass('error');
        errorDetected = true;
      }
      else if(!statType && statValue) {
        statTypeObj.addClass('error');
        errorDetected = true;
      }
      else if(!statType && !statValue) {
        statValueObj.addClass('error');
        statTypeObj.addClass('error');
        errorDetected = true;
      }
    });
    
    if(errorDetected) { return; }

    $("#output").show();

    let itemLevel = $('#item-level').val() || null;
    let itemDescription = $('#item-description').val() || null;
    let statValue = null;
    const itemClass = $('#item-slot option:selected').data('class');
    const itemBind = $('input[name="itemBind"]:checked').val() || null;
    const itemUnique = $('input[name="itemUnique"]:checked').val() || null;
    const itemQuality = $('input[name="itemQuality"]:checked').data('quality') || null;
    let qualityName = qualityCoefficients[itemQuality].name || null;
    const itemSlot = parseFloat($('#item-slot').val()) || null;
    const qualityCoefficient = qualityCoefficients[itemQuality].calc;

    if (calcMethod === 'level') { // level calc
      itemLevel = calculateLevel(itemClass, itemSlot, itemQuality, qualityCoefficient);
    }
    else if (calcMethod === 'stats') { // stat calc
      const statValues = calculateStats(itemClass, itemLevel, itemSlot, itemQuality, qualityCoefficient);
      $('#stats .group').each(function() {
        let statType = $(this).find('.stat-type').val();
        if (statValues[statType]) {
          $(this).find('.stat-amount').data('calc', statValues[statType]);
        }
      });
      //statValue = Object.values(statValues).reduce((acc, val) => acc + val, 0);
    }

    // tooltip output

    let bindHTML = '';
    let uniqueHTML = '';
    let whiteStatsHTML = '';
    let socketsHTML = '';
    let greenStatsHTML = '';
    let itemArmor = '';
    let blockValue = '';
    let bonusArmor = 0;
    let weaponDamageHTML = '';
    let durabilityHTML = '';
    let sellPriceHTML = '';
    let itemFlavorHTML = itemDescription ? `<div class="flavor">"${itemDescription}"</div>` : '';

    $('#stats .group').each(function() {
      const statTypeObj = $(this).find('.stat-type option:selected');
      const statValueObj = $(this).find('.stat-amount');
      let statTypeText = statTypeObj.text();
      let statTypeKey = statTypeObj.val();
      let statAmount = calcMethod == 'level' ? statValueObj.val() : statValueObj.data('calc');
      if (statTypeKey && statAmount > 0) {
        let stat = itemStats[statTypeKey];
        if (stat.type === 0) {
          whiteStatsHTML += `<div class="stat white">+${statAmount} ${statTypeText}</div>`;
        }
        else if (stat.type === 1) {
          let customPhrase = statPhrasing(statTypeKey, statAmount);
          greenStatsHTML += `<div class="stat green">Equip: ${customPhrase}</div>`;
        }
        else if (stat.type === 2) {
          const socketColor = statTypeObj.data('color');
          socketsHTML += `<div class="socket"><img src="item-display/socket/${socketColor}.png" />${socketColor} Socket</div>`;
        }
        else if (stat.type === 3) {
          bonusArmor = $(this).find('.stat-amount').val();
        }
      }
    });

    let bind = $('input[name="itemBind"]:checked').val();
    bind = bind == "boe" ? 'Binds when equipped' : bind == "bop" ? 'Binds when picked up' : null;
    if (bind) { bindHTML = `<div class="item-bind">${bind}</div>`; }

    let unique = $('input[name="itemUnique"]:checked').val();
    unique = unique == "unique" ? 'Unique' : unique == "equipped" ? 'Unique-Equipped' : null;
    if (unique) { uniqueHTML = `<div class="item-unique">${unique}</div>`; }

    let slotName = $('#item-slot option:selected').text();
    let itemName = $("#item-name").val() || `${qualityName} ${slotName}`;
    
    let requiredLevel = parseFloat($('#item-reqlvl').val());
    requiredLevel = requiredLevel === 0 ? '' : requiredLevel > 80 ? 80 : requiredLevel < 1 ? 1 : itemLevel - 5 > 0 ? itemLevel - 5 : 1;
    let requiredLevelHTML = requiredLevel >= 1 ? `<div>Requires Level ${requiredLevel}</div>` : '';

    let itemType = $('#item-subclass option:selected').text();
    let itemTypeKey = parseFloat($('#item-subclass option:selected').val());

    if (itemClass == 2) { // weapon properties
      const damageMin = parseFloat($("#damageMin").val());
      const damageMax = parseFloat($("#damageMax").val());
      const attackSpeed = parseFloat($("#attackSpeed").val());
      let delay = attackSpeed >= 5 ? 5 : attackSpeed <= 1 ? 1 : attackSpeed;
      weaponDamageHTML = calculateDamage(damageMin, damageMax, delay, getBonusDamage());
      // calculate dps reduction
      // add feral attack power or spell power
    }

    if (itemClass == 4) { // armor properties
      itemArmor = calculateArmor(itemSlot, itemType, itemLevel, itemQuality, bonusArmor);
      if(itemSlot == 14) {
        blockValue = calculateShieldBlock(itemLevel, itemQuality);
      }
      if(socketsHTML) {
        const socketBonus = '+8 Strength';
        socketsHTML = `
          <div id="sockets">
            ${socketsHTML}
            <div class="socket">Socket Bonus: ${socketBonus}</div>
          </div>
        `;
      }
    }

    const durabilityCalc = 145;
    durabilityHTML = itemTypeKey !== 0 ? `<div>Durability ${durabilityCalc} / ${durabilityCalc}</div>` : '';

    const [gold, silver, copper] = [19, 96, 36];
    sellPriceHTML = `
    <div id="sellprice">
      <div>Sell Price:</div>
      ${gold >= 0 ? '<div class="gold">'+gold+'</div>' : ''}
      ${silver >= 0 ? '<div class="silver">'+silver+'</div> ' : ''}
      ${copper >= 0 ? '<div class="copper">'+copper+'</div> ' : ''}
    </div>
    `;

    let tooltipHtml = createTooltipHTML(qualityName, itemName, itemLevel, durabilityHTML, requiredLevelHTML, sellPriceHTML, bindHTML, uniqueHTML, slotName, subClassHTML(), weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, socketsHTML, greenStatsHTML, itemFlavorHTML);
    $('#output .tooltip').html(tooltipHtml);
  }

  // ui/ux

  $(document).on('click', '#stats .group .delete', function() {
    var parentGroup = $(this).parent();
    if(parentGroup.hasClass('socket')) { updateStatGroup('socket','delete'); }
    else { updateStatGroup('stat', 'delete'); }
    parentGroup.addClass('wipe-out').on('animationend', function() { $(this).remove(); });
  });

  $(document).on('change input', '#stats .stat-amount', function() {
    if ($(this).val() <= 0) { $(this).val(''); }
    const val = 999;
    const pct = 100;
    let sum = 0;

    if($("#selectStats").is(":checked")) {
      $('.stat-amount').attr('max', pct);
      if ($(this).val() >= pct) { $(this).val(pct); }
      $('.stat-amount').each(function() { sum += parseFloat($(this).val()) || 0; });
      if(sum != pct) { $('.stat-amount').addClass('error'); }
      else { $('.stat-amount').removeClass('error'); }
    }
    else {
      $('.stat-amount').attr('max', val);
      if ($(this).val() > val) { $(this).val(val); }
    }
  });

  $("#stats").on('change input', '.stat-type, .stat-amount', function() {
    if($(this).hasClass('error')) {
      $(this).removeClass('error');
    }
  });

  $("#output").hide();
  $("#warning").hide();
  $(".itemType").hide();
  $(".weaponMethod").hide();
  let lastSelected = null;
  
  $("#damageMax, #damageMin, #damageMax1, #damageMin1, #attackSpeed").on('change input', function() {
    if ($(this).val() <= 0) { $(this).val(''); }
  });
  
  $("#damageMax, #damageMin").on('change input', function() {
    let maxDamageObj = $("#damageMax");
    let maxDamage = parseFloat(maxDamageObj.val());
    let minDamageObj = $("#damageMin");
    let minDamage = parseFloat(minDamageObj.val());
    //if(maxDamage < minDamage && maxDamage >= 0) { maxDamageObj.val(minDamage); }
  });

  $("#damageMax1, #damageMin1").on('change input', function() {
    let maxDamageObj = $("#damageMax1");
    let maxDamage = parseFloat(maxDamageObj.val());
    let minDamage = parseFloat($("#damageMin1").val());
    if(maxDamage < minDamage && maxDamage >= 0) { maxDamageObj.val(minDamage); }
  });
  
  $('input[name="itemClass"]').click(function() {
    const currentSelection = $(this).val();
    if (lastSelected === currentSelection) { return; }
    lastSelected = currentSelection;

    let itemClass = $('input[name="itemClass"]:checked').val();
    populateItemSlots(itemClass);
    $('.itemSlot').show();
    $(".itemType").hide();
    if (currentSelection == 4) {
      $("#item-damage").empty();
      $("#damageMax, #damageMin").val('');
      $(".weaponDamage").hide();
      $('.weaponDamageExtra input').val('');
      $(".weaponDamageExtra").hide();
    }
  });

  $('#item-level').hide();
  $('.textStats').hide();
  $(".weaponDamage").hide();
  $(".weaponDamageExtra").hide();
  $("#selectLevel").click(function() {
    $("#item-level").val('').hide();
    $(".textStats").hide();
    $(".textLevel").show();
    $("#statMethod").html("integer");
    $("#item-level").attr("required", false);
    $('.stat-amount').removeClass('error');
  });
  $("#selectStats").click(function() {
    $("#item-level").val('').show();
    $(".textStats").show();
    $(".textLevel").hide();
    $("#statMethod").html("percentage");
    $("#item-level").attr("required", true);
    $("#item-level").focus();
    let sum = 0;
    $('.stat-amount').each(function() {
      sum += parseFloat($(this).val()) || 0;
    });
    if(sum > 100) { $('.stat-amount').addClass('error'); }
  });
  $('#item-level').on('change input', function() { if ($(this).val() <= 0) { $(this).val(''); } });
  $('#add-stat').click(function() { updateStatGroup('stat', 'add'); });
  $('#add-socket').click(function() { updateStatGroup('socket', 'add'); });
  $('#stats').on('change', '.stat-type.stat', updateStatDropdowns);
  $('#stats').on('change', '.stat-type.socket', updateSocketDropdowns);
  $('input[name="itemQuality"]').click(function() {
    $("#item-name").removeClass("uncommon rare epic legendary artifact");
    $("#item-name").addClass($(this).val());
  });
  
  $('#item-subclass').on('change', function() {
    if($(this).hasClass('error')) { $(this).removeClass('error'); }
    const selectedClass = $("#item-slot option:selected").data('class');
    if (selectedClass == 2) { // is a weapon
      populateWeaponDamageTypes();
      $(".weaponDamage").show();

      if ($("#item-subclass option:selected").val() == 10) { // staff
        $(".weaponMethod").show();
      }
      else {
        $(".weaponMethod").hide();
      }

      if ($("#item-slot option:selected").val() == 21) { // main-hand
        $(".weaponMethod").show();
      }

      if ($("#item-slot option:selected").val() == 26) {
        $('.weaponDamageExtra input').val('');
        $(".weaponDamageExtra").hide();
      }
      else if ($("#item-slot option:selected").val() == 25) {
        $('.weaponDamageExtra input').val('');
        $(".weaponDamageExtra").hide();
      }
      else if ($("#item-slot option:selected").val() == 2) {
        $('.weaponDamageExtra input').val('');
        $(".weaponDamageExtra").hide();
      }
      else { $(".weaponDamageExtra").show(); }
    }
  });
  
  $('#item-slot').on('change', function() {
    if($(this).hasClass('error')) {
      $("#item-subclass").removeClass('error');
      $(this).removeClass('error');
    }
    const itemSlot = $(this).find('option:selected').val();
    const itemClass = $(this).find('option:selected').data('class');
    const array = itemClass == '4' ? armorClass : weaponClass;
    if (itemSlot) { populateSubClass(array[itemSlot].subClass, itemClass); }
    $(".itemType").show();
    $(".weaponMethod").hide();
    if(itemSlot == 26 || itemSlot == 25 || itemSlot == 15) {
      $('.weaponDamageExtra input').val('');
      $(".weaponDamageExtra").hide();
    }
  });
  
  $('#calculator').on("submit keypress", function(e) { 
    if ((e.type === 'keypress' && e.key === 'Enter') || e.type === 'submit') {
      e.preventDefault();
      calculateForm();
    }
  });

  // page load
  populateItemSlots($('input[name="itemClass"]:checked').val());

});