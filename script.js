$(document).ready(function() {
  
  const exponent = Math.log(2) / Math.log(1.5);
  const exponentInverse = 1 / exponent;

  const dataFilter = (quality, lvl, data) => {
    for (const set of data) { if (quality === set.quality && set.min <= lvl) { return set.mod; } }
    return null;
  };

  const armorClass = {
    1: { name: "Head", sellMod: (12/16), armorMod: (13/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (16/16) },
        { quality: 4, min: 90, mod: (11/16) },
        { quality: 4, min: 1, mod: (16/16) },
        { quality: 3, min: 1, mod: (16/16) },
        { quality: 2, min: 1, mod: (16/16) },
      ])
    },
    2: { name: "Neck", sellMod: (8/16), armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 1, mod: (4/16) },
      ])
    },
    3: { name: "Shoulder", sellMod: (12/16), armorMod: (12/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (8/16) },
        { quality: 4, min: 90, mod: (6/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 1, mod: (8/16) },
      ])
    },
    6: { name: "Waist", sellMod: (8/16), armorMod: (9/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (8/16) },
        { quality: 4, min: 90, mod: (6/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 1, mod: (8/16) },
      ])
    },
    7: { name: "Legs", sellMod: (16/16), armorMod: (14/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (16/16) },
        { quality: 4, min: 90, mod: (12/16) },
        { quality: 4, min: 1, mod: (16/16) },
        { quality: 3, min: 1, mod: (16/16) },
        { quality: 2, min: 1, mod: (16/16) },
      ])
    },
    8: { name: "Feet", sellMod: (12/16), armorMod: (11/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (8/16) },
        { quality: 4, min: 90, mod: (6/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 1, mod: (8/16) },
      ])
    },
    9: { name: "Wrists", sellMod: (8/16), armorMod: (7/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 1, mod: (4/16) },
      ])
    },
    10: { name: "Hands", sellMod: (8/16), armorMod: (10/16), itemClass: 4, subClass: [1, 2, 3, 4],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (8/16) },
        { quality: 4, min: 90, mod: (6/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 1, mod: (8/16) },
      ])
    },
    11: { name: "Finger", sellMod: (8/16), armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 200, mod: (4/16) },
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 1, mod: (4/16) },
      ])
    },
    12: { name: "Trinket", sellMod: (28/16), armorMod: 0, itemClass: 4, subClass: [0],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 90, mod: (6/16) },
        { quality: 4, min: 1, mod: (8/16) },
        { quality: 3, min: 80, mod: (11/16) },
        { quality: 3, min: 1, mod: (8/16) },
        { quality: 2, min: 1, mod: (8/16) },
      ])
    },
    14: { name: "Shield", sellMod: (15/16), armorMod: (16/16), itemClass: 4, subClass: [6],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 1, mod: (4/16) },
      ])
    },
    16: { name: "Back", sellMod: (12/16), armorMod: (8/16), itemClass: 4, subClass: [1],
      slotMod: (quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 90, mod: (3/16) },
        { quality: 4, min: 1, mod: (4/16) },
        { quality: 3, min: 1, mod: (4/16) },
        { quality: 2, min: 80, mod: (4/16) },
        { quality: 2, min: 1, mod: (3/16) },
      ])
    },
    4: { name: "Shirt", sellMod: (4/16), armorMod: 0, itemClass: 4, subClass: [1], slotMod: (1/32) },
    5: { name: "Chest", sellMod: (16/16), armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    7: { name: "Legs", sellMod: (16/16), armorMod: (14/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    19: { name: "Tabard", sellMod: (4/16), armorMod: 0, itemClass: 4, subClass: [0], slotMod: (1/32) },
    20: { name: "Chest (Robe)", sellMod: (16/16), armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4], slotMod: (16/16) },
    23: { name: "Held Off-hand", sellMod: (8/16), armorMod: 0, itemClass: 4, subClass: [0], slotMod: (3/16) },
    28: { name: "Relic", sellMod: (4/16), armorMod: 0, itemClass: 4, subClass: [7, 8, 9, 10], slotMod: (1/32) },
  };
  
  const weaponClass = {
    13: { name: "One-Hand", sellMod: (7/16), slotMod: (2/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    15: { name: "Bow", sellMod: (16/16), slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [2] },
    17: { name: "Two-Hand", sellMod: (16/16), slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [1, 5, 8, 6, 10] },
    21: { name: "Main-Hand", sellMod: (7/16), slotMod: (2/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    22: { name: "Off-Hand", sellMod: (7/16), slotMod: (2/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    25: { name: "Thrown", sellMod: (5/16), slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [16] },
    26: { name: "Ranged", sellMod: (5/16), slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [3, 18, 19] }
  };

  const socketMods = (slot, quality, lvl) => dataFilter(quality, lvl, 
    [2, 11, 14, 23].includes(slot)
    ? [ // ammys, rings, shields, offhands
      { quality: 4, min: 200, mod: (24/1) },
      { quality: 4, min: 1, mod: (10/1) },
      { quality: 3, min: 1, mod: (10/1) },
      { quality: 2, min: 1, mod: (5/1) },
    ]
    : [ // everything else
      { quality: 4, min: 200, mod: (24/1) },
      { quality: 4, min: 90, mod: (100/1) },
      { quality: 4, min: 1, mod: (20/1) },
      { quality: 3, min: 1, mod: (20/1) },
      { quality: 2, min: 1, mod: (10/1) },
    ]
  );

  const itemStats = {
    "armor": { name: "Bonus Armor", type: 3,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 1, mod: (2/32) },
        { quality: 3, min: 80, mod: (2/32) },
        { quality: 3, min: 1, mod: (3/32) },
        { quality: 2, min: 1, mod: (3/32) },
      ])
    },
    7: { name: "Stamina", type: 0,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 90, mod: (2/3) },
        { quality: 4, min: 1, mod: (16/16) },
        { quality: 3, min: 80, mod: (2/3) },
        { quality: 3, min: 1, mod: (16/16) },
        { quality: 2, min: 80, mod: (2/3) },
        { quality: 2, min: 1, mod: (16/16) },
      ])
    },
    43: { name: "Mana Regen MP5", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, 
        [2, 11, 12, 23].includes(slot)
        ? [ // ammys, rings, trinkets, offhand
          { quality: 4, min: 200, mod: (24/16) },
          { quality: 4, min: 1, mod: (32/16) },
          { quality: 3, min: 80, mod: (32/16) },
          { quality: 3, min: 1, mod: (48/16) },
          { quality: 2, min: 1, mod: (48/16) },
        ]
        : [ // everything else
          { quality: 4, min: 1, mod: (32/16) },
          { quality: 3, min: 80, mod: (32/16) },
          { quality: 3, min: 1, mod: (92/32) },
          { quality: 2, min: 1, mod: (92/32) },
        ]
      )
    },
    45: { name: "Spell Power", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, [ 
        { quality: 4, min: 90, mod: (45/64) },
        { quality: 4, min: 1, mod: (55/64) },
        { quality: 3, min: 1, mod: (55/64) },
        { quality: 2, min: 80, mod: (55/64) },
        { quality: 2, min: 1, mod: (45/64) },
      ])
    },
    46: { name: "Health Regen HP5", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, 
        [2, 11, 12, 23].includes(slot)
        ? [ // ammys, rings, trinkets, offhand
          { quality: 4, min: 200, mod: (4/16) },
          { quality: 4, min: 90, mod: (8/16) },
          { quality: 4, min: 1, mod: (16/16) },
          { quality: 3, min: 1, mod: (32/16) },
          { quality: 2, min: 1, mod: (32/16) },
        ]
        : [ // everything else
          { quality: 4, min: 200, mod: (8/16) },
          { quality: 4, min: 90, mod: (16/16) },
          { quality: 4, min: 1, mod: (32/16) },
          { quality: 3, min: 1, mod: (64/16) },
          { quality: 2, min: 1, mod: (64/16) },
        ]
      )
    },
    48: { name: "Block Value", type: 1,
      statMod: (slot, quality, lvl) => dataFilter(quality, lvl, 
        [2, 11, 12, 14].includes(slot)
        ? [ // ammys, rings, trinkets, shields
          { quality: 4, min: 200, mod: (4/64) },
          { quality: 4, min: 1, mod: (21/64) },
          { quality: 3, min: 1, mod: (21/64) },
          { quality: 2, min: 80, mod: (21/64) },
          { quality: 2, min: 1, mod: (16/16) },
        ]
        : [ // everything else
          { quality: 4, min: 1, mod: (21/64) },
          { quality: 3, min: 1, mod: (21/64) },
          { quality: 2, min: 80, mod: (21/64) },
          { quality: 2, min: 1, mod: (16/16) },
        ]
      )
    },
    3: { name: "Agility", type: 0, statMod: (16/16) },
    4: { name: "Strength", type: 0, statMod: (16/16) },
    5: { name: "Intellect", type: 0, statMod: (16/16) },
    6: { name: "Spirit", type: 0, statMod: (16/16) },
    12: { name: "Defense Rating", type: 1, statMod: (16/16) },
    13: { name: "Dodge Rating", type: 1, statMod: (16/16) },
    14: { name: "Parry Rating", type: 1, statMod: (16/16) },
    15: { name: "Block Rating", type: 1, statMod: (16/16) },
    21: { name: "Spell Crit Rating", type: 1, statMod: (16/16) },
    31: { name: "Hit Rating", type: 1, statMod: (16/16) },
    32: { name: "Crit Rating", type: 1, statMod: (16/16) },
    35: { name: "Resilience", type: 1, statMod: (16/16) },
    36: { name: "Haste Rating", type: 1, statMod: (16/16) },
    37: { name: "Expertise Rating", type: 1, statMod: (16/16) },
    38: { name: "Attack Power", type: 1, statMod: (8/16) },
    44: { name: "Armor Penetration Rating", type: 1, statMod: (16/16) },
    47: { name: "Spell Penetration", type: 1, statMod: (12/16) },
    "arcane_res": { name: "Resist Arcane", type: 0, statMod: (16/16) },
    "fire_res": { name: "Resist Fire", type: 0, statMod: (16/16) },
    "nature_res": { name: "Resist Nature", type: 0, statMod: (16/16) },
    "frost_res": { name: "Resist Frost", type: 0, statMod: (16/16) },
    "shadow_res": { name: "Resist Shadow", type: 0, statMod: (16/16) },
    "meta_socket": { name: "Meta Socket", color: "meta", type: 2, statMod: socketMods },
    "red_socket": { name: "Red Socket", color: "red", type: 2, statMod: socketMods },
    "blue_socket": { name: "Blue Socket", color: "blue", type: 2, statMod: socketMods },
    "yellow_socket": { name: "Yellow Socket", color: "yellow", type: 2, statMod: socketMods },
  };

  const statPhrases = {
    12: statAmount => `Increases defense rating by ${statAmount}.`,
    13: statAmount => `Increases your dodge rating by ${statAmount}.`,
    14: statAmount => `Increases your parry rating by ${statAmount}.`,
    15: statAmount => `Increases your shield block rating by ${statAmount}.`,
    21: statAmount => `Improves critical strike rating by ${statAmount}.`,
    31: statAmount => `Improves hit rating by ${statAmount}.`,
    32: statAmount => `Improves critical strike rating by ${statAmount}.`,
    35: statAmount => `Improves your resilience rating by ${statAmount}.`,
    36: statAmount => `Improves haste rating by ${statAmount}.`,
    37: statAmount => `Improves expertise rating by ${statAmount}.`,
    38: statAmount => `Increases attack power by ${statAmount}.`,
    43: statAmount => `Restores ${statAmount} mana per 5 sec.`,
    44: statAmount => `Increases your armor penetration rating by ${statAmount}.`,
    45: statAmount => `Increases spell power by ${statAmount}.`,
    46: statAmount => `Restores ${statAmount} health per 5 sec.`,
    47: statAmount => `Increases spell penetration by ${statAmount}.`,
    48: statAmount => `Increases the block value of your shield by ${statAmount}.`
  };

  const armorSubClass = {
    0: { name: "Miscellaneous", sellMod: (28/16), tooltip: 0 },
    1: { name: "Cloth", sellMod: (9/16), tooltip: 1 },
    2: { name: "Leather", sellMod: (11/16), tooltip: 1 },
    3: { name: "Mail", sellMod: (14/16), tooltip: 1 },
    4: { name: "Plate", sellMod: (16/16), tooltip: 1 },
    6: { name: "Shield", sellMod: (16/16), tooltip: 0 },
    7: { name: "Libram", sellMod: (16/16), tooltip: 1 }, // paladin
    8: { name: "Idol", sellMod: (16/16), tooltip: 1 }, // druid
    9: { name: "Totem", sellMod: (16/16), tooltip: 1 }, // shaman
    10: { name: "Sigil", sellMod: (16/16), tooltip: 1 } // deathknight
  };

  const weaponDamageTypes = {
    1: { name: "Holy" },
    2: { name: "Fire" },
    3: { name: "Nature" },
    4: { name: "Frost" },
    5: { name: "Shadow" },
    6: { name: "Arcane" }
  };
  
  const weaponDelays = {
    0: { 21: 2400, 13: 2300, 22: 2000, 17: 3400 }, // Axe
    4: { 21: 2000, 13: 2300, 22: 1500, 17: 3300 }, // Mace
    7: { 21: 1900, 13: 2200, 22: 1500, 17: 3300 }, // Sword
    15: { 21: 1700, 13: 1700, 22: 1600 }, // Dagger
    13: { 21: 2600, 13: 2000, 22: 2000 }, // Fist
    6: { 17: 3200 }, // Polearm
    10: { 17: 2700 }, // Staff
    2: { 15: 2700 }, // Bow
    16: { 25: 1900 }, // Thrown
    3: { 26: 2700 }, // Gun
    18: { 26: 2900 }, // Crossbow
    19: { 26: 1700 } // Wand
  };
  
  const weaponSubClass = {
    0: { name: "Axe", delay: type => weaponDelays[0][type] || 2400, tooltip: 1 },
    1: { name: "Axe", delay: type => weaponDelays[0][type] || 2400, tooltip: 1 },
    2: { name: "Bow", delay: type => weaponDelays[2][type] || 2700, tooltip: 0 },
    3: { name: "Gun", delay: type => weaponDelays[3][type] || 2700, tooltip: 1 },
    4: { name: "Mace", delay: type => weaponDelays[4][type] || 2000, tooltip: 1 },
    5: { name: "Mace", delay: type => weaponDelays[4][type] || 2000, tooltip: 1 },
    6: { name: "Polearm", delay: type => weaponDelays[6][type] || 3200, tooltip: 1 },
    7: { name: "Sword", delay: type => weaponDelays[7][type] || 1900, tooltip: 1 },
    8: { name: "Sword", delay: type => weaponDelays[7][type] || 1900, tooltip: 1 },
    10: { name: "Staff", delay: type => weaponDelays[10][type] || 2700, tooltip: 1 },
    13: { name: "Fist", delay: type => weaponDelays[13][type] || 2000, tooltip: 1 },
    15: { name: "Dagger", delay: type => weaponDelays[15][type] || 1700, tooltip: 1 },
    16: { name: "Thrown", delay: type => weaponDelays[16][type] || 1900, tooltip: 1 },
    18: { name: "Crossbow", delay: type => weaponDelays[18][type] || 2900, tooltip: 1 },
    19: { name: "Wand", delay: type => weaponDelays[19][type] || 1700, tooltip: 1 }
  };

  const weaponDamageMod = [
    { type: [13, 15, 22, 25, 26], sub: null, quality: [2, 3, 4], min: 1, max: 300, mod: 0.54 }, // Default for types 13, 15, 22, 25, 26
    { type: 17, sub: [1, 5, 6, 8, 10], quality: [2, 3, 4], min: 1, max: 300, mod: 0.65 }, // Default two-hand for type 17
    { type: 17, sub: 10, quality: [2, 3, 4], min: 101, max: 300, mod: 0.54 }, // Default caster staff for type 17
    { type: 21, sub: null, quality: [2, 3, 4], min: 1, max: 100, mod: 0.54 }, // Default main-hand for type 21 (1 to 100)
    { type: 21, sub: null, quality: [2, 3, 4], min: 101, max: 300, mod: 0.3125 }, // Default main-hand for type 21 (101 to 300)
    { type: 13, sub: 15, quality: 3, min: 101, max: 300, mod: 0.65 }, // Rare one-hand daggers
    { type: 13, sub: 15, quality: 4, min: 1, max: 100, mod: 0.54 }, // Epic one-hand daggers (1 to 100)
    { type: 13, sub: 15, quality: 4, min: 101, max: 300, mod: 0.65 }, // Epic one-hand daggers (101 to 300)
    { type: 15, sub: 2, quality: 4, min: 1, max: 100, mod: 0.54 }, // Epic bows (1 to 100)
    { type: 15, sub: 2, quality: 4, min: 101, max: 300, mod: 0.65 }, // Epic bows (101 to 300)
    { type: 21, sub: 13, quality: [2, 3], min: 1, max: 300, mod: 0.54 }, // Default main-hand fist (2, 3)
    { type: 21, sub: 13, quality: 4, min: 200, max: 300, mod: 0.65 }, // Epic main-hand fist (200 to 300)
    { type: 21, sub: 4, quality: 4, min: 115, max: 164, mod: 0.155 }, // Epic main-hand mace (115 to 164)
    { type: 21, sub: 15, quality: 4, min: 101, max: 200, mod: 0.155 }, // Epic main-hand daggers (101 to 200)
    { type: 21, sub: 15, quality: 4, min: 1, max: 100, mod: 0.3125 }, // Epic main-hand daggers (1 to 100)
    { type: 21, sub: 0, quality: 4, min: 1, max: 300, mod: 0.54 }, // Epic main-hand axes
    { type: 25, sub: 16, quality: [3, 4], min: 1, max: 300, mod: 0.65 }, // Rare and epic thrown
    { type: 26, sub: 18, quality: [3, 4], min: 1, max: 300, mod: 0.65 }, // Rare and epic crossbows
  ];

  const weaponDPS = {
    4: {
      13: [ // One-hand
        { min: 1, max: 99, sub: null, mod: lvl => -0.46373319610341757 + 1.948435650742608 * lvl - 0.05134655549435444 * Math.pow(lvl, 2) + 0.0006882333623959314 * Math.pow(lvl, 3) - 0.000002864536021471839 * Math.pow(lvl, 4) },
        { min: 100, max: 199, sub: null, mod: lvl => -0.2769968450289057 + 1.5484937105463996 * lvl - 0.011645982924600652 * Math.pow(lvl, 2) + 0.00004802296965314522 * Math.pow(lvl, 3) - 5.273652941191476e-8 * Math.pow(lvl, 4) },
        { min: 200, max: 300, sub: null, mod: lvl => -0.08289582596875844 + 1.1576083521398557 * lvl - 0.005540388894214148 * Math.pow(lvl, 2) + 0.000016701140069482415 * Math.pow(lvl, 3) }
      ],
      15: [ // Bows
        { min: 1, max: 300, sub: 2, mod: lvl => -1.8160185143165526 + 0.8176011515936384 * lvl + 0.00004631966853788777 * Math.pow(lvl, 2) - 0.00002190693147532568 * Math.pow(lvl, 3) + 9.05587408850838e-8 * Math.pow(lvl, 4) }
      ],
      17: [ // Two-hand
        { type: 'caster', min: 1, max: 300, sub: 10, mod: lvl => -2.7137455672 + 1.2034848552 * lvl - 0.0078149234 * Math.pow(lvl, 2) + 0.0000237964 * Math.pow(lvl, 3) },
        { type: 'druid', min: 1, max: 300, sub: 10, mod: lvl => -39.8477534594 + 2.2205407279 * lvl - 0.0111235858 * Math.pow(lvl, 2) + 0.0000284616 * Math.pow(lvl, 3) },
        { type: null, min: 1, max: 100, sub: -10, mod: lvl => -0.7405045351583416 + 2.5291730790997162 * lvl - 0.06696995004352309 * Math.pow(lvl, 2) + 0.0009043795705405915 * Math.pow(lvl, 3) - 0.000003796542201089664 * Math.pow(lvl, 4) },
        { type: null, min: 91, max: 300, sub: -10, mod: lvl => 0.904817539290022 + 1.5822436006525589 * lvl - 0.007940579189201744 * Math.pow(lvl, 2) + 0.000023354465861457816 * Math.pow(lvl, 3) },
      ],
      21: [ // Main-hand
        { type: 'caster', min: 1, max: 199, sub: [4, 7, 15], mod: lvl => 0.33220409164479436 + 0.9289727447958701 * lvl - 0.0029446443452658348 * Math.pow(lvl, 2) - 0.00004346568763260079 * Math.pow(lvl, 3) + 2.2512744703653982e-7 * Math.pow(lvl, 4) },
        { type: 'caster', min: 200, max: 300, sub: [4, 7, 15], mod: lvl => -1428.9508500081054 + 19.69433925384912 * lvl - 0.08717187138547562 * Math.pow(lvl, 2) + 0.0001325134232926368 * Math.pow(lvl, 3) },
        { type: null, min: 1, max: 300, sub: null, mod: lvl => -0.5178790028826743 + 0.4607974744638549 * lvl + 0.0061377306628395585 * Math.pow(lvl, 2) - 0.00006505628736448377 * Math.pow(lvl, 3) + 2.70678156265153e-7 * Math.pow(lvl, 4) - 3.427754270710267e-10 * Math.pow(lvl, 5) }
      ],
      22: [ // Off-hand
        { min: 1, max: 300, sub: null, mod: lvl => -0.8154206101027381 + 0.8306900043436485 * lvl - 0.00029042355648253686 * Math.pow(lvl, 2) - 0.000009668965907691205 * Math.pow(lvl, 3) + 4.243652454960742e-8 * Math.pow(lvl, 4) }
      ],
      25: [ // Thrown
        { min: 1, max: 300, sub: null, mod: lvl => -0.12483151990909214 + 1.605551235747681 * lvl - 0.008135377299559524 * Math.pow(lvl, 2) + 0.000023833062012799013 * Math.pow(lvl, 3) }
      ],
      26: [ // Ranged: Guns & Crossbows
        { min: 1, max: 300, sub: [3, 18], mod: lvl => -2.9838107517317654 + 1.044765562039762 * lvl - 0.003913212784379925 * Math.pow(lvl, 2) + 6.090860438060731e-7 * Math.pow(lvl, 3) + 5.016590029076527e-8 * Math.pow(lvl, 4) },
        { min: 1, max: 94, sub: 19, mod: lvl => -0.19588388531408696 + 1.413551669030605 * lvl - 0.014741678597083266 * Math.pow(lvl, 2) + 0.00017194361662129607 * Math.pow(lvl, 3) },
        { min: 95, max: 300, sub: 19, mod: lvl => 38.01542852693626 + 1.5934000590768418 * lvl - 0.007732119057129331 * Math.pow(lvl, 2) + 0.000027000350802930127 * Math.pow(lvl, 3) },
      ]
    },
    3: {
      13: [ // One-hand
        { min: 1, max: 115, sub: null, mod: lvl => -0.20849222965398617 + 0.5638012041071734 * lvl + 0.006185098993217638 * Math.pow(lvl, 2) - 0.00010529221983632224 * Math.pow(lvl, 3) + 4.856933421922349e-7 * Math.pow(lvl, 4) },
        { min: 116, max: 300, sub: null, mod: lvl => -1129.4203195277557 + 28.231290187427803 * lvl - 0.24779778144598605 * Math.pow(lvl, 2) + 0.0009711032569160498 * Math.pow(lvl, 3) - 0.0000014022912601703806 * Math.pow(lvl, 4) }
      ],
      15: [ // Bows
        { min: 1, max: 300, sub: 2, mod: lvl => -0.743084783011632 + 0.7736504766853647 * lvl - 0.002608641911723087 * Math.pow(lvl, 2) + 0.000008555961584640232 * Math.pow(lvl, 3) }
      ],
      17: [ // Two-hand
        { type: 'caster', min: 1, max: 300, sub: 10, mod: lvl => -1.5589456685719236 + 0.9962799588626463 * lvl - 0.002586859275705108 * Math.pow(lvl, 2) + 0.000009472522985824832 * Math.pow(lvl, 3) },
        { type: null, min: 1, max: 300, sub: -10, mod: lvl => -1.4407940637747765 + 0.9868570871805012 * lvl - 0.0023989071048527186 * Math.pow(lvl, 2) + 0.00000872913868341514 * Math.pow(lvl, 3) },
      ],
      21: [ // Main-hand
        { min: 1, max: 300, sub: [4, 7, 15], mod: lvl => 0.9195580731155433 + 0.7492658962645824 * lvl - 0.005319339993856751 * Math.pow(lvl, 2) + 0.000017593004422642952 * Math.pow(lvl, 3) },
        { min: 1, max: 300, sub: null, mod: lvl => 0.7081542428231806 + 0.6667863115619928 * lvl - 0.0007860876748404416 * Math.pow(lvl, 2) + 0.000003503709149771536 * Math.pow(lvl, 3) }
      ],
      22: [ // Off-hand
        { min: 1, max: 300, sub: null, mod: lvl => 0.31862967197133674 + 0.6822091250858717 * lvl - 0.0007913172544140505 * Math.pow(lvl, 2) + 0.000003122564997039902 * Math.pow(lvl, 3) }
      ],
      25: [ // Thrown
        { min: 1, max: 300, sub: null, mod: lvl => 0.625697055774282 + 0.8215995459019617 * lvl - 0.0005425910100895496 * Math.pow(lvl, 2) + 0.0000032710921570688796 * Math.pow(lvl, 3) }
      ],
      26: [ // Ranged: Guns & Crossbows
        { min: 1, max: 300, sub: [3, 18], mod: lvl => -0.2913340491058385 + 0.7574162727175957 * lvl - 0.0024457905894126005 * Math.pow(lvl, 2) + 0.000008067767939268019 * Math.pow(lvl, 3) },
        { min: 1, max: 300, sub: 19, mod: lvl => 1.8294537711042669 + 0.7318471260336387 * lvl + 0.004969814407876487 * Math.pow(lvl, 2) - 0.000017145838654172353 * Math.pow(lvl, 3) + 1.7205349213855612e-8 * Math.pow(lvl, 4) }
      ]
    },
    2: {
      13: [ // One-hand
        { min: 1, max: 300, sub: null, mod: lvl => 0.4042050606136029 + 0.49734508151683776 * lvl + 0.0007876333296000732 * Math.pow(lvl, 2) - 0.0000013811950352316454 * Math.pow(lvl, 3) }
      ],
      15: [ // Bow
        { min: 1, max: 300, sub: 2, mod: lvl => 0.22444917005698017 + 0.5822163577210446 * lvl - 0.0006990769934425673 * Math.pow(lvl, 2) + 0.0000024109481894875313 * Math.pow(lvl, 3) }
      ],
      17: [ // Two-hand
        { type: 'caster', min: 1, max: 300, sub: 10, mod: lvl => 0.5878275909223474 + 0.6486638702862207 * lvl - 0.0008183156661210863 * Math.pow(lvl, 2) },
        { type: null, min: 1, max: 300, sub: null, mod: lvl => -1.2469017714620838 + 0.7595359183093786 * lvl - 0.00052 * Math.pow(lvl, 2) + 0.0000031790771502211193 * Math.pow(lvl, 3) }
      ],
      21: [ // Main-hand
        { type: null, min: 1, max: 300, sub: null, mod: lvl => 0.1888986564358558 + 0.514467630955437 * lvl + 0.0001449871791498711 * Math.pow(lvl, 2) + 0.0000022300382306673762 * Math.pow(lvl, 3) },
        { type: 'caster', min: 1, max: 300, sub: [4, 7, 15], mod: lvl => 0.4835370552909741 + 0.8668090226204177 * lvl - 0.006599272125728605 * Math.pow(lvl, 2) + 0.000020415414066691894 * Math.pow(lvl, 3) }
      ],
      22: [ // Off-hand
        { min: 1, max: 300, sub: null, mod: lvl => 0.9718419506869891 + 0.41682208197155196 * lvl + 0.001587412068902008 * Math.pow(lvl, 2) - 0.0000030964817997803457 * Math.pow(lvl, 3) }
      ],
      25: [ // Thrown
        { min: 1, max: 300, sub: null, mod: lvl => 2.766343576702119 + 0.46057309703714083 * lvl + 0.0031338924726831943 * Math.pow(lvl, 2) - 0.000008297133052168907 * Math.pow(lvl, 3) }
      ],
      26: [ // Ranged: Guns, Crossbows, & Wands
        { min: 1, max: 300, sub: [3, 18], mod: lvl => 1.4129016032445012 + 0.4961550555995297 * lvl + 0.00032039463941715415 * Math.pow(lvl, 2) - 8.224505599804983e-7 * Math.pow(lvl, 3) },
        { min: 1, max: 300, sub: 19, mod: lvl => 3.4857134522863866 + 0.48418168318576166 * lvl + 0.005842172301613738 * Math.pow(lvl, 2) - 0.000014078423351119631 * Math.pow(lvl, 3) }
      ]
    }
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
    4: lvl => {
      if (lvl >= 190) return 364.0853740290 - 1.7727768015 * lvl + 0.0050409241 * Math.pow(lvl, 2);
      if (lvl >= 1) return -36.7178644064 + 2.3738336805 * lvl - 0.0257785254 * Math.pow(lvl, 2) + 0.0002156921 * Math.pow(lvl, 3) - 0.0000005816 * Math.pow(lvl, 4);
    },
    3: lvl => {
      if (lvl >= 154) return 18470.4850615834 - 421.5128438990 * lvl + 3.5991532696 * Math.pow(lvl, 2) - 0.0135272648 * Math.pow(lvl, 3) + 0.0000189300 * Math.pow(lvl, 4);
      if (lvl >= 71) return -29 + 1 * lvl;
      if (lvl >= 1) return -3.5159255097 + 1.1796186496 * lvl - 0.0464979829 * Math.pow(lvl, 2) + 0.0011133817 * Math.pow(lvl, 3) - 0.0000079076 * Math.pow(lvl, 4);
    },
    2: lvl => {
      if (lvl >= 130) return 958.2984725669 - 18.2166307096 * lvl + 0.1250629715 * Math.pow(lvl, 2) - 0.0002655468 * Math.pow(lvl, 3);
      if (lvl >= 80) return -16.3908655872 + 0.6897096083 * lvl + 0.0013506088 * Math.pow(lvl, 2);
      if (lvl >= 1) return -3.0432462933 + 0.8825715740 * lvl - 0.0312968732 * Math.pow(lvl, 2) + 0.0007254284 * Math.pow(lvl, 3) - 0.0000046519 * Math.pow(lvl, 4);
    }
  };

  const qualityCoefficients = {
    4: {
      name: 'epic',
      sellValue: lvl => { return 10000 + 600 * lvl + Math.pow(0.16 * lvl, 2) },
      calc: lvl => {
        if (lvl >= 200) return qC(lvl,1.32,-120);
        if (lvl >= 100) return qC(lvl,0.700,-2);
        if (lvl >= 1) return qC(lvl,0.689,1);
      }
    },
    3: {
      name: 'rare',
      sellValue: lvl => { return 500 + 525 * lvl },
      calc: lvl => {
        if (lvl >= 136) return qC(lvl,0.88,-39.25);
        if (lvl >= 80) return qC(lvl,0.674,-8);
        if (lvl >= 1) return qC(lvl,0.641,-4);
      }
    },
    2: {
      name: 'uncommon',
      sellValue: lvl => { return 439 * lvl },
      calc: lvl => {
        if (lvl >= 130) return qC(lvl,0.801,-38.3); 
        if (lvl >= 80) return qC(lvl,0.505,-4.5); 
        if (lvl >= 1) return qC(lvl,0.495,-2.85); 
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
    let statBudget = 0;
    let socketBudgetTotal = 0;

    const array = itemClass == '4' ? armorClass : weaponClass;
    const invType = array[slot];
    const slotMod = invType.slotMod;
    const slotModFunction = typeof slotMod === 'function';
    const effectiveSlotMod = slotModFunction ? slotMod(quality, level) : slotMod;
    let itemBudget = Math.pow(qualityMod(level) * effectiveSlotMod, exponent) / effectiveSlotMod;
    
    $('#stats .group.socket').each(function() {
      const socketType = $(this).find('.stat-type.socket').val();
      const socketName = itemStats[socketType]?.name;
      const socketMod = itemStats[socketType].statMod;
      const effectiveSocketMod = socketMod(slot, quality, level);
      const socketBudget = Math.pow(effectiveSocketMod, exponent);
      socketBudgetTotal += socketBudget;
      itemBudget -= socketBudget;
      statValues[socketType] = 1;
      console.log(`socketType: ${socketName}(${socketType}), socketValue: 1, socketMod: ${effectiveSocketMod}, socketBudget: ${socketBudget}`);
    });
    
    $('#stats .group.stat').each(function() {
      const statType = $(this).find('.stat-type').val();
      const statName = itemStats[statType]?.name;
      const statPercent = parseFloat($(this).find('.stat-amount').val()) / 100;
      const statMod = itemStats[statType].statMod;
      const statModFunction = typeof statMod === 'function';
      const effectiveStatMod = statModFunction ? statMod(slot, quality, level) : statMod;
      statBudget = itemBudget * statPercent;
      const statValue = Math.pow(statBudget / effectiveStatMod, exponentInverse);
      statValues[statType] = Math.ceil(statValue);
      console.log(`statType: ${statName}(${statType}), statValue: ${statValue}, statMod: ${effectiveStatMod}, statBudget: ${statBudget}`);
    });

    if(itemBudget <= 0) {
      $('#output').hide();
      $('#item-level').addClass('error');
    }

    console.log(`qualityMod: ${qualityMod(level)}, statBudget: ${statBudget}, slotMod: ${effectiveSlotMod}, itemBudget: ${parseFloat(socketBudgetTotal) + parseFloat(itemBudget)}, itemLevel: ${level}`);
    return statValues;
  }

  function getWeaponDelay(type, sub) {
    return weaponSubClass[sub].delay(type);
  }

  function calculateDamage(lvl, quality, type, sub, delay = null, special = null, bonus = null) {
    console.warn(`calculating weapon damage`);

    // Retrieve base DPS
    const baseDps = (() => {
      const array = weaponDPS[quality];
      const data = special ? array[special] : array[type];
      for (const row of data) {
        const subMatch = row.sub === null || 
                         (Array.isArray(row.sub) && row.sub.some(s => s >= 0 && s === sub || s < 0 && s !== -sub)) || 
                         row.sub === sub;
        if (subMatch && lvl >= row.min && lvl < row.max) {
          return row.mod(lvl);
        }
      }
      return null;
    })();
    console.log(`Base DPS: ${baseDps}`);

    // Retrieve weapon modifier
const coefficient = (() => {
  const matchingEntry = weaponDamageMod.find(entry =>
    (Array.isArray(entry.type) ? entry.type.includes(type) : entry.type === type) &&
    (entry.sub === null || (Array.isArray(entry.sub) ? entry.sub.includes(sub) : entry.sub === sub)) &&
    (Array.isArray(entry.quality) ? entry.quality.includes(quality) : entry.quality === quality) &&
    lvl >= entry.min && lvl <= entry.max
  );
  return matchingEntry ? matchingEntry.mod : null;
})();
    console.log(`Coefficient (Modifier): ${coefficient}`);

    // Determine attack speed
    const attackSpeed = delay ? delay : weaponSubClass[sub].delay(type);
    console.log(`Attack Speed: ${attackSpeed}`);

    // Calculate damage
    let minDamage = baseDps * (attackSpeed / 1000) * (1 - coefficient / 2);
    let maxDamage = baseDps * (attackSpeed / 1000) * (1 + coefficient / 2);
    console.log(`Min Damage before bonus: ${minDamage}`);
    console.log(`Max Damage before bonus: ${maxDamage}`);

    // Apply bonus damage
    let damageHTML = '';
    if (bonus) {
      minDamage += bonus.min;
      maxDamage += bonus.max ? bonus.max : bonus.min;
      damageHTML = bonus.display;
      console.log(`Bonus Min Damage: ${bonus.min}`);
      console.log(`Bonus Max Damage: ${bonus.max ? bonus.max : bonus.min}`);
    }

    // Final damage values
    console.log(`Final Min Damage: ${minDamage}`);
    console.log(`Final Max Damage: ${maxDamage}`);

    // Prepare final damage output
    const baseDamageText = maxDamage === minDamage ? `${Math.ceil(minDamage)}` : `${Math.ceil(minDamage)} - ${Math.ceil(maxDamage)}`;
    const finalDPS = ((minDamage + maxDamage) / 2) / (attackSpeed / 1000);
    console.log(`Final DPS: ${finalDPS}`);

    console.log(`calculateDamage(${lvl}, ${quality}, ${type}, ${sub}, ${delay}, ${special}, ${bonus}) => min: ${minDamage}, max: ${maxDamage}`);

    return `
      <div class="group spread">
        <div>${baseDamageText} Damage</div>
        <div>Speed ${(attackSpeed / 1000).toFixed(2)}</div>
      </div>
      ${damageHTML}
      <div>(${finalDPS.toFixed(2)} damage per second)</div>
    `;
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
    damageObj.empty().append('<option value="">Bonus Damage</option>');
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
      options += `<option data-color="${data.color}" value="${key}">${data.name}</option>`;
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
        if (data.type === 2 && (key !== 'meta_socket' || selectedSockets.indexOf(key) === -1 || key === socketValue)) { selectObj.append(`<option data-color="${data.color}" value="${key}">${data.name}</option>`); }
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
          <div class="group pill stat" id="stat-group-${statCount}">
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
          <div class="group pill socket" id="stat-group-${statCount}">
            <input type="number" class="stat-amount hide" data-calc="" id="stat-amount-${statCount}" value="1" disabled />
            ${createSocketDropdown(socketCount)}
            <div class="delete"><i class="stage1 fa-solid fa-ellipsis-vertical"></i><i class="stage2 fa-regular fa-trash-can"></i></div>
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
  
  function createTooltipHTML(itemQuality, itemName, itemLevel, durabilityHTML, requiredLevelHTML, moneyHTML, bindHTML, uniqueHTML, slotHTML, typeHTML, weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, socketsHTML, greenStatsHTML, itemFlavorHTML) {
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
      ${socketsHTML}
      ${durabilityHTML}
      ${requiredLevelHTML}
      <div class="green stats">${greenStatsHTML}</div>
      ${itemFlavorHTML}
      ${moneyHTML}
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

  function sumStats() {
    let sum = 0;
    $('#stats .group.stat .stat-amount').each(function() { sum += parseFloat($(this).val()) || 0; });
    return sum;
  }
  
  function sumSockets() {
    return $('#stats .group.socket').length;
  }
  
  function statPhrasing(itemStat, statAmount) {
    const phraseFunction = statPhrases[itemStat];
    return phraseFunction ? phraseFunction(statAmount) : 'broken';
  }
  
  function calculateDenomination(totalCopper) {
    const gold = Math.floor(totalCopper / 10000);
    const remainder = totalCopper % 10000;
    const silver = Math.floor(remainder / 100);
    const copper = Math.floor(remainder % 100);
    console.log(`gold:  ${gold}, silver: ${silver}, copper: ${copper}`);
    return [gold, silver, copper];
  }
  
  function calculateBuyValue(sellValue, type) {
    const typeMod = type === 0 ? 0.25 : 0.2;
    const totalCopper = sellValue / typeMod;
    return calculateDenomination(totalCopper);
  }

  function calculateSellValue(itemClass, level, quality, slot, type) {
    console.warn(`generating monetary values`);
    const array = itemClass == '4' ? armorClass : weaponClass;
    const invType = array[slot];
    const sellMod = invType.sellMod;
    const qualityMod = armorSubClass[type].sellMod;
    const totalCopper = qualityCoefficients[quality].sellValue(level) * sellMod * qualityMod;
    const sellValue = calculateDenomination(totalCopper);
    const buyValue = calculateBuyValue(totalCopper, type);
    return { buyValue, sellValue };
  }

  function calculateForm() { // form calculation
    // error check
    let err = false;
    $("#output").hide();

    const calcMethod = $('input[name="calcMethod"]:checked').val();
    if (calcMethod === 'stats') {
      if ($("#item-level").val() <= 0) {
        $("#item-level").addClass('error');
        err = true;
      }
      if ($('#stats .group.stat').length > 0 && sumStats() != 100) {
        $("#stats .group.stat .stat-amount").addClass('error');
        err = true;
      }
    }
    if (!$('#item-slot').val()) {
      $('#item-slot').addClass('error');
      err = true;
    }
    if (!$('#item-subclass').val()) {
      $('#item-subclass').addClass('error');
      err = true;
    }
    if (!$('#item-slot').val() && !$('#item-subclass').val()) {
      err = true;
    }
    if ($('#stats .group.stat').length <= 0 && $('#stats .group.socket').length <= 0) {
      $('#add-stat').addClass('error');
      $('#add-socket').addClass('error');
      err = true;
    }

    $('#stats .group.socket').each(function() {
      const statTypeObj = $(this).find('.stat-type');
      const statType = statTypeObj.val();
      if(!statType) {
        statTypeObj.addClass('error');
        err = true;
      }
    });
    
    $('#stats .group.stat').each(function() {
      const statTypeObj = $(this).find('.stat-type');
      const statType = statTypeObj.val();
      const statValueObj = $(this).find('.stat-amount');
      const statValue = parseFloat(statValueObj.val());
      if(statType && !statValue) {
        statValueObj.addClass('error');
        err = true;
      }
      else if(!statType && statValue) {
        statTypeObj.addClass('error');
        err = true;
      }
      else if(!statType && !statValue) {
        statValueObj.addClass('error');
        statTypeObj.addClass('error');
        err = true;
      }
    });

    if(err) { return; }
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
    requiredLevel = requiredLevel == 0 ? '' : requiredLevel >= 1 ? requiredLevel : itemLevel-5 >= 1 ? itemLevel-5 : 0;
    let requiredLevelHTML = requiredLevel >= 1 ? `<div>Requires Level ${requiredLevel}</div>` : '';

    let itemType = $('#item-subclass option:selected').text();
    let itemTypeKey = parseFloat($('#item-subclass option:selected').val());

    if (itemClass == 2) { // weapon properties
      const damageMin = parseFloat($("#damageMin").val());
      const damageMax = parseFloat($("#damageMax").val());
      const delay = parseFloat($("#weaponSpeed").val()*1000 || getWeaponDelay(itemSlot, itemTypeKey));
      weaponDamageHTML = calculateDamage(itemLevel, itemQuality, itemSlot, itemTypeKey, delay, null, getBonusDamage());
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
      else { socketsHTML = ''; }
    }

    const durabilityCalc = 145;
    durabilityHTML = itemTypeKey !== 0 ? `<div>Durability ${durabilityCalc} / ${durabilityCalc}</div>` : '';

    const { sellValue, buyValue } = calculateSellValue(itemClass, itemLevel, itemQuality, itemSlot, itemTypeKey);
    const [goldSell, silverSell, copperSell] = sellValue;
    const [goldBuy, silverBuy, copperBuy] = buyValue;

    sellPriceHTML = `
      <div id="sell">
        <div>Sell Price:</div>
        ${goldSell > 0 ? `<div class="gold">${goldSell}</div>` : ''}
        ${silverSell > 0 ? `<div class="silver">${silverSell}</div>` : ''}
        ${copperSell > 0 ? `<div class="copper">${copperSell}</div>` : ''}
      </div>
    `;

    buyPriceHTML = `
      <div id="buy">
        <div>Buy Price:</div>
        ${goldBuy > 0 ? `<div class="gold">${goldBuy}</div>` : ''}
        ${silverBuy > 0 ? `<div class="silver">${silverBuy}</div>` : ''}
        ${copperBuy > 0 ? `<div class="copper">${copperBuy}</div>` : ''}
      </div>
    `;

    const moneyHTML = sellPriceHTML + buyPriceHTML;

    let tooltipHtml = createTooltipHTML(qualityName, itemName, itemLevel, durabilityHTML, requiredLevelHTML, moneyHTML, bindHTML, uniqueHTML, slotName, subClassHTML(), weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, socketsHTML, greenStatsHTML, itemFlavorHTML);
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
    const val = 10000;
    const pct = 100;
    let sum = 0;

    if($("#selectStats").is(":checked")) {
      $('.group.stat .stat-amount').attr('max', pct);
      if ($(this).val() >= pct) { $(this).val(pct); }
      $('.group.stat .stat-amount').each(function() { sum += parseFloat($(this).val()) || 0; });
      if(sum != pct) { $('.group.stat .stat-amount').addClass('error'); }
      else { $('.group.stat .stat-amount').removeClass('error'); }
    }
    else {
      $('.group.stat .stat-amount').attr('max', val);
      if ($(this).val() > val) { $(this).val(val); }
    }
  });

  $('#reset').on('click', function() {
    $('form')[0].reset();
    $('#stats .group').remove();
    $('#item-subclass, #output, #item-level').hide();
    const itemClassObj = $('input[name="itemClass"]:checked');
    const itemClass = $(itemClassObj).val();
    populateItemSlots(itemClass);
    $(".weaponDamage").hide();
    $(".weaponDamageExtra").hide();
    statCount = 0;
    socketCount = 0;
    $('#add-stat, #add-socket').show();
    $('*').removeClass('error');
    const reset = $(this);
    reset.removeClass('rotate');
    reset.addClass('rotate');
    reset.on('animationend', function() {
      reset.removeClass('rotate');
    });
  });
  
  $("#stats").on('change input', '.stat-type, .stat-amount', function() {
    if($(this).hasClass('error')) {
      $(this).removeClass('error');
    }
  });

  $("#output, #sockets").hide();
  $(".itemType").hide();
  $(".weaponMethod").hide();
  let lastSelected = null;
  
  $("#item-reqlvl").on('change input', function() {
    if ($(this).val() < 0) { $(this).val(''); }
  });


  $("#weaponSpeed").on('', function() {
    let obj = $(this).val();
    let val = obj.val();
  });

  $("#weaponSpeed").on('change input', function() {
    let obj = $(this);
    let val = obj.val();
    if (val >= 6) { obj.val(6); }
    if (val <= 0) { obj.val(''); }
  });

  $("#damageMax1, #damageMin1").on('change input', function() {
    if ($(this).val() <= 0) { $(this).val(''); }
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
      $("#weaponSpeed").val('');
      $(".weaponDamage").hide();
      $('.weaponDamage input').val('');
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
    $("#statMethod").html("an integer");
    $("#item-level").attr("required", false);
    $('.stat-amount').removeClass('error');
  });
  $("#selectStats").click(function() {
    $("#item-level").val('').show();
    $(".textStats").show();
    $(".textLevel").hide();
    $("#statMethod").html("a percentage");
    $("#item-level").attr("required", true);
    $("#item-level").focus();
    let sum = 0;
    $('.stat-amount').each(function() {
      sum += parseFloat($(this).val()) || 0;
    });
    if(sum > 100) { $('.stat-amount').addClass('error'); }
  });
  $('#item-level').on('change input', function() {
    if ($(this).val() <= 0) { $(this).val(''); }
    else { $(this).removeClass('error'); }
  });
  $('#add-stat').click(function() {
    $(this).removeClass('error');
    $('#add-socket').removeClass('error');
    updateStatGroup('stat', 'add');
  });
  $('#add-socket').click(function() {
    $(this).removeClass('error');
    $('#add-stat').removeClass('error');
    updateStatGroup('socket', 'add');
  });
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
      $("#weaponSpeed").val();

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
    $(".weaponMethod, .weaponDamage").hide();
    if(itemSlot == 15 || itemSlot == 25) {
      $(".weaponDamage").show();
      $('.weaponDamage input').val('');
    }
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

  $('#submit').on("click", function(e) {
    e.preventDefault();
    calculateForm();
  });

  // page load
  populateItemSlots($('input[name="itemClass"]:checked').val());

});