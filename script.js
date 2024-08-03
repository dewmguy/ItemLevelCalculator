$(document).ready(function() {
  
  const exponent = 1.5;
  //const exponent = Math.log(2)/Math.log(1.5);
  const exponentInverse = 1 / exponent;
  
  const applyResistances = (quality, ilvl) => {
    return (quality === 2 && ilvl >= 1 && ilvl <= 69) ? (14/16) :
    (quality === 4 && ilvl >= 200 && ilvl <= 300) ? (12/16) :
    (14/16);
  };

  const applySockets = (quality, ilvl) => {
    return (quality === 2 && ilvl >= 1 && ilvl <= 69) ? (10/1) :
    (quality === 2 && ilvl >= 70 && ilvl <= 135) ? (10/1) :
    (quality === 2 && ilvl >= 136 && ilvl <= 200) ? (25/1) :
    (quality === 3 && ilvl >= 1 && ilvl <= 79) ? (10/1) :
    (quality === 3 && ilvl >= 80 && ilvl <= 135) ? (10/1) :
    (quality === 3 && ilvl >= 136 && ilvl <= 200) ? (25/1) :
    (quality === 4 && ilvl >= 1 && ilvl <= 89) ? (10/1) :
    (quality === 4 && ilvl >= 90 && ilvl <= 199) ? (10/1) :
    (quality === 4 && ilvl >= 200 && ilvl <= 300) ? (25/1) :
    null;
  };
  
  const dataFilter = (quality, ilvl, data) => {
    for (const set of data) {
      if (quality === set.quality && ilvl >= set.min && ilvl <= set.max) { return set.mod; }
    }
    return null;
  };

  const inventoryType = {
    "1": { name: "Head", armorMod: (13/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "3": { name: "Shoulder", armorMod: (12/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (8/16) },
    "5": { name: "Chest", armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "7": { name: "Legs", armorMod: (14/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    "9": { name: "Wrists", armorMod: (7/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (4/16) },
    "20": { name: "Chest (Robe)", slotMod: (16/16), armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "4": { name: "Shirt", armorMod: 0, itemClass: 4, subClass: [1], slotMod: (1/16) },
    "19": { name: "Tabard", armorMod: 0, itemClass: 4, subClass: [0], slotMod: (1/16) },
    "28": { name: "Relic", armorMod: 0, itemClass: 4, subClass: [7, 8, 9, 10], slotMod: (1/16) },
    "6": { name: "Waist", armorMod: (9/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (10/16) },
        { quality: 2, min: 70, max: 135, mod: (8/16) },
        { quality: 2, min: 136, max: 200, mod: (8/16) },
        { quality: 3, min: 1, max: 79, mod: (10/16) },
        { quality: 3, min: 80, max: 135, mod: (9/16) },
        { quality: 3, min: 136, max: 200, mod: (9/16) },
        { quality: 4, min: 1, max: 89, mod: (10/16) },
        { quality: 4, min: 90, max: 199, mod: (9/16) },
        { quality: 4, min: 200, max: 300, mod: (9/16) },
      ])
    },
    "8": { name: "Feet", armorMod: (11/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (8/16) },
        { quality: 2, min: 70, max: 135, mod: (8/16) },
        { quality: 2, min: 136, max: 200, mod: (8/16) },
        { quality: 3, min: 1, max: 79, mod: (8/16) },
        { quality: 3, min: 80, max: 135, mod: (7/16) },
        { quality: 3, min: 136, max: 200, mod: (7/16) },
        { quality: 4, min: 1, max: 89, mod: (8/16) },
        { quality: 4, min: 90, max: 199, mod: (7/16) },
        { quality: 4, min: 200, max: 300, mod: (7/16) },
      ])
    },
    "10": { name: "Hands", armorMod: (10/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (9/16) },
        { quality: 2, min: 70, max: 135, mod: (8/16) },
        { quality: 2, min: 136, max: 200, mod: (8/16) },
        { quality: 3, min: 1, max: 79, mod: (9/16) },
        { quality: 3, min: 80, max: 135, mod: (9/16) },
        { quality: 3, min: 136, max: 200, mod: (6/16) },
        { quality: 4, min: 1, max: 89, mod: (9/16) },
        { quality: 4, min: 90, max: 199, mod: (8/16) },
        { quality: 4, min: 200, max: 300, mod: (4/16) },
      ])
    },
    "14": { name: "Shield", armorMod: (16/16), itemClass: 4, subClass: [6],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (4/16) },
        { quality: 2, min: 70, max: 135, mod: (4/16) },
        { quality: 2, min: 136, max: 200, mod: (4/16) },
        { quality: 3, min: 1, max: 79, mod: (4/16) },
        { quality: 3, min: 80, max: 135, mod: (4/16) },
        { quality: 3, min: 136, max: 200, mod: (4/16) },
        { quality: 4, min: 1, max: 89, mod: (4/16) },
        { quality: 4, min: 90, max: 199, mod: (4/16) },
        { quality: 4, min: 200, max: 300, mod: (8/16) },
      ])
    },
    "16": { name: "Back", armorMod: (8/16), itemClass: 4, subClass: [1],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (3/16) },
        { quality: 2, min: 70, max: 135, mod: (4/16) },
        { quality: 2, min: 136, max: 200, mod: (4/16) },
        { quality: 3, min: 1, max: 79, mod: (3/16) },
        { quality: 3, min: 80, max: 135, mod: (3/16) },
        { quality: 3, min: 136, max: 200, mod: (3/16) },
        { quality: 4, min: 1, max: 89, mod: (3/16) },
        { quality: 4, min: 90, max: 199, mod: (3/16) },
        { quality: 4, min: 200, max: 300, mod: (4/16) },
      ])
    },
    "2": { name: "Neck", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (4/16) },
        { quality: 2, min: 70, max: 135, mod: (4/16) },
        { quality: 2, min: 136, max: 200, mod: (4/16) },
        { quality: 3, min: 1, max: 79, mod: (4/16) },
        { quality: 3, min: 80, max: 135, mod: (3/16) },
        { quality: 3, min: 136, max: 200, mod: (4/16) },
        { quality: 4, min: 1, max: 89, mod: (4/16) },
        { quality: 4, min: 90, max: 199, mod: (3/16) },
        { quality: 4, min: 200, max: 300, mod: (3/16) },
      ])
    },
    "11": { name: "Finger", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (3/16) },
        { quality: 2, min: 70, max: 135, mod: (4/16) },
        { quality: 2, min: 136, max: 200, mod: (4/16) },
        { quality: 3, min: 1, max: 79, mod: (3/16) },
        { quality: 3, min: 80, max: 135, mod: (3/16) },
        { quality: 3, min: 136, max: 200, mod: (3/16) },
        { quality: 4, min: 1, max: 89, mod: (3/16) },
        { quality: 4, min: 90, max: 199, mod: (3/16) },
        { quality: 4, min: 200, max: 300, mod: (8/16) },
      ])
    },
    "12": { name: "Trinket", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (8/16) },
        { quality: 2, min: 70, max: 135, mod: (7/16) },
        { quality: 2, min: 136, max: 200, mod: (7/16) },
        { quality: 3, min: 1, max: 79, mod: (8/16) },
        { quality: 3, min: 80, max: 135, mod: (11/16) },
        { quality: 3, min: 136, max: 200, mod: (11/16) },
        { quality: 4, min: 1, max: 89, mod: (8/16) },
        { quality: 4, min: 90, max: 199, mod: (5/16) },
        { quality: 4, min: 200, max: 300, mod: (3/16) },
      ])
    },
    "23": { name: "Held Off-hand", armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, ilvl) => dataFilter(quality, ilvl, [
        { quality: 2, min: 1, max: 69, mod: (3/16) },
        { quality: 2, min: 70, max: 135, mod: (4/16) },
        { quality: 2, min: 136, max: 200, mod: (4/16) },
        { quality: 3, min: 1, max: 79, mod: (3/16) },
        { quality: 3, min: 80, max: 135, mod: (3/16) },
        { quality: 3, min: 136, max: 200, mod: (3/16) },
        { quality: 4, min: 1, max: 89, mod: (3/16) },
        { quality: 4, min: 90, max: 199, mod: (3/16) },
        { quality: 4, min: 200, max: 300, mod: (3/16) },
      ])
    },
    "13": { name: "One-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "21": { name: "Main-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "22": { name: "Off-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "17": { name: "Two-Hand", slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [1, 5, 8, 6, 10] },
    "15": { name: "Bow", slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [2] },
    "25": { name: "Thrown", slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [16] },
    "26": { name: "Ranged", slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [3, 18, 19] }
  };

  const itemStats = {
    "0": { name: "Mana", type: 0, statMod: (32/16) },
    "1": { name: "Health", type: 0, statMod: (32/16) },
    "3": { name: "Agility", type: 0, statMod: (16/16) },
    "4": { name: "Strength", type: 0, statMod: (16/16) },
    "5": { name: "Intellect", type: 0, statMod: (16/16) },
    "6": { name: "Spirit", type: 0, statMod: (16/16) },
    "7": { name: "Stamina", type: 0,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [
        { quality: 2, min: 1, max: 69, mod: (16/16) },
        { quality: 2, min: 70, max: 200, mod: (10/16) },
        { quality: 3, min: 1, max: 79, mod: (16/16) },
        { quality: 3, min: 80, max: 200, mod: (10/16) },
        { quality: 4, min: 1, max: 300, mod: (10/16) },
      ])
    },
    "12": { name: "Defense Rating", type: 1, statMod: (slot, quality, lvl) => (slot === 14) ? (10/16) : (16/16) },
    "13": { name: "Dodge Rating", type: 1, statMod: (16/16) },
    "14": { name: "Parry Rating", type: 1, statMod: (16/16) },
    "15": { name: "Block Rating", type: 1, statMod: (slot, quality, lvl) => (slot === 14) ? (6/16) : (16/16) },
    "21": { name: "Spell Crit Rating", type: 1, statMod: (16/16) },
    "31": { name: "Hit Rating", type: 1, statMod: (16/16) },
    "32": { name: "Crit Rating", type: 1, statMod: (16/16) },
    "35": { name: "Resilience Rating", type: 1, statMod: (16/16) },
    "36": { name: "Haste Rating", type: 1, statMod: (16/16) },
    "37": { name: "Expertise Rating", type: 1, statMod: (16/16) },
    "38": { name: "Attack Power", type: 1, statMod: (8/16) },
    "43": { name: "Mana Regen MP5", type: 1, statMod: (32/16) },
    "44": { name: "Armor Penetration Rating", type: 1, statMod: (16/16) },
    "45": { name: "Spell Power", type: 1, statMod: (14/16) },
    "46": { name: "Health Regen HP5", type: 1, 
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [
        { quality: 4, min: 200, max: 300, mod: (4/16) },
        { quality: 1, min: 1, max: 300, mod: (11/16) },
      ])
    },
    "47": { name: "Spell Penetration", type: 1, statMod: (12/16) },
    "48": { name: "Block Value", type: 1, 
      statMod: (slot, quality, lvl) => {
        if ([2, 11, 14].includes(type) || (quality === 4 && lvl > 90)) { return (4/16); }
        else { return (11/16); }
      }
    },
    "armor": { name: "Bonus Armor", type: 3, statMod: (3/32) },
    "arcane_res": { name: "Resist Arcane", type: 0, statMod: applyResistances },
    "fire_res": { name: "Resist Fire", type: 0, statMod: applyResistances },
    "holy_res": { name: "Resist Holy", type: 0, statMod: applyResistances },
    "nature_res": { name: "Resist Nature", type: 0, statMod: applyResistances },
    "frost_res": { name: "Resist Frost", type: 0, statMod: applyResistances },
    "shadow_res": { name: "Resist Shadow", type: 0, statMod: applyResistances },
    "meta_socket": { name: "Meta Socket", type: 2, statMod: applySockets },
    "red_socket": { name: "Red Socket", type: 2, statMod: applySockets },
    "blue_socket": { name: "Blue Socket", type: 2, statMod: applySockets },
    "yellow_socket": { name: "Yellow Socket", type: 2, statMod: applySockets },
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

  const armorTypes = {
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

  const weaponTypes = {
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
    //"0": { name: "Physical" },
    "1": { name: "Holy" },
    "2": { name: "Fire" },
    "3": { name: "Nature" },
    "4": { name: "Frost" },
    "5": { name: "Shadow" },
    "6": { name: "Arcane" }
  };
  
  const armorData = {
    "6": {
      Cloth: ilvl => 2.5281010518232847 + 1.331747228269099 * ilvl + 0.00944593034412355 * Math.pow(ilvl, 2) - 0.00006849549050619422 * Math.pow(ilvl, 3) + 1.2354987243172888e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => 1.5555029361141006 + 3.0358551084632817 * ilvl + 0.010441421831956765 * Math.pow(ilvl, 2) - 0.00009593877599476476 * Math.pow(ilvl, 3) + 1.8476622137336274e-7 * Math.pow(ilvl, 4),
      Mail: ilvl => -7.5320987581173 + 9.77641667353662 * ilvl - 0.07509546031114869 * Math.pow(ilvl, 2) + 0.0008277573203410827 * Math.pow(ilvl, 3) - 0.000003968983245793348 * Math.pow(ilvl, 4) + 6.374377745994348e-9 * Math.pow(ilvl, 5),
      Plate: ilvl => 5.102460977820272 + 9.509093276356396 * ilvl + 0.07993511436723227 * Math.pow(ilvl, 2) - 0.0005654807309686971 * Math.pow(ilvl, 3) + 0.0000010185213184327804 * Math.pow(ilvl, 4),
      Shield: ilvl => -68.32056773225723 + 52.05238254766441 * ilvl - 0.2633818416382036 * Math.pow(ilvl, 2) + 0.0032416668345449868 * Math.pow(ilvl, 3) - 0.000017286124455117578 * Math.pow(ilvl, 4) + 2.9484202941863735e-8 * Math.pow(ilvl, 5)
    },
    "5": {
      Cloth: ilvl => 2.5281010518232847 + 1.331747228269099 * ilvl + 0.00944593034412355 * Math.pow(ilvl, 2) - 0.00006849549050619422 * Math.pow(ilvl, 3) + 1.2354987243172888e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => 1.5555029361141006 + 3.0358551084632817 * ilvl + 0.010441421831956765 * Math.pow(ilvl, 2) - 0.00009593877599476476 * Math.pow(ilvl, 3) + 1.8476622137336274e-7 * Math.pow(ilvl, 4),
      Mail: ilvl => -7.5320987581173 + 9.77641667353662 * ilvl - 0.07509546031114869 * Math.pow(ilvl, 2) + 0.0008277573203410827 * Math.pow(ilvl, 3) - 0.000003968983245793348 * Math.pow(ilvl, 4) + 6.374377745994348e-9 * Math.pow(ilvl, 5),
      Plate: ilvl => 5.102460977820272 + 9.509093276356396 * ilvl + 0.07993511436723227 * Math.pow(ilvl, 2) - 0.0005654807309686971 * Math.pow(ilvl, 3) + 0.0000010185213184327804 * Math.pow(ilvl, 4),
      Shield: ilvl => -68.32056773225723 + 52.05238254766441 * ilvl - 0.2633818416382036 * Math.pow(ilvl, 2) + 0.0032416668345449868 * Math.pow(ilvl, 3) - 0.000017286124455117578 * Math.pow(ilvl, 4) + 2.9484202941863735e-8 * Math.pow(ilvl, 5)
    },
    "4": {
      Cloth: ilvl => 2.5281010518232847 + 1.331747228269099 * ilvl + 0.00944593034412355 * Math.pow(ilvl, 2) - 0.00006849549050619422 * Math.pow(ilvl, 3) + 1.2354987243172888e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => 1.5555029361141006 + 3.0358551084632817 * ilvl + 0.010441421831956765 * Math.pow(ilvl, 2) - 0.00009593877599476476 * Math.pow(ilvl, 3) + 1.8476622137336274e-7 * Math.pow(ilvl, 4),
      Mail: ilvl => -7.5320987581173 + 9.77641667353662 * ilvl - 0.07509546031114869 * Math.pow(ilvl, 2) + 0.0008277573203410827 * Math.pow(ilvl, 3) - 0.000003968983245793348 * Math.pow(ilvl, 4) + 6.374377745994348e-9 * Math.pow(ilvl, 5),
      Plate: ilvl => 5.102460977820272 + 9.509093276356396 * ilvl + 0.07993511436723227 * Math.pow(ilvl, 2) - 0.0005654807309686971 * Math.pow(ilvl, 3) + 0.0000010185213184327804 * Math.pow(ilvl, 4),
      Shield: ilvl => -68.32056773225723 + 52.05238254766441 * ilvl - 0.2633818416382036 * Math.pow(ilvl, 2) + 0.0032416668345449868 * Math.pow(ilvl, 3) - 0.000017286124455117578 * Math.pow(ilvl, 4) + 2.9484202941863735e-8 * Math.pow(ilvl, 5)
    },
    "3": {
      Cloth: ilvl => -1.3423883493277042 + 2.200587627369824 * ilvl - 0.023452920240817212 * Math.pow(ilvl, 2) + 0.0002057092987396633 * Math.pow(ilvl, 3) - 5.346376377648381e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => -4.3185941880426775 + 5.22367821032947 * ilvl - 0.06638307153372526 * Math.pow(ilvl, 2) + 0.0005313187225831865 * Math.pow(ilvl, 3) - 0.0000013052892289727186 * Math.pow(ilvl, 4),
      Mail: ilvl => 31.445856660984333 + 8.055343208054605 * ilvl - 0.08529020006193702 * Math.pow(ilvl, 2) + 0.0007948792659050846 * Math.pow(ilvl, 3) - 0.0000021078789263816906 * Math.pow(ilvl, 4),
      Plate: ilvl => -28.396604349521805 + 16.329061088393786 * ilvl - 0.16567265946139803 * Math.pow(ilvl, 2) + 0.0014420657876884682 * Math.pow(ilvl, 3) - 0.000003730547431550686 * Math.pow(ilvl, 4),
      Shield: ilvl => -44.06927830732479 + 60.18645188729204 * ilvl - 4.54601783641102 * Math.pow(ilvl, 2) + 0.19213407170465685 * Math.pow(ilvl, 3) - 0.003571960126176484 * Math.pow(ilvl, 4) + 0.00003452904159703563 * Math.pow(ilvl, 5) - 1.8099081604737638e-7 * Math.pow(ilvl, 6) + 4.887914417526831e-10 * Math.pow(ilvl, 7) - 5.340719565656609e-13 * Math.pow(ilvl, 8)
    },
    "2": {
      Cloth: ilvl => 8.528248246851293 + 1.13588900743772 * ilvl + 0.00018480865552209587 * Math.pow(ilvl, 2),
      Leather: ilvl => 39.0574346793 + 1.8042785077 * ilvl + 0.0014831968 * Math.pow(ilvl, 2),
      Mail: ilvl => 74.58060541262037 + 3.93396431596397 * ilvl + 0.004366253997171184 * Math.pow(ilvl, 2),
      Plate: ilvl => -8.953978248173765 + 9.748506027592633 * ilvl - 0.003686683605302056 * Math.pow(ilvl, 2),
      Shield: ilvl => 82.22823 + 29.92042 * ilvl - 0.01284 * Math.pow(ilvl, 2) + 0.00007097724866192495 * Math.pow(ilvl, 3)
    }
  };

  const shieldBlockCoefficients = {
    uncommon: level => {
      if (level >= 1 && level <= 80) return -3.0432462933 + 0.8825715740 * level - 0.0312968732 * Math.pow(level, 2) + 0.0007254284 * Math.pow(level, 3) - 0.0000046519 * Math.pow(level, 4);
      if (level >= 81 && level <= 137) return -16.3908655872 + 0.6897096083 * level + 0.0013506088 * Math.pow(level, 2);
      if (level >= 138) return 958.2984725669 - 18.2166307096 * level + 0.1250629715 * Math.pow(level, 2) - 0.0002655468 * Math.pow(level, 3);
    },
    rare: level => {
      if (level >= 1 && level <= 70) return -3.5159255097 + 1.1796186496 * level - 0.0464979829 * Math.pow(level, 2) + 0.0011133817 * Math.pow(level, 3) - 0.0000079076 * Math.pow(level, 4);
      if (level >= 71 && level <= 153) return -29.0000000000 + 1.0000000000 * level;
      if (level >= 154) return 18470.4850615834 - 421.5128438990 * level + 3.5991532696 * Math.pow(level, 2) - 0.0135272648 * Math.pow(level, 3) + 0.0000189300 * Math.pow(level, 4);
    },
    epic: level => {
      if (level >= 0 && level <= 189) return -36.7178644064 + 2.3738336805 * level - 0.0257785254 * Math.pow(level, 2) + 0.0002156921 * Math.pow(level, 3) - 0.0000005816 * Math.pow(level, 4);
      if (level >= 190 && level <= 300) return 364.0853740290 - 1.7727768015 * level + 0.0050409241 * Math.pow(level, 2);
    },
    default: level => 54.5284833805 - 1.7511894287 * level + 0.0378136180 * Math.pow(level, 2) - 0.0001827142 * Math.pow(level, 3) + 0.0000002842 * Math.pow(level, 4)
  };

  const qualityCoefficients = {
    2: {
      name: 'uncommon',
      calculate: function(ilvl) {
        if (ilvl >= 1 && ilvl <= 69) return ilvl * 0.5 - 4;
        if (ilvl >= 70 && ilvl <= 135) return ilvl * 0.51 - 4.5;
        if (ilvl >= 136 && ilvl <= 200) return ilvl * 0.59 - 17;
      }
    },
    3: {
      name: 'rare',
      calculate: function(ilvl) {
        if (ilvl >= 1 && ilvl <= 79) return ilvl * 0.635 - 3.6;
        if (ilvl >= 80 && ilvl <= 135) return ilvl * 0.625 - 1.15;
        if (ilvl >= 136 && ilvl <= 300) return ilvl * 0.83 - 41;
      }
    },
    4: {
      name: 'epic',
      calculate: function(ilvl) {
        if (ilvl >= 1 && ilvl <= 99) return ilvl * 0.689 - 1;
        if (ilvl >= 100 && ilvl <= 199) return ilvl * 0.689 + 4;
        if (ilvl >= 200 && ilvl <= 300) return ilvl * 1.8 - 240;
      }
    }
  };

  function calculateLevel(slot, quality, qualityMod) {
    console.error("calculating level from stats");
    console.log(`slot: ${slot}, quality: ${quality}, qualityMod: ${qualityMod}`);

    const inventory = inventoryType[slot];
    const slotMod = inventory.slotMod;
    const slotModFunction = typeof slotMod === 'function';
    
    let totalStatBudget = 0;

    $('#stats .group').each(function() {
      const statType = $(this).find('.stat-type').val();
      const statName = itemStats[statType]?.name || '';
      const statMod = itemStats[statType]?.statMod || 1;
      const statValue = parseFloat($(this).find('.stat-amount').val());
      const effectiveStatMod = typeof statMod === 'function' ? statMod(slot, quality, statValue) : statMod;

      const statBudget = Math.pow(statValue * effectiveStatMod, exponent);
      totalStatBudget += statBudget;
      console.log(`statType: ${statName}(${statType}), statValue: ${statValue}, statMod: ${effectiveStatMod}, statBudget: ${statBudget}`);
    });
    
    let itemLevel = 0;
    for (let i = 0; i < 9999; i++) {
      const itemBudget = totalStatBudget * (slotModFunction ? slotMod(quality, i+1) : slotMod);
      const effectiveSlotMod = slotModFunction ? slotMod(quality, i) : slotMod;
      const statBudgetIncrement = Math.pow(qualityMod(i) * effectiveSlotMod, exponent);
      //console.log(`statBudgetIncrement [${i+1}] = ${statBudgetIncrement}`);
      if (statBudgetIncrement > itemBudget) {
        console.log(`qualityMod: ${qualityMod(i)}, statBudget: ${totalStatBudget}, slotMod: ${effectiveSlotMod}, itemBudget: ${itemBudget}, itemLevel: ${i}`);
        itemLevel = Math.max(i, 1);
        break;
      }
    }
    return itemLevel;
  }

  function calculateStats(level, slot, quality, qualityMod) {
    console.error(`calculating stats from level`);
    
    const inventory = inventoryType[slot];
    const slotMod = inventory.slotMod;
    const slotModFunction = typeof slotMod === 'function';
    const effectiveSlotMod = slotModFunction ? slotMod(quality, level) : slotMod;

    const itemBudget = Math.pow(qualityMod(level) * effectiveSlotMod, exponent) / effectiveSlotMod;
    const statValues = {};

    $('#stats .group').each(function() {
      const statType = $(this).find('.stat-type').val();
      const statName = itemStats[statType]?.name || '';
      const statMod = itemStats[statType]?.statMod || 1;
      const statPercent = parseFloat($(this).find('.stat-amount').val()) / 100 || 0;
      const effectiveStatMod = typeof statMod === 'function' ? statMod(slot, quality, level) : statMod;

      const statBudget = itemBudget * statPercent;
      const statValue = Math.pow(statBudget / effectiveStatMod, exponentInverse);
      console.log(`statValue = ${statBudget} * ${effectiveStatMod} = ${statValue}`);
      
      statValues[statType] = Math.floor(statValue);
      console.log(`statType: ${statName}(${statType}), statValue: ${statValue}, statMod: ${effectiveStatMod}, statBudget: ${statBudget}`);
    });

    console.log(`qualityMod: ${qualityMod(level)}, slotMod: ${effectiveSlotMod}, itemBudget: ${itemBudget}, itemLevel: ${level}`);
    return statValues;
  }

  function calculateArmor(slot, type, level, quality, bonus) {
    const slotData = inventoryType[slot];
    if (slotData.armorMod > 0) {
      console.error("generating armor");
      const slotMod = slotData.armorMod;
      console.log(`slotCoefficient: ${slotMod}`);
      const baseValue = armorData[quality][type](level);
      console.log(`baseValue: ${baseValue}`);
      console.log(`bonusArmor: ${bonus}`);
      const totalArmor = Math.max(Math.ceil(baseValue * slotMod), 0) + parseFloat(bonus);
      console.log(`totalArmor: ${totalArmor}`);
      return `<div class="${bonus >= 1 ? 'green' : ''}">${totalArmor} Armor</div>`;
    }
    else { return ''; }
  }
  
  function calculateShieldBlock(level, quality) {
    const calculateBlock = shieldBlockCoefficients[quality] || shieldBlockCoefficients.default;
    const baseBlock = calculateBlock(level);
    const totalBlock = baseBlock > 0 ? Math.ceil(baseBlock) : 0;
    return `<div>${totalBlock} Block</div>`;
  }

  function populateItemSlots(itemClass) {
    const itemSlotObj = $('#item-slot');
    let name = itemClass == '4' ? 'Armor' : 'Weapon';
    itemSlotObj.empty().append(`<option value="">Choose ${name} Type</option>`);
    $.each(inventoryType, function(key, data) {
      if(data.itemClass == itemClass) {
        itemSlotObj.append(`<option data-class="${data.itemClass}" value="${key}">${data.name}</option>`);
      }
    });
  }

  function populateSubClass(subClass, itemClass) {
    const subClassObj = $('#item-subclass');
    subClassObj.empty();
    const classList = itemClass == 4 ? armorTypes : weaponTypes;

    if (subClass.length === 1) {
      const classKey = subClass[0];
      const classData = classList[classKey];
      if (classData) {
        subClassObj.append(`<option value="${classKey}">${classData.name}</option>`);
        subClassObj.prop('disabled', true);
      }
    }
    else {
      subClassObj.append(`<option value="">Choose ${$("#item-slot option:selected").data('class') == 2 ? 'Weapon' : 'Armor'} Type</option>`);
      $.each(subClass, function(_, classKey) {
        let classData = classList[classKey];
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
    $.each(itemStats, function(key, data) { options += `<option value="${key}">${data.name}</option>`; });
    return `<select id="stat-type-${id}" class="stat-type" data-id="${id}">${options}</select>`;
  }

  function updateStatDropdowns() {
    const selectedStats = [];
    $('.stat-type').each(function() {
      const statValue = $(this).val();
      if (statValue) { selectedStats.push(statValue); }
      const selectObj = $(this);
      selectObj.empty();
      selectObj.append('<option value="">Select a Stat</option>');
      $.each(itemStats, function(key, data) {
        if (selectedStats.indexOf(key) === -1 || key === statValue) { selectObj.append(`<option value="${key}">${data.name}</option>`); }
      });
      selectObj.val(statValue);
    });
  }

  let statCount = 0;

  function updateStatGroup(action) {
    if (action == 'add') {
      if (statCount < 11) {
        const statHtml = `
          <div class="group select" id="stat-group-${statCount}">
            <input type="number" class="stat-amount" data-calc="" id="stat-amount-${statCount}" value="0" />
            ${createStatDropdown(statCount)}
            <div class="delete"></div>
          </div>`;
        $('#stats').append(statHtml);
        updateStatDropdowns();
        statCount++;
      }
    }
    else if (action == 'delete') { statCount--; }
    if (statCount == 10) { $("#add-stat").hide(); }
    else { $("#add-stat").show(); }
  }

  function subClassVisible(subClass, classList) {
    return classList[subClass] ? classList[subClass].tooltip : false;
  }
  
  function subClassHTML() {
    const itemClass = $('#item-slot option:selected').data('class');
    const subClass = $('#item-subclass').val();
    let subClassName = '';
    if (subClassVisible(subClass, itemClass === 4 ? armorTypes : weaponTypes) === 1) { subClassName = $('#item-subclass option:selected').text(); }
    return subClassName ? `<div class="item-subclass">${subClassName}</div>` : subClassName;
  }
  
  function createTooltipHTML(itemQuality, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotHTML, typeHTML, weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, greenStatsHTML, itemFlavorHTML) {
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
      <div class="item-reqlvl">Requires Level ${itemReqLevel}</div>
      <div class="green stats">${greenStatsHTML}</div>
      ${itemFlavorHTML}
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
    const itemBind = $('input[name="itemBind"]:checked').val() || null;
    const itemUnique = $('input[name="itemUnique"]:checked').val() || null;
    const itemQuality = $('input[name="itemQuality"]:checked').data('quality') || null;
    let qualityName = qualityCoefficients[itemQuality].name || null;
    const itemSlot = parseFloat($('#item-slot').val()) || null;
    const qualityCoefficient = qualityCoefficients[itemQuality]?.calculate || (() => 0);

    if (calcMethod === 'level') { // level calc
      itemLevel = calculateLevel(itemSlot, itemQuality, qualityCoefficient);
    }
    else if (calcMethod === 'stats') { // stat calc
      const statValues = calculateStats(itemLevel, itemSlot, itemQuality, qualityCoefficient);
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
    let greenStatsHTML = '';
    let itemArmor = '';
    let blockValue = '';
    let bonusArmor = 0;
    let weaponDamageHTML = '';
    let itemFlavorHTML = itemDescription ? `<div class="flavor">"${itemDescription}"</div>` : '';

    $('#stats .group').each(function() {
      let statTypeText = $(this).find('.stat-type option:selected').text();
      let statTypeKey = $(this).find('.stat-type option:selected').val();
      let statAmount = calcMethod == 'level' ? $(this).find('.stat-amount').val() : $(this).find('.stat-amount').data('calc');
      if (statTypeKey && statAmount > 0) {
        let stat = itemStats[statTypeKey];
        if (stat.type === 0) {
          whiteStatsHTML += `<div class="stat white">+${statAmount} ${statTypeText}</div>`;
        }
        else if (stat.type === 1) {
          let customPhrase = statPhrasing(statTypeKey, statAmount);
          greenStatsHTML += `<div class="stat green">Equip: ${customPhrase}</div>`;
        }
        else if (stat.type === 3) {
          bonusArmor = $(this).find('.stat-amount').val();
        }
        else if (stat.type === 2) {
           //gem logic
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
    
    let itemReqLevel = $("#item-reqlvl").val() || 0;

    let itemClass = $('#item-slot option:selected').data('class');
    let itemType = $('#item-subclass option:selected').text();
    let itemTypeKey = $('#item-subclass option:selected').val();

    if (itemClass == 2) { // weapon properties
      const damageMin = parseFloat($("#damageMin").val());
      const damageMax = parseFloat($("#damageMax").val());
      const attackSpeed = parseFloat($("#attackSpeed").val());
      weaponDamageHTML = calculateDamage(damageMin, damageMax, attackSpeed, getBonusDamage());
      // calculate dps reduction
      // add feral attack power or spell power
    }

    if (itemClass == 4) { // armor properties
      itemArmor = calculateArmor(itemSlot, itemType, itemLevel, itemQuality, bonusArmor);
      if(itemSlot == 14) {
        blockValue = calculateShieldBlock(itemLevel, itemQuality);
      }
    }
    
    // durability

    let tooltipHtml = createTooltipHTML(qualityName, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotName, subClassHTML(), weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, greenStatsHTML, itemFlavorHTML);
    $('#output .tooltip').html(tooltipHtml);
  }

  // ui/ux

  $(document).on('click', '#stats .group .delete', function() {
    updateStatGroup('delete');
    $(this).parent(".group").remove();
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
    if(maxDamage < minDamage && maxDamage >= 0) { maxDamageObj.val(minDamage); }
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
  $('#add-stat').click(function() { updateStatGroup('add'); });
  $('#stats').on('change', '.stat-type', updateStatDropdowns);
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
    if (itemSlot) { populateSubClass(inventoryType[itemSlot].subClass, itemClass); }
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