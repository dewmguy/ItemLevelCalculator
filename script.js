$(document).ready(function() {
  
  const itemSlots = {
    "1": { name: "Head", slotMod: (13/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "2": { name: "Neck", slotMod:  (9/16), itemClass: 4, armor: 0, subClass: [0] },
    "3": { name: "Shoulder", slotMod: (12/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "4": { name: "Shirt", slotMod:  (3/16), itemClass: 4, armor: 0, subClass: [1] },
    "5": { name: "Chest", slotMod: (16/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "6": { name: "Waist", slotMod:  (9/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "7": { name: "Legs", slotMod: (14/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "8": { name: "Feet", slotMod: (11/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "9": { name: "Wrists", slotMod:  (7/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "10": { name: "Hands", slotMod: (10/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "11": { name: "Finger", slotMod:  (9/16), itemClass: 4, armor: 0, subClass: [0] },
    "12": { name: "Trinket", slotMod: (12/16), itemClass: 4, armor: 0, subClass: [0] },
    "13": { name: "One-Hand", slotMod:  (9/16), itemClass: 2, armor: 0, subClass: [0, 4, 7, 15, 13] },
    "14": { name: "Shield", slotMod: (16/16), itemClass: 4, armor: 1, subClass: [6] },
    "15": { name: "Bow", slotMod: (16/16), itemClass: 2, armor: 0, subClass: [2] },
    "16": { name: "Back", slotMod:  (8/16), itemClass: 4, armor: 1, subClass: [1] },
    "17": { name: "Two-Hand", slotMod: (16/16), itemClass: 2, armor: 0, subClass: [1, 5, 8, 6, 10] },
    "19": { name: "Tabard", slotMod:  (3/16), itemClass: 4, armor: 0, subClass: [0] },
    "20": { name: "Robe", slotMod: (16/16), itemClass: 4, armor: 1, subClass: [1, 2, 3, 4] },
    "21": { name: "Main-Hand", slotMod:  (7/16), itemClass: 2, armor: 0, subClass: [0, 4, 7, 15, 13] },
    "22": { name: "Off-Hand", slotMod:  (7/16), itemClass: 2, armor: 0, subClass: [0, 4, 7, 15, 13] },
    "23": { name: "Held Off-hand", slotMod:  (9/16), itemClass: 4, armor: 0, subClass: [0] },
    "25": { name: "Thrown", slotMod:  (5/16), itemClass: 2, armor: 0, subClass: [16] },
    "26": { name: "Ranged", slotMod:  (5/16), itemClass: 2, armor: 0, subClass: [3, 18, 19] },
    "28": { name: "Relic", slotMod:  (4/16), itemClass: 4, armor: 0, subClass: [7, 8, 9, 10] }
  };
  
  const itemStats = {
    "0": { name: "Mana", statMod: (32/16), type: 0 },
    "1": { name: "Health", statMod: (32/16), type: 0 },
    "3": { name: "Agility", statMod: (16/16), type: 0 },
    "4": { name: "Strength", statMod: (16/16), type: 0 },
    "5": { name: "Intellect", statMod: (16/16), type: 0 },
    "6": { name: "Spirit", statMod: (16/16), type: 0 },
    "7": { name: "Stamina", statMod: (10/16), type: 0 },
    "12": { name: "Defense Rating", statMod: (16/16), type: 1 },
    "13": { name: "Dodge Rating", statMod: (16/16), type: 1 },
    "14": { name: "Parry Rating", statMod: (16/16), type: 1 },
    "15": { name: "Block Rating", statMod: (16/16), type: 1 },
    "31": { name: "Hit Rating", statMod: (16/16), type: 1 },
    "32": { name: "Crit Rating", statMod: (16/16), type: 1 },
    "35": { name: "Resilience Rating", statMod: (16/16), type: 1 },
    "36": { name: "Haste Rating", statMod: (16/16), type: 1 },
    "37": { name: "Expertise Rating", statMod: (16/16), type: 1 },
    "38": { name: "Attack Power", statMod: (8/16), type: 1 },
    "43": { name: "Mana Regen MP5", statMod: (273/200), type: 1 },
    "44": { name: "Armor Penetration Rating", statMod: (2/16), type: 1 },
    "45": { name: "Spell Power", statMod: (9/16), type: 1 },
    "46": { name: "Health Regen HP5", statMod: (91/400), type: 1 },
    "47": { name: "Spell Penetration", statMod: (12/16), type: 1 },
    "48": { name: "Block Value", statMod: (11/16), type: 1 },
    "armor": { name: "Bonus Armor", statMod: (1/16), type: 2 },
    "all_res": { name: "Resist All", statMod: (5/2), type: 0 },
    "arcane_res": { name: "Resist Arcane", statMod: (16/16), type: 0 },
    "fire_res": { name: "Resist Fire", statMod: (16/16), type: 0 },
    "holy_res": { name: "Resist Holy", statMod: (16/16), type: 0 },
    "nature_res": { name: "Resist Nature", statMod: (16/16), type: 0 },
    "frost_res": { name: "Resist Frost", statMod: (16/16), type: 0 },
    "shadow_res": { name: "Resist Shadow", statMod: (16/16), type: 0 }
  };

  const armorTypes = {
    "0": { name: "Miscellaneous", tooltip: 0 },
    "1": { name: "Cloth",         tooltip: 1 },
    "2": { name: "Leather",       tooltip: 1 },
    "3": { name: "Mail",          tooltip: 1 },
    "4": { name: "Plate",         tooltip: 1 },
    "6": { name: "Shield",        tooltip: 0 },
    "7": { name: "Libram",        tooltip: 1 },
    "8": { name: "Idol",          tooltip: 1 },
    "9": { name: "Totem",         tooltip: 1 },
    "10": { name: "Sigil",         tooltip: 1 }
  };

  const weaponTypes = {
    "0": { name: "Axe", tooltip: 1 },
    "4": { name: "Mace", tooltip: 1 },
    "7": { name: "Sword", tooltip: 1 },
    "15": { name: "Dagger", tooltip: 1 },
    "13": { name: "Fist", tooltip: 1 },
    "16": { name: "Thrown", tooltip: 1 },
    "1": { name: "Axe", tooltip: 1 },
    "5": { name: "Mace", tooltip: 1 },
    "8": { name: "Sword", tooltip: 1 },
    "6": { name: "Polearm", tooltip: 1 },
    "10": { name: "Staff", tooltip: 1 },
    "2": { name: "Bow", tooltip: 0 },
    "3": { name: "Gun", tooltip: 1 },
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
      Cloth: ilvl => -35.9162438072 + 2.7177139937 * ilvl - 0.0069377995 * Math.pow(ilvl, 2) + 0.0000083546 * Math.pow(ilvl, 3),
      Leather: ilvl => -67.9413659377 + 5.3865646281 * ilvl - 0.0159938709 * Math.pow(ilvl, 2) + 0.0000230294 * Math.pow(ilvl, 3),
      Mail: ilvl => 298.6093918649 - 3.4214066738 * ilvl + 0.1328334643 * Math.pow(ilvl, 2) - 0.0006791076 * Math.pow(ilvl, 3) + 0.0000010936 * Math.pow(ilvl, 4),
      Plate: ilvl => 798.1656398430 - 14.0579736482 * ilvl + 0.3181534343 * Math.pow(ilvl, 2) - 0.0015491623 * Math.pow(ilvl, 3) + 0.0000024433 * Math.pow(ilvl, 4),
      Shield: ilvl => 1211.2180000000 + 7.7787612192 * ilvl + 0.5256944740 * Math.pow(ilvl, 2) - 0.0030091680 * Math.pow(ilvl, 3) + 0.0000050841 * Math.pow(ilvl, 4)
    },
    legendary: {
      Cloth: ilvl => -35.9162438072 + 2.7177139937 * ilvl - 0.0069377995 * Math.pow(ilvl, 2) + 0.0000083546 * Math.pow(ilvl, 3),
      Leather: ilvl => -67.9413659377 + 5.3865646281 * ilvl - 0.0159938709 * Math.pow(ilvl, 2) + 0.0000230294 * Math.pow(ilvl, 3),
      Mail: ilvl => 298.6093918649 - 3.4214066738 * ilvl + 0.1328334643 * Math.pow(ilvl, 2) - 0.0006791076 * Math.pow(ilvl, 3) + 0.0000010936 * Math.pow(ilvl, 4),
      Plate: ilvl => 798.1656398430 - 14.0579736482 * ilvl + 0.3181534343 * Math.pow(ilvl, 2) - 0.0015491623 * Math.pow(ilvl, 3) + 0.0000024433 * Math.pow(ilvl, 4),
      Shield: ilvl => 1211.2180000000 + 7.7787612192 * ilvl + 0.5256944740 * Math.pow(ilvl, 2) - 0.0030091680 * Math.pow(ilvl, 3) + 0.0000050841 * Math.pow(ilvl, 4)
    },
    epic: {
      Cloth: ilvl => -35.9162438072 + 2.7177139937 * ilvl - 0.0069377995 * Math.pow(ilvl, 2) + 0.0000083546 * Math.pow(ilvl, 3),
      Leather: ilvl => -67.9413659377 + 5.3865646281 * ilvl - 0.0159938709 * Math.pow(ilvl, 2) + 0.0000230294 * Math.pow(ilvl, 3),
      Mail: ilvl => 298.6093918649 - 3.4214066738 * ilvl + 0.1328334643 * Math.pow(ilvl, 2) - 0.0006791076 * Math.pow(ilvl, 3) + 0.0000010936 * Math.pow(ilvl, 4),
      Plate: ilvl => 798.1656398430 - 14.0579736482 * ilvl + 0.3181534343 * Math.pow(ilvl, 2) - 0.0015491623 * Math.pow(ilvl, 3) + 0.0000024433 * Math.pow(ilvl, 4),
      Shield: ilvl => 808.8603184150 + 7.7787612192 * ilvl + 0.5256944740 * Math.pow(ilvl, 2) - 0.0030091680 * Math.pow(ilvl, 3) + 0.0000050841 * Math.pow(ilvl, 4)
    },
    rare: {
      Cloth: ilvl => -1.7276726124 + 2.2210828108 * ilvl - 0.0237938117 * Math.pow(ilvl, 2) + 0.0002079170 * Math.pow(ilvl, 3) - 0.0000005395 * Math.pow(ilvl, 4),
      Leather: ilvl => -4.8585494487 + 5.2507808015 * ilvl - 0.0668166270 * Math.pow(ilvl, 2) + 0.0005340479 * Math.pow(ilvl, 3) - 0.0000013112 * Math.pow(ilvl, 4),
      Mail: ilvl => 31.4458566610 + 8.0553432081 * ilvl - 0.0852902001 * Math.pow(ilvl, 2) + 0.0007948793 * Math.pow(ilvl, 3) - 0.0000021079 * Math.pow(ilvl, 4),
      Plate: ilvl => -945.7560305396 + 52.8506875668 * ilvl - 0.6639548312 * Math.pow(ilvl, 2) + 0.0042400859 * Math.pow(ilvl, 3) - 0.0000092706 * Math.pow(ilvl, 4),
      Shield: ilvl => -1632.9049851859 + 111.4033198457 * ilvl - 1.3258633473 * Math.pow(ilvl, 2) + 0.0091741437 * Math.pow(ilvl, 3) - 0.0000210537 * Math.pow(ilvl, 4)
    },
    uncommon: {
      Cloth: ilvl => 9.3698273840 + 1.1137462410 * ilvl + 0.0002936443 * Math.pow(ilvl, 2),
      Leather: ilvl => 39.0574346793 + 1.8042785077 * ilvl + 0.0014831968 * Math.pow(ilvl, 2),
      Mail: ilvl => 74.5806054126 + 3.9339643160 * ilvl + 0.0043662540 * Math.pow(ilvl, 2),
      Plate: ilvl => -9.1068691810 + 9.7517833041 * ilvl - 0.0037013807 * Math.pow(ilvl, 2),
      Shield: ilvl => -164.0465200000 + 33.9723200000 * ilvl - 0.0145401229 * Math.pow(ilvl, 2)
    }
  };

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

  function getQualityCoefficient(quality) {
    switch (quality) {
      case 'uncommon':  return ilvl => ilvl *  (8/16) - 4;
      case 'rare':      return ilvl => ilvl * (10/16) - 7;
      case 'epic':      return ilvl => ilvl * (12/16) - 6;
      case 'legendary': return ilvl => ilvl * (14/16);
      case 'artifact':  return ilvl => ilvl * (16/16);
      default: return () => 0;
    }
  }

  function calculateStats(level, slot, quality) {
    console.error(`calculating stats from level`);
    let statCount = 1;
    const itemBudget = Math.pow(quality(level) * itemSlots[slot].slotMod, 1.5);
    console.log(`itemBudget: ${itemBudget}`);
    const statValues = {};
    $('#stats .group').each(function() {
      const statName = $(this).find('.stat-type option:selected').text();
      const statType = $(this).find('.stat-type').val();
      const percent = parseFloat($(this).find('.stat-amount').val()) / 100 || 0;
      const statCoefficient = itemStats[statType] ? itemStats[statType].statMod : 1;
      console.log(`statCoefficient: ${statCoefficient}`);
      const statBudget = itemBudget * percent; // the math
      console.log(`statBudget: ${statBudget}`);
      const statAmount = Math.pow(statBudget / statCoefficient, 2/3);
      console.log(`statAmount: ${statAmount}`);
      statValues[statType] = Math.floor(statAmount);
      console.log(`[${statCount}] ${statName}: ${itemBudget} * ${percent}`);
      statCount++;
    });
    console.log(`returned statValues: ${JSON.stringify(statValues)}`);
    return statValues;
  }
  
  function calculateLevel(slot, quality) {
    console.error("calculating level from stats");
    let itemBudget = 0;
    let statCount = 1;
    $('#stats .group').each(function() {
      const statName = $(this).find('.stat-type option:selected').text();
      const statType = $(this).find('.stat-type').val();
      const statCoefficient = itemStats[statType] ? itemStats[statType].statMod : 1;
      const statAmount = parseFloat($(this).find('.stat-amount').val());
      const statValue = Math.pow(statAmount * statCoefficient, 1.5); // the math
      console.log(`[${statCount}] ${statName}: (${statAmount} * ${statCoefficient})^1.5 = ${statValue}`);
      itemBudget += statValue;
      statCount++;
    });
    console.log(`itemBudget: ${itemBudget}`);
    let i = 0;
    while (i < 9999) {
      const statBudgetIncrement = Math.pow(quality(i) * itemSlots[slot].slotMod, 1.5);
      //console.log(`statBudgetIncrement: ${statBudgetIncrement}`);
      if (statBudgetIncrement >= itemBudget) {
        itemLevel = i;
        console.log(`itemLevel: ${itemLevel}`);
        break;
      }
      i++;
    }
    return itemLevel;
  }
  
  function calculateArmor(slot, type, level, quality) {
    console.error("generating armor");
    const slotData = itemSlots[slot];
    if (slotData.armor == 0) { return ''; }
    const slotCoefficient = slotData.slotMod;
    console.log(`slotCoefficient: ${slotCoefficient}`);
    const baseCoefficient = armorData[quality][type];
    const baseValue = baseCoefficient(level);
    console.log(`baseValue: ${baseValue}`);
    const totalArmor = baseValue * slotCoefficient > 0 ? Math.ceil(baseValue * slotCoefficient) : 0;
    console.log(`totalArmor: ${totalArmor}`);
    return `<div>${totalArmor} Armor</div>`;
  }

  function calculateShieldBlock(level, quality) {
      let baseBlock;
      switch (quality) {
        case 'uncommon':
          if (level >= 1 && level <= 80) { baseBlock = -3.0432462933 + 0.8825715740 * level - 0.0312968732 * Math.pow(level, 2) + 0.0007254284 * Math.pow(level, 3) - 0.0000046519 * Math.pow(level, 4); }
          else if (level >= 81 && level <= 137) { baseBlock = -16.3908655872 + 0.6897096083 * level + 0.0013506088 * Math.pow(level, 2); }
          else if (level >= 138) { baseBlock = 958.2984725669 - 18.2166307096 * level + 0.1250629715 * Math.pow(level, 2) - 0.0002655468 * Math.pow(level, 3); }
          break;
        case 'rare':
          if (level >= 1 && level <= 70) { baseBlock = -3.5159255097 + 1.1796186496 * level - 0.0464979829 * Math.pow(level, 2) + 0.0011133817 * Math.pow(level, 3) - 0.0000079076 * Math.pow(level, 4); }
          else if (level >= 71 && level <= 153) { baseBlock = -29.0000000000 + 1.0000000000 * level; }
          else if (level >= 154) { baseBlock = 18470.4850615834 - 421.5128438990 * level + 3.5991532696 * Math.pow(level, 2) - 0.0135272648 * Math.pow(level, 3) + 0.0000189300 * Math.pow(level, 4); }
          break;
        case 'epic':
          if (level >= 0 && level <= 189) { baseBlock = -36.7178644064 + 2.3738336805 * level - 0.0257785254 * Math.pow(level, 2) + 0.0002156921 * Math.pow(level, 3) - 0.0000005816 * Math.pow(level, 4); }
          else if (level >= 190 && level <= 300) { baseBlock = 364.0853740290 - 1.7727768015 * level + 0.0050409241 * Math.pow(level, 2); }
          break;
        default:
          baseBlock = 54.5284833805 - 1.7511894287 * level + 0.0378136180 * Math.pow(level, 2) - 0.0001827142 * Math.pow(level, 3) + 0.0000002842 * Math.pow(level, 4);
          break;
      }
      const totalBlock = baseBlock > 0 ? Math.ceil(baseBlock) : 0;
      return `<div>${totalBlock} Block</div>`;
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
  
  function getCustomPhrasing(itemStat, statAmount) {
    switch(itemStat) {
      case "12": return `Increases defense rating by ${statAmount}.`;
      case "13": return `Increases your dodge rating by ${statAmount}.`;
      case "14": return `Increases your parry rating by ${statAmount}.`;
      case "15": return `Increases your shield block rating by ${statAmount}.`;
      case "31": return `Improves hit rating by ${statAmount}.`;
      case "32": return `Improves critical strike rating by ${statAmount}.`;
      case "35": return `Improves your resilience rating by ${statAmount}.`;
      case "36": return `Improves haste rating by ${statAmount}.`;
      case "37": return `Improves expertise rating by ${statAmount}.`;
      case "38": return `Increases attack power by ${statAmount}.`;
      case "43": return `Restores +${statAmount} mana per 5 sec.`;
      case "44": return `Increases your armor penetration rating by ${statAmount}.`;
      case "45": return `Increases spell power by ${statAmount}.`;
      case "46": return `Restores +${statAmount} health per 5 sec.`;
      case "47": return `Increases spell penetration by ${statAmount}.`;
      case "48": return `Increases the block value of your shield by ${statAmount}.`;
      default: return `broken`;
    }
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
    const qualityCoefficient = getQualityCoefficient(itemQuality);

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
          let customPhrase = getCustomPhrasing(statTypeKey, statAmount);
          greenStatsHTML += `<div class="stat green">Equip: ${customPhrase}</div>`;
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
      // output armor
      itemArmor = calculateArmor(itemSlot, itemType, itemLevel, itemQuality);
      // calc armor first, then add bonus armor, then make the stat green
      // extra armor is stored in ArmorDamageModifier
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