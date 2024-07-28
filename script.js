$(document).ready(function() {
  
  const exponent = Math.log(2)/Math.log(1.5);
  const exponentInverse = 1 / exponent;
  
  const itemSlots = {
    "1": { name: "Head", slotMod: (16/16), armorMod: (13/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "2": { name: "Neck", slotMod: (9/16), armorMod: 0, itemClass: 4, subClass: [0] },
    "3": { name: "Shoulder", slotMod: (8/16), armorMod: (12/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "4": { name: "Shirt", slotMod: (3/16), armorMod: 0, itemClass: 4, subClass: [1] },
    "5": { name: "Chest", slotMod: (16/16), armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "6": { name: "Waist", slotMod: (9/16), armorMod: (9/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "7": { name: "Legs", slotMod: (16/16), armorMod: (14/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "8": { name: "Feet", slotMod: (7/16), armorMod: (11/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "9": { name: "Wrists", slotMod: (4/16), armorMod: (7/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "10": { name: "Hands", slotMod: (9/16), armorMod: (10/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "11": { name: "Finger", slotMod: (9/16), armorMod: 0, itemClass: 4, subClass: [0] },
    "12": { name: "Trinket", slotMod: (11/16), armorMod: 0, itemClass: 4, subClass: [0] },
    "13": { name: "One-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "14": { name: "Shield", slotMod: (4/16), armorMod: (16/16), itemClass: 4, subClass: [6] },
    "15": { name: "Bow", slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [2] },
    "16": { name: "Back", slotMod: (4/16), armorMod: (8/16), itemClass: 4, subClass: [1] },
    "17": { name: "Two-Hand", slotMod: (16/16), armorMod: 0, itemClass: 2, subClass: [1, 5, 8, 6, 10] },
    "19": { name: "Tabard", slotMod: (3/16), armorMod: 0, itemClass: 4, subClass: [0] },
    "20": { name: "Chest (Robe)", slotMod: (16/16), armorMod: (16/16), itemClass: 4, subClass: [1, 2, 3, 4] },
    "21": { name: "Main-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "22": { name: "Off-Hand", slotMod: (7/16), armorMod: 0, itemClass: 2, subClass: [0, 4, 7, 15, 13] },
    "23": { name: "Held Off-hand", slotMod: (4/16), armorMod: 0, itemClass: 4, subClass: [0] },
    "25": { name: "Thrown", slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [16] },
    "26": { name: "Ranged", slotMod: (5/16), armorMod: 0, itemClass: 2, subClass: [3, 18, 19] },
    "28": { name: "Relic", slotMod: (5/16), armorMod: 0, itemClass: 4, subClass: [7, 8, 9, 10] }
  };
  
  const itemStats = { // vanilla item stats
    "0": { name: "Mana", statMod: (32/16), type: 0 },
    "1": { name: "Health", statMod: (32/16), type: 0 },
    "3": { name: "Agility", statMod: (16/16), type: 0 },
    "4": { name: "Strength", statMod: (16/16), type: 0 },
    "5": { name: "Intellect", statMod: (16/16), type: 0 },
    "6": { name: "Spirit", statMod: (16/16), type: 0 },
    "7": { name: "Stamina", statMod: (16/16), type: 0 },
    "12": { name: "Defense Rating", statMod: (16/16), type: 1 },
    "13": { name: "Dodge Rating", statMod: (16/16), type: 1 },
    "14": { name: "Parry Rating", statMod: (16/16), type: 1 },
    "15": { name: "Block Rating", statMod: (16/16), type: 1 },
    "21": { name: "Spell Crit Rating", statMod: (16/16), type: 1 },
    "31": { name: "Hit Rating", statMod: (16/16), type: 1 },
    "32": { name: "Crit Rating", statMod: (16/16), type: 1 },
    "35": { name: "Resilience Rating", statMod: (16/16), type: 1 },
    "36": { name: "Haste Rating", statMod: (16/16), type: 1 },
    "37": { name: "Expertise Rating", statMod: (16/16), type: 1 },
    "38": { name: "Attack Power", statMod: (8/16), type: 1 },
    "43": { name: "Mana Regen MP5", statMod: (32/16), type: 1 },
    "44": { name: "Armor Penetration Rating", statMod: (16/16), type: 1 },
    "45": { name: "Spell Power", statMod: (14/16), type: 1 },
    "46": { name: "Health Regen HP5", statMod: (11/16), type: 1 },
    "47": { name: "Spell Penetration", statMod: (12/16), type: 1 },
    "48": { name: "Block Value", statMod: (11/16), type: 1 },
    "armor": { name: "Bonus Armor", statMod: (3/32), type: 2 },
    "arcane_res": { name: "Resist Arcane", statMod: (12/16), type: 0 },
    "fire_res": { name: "Resist Fire", statMod: (12/16), type: 0 },
    "holy_res": { name: "Resist Holy", statMod: (12/16), type: 0 },
    "nature_res": { name: "Resist Nature", statMod: (12/16), type: 0 },
    "frost_res": { name: "Resist Frost", statMod: (12/16), type: 0 },
    "shadow_res": { name: "Resist Shadow", statMod: (12/16), type: 0 }
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
    "7": { name: "Libram", tooltip: 1 },
    "8": { name: "Idol", tooltip: 1 },
    "9": { name: "Totem", tooltip: 1 },
    "10": { name: "Sigil", tooltip: 1 }
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
    artifact: {
      Cloth: ilvl => 2.5281010518232847 + 1.331747228269099 * ilvl + 0.00944593034412355 * Math.pow(ilvl, 2) - 0.00006849549050619422 * Math.pow(ilvl, 3) + 1.2354987243172888e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => 1.5555029361141006 + 3.0358551084632817 * ilvl + 0.010441421831956765 * Math.pow(ilvl, 2) - 0.00009593877599476476 * Math.pow(ilvl, 3) + 1.8476622137336274e-7 * Math.pow(ilvl, 4),
      Mail: ilvl => -7.5320987581173 + 9.77641667353662 * ilvl - 0.07509546031114869 * Math.pow(ilvl, 2) + 0.0008277573203410827 * Math.pow(ilvl, 3) - 0.000003968983245793348 * Math.pow(ilvl, 4) + 6.374377745994348e-9 * Math.pow(ilvl, 5),
      Plate: ilvl => 5.102460977820272 + 9.509093276356396 * ilvl + 0.07993511436723227 * Math.pow(ilvl, 2) - 0.0005654807309686971 * Math.pow(ilvl, 3) + 0.0000010185213184327804 * Math.pow(ilvl, 4),
      Shield: ilvl => -68.32056773225723 + 52.05238254766441 * ilvl - 0.2633818416382036 * Math.pow(ilvl, 2) + 0.0032416668345449868 * Math.pow(ilvl, 3) - 0.000017286124455117578 * Math.pow(ilvl, 4) + 2.9484202941863735e-8 * Math.pow(ilvl, 5)
    },
    legendary: {
      Cloth: ilvl => 2.5281010518232847 + 1.331747228269099 * ilvl + 0.00944593034412355 * Math.pow(ilvl, 2) - 0.00006849549050619422 * Math.pow(ilvl, 3) + 1.2354987243172888e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => 1.5555029361141006 + 3.0358551084632817 * ilvl + 0.010441421831956765 * Math.pow(ilvl, 2) - 0.00009593877599476476 * Math.pow(ilvl, 3) + 1.8476622137336274e-7 * Math.pow(ilvl, 4),
      Mail: ilvl => -7.5320987581173 + 9.77641667353662 * ilvl - 0.07509546031114869 * Math.pow(ilvl, 2) + 0.0008277573203410827 * Math.pow(ilvl, 3) - 0.000003968983245793348 * Math.pow(ilvl, 4) + 6.374377745994348e-9 * Math.pow(ilvl, 5),
      Plate: ilvl => 5.102460977820272 + 9.509093276356396 * ilvl + 0.07993511436723227 * Math.pow(ilvl, 2) - 0.0005654807309686971 * Math.pow(ilvl, 3) + 0.0000010185213184327804 * Math.pow(ilvl, 4),
      Shield: ilvl => -68.32056773225723 + 52.05238254766441 * ilvl - 0.2633818416382036 * Math.pow(ilvl, 2) + 0.0032416668345449868 * Math.pow(ilvl, 3) - 0.000017286124455117578 * Math.pow(ilvl, 4) + 2.9484202941863735e-8 * Math.pow(ilvl, 5)
    },
    epic: {
      Cloth: ilvl => 2.5281010518232847 + 1.331747228269099 * ilvl + 0.00944593034412355 * Math.pow(ilvl, 2) - 0.00006849549050619422 * Math.pow(ilvl, 3) + 1.2354987243172888e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => 1.5555029361141006 + 3.0358551084632817 * ilvl + 0.010441421831956765 * Math.pow(ilvl, 2) - 0.00009593877599476476 * Math.pow(ilvl, 3) + 1.8476622137336274e-7 * Math.pow(ilvl, 4),
      Mail: ilvl => -7.5320987581173 + 9.77641667353662 * ilvl - 0.07509546031114869 * Math.pow(ilvl, 2) + 0.0008277573203410827 * Math.pow(ilvl, 3) - 0.000003968983245793348 * Math.pow(ilvl, 4) + 6.374377745994348e-9 * Math.pow(ilvl, 5),
      Plate: ilvl => 5.102460977820272 + 9.509093276356396 * ilvl + 0.07993511436723227 * Math.pow(ilvl, 2) - 0.0005654807309686971 * Math.pow(ilvl, 3) + 0.0000010185213184327804 * Math.pow(ilvl, 4),
      Shield: ilvl => -68.32056773225723 + 52.05238254766441 * ilvl - 0.2633818416382036 * Math.pow(ilvl, 2) + 0.0032416668345449868 * Math.pow(ilvl, 3) - 0.000017286124455117578 * Math.pow(ilvl, 4) + 2.9484202941863735e-8 * Math.pow(ilvl, 5)
    },
    rare: {
      Cloth: ilvl => -1.3423883493277042 + 2.200587627369824 * ilvl - 0.023452920240817212 * Math.pow(ilvl, 2) + 0.0002057092987396633 * Math.pow(ilvl, 3) - 5.346376377648381e-7 * Math.pow(ilvl, 4),
      Leather: ilvl => -4.3185941880426775 + 5.22367821032947 * ilvl - 0.06638307153372526 * Math.pow(ilvl, 2) + 0.0005313187225831865 * Math.pow(ilvl, 3) - 0.0000013052892289727186 * Math.pow(ilvl, 4),
      Mail: ilvl => 31.445856660984333 + 8.055343208054605 * ilvl - 0.08529020006193702 * Math.pow(ilvl, 2) + 0.0007948792659050846 * Math.pow(ilvl, 3) - 0.0000021078789263816906 * Math.pow(ilvl, 4),
      Plate: ilvl => -28.396604349521805 + 16.329061088393786 * ilvl - 0.16567265946139803 * Math.pow(ilvl, 2) + 0.0014420657876884682 * Math.pow(ilvl, 3) - 0.000003730547431550686 * Math.pow(ilvl, 4),
      Shield: ilvl => -44.06927830732479 + 60.18645188729204 * ilvl - 4.54601783641102 * Math.pow(ilvl, 2) + 0.19213407170465685 * Math.pow(ilvl, 3) - 0.003571960126176484 * Math.pow(ilvl, 4) + 0.00003452904159703563 * Math.pow(ilvl, 5) - 1.8099081604737638e-7 * Math.pow(ilvl, 6) + 4.887914417526831e-10 * Math.pow(ilvl, 7) - 5.340719565656609e-13 * Math.pow(ilvl, 8)
    },
    uncommon: {
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
    'uncommon': ilvl => ilvl * (8 / 16) - 4,
    'rare': ilvl => ilvl * (10 / 16) - 3,
    'epic': ilvl => ilvl * (12 / 16) - 2,
    'legendary': ilvl => ilvl * (14 / 16),
    'artifact': ilvl => ilvl * (16 / 16)
  };

  function calculateLevel(slot, quality) {
    console.error("calculating level from stats");
    const slotMod = itemSlots[slot].slotMod;
    let totalStatBudget = 0;
    let qualityMod, statBudgetIncrement;

    $('#stats .group').each(function() {
      const statType = $(this).find('.stat-type').val();
      const statMod = itemStats[statType]?.statMod || 1;
      const statValue = parseFloat($(this).find('.stat-amount').val());
      const statBudget = Math.pow(statValue * statMod, exponent);
      totalStatBudget += statBudget;
      console.log(`statType: (${statType}), statValue: ${statValue}, statMod: ${statMod}, statBudget: ${statBudget}`);
    });
    const itemBudget = totalStatBudget * slotMod;
    console.log(`totalStatBudget: ${totalStatBudget}, slotMod: ${slotMod}, itemBudget: ${itemBudget}`);

    for (let i = 0; i < 9999; i++) {
      qualityMod = quality(i);
      statBudgetIncrement = Math.pow(qualityMod * slotMod, exponent);
      if (statBudgetIncrement >= itemBudget) {
        console.log(`itemLevel: ${i}`);
        return i;
      }
    }
    return 0;
  }
  
  function calculateStats(level, slot, quality) {
    console.error(`calculating stats from level`);
    const itemSlotData = itemSlots[slot];
    const qualityValue = quality(level);
    const slotMod = itemSlotData.slotMod;
    const itemBudget = Math.pow(qualityValue * slotMod, exponent);
    console.log(`itemBudget: ${itemBudget}`);

    const statValues = {};
    $('#stats .group').each(function() {
      const statType = $(this).find('.stat-type').val();
      const percent = parseFloat($(this).find('.stat-amount').val()) / 100 || 0;
      const statMod = itemStats[statType]?.statMod || 1;
      const statBudget = itemBudget * percent;
      const statAmount = Math.pow(statBudget / statMod, exponentInverse);
      statValues[statType] = Math.floor(statAmount);
      console.log(`[${statType}] statBudget: ${statBudget}, statAmount: ${statAmount}`);
    });
    console.log(`returned statValues: ${JSON.stringify(statValues)}`);
    return statValues;
  }

  function calculateArmor(slot, type, level, quality, armor) {
    const slotData = itemSlots[slot];
    if (slotData.armorMod > 0) {
      console.error("generating armor");
      const slotMod = slotData.armorMod;
      console.log(`slotCoefficient: ${slotMod}`);
      const baseValue = armorData[quality][type](level);
      console.log(`baseValue: ${baseValue}`);
      console.log(`bonusArmor: ${armor}`);
      let totalArmor = Math.max(Math.ceil(baseValue * slotMod), 0) + parseFloat(armor);
      console.log(`totalArmor: ${totalArmor}`);
      return `<div class="${armor >= 1 ? 'green' : ''}">${totalArmor} Armor</div>`;
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
    $.each(itemSlots, function(key, data) {
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
    const itemSlot = $(this).find('option:selected').val();
    const itemClass = $(this).find('option:selected').data('class');
    if (itemSlot) { populateSubClass(itemSlots[itemSlot].subClass, itemClass); }
    $(".itemType").show();
    $(".weaponMethod").hide();
    if(itemSlot == 26 || itemSlot == 25 || itemSlot == 15) {
      $('.weaponDamageExtra input').val('');
      $(".weaponDamageExtra").hide();
    }
  });
  
  $('#calculator').submit(function(e) { // calculate
    e.preventDefault();

    const calcMethod = $('input[name="calcMethod"]:checked').val();
    if (calcMethod === 'stats' && ($("#item-level").val() <= 0 || sumStatValues() != 100)) {
      $(".stat-amount").addClass('error');
      return;
    }
    if (!$('input[name="itemQuality"]:checked').val()) { return; }

    $("#output").show();

    let itemLevel = $('#item-level').val() || null;
    let itemDescription = $('#item-description').val() || null;
    let statValue = null;
    const itemBind = $('input[name="itemBind"]:checked').val() || null;
    const itemUnique = $('input[name="itemUnique"]:checked').val() || null;
    const itemQuality = $('input[name="itemQuality"]:checked').val() || null;
    const itemQualityPretty = itemQuality.charAt(0).toUpperCase() + itemQuality.slice(1);
    const itemSlot = parseFloat($('#item-slot').val()) || null;
    const qualityCoefficient = qualityCoefficients[itemQuality] || (() => 0);

    if (calcMethod === 'level') { // level calc
      itemLevel = calculateLevel(itemSlot, qualityCoefficient);
    }
    else if (calcMethod === 'stats') { // stat calc
      const statValues = calculateStats(itemLevel, itemSlot, qualityCoefficient);

      $('#stats .group').each(function() {
        let statType = $(this).find('.stat-type').val();
        if (statValues[statType]) {
          $(this).find('.stat-amount').data('calc', statValues[statType]);
        }
      });

      statValue = Object.values(statValues).reduce((acc, val) => acc + val, 0);
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
        else if (stat.type === 2) {
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
    let itemName = $("#item-name").val() || `${itemQualityPretty} ${slotName}`;
    
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

    let tooltipHtml = createTooltipHTML(itemQuality, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotName, subClassHTML(), weaponDamageHTML, itemArmor, blockValue, whiteStatsHTML, greenStatsHTML, itemFlavorHTML);
    $('#output .tooltip').html(tooltipHtml);

  });

  // page load
  populateItemSlots($('input[name="itemClass"]:checked').val());

});