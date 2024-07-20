$(document).ready(function() {
  let statCount = 0;
  
  const itemSlots = {
    "1": { label: "Head", value: 1.00, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "2": { label: "Neck", value: 0.55, type: 4, armor: 0, types: [0] },
    "3": { label: "Shoulder", value: 0.77, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "16": { label: "Back", value: 0.55, type: 4, armor: 1, types: [1] },
    "5": { label: "Chest", value: 1.00, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "20": { label: "Robe", value: 1.00, armor: 1, type: 4, types: [1, 2, 3, 4] },
    "4": { label: "Shirt", value: 0.55, type: 4, armor: 0, types: [1] },
    "19": { label: "Tabard", value: 0.55, type: 4, armor: 0, types: [0] },
    "9": { label: "Wrists", value: 0.55, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "10": { label: "Hands", value: 0.77, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "6": { label: "Waist", value: 0.77, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "7": { label: "Legs", value: 1.00, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "8": { label: "Feet", value: 0.77, type: 4, armor: 1, types: [1, 2, 3, 4] },
    "11": { label: "Finger", value: 0.55, type: 4, armor: 0, types: [0] },
    "12": { label: "Trinket", value: 0.70, type: 4, armor: 0, types: [0] },
    "14": { label: "Shield", value: 0.55, type: 4, armor: 1, types: [6] },
    "23": { label: "Held in Off-hand", value: 0.55, armor: 0, type: 4, types: [0] },
    "28": { label: "Relic", value: 0.55, type: 4, armor: 0, types: [7, 8, 9, 10] },
    "21": { label: "Main-Hand", value: 0.42, type: 2, armor: 0, types: [0, 4, 7, 15, 13] },
    "22": { label: "Off-Hand", value: 0.42, type: 2, armor: 0, types: [0, 4, 7, 15, 13] },
    "13": { label: "One-Hand", value: 0.42, type: 2, armor: 0, types: [0, 4, 7, 15, 13] },
    "17": { label: "Two-Hand", value: 1.00, type: 2, armor: 0, types: [1, 5, 8, 6, 10] },
    "15": { label: "Bow", value: 1.00, type: 2, armor: 0, types: [2] }, // real bow
    "25": { label: "Thrown", value: 0.42, type: 2, armor: 0, types: [16] },
    "26": { label: "Ranged", value: 0.42, type: 2, armor: 0, types: [3, 18, 19] },
  };

  const armorTypes = {
    "0": { label: "Miscellaneous", see: 0 },
    "1": { label: "Cloth", see: 1 },
    "2": { label: "Leather", see: 1 },
    "3": { label: "Mail", see: 1 },
    "4": { label: "Plate", see: 1 },
    "6": { label: "Shield", see: 0 },
    "7": { label: "Libram", see: 1 },
    "8": { label: "Idol", see: 1 },
    "9": { label: "Totem", see: 1 },
    "10": { label: "Sigil", see: 1 },
  };
  
  const armorBaseCalc = {
    artifact: {
      Cloth: ilvl => -35.9162438072 + 2.7177139937 * ilvl - 0.0069377995 * Math.pow(ilvl, 2) + 0.0000083546 * Math.pow(ilvl, 3),
      Leather: ilvl => -67.9413659377 + 5.3865646281 * ilvl - 0.0159938709 * Math.pow(ilvl, 2) + 0.0000230294 * Math.pow(ilvl, 3),
      Mail: ilvl => -134.2869568235 + 11.0241030695 * ilvl - 0.0271961135 * Math.pow(ilvl, 2) + 0.0000320858 * Math.pow(ilvl, 3),
      Plate: ilvl => 798.1656398430 - 14.0579736482 * ilvl + 0.3181534343 * Math.pow(ilvl, 2) - 0.0015491623 * Math.pow(ilvl, 3) + 0.0000024433 * Math.pow(ilvl, 4),
      Shield: ilvl => 1875.7150800000 + 7.7787612192 * ilvl + 0.5256944740 * Math.pow(ilvl, 2) - 0.0030091680 * Math.pow(ilvl, 3) + 0.0000050841 * Math.pow(ilvl, 4)
    },
    legendary: {
      Cloth: ilvl => -35.9162438072 + 2.7177139937 * ilvl - 0.0069377995 * Math.pow(ilvl, 2) + 0.0000083546 * Math.pow(ilvl, 3),
      Leather: ilvl => -67.9413659377 + 5.3865646281 * ilvl - 0.0159938709 * Math.pow(ilvl, 2) + 0.0000230294 * Math.pow(ilvl, 3),
      Mail: ilvl => -134.2869568235 + 11.0241030695 * ilvl - 0.0271961135 * Math.pow(ilvl, 2) + 0.0000320858 * Math.pow(ilvl, 3),
      Plate: ilvl => 798.1656398430 - 14.0579736482 * ilvl + 0.3181534343 * Math.pow(ilvl, 2) - 0.0015491623 * Math.pow(ilvl, 3) + 0.0000024433 * Math.pow(ilvl, 4),
      Shield: ilvl => 1211.2180000000 + 7.7787612192 * ilvl + 0.5256944740 * Math.pow(ilvl, 2) - 0.0030091680 * Math.pow(ilvl, 3) + 0.0000050841 * Math.pow(ilvl, 4)
    },
    epic: {
      Cloth: ilvl => -35.9162438072 + 2.7177139937 * ilvl - 0.0069377995 * Math.pow(ilvl, 2) + 0.0000083546 * Math.pow(ilvl, 3),
      Leather: ilvl => -67.9413659377 + 5.3865646281 * ilvl - 0.0159938709 * Math.pow(ilvl, 2) + 0.0000230294 * Math.pow(ilvl, 3),
      Mail: ilvl => -134.2869568235 + 11.0241030695 * ilvl - 0.0271961135 * Math.pow(ilvl, 2) + 0.0000320858 * Math.pow(ilvl, 3),
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
      Shield: ilvl => -289.3643455354 + 34.5446475247 * ilvl - 0.0145401229 * Math.pow(ilvl, 2)
    }
  };
  
  const armorSlotCoefficients = {
    Shield:    16/16,
    Chest:     16/16,
    Robe:      16/16,
    Legs:      14/16,
    Head:      13/16,
    Shoulder:  12/16,
    Feet:      11/16,
    Hands:     10/16,
    Waist:     9/16,
    Back:      8/16,
    Wrists:    7/16,
  };

  const weaponTypes = {
    "0": { label: "Axe", see: 1 },
    "4": { label: "Mace", see: 1 },
    "7": { label: "Sword", see: 1 },
    "15": { label: "Dagger", see: 1 },
    "13": { label: "Fist", see: 1 },
    "16": { label: "Thrown", see: 1 },
    "1": { label: "Axe", see: 1 },
    "5": { label: "Mace", see: 1 },
    "8": { label: "Sword", see: 1 },
    "6": { label: "Polearm", see: 1 },
    "10": { label: "Staff", see: 1 },
    "2": { label: "Bow", see: 0 },
    "3": { label: "Gun", see: 1 },
    "18": { label: "Crossbow", see: 1 },
    "19": { label: "Wand", see: 1 },
  };
  
  const weaponDamage = {
    "0": { label: "Physical" },
    "1": { label: "Holy" },
    "2": { label: "Fire" },
    "3": { label: "Nature" },
    "4": { label: "Frost" },
    "5": { label: "Shadow" },
    "6": { label: "Arcane" },
  };
  
  const weaponBaseDamageCalc = {
    "13": { // One-Hand
      uncommon:  ilvl => ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7,
      rare:      ilvl => ilvl <= 97 ? ilvl * 0.4350 + 15.8250 : ilvl * 0.7488 - 14.4905,
      epic:      ilvl => ilvl <= 97 ? ilvl * 0.4500 + 36.1000 : ilvl * 0.6 + 15.5,
      legendary: ilvl => ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0,
      artifact:  ilvl => ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0
    },
    "15": { // Bow
      uncommon:  ilvl => (ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7) * 1.3,
      rare:      ilvl => (ilvl <= 97 ? ilvl * 0.435 + 15.825 : ilvl * 0.7488 - 14.4905) * 1.3,
      epic:      ilvl => (ilvl <= 97 ? ilvl * 0.45 + 36.1 : ilvl * 0.6 + 15.5) * 1.3,
      legendary: ilvl => (ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0) * 1.3,
      artifact:  ilvl => (ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0) * 1.3
    },
    "17": { // Two-Hand
      uncommon:  ilvl => (ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7) * 1.3,
      rare:      ilvl => (ilvl <= 97 ? ilvl * 0.435 + 15.825 : ilvl * 0.7488 - 14.4905) * 1.3,
      epic:      ilvl => (ilvl <= 97 ? ilvl * 0.45 + 36.1 : ilvl * 0.6 + 15.5) * 1.3,
      legendary: ilvl => (ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0) * 1.3,
      artifact:  ilvl => (ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0) * 1.3
    },
    "21": { // Main-Hand
      uncommon:  ilvl => ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7,
      rare:      ilvl => ilvl <= 97 ? ilvl * 0.4350 + 15.8250 : ilvl * 0.7488 - 14.4905,
      epic:      ilvl => ilvl <= 97 ? ilvl * 0.4500 + 36.1000 : ilvl * 0.6 + 15.5,
      legendary: ilvl => ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0,
      artifact:  ilvl => ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0
    },
    "22": { // Off-Hand
      uncommon:  ilvl => ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7,
      rare:      ilvl => ilvl <= 97 ? ilvl * 0.4350 + 15.8250 : ilvl * 0.7488 - 14.4905,
      epic:      ilvl => ilvl <= 97 ? ilvl * 0.4500 + 36.1000 : ilvl * 0.6 + 15.5,
      legendary: ilvl => ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0,
      artifact:  ilvl => ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0
    },
    "26": { // Ranged
      "2": { // Bow
        uncommon:  ilvl => (ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7) * 1.3,
        rare:      ilvl => (ilvl <= 97 ? ilvl * 0.435 + 15.825 : ilvl * 0.7488 - 14.4905) * 1.3,
        epic:      ilvl => (ilvl <= 97 ? ilvl * 0.45 + 36.1 : ilvl * 0.6 + 15.5) * 1.3,
        legendary: ilvl => (ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0) * 1.3,
        artifact:  ilvl => (ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0) * 1.3
      },
      "3": { // Gun
        uncommon:  ilvl => ilvl * 0.5 + 1.4,
        rare:      ilvl => ilvl * 0.58 - 0.3,
        epic:      ilvl => ilvl * 0.4047 + 32.84,
        legendary: ilvl => ilvl * 0.5 + 40.0,
        artifact:  ilvl => ilvl * 0.6 + 60.0
      },
      "18": { // Crossbow
        uncommon:  ilvl => ilvl * 0.5 + 1.4,
        rare:      ilvl => ilvl * 0.58 - 0.3,
        epic:      ilvl => ilvl * 0.4047 + 32.84,
        legendary: ilvl => ilvl * 0.5 + 40.0,
        artifact:  ilvl => ilvl * 0.6 + 60.0
      },
      "19": { // Wand
        uncommon:  ilvl => (ilvl <= 97 ? ilvl * 0.3448 + 16.7552 : ilvl * 0.6333 - 10.7) * 1.77,
        rare:      ilvl => (ilvl <= 97 ? ilvl * 0.435 + 15.825 : ilvl * 0.7488 - 14.4905) * 1.80,
        epic:      ilvl => (ilvl <= 97 ? ilvl * 0.45 + 36.1 : ilvl * 0.6 + 15.5) * 1.83,
        legendary: ilvl => (ilvl <= 97 ? ilvl * 0.475 + 50.0 : ilvl * 0.7 + 30.0) * 1.85,
        artifact:  ilvl => (ilvl <= 97 ? ilvl * 0.5 + 70.0 : ilvl * 0.8 + 50.0) * 1.87
      }
    },
    "25": { // Thrown
      uncommon:  ilvl => ilvl * 0.5542 - 8.8045,
      rare:      ilvl => ilvl * 0.6191 - 6.9569,
      epic:      ilvl => ilvl * 0.4047 + 32.84,
      legendary: ilvl => ilvl * 0.5 + 40.0,
      artifact:  ilvl => ilvl * 0.6 + 60.0
    }
  };

  const statData = {
    "0": { label: "Mana", value: 2, type: 0 },
    "1": { label: "Health", value: 2, type: 0 },
    "3": { label: "Agility", value: 1, type: 0 },
    "4": { label: "Strength", value: 1, type: 0 },
    "5": { label: "Intellect", value: 1, type: 0 },
    "6": { label: "Spirit", value: 1, type: 0 },
    "7": { label: "Stamina", value: (2/3), type: 0 },
    "12": { label: "Defense Rating", value: 1, type: 1 },
    "13": { label: "Dodge Rating", value: 1, type: 1 },
    "14": { label: "Parry Rating", value: 1, type: 1 },
    "15": { label: "Block Rating", value: 1, type: 1 },
    "31": { label: "Hit Rating", value: 1, type: 1 },
    "32": { label: "Crit Rating", value: 1, type: 1 },
    "35": { label: "Resilience Rating", value: 1, type: 1 },
    "36": { label: "Haste Rating", value: 1, type: 1 },
    "37": { label: "Expertise Rating", value: 1, type: 1 },
    "38": { label: "Attack Power", value: (1/2), type: 1 },
    "43": { label: "Mana Regen MP5", value: (273/200), type: 1 },
    "44": { label: "Armor Penetration Rating", value: (1/7), type: 1 },
    "45": { label: "Spell Power", value: (6/7), type: 1 },
    "46": { label: "Health Regen HP5", value: (91/400), type: 1 },
    "47": { label: "Spell Penetration", value: (4/5), type: 1 },
    "48": { label: "Block Value", value: (2/3), type: 1 },
    "armor": { label: "Bonus Armor", value: (1/14), type: 2 },
    "arcane_res": { label: "Resist Arcane", value: 1, type: 0 },
    "fire_res": { label: "Resist Fire", value: 1, type: 0 },
    "holy_res": { label: "Resist Holy", value: 1, type: 0 },
    "nature_res": { label: "Resist Nature", value: 1, type: 0 },
    "frost_res": { label: "Resist Frost", value: 1, type: 0 },
    "shadow_res": { label: "Resist Shadow", value: 1, type: 0 },
  };

  function populateItemSlots(type) {
    const itemSlotSelect = $('#item-slot');
    let name = type == '4' ? 'Armor' : 'Weapon';
    itemSlotSelect.empty().append(`<option value="">Choose ${name} Type</option>`);
    $.each(itemSlots, function(key, data) {
      if(data.type == type) {
        itemSlotSelect.append(`<option data-key="${key}" data-type="${data.type}" value="${data.value}">${data.label}</option>`);
      }
    });
  }

  function populateItemTypes(types, type) {
    let itemType = $("#item-slot option:selected").data('type');
    itemType = itemType == 2 ? 'Weapon' : 'Armor';
    const itemTypeSelect = $('#item-type');
    itemTypeSelect.empty();
    const typeList = type === 4 ? armorTypes : weaponTypes;

    if (types.length === 1) {
      const typeKey = types[0];
      const typeData = typeList[typeKey];
      if (typeData) {
        itemTypeSelect.append(`<option value="${typeKey}">${typeData.label}</option>`);
        itemTypeSelect.prop('disabled', true);
      }
    }
    else {
      itemTypeSelect.append(`<option value="">Choose ${itemType} Type</option>`);
      $.each(types, function(_, typeKey) {
        let typeData = typeList[typeKey];
        if (typeData) {
          itemTypeSelect.append(`<option value="${typeKey}">${typeData.label}</option>`);
        }
      });
      itemTypeSelect.prop('disabled', false);
    }
  }

  function populateWeaponDamageTypes() {
    const damageSelects = ['#item-damage1', '#item-damage2'];
    damageSelects.forEach(id => {
      const selectElement = $(id);
      selectElement.empty().append('<option value="">Extra Damage</option>');
      $.each(weaponDamage, function(key, data) {
        selectElement.append(`<option value="${key}">${data.label}</option>`);
      });
    });
  }

  function updateWeaponDamageOptions() {
    const selectedDamage1 = $('#item-damage1').val();
    const selectedDamage2 = $('#item-damage2').val();
    
    $('#item-damage1 option').each(function() {
      const value = $(this).val();
      if (value && value === selectedDamage2) { $(this).hide(); }
      else { $(this).show(); }
    });

    $('#item-damage2 option').each(function() {
      const value = $(this).val();
      if (value && value === selectedDamage1) { $(this).hide(); }
      else { $(this).show(); }
    });
  }

  function createStatDropdown(id) {
    let options = '<option value="">Select Stat</option>';
    $.each(statData, function(key, data) { options += `<option data-key="${key}" value="${data.value}">${data.label}</option>`; });
    return `<select id="stat-type-${id}" class="stat-type" data-id="${id}">${options}</select>`;
  }

  function updateStatDropdowns() {
    const selectedStats = [];
    $('.stat-type').each(function() {
      const selectedVal = $(this).val();
      if (selectedVal) { selectedStats.push(selectedVal); }
    });

    $('.stat-type').each(function() {
      const currentVal = $(this).val();
      const dropdown = $(this);
      dropdown.empty();
      dropdown.append('<option value="">Select a Stat</option>');
      $.each(statData, function(key, data) {
        if (selectedStats.indexOf(key) === -1 || key === currentVal) { dropdown.append(`<option value="${key}">${data.label}</option>`); }
      });
      dropdown.val(currentVal);
    });
  }

  function updateStatGroup(update) {
    if (update == 'add') {
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
    else if (update == 'remove') {
      $('#stats .group:last').remove();
      statCount--;
    }
    else if (update == 'delete') { statCount--; }
    if (statCount == 10) { $("#add-stat").hide(); } else { $("#add-stat").show(); }
  }

  function getItemQualityCoefficient(itemQuality) {
    switch (itemQuality) {
      case 'uncommon': return ilvl => ilvl * 0.5 - 2;
      case 'rare': return ilvl => ilvl * 0.625 - 1.15;
      case 'epic': return ilvl => ilvl * 0.77 - 1;
      case 'legendary': return ilvl => ilvl * 0.90; // i made this up
      case 'artifact': return ilvl => ilvl; // i made this up
      default: return () => 0;
    }
  }

  function calculateStats(itemLevel, itemSlot) {
    console.error(`calculating stats from level`);
    const itemQuality = $('input[name="itemQuality"]:checked').val();
    let itemQualityCoefficient = getItemQualityCoefficient(itemQuality);
    const itemBudget = Math.floor(Math.pow(itemQualityCoefficient(itemLevel) * itemSlot, 1.5)); // total item value
    console.log(`itemBudget: ${itemBudget}`);
    const statValues = {};
    $('#stats .group').each(function() {
      // get values
      const statName = $(this).find('.stat-type option:selected').text();
      console.log(`statName: ${statName}`);
      const statType = $(this).find('.stat-type').val();
      console.log(`statType: ${statType}`);
      const percent = parseFloat($(this).find('.stat-amount').val()) / 100 || 0;
      console.log(`percent: ${percent * 100}%`);
      const statCoefficient = statData[statType] ? statData[statType].value : 1;
      console.log(`statCoefficient: ${statCoefficient}`);
      // do the math
      const statBudget = itemBudget * percent;
      console.log(`statBudget: ${statBudget}`);
      const statAmount = Math.pow(statBudget / statCoefficient, 2/3);
      console.log(`statAmount: ${statAmount}`);
      statValues[statType] = Math.floor(statAmount);
    });
    console.log(`returned statValues: ${JSON.stringify(statValues)}`);
    return statValues;
  }
  
  function calculateArmor(slot, type, level, quality) {
    const slotData = itemSlots[slot];
    if (slotData.armor == 0) { return ''; }
    console.error("generating armor");
    const baseCalc = armorBaseCalc[quality][type];
    const baseValue = baseCalc(level);
    console.log(`baseValue: ${baseValue}`);
    const slotCoefficient = armorSlotCoefficients[slotData.label];
    const totalArmor = Math.ceil(baseValue * slotCoefficient);
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
      default: // epic or better
        baseBlock = 54.5284833805 - 1.7511894287 * level + 0.0378136180 * Math.pow(level, 2) - 0.0001827142 * Math.pow(level, 3) + 0.0000002842 * Math.pow(level, 4);
        break;
    }
    const totalBlock = Math.ceil(baseBlock);
    return `<div>${totalBlock} Block</div>`;
  }

  function isTypeVisible(typeKey, typeList) {
    return typeList[typeKey] ? typeList[typeKey].see : false;
  }
  
  function getItemTypeHTML() {
    let typeKey = $('#item-type').val();
    let itemType = '';
    const selectedType = $('#item-slot').find('option:selected').data('type');
    if (selectedType == 4 && isTypeVisible(typeKey, armorTypes) === 1) { itemType = $('#item-type option:selected').text(); }
    else if (selectedType === 2 && isTypeVisible(typeKey, weaponTypes) === 1) { itemType = $('#item-type option:selected').text(); }
    return itemType ? `<div class="item-type">${itemType}</div>` : '';
  }
  
  function getCustomPhrasing(statTypeKey, statAmount) {
    switch(statTypeKey) {
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
  
  function createTooltipHTML(itemQuality, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotHTML, typeHTML, weaponDamage, itemArmor, blockValue, whiteStatsHtml, greenStatsHtml) {
    return `
      <div class="item-name ${itemQuality}">${itemName}</div>
      <div class="item-level">Item Level ${itemLevel}</div>
      ${bindHTML}
      ${uniqueHTML}
      <div class="group spread"><div class="item-slot">${slotHTML}</div>${typeHTML}</div>
      ${weaponDamage}
      ${itemArmor}
      ${blockValue}
      <div class="white stats">${whiteStatsHtml}</div>
      <div class="item-reqlvl">Requires Level ${itemReqLevel}</div>
      <div class="green stats">${greenStatsHtml}</div>
    `;
  }

  function getBonusDamage(index) {
    const damageTypeSelector = `#item-damage${index} option:selected`;
    const minSelector = `#damageMin${index}`;
    const maxSelector = `#damageMax${index}`;

    if ($(damageTypeSelector).val() !== "" && $(minSelector).val() > 0 && $(maxSelector).val() > 0) {
      let bonusDamageType = $(damageTypeSelector).text();
      let bonusDamageMin = parseFloat($(minSelector).val());
      let bonusDamageMax = parseFloat($(maxSelector).val());
      return {
        min: bonusDamageMin,
        max: bonusDamageMax,
        type: bonusDamageType,
        display: `<div>+${bonusDamageMin} - ${bonusDamageMax} ${bonusDamageType} Damage</div>`
      };
    }
    return null;
  }

  function calculateDPS(min, max, rate) {
    const avg = (min + max) / 2;
    return avg / rate;
  }

  function calculateWeaponDamage(damageMin, damageMax, attackSpeed, bonusDamages = []) {
    console.error('calculating weapon damage');

    let totalMinDamage = damageMin;
    let totalMaxDamage = damageMax;
    let bonusDamageHTML = '';

    bonusDamages.forEach(bonus => {
      if (bonus) {
        console.log("bonus damage exists")
        totalMinDamage += bonus.min;
        totalMaxDamage += bonus.max;
        bonusDamageHTML += bonus.display;
      }
    });

    const dps = calculateDPS(totalMinDamage, totalMaxDamage, attackSpeed);
    console.log(`dps: ${dps}`);

    return `
      <div class="group spread">
        <div>${Math.ceil(totalMinDamage)} - ${Math.ceil(totalMaxDamage)} Damage</div>
        <div>Speed ${attackSpeed.toFixed(2)}</div>
      </div>
      ${bonusDamageHTML}
      <div>(${dps.toFixed(2)} damage per second)</div>
    `;
  }

  function sumStatValues() {
    let sum = 0;
    $('.stat-amount').each(function() {
        sum += parseFloat($(this).val()) || 0;
    });
    return sum;
  }

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
  let lastSelected = null;

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
    $("#statMethod").html("number");
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
  
  $('#item-type').on('change', function() {
    const selectedType = $("#item-slot option:selected").data('type');
    if (selectedType == 2) { // is a weapon
      updateWeaponDamageOptions();
      populateWeaponDamageTypes();
      $(".weaponDamage").show();
      if ($("#item-slot option:selected").data('key') == 26) {
        $('.weaponDamageExtra input').val('');
        $(".weaponDamageExtra").hide();
      }
      else if ($("#item-slot option:selected").data('key') == 25) {
        $('.weaponDamageExtra input').val('');
        $(".weaponDamageExtra").hide();
      }
      else if ($("#item-slot option:selected").data('key') == 2) {
        $('.weaponDamageExtra input').val('');
        $(".weaponDamageExtra").hide();
      }
      else { $(".weaponDamageExtra").show(); }
    }
  });
  
  $("#item-damage1, #item-damage2").on('change',function() {
    updateWeaponDamageOptions();
  });
  
  $('#item-slot').on('change', function() {
    const selectedSlot = $(this).find('option:selected').data('key');
    const selectedType = $(this).find('option:selected').data('type');
    if (selectedSlot) { populateItemTypes(itemSlots[selectedSlot].types, selectedType); }
    $(".itemType").show();
    if(selectedSlot == 26 || selectedSlot == 25 || selectedSlot == 15) {
      $('.weaponDamageExtra input').val('');
      $(".weaponDamageExtra").hide();
    }
  });

  populateItemSlots($('input[name="itemClass"]:checked').val());

  $('#calculator').submit(function(e) {
    e.preventDefault();
    //$('.calculate').click(function() { // calculate

    const calcMethod = $('input[name="calcMethod"]:checked').val();
    if (calcMethod === 'stats' && ($("#item-level").val() <= 0 || sumStatValues() != 100)) {
      $(".stat-amount").addClass('error');
      return;
    }
    if (!$('input[name="itemQuality"]:checked').val()) { return; }

    $("#output").show();

    let itemLevel = $('#item-level').val() || null;
    let statValue = null;
    const itemBind = $('input[name="itemBind"]:checked').val() || null;
    const itemUnique = $('input[name="itemUnique"]:checked').val() || null;
    const itemQuality = $('input[name="itemQuality"]:checked').val() || null;
    const itemQualityPretty = itemQuality.charAt(0).toUpperCase() + itemQuality.slice(1);
    const itemSlot = parseFloat($('#item-slot').val()) || null;

    const itemQualityCoefficient = getItemQualityCoefficient(itemQuality);

    if (calcMethod === 'level') { // level calc
      console.error("calculating level from stats");
      let itemValue = 0;
      $('#stats .group').each(function() {
        // gather values
        const statName = $(this).find('.stat-type option:selected').text();
        console.log(`statName: ${statName}`);
        const statType = $(this).find('.stat-type').val();
        console.log(`statType: ${statType}`);
        const statCoefficient = statData[statType] ? statData[statType].value : 1;
        console.log(`statCoefficient: ${statCoefficient}`);
        const statAmount = parseFloat($(this).find('.stat-amount').val());
        console.log(`statAmount: ${statAmount}`);
        // do the math
        const statValue = Math.ceil(Math.pow(statAmount * statCoefficient, 1.5));
        console.log(`statValue: ${statValue}`);
        itemValue += statValue;
      });
      console.log(`itemValue: ${itemValue}`);
      let i = 0;
      while (i < 9999) {
        const statBudgetIncremental = Math.ceil(Math.pow(itemQualityCoefficient(i) * itemSlot, 1.5));
        if (statBudgetIncremental >= Math.ceil(itemValue)) {
          itemLevel = i;
          console.log(`itemLevel: ${itemLevel}`);
          break;
        }
        i++;
      }
    }
    else if (calcMethod === 'stats') { // stat calc
      const statValues = calculateStats(itemLevel, itemSlot);

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
    let whiteStatsHtml = '';
    let greenStatsHtml = '';
    let itemArmor = '';
    let blockValue = '';
    let weaponDamage = '';

    $('#stats .group').each(function() {
      let statTypeText = $(this).find('.stat-type option:selected').text();
      let statTypeKey = $(this).find('.stat-type option:selected').val();
      let statAmount = calcMethod == 'level' ? $(this).find('.stat-amount').val() : $(this).find('.stat-amount').data('calc'); // the literal generated stat value
      if (statTypeKey && statAmount > 0) {
        let stat = statData[statTypeKey];
        if (stat.type === 0) {
          whiteStatsHtml += `<div class="stat white">+${statAmount} ${statTypeText}</div>`;
        }
        else if (stat.type === 1) {
          let customPhrase = getCustomPhrasing(statTypeKey, statAmount);
          greenStatsHtml += `<div class="stat green">Equip: ${customPhrase}</div>`;
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

    let itemClass = $('#item-slot option:selected').data('type');
    let itemSlotKey = $('#item-slot option:selected').data('key');
    let itemType = $('#item-type option:selected').text();
    let itemTypeKey = $('#item-type option:selected').val();

    if (itemClass == 2) { // weapon properties
      const damageMin = parseFloat($("#damageMin").val());
      const damageMax = parseFloat($("#damageMax").val());
      const attackSpeed = parseFloat($("#attackSpeed").val());
      const bonusDamages = [getBonusDamage(1), getBonusDamage(2)];
      weaponDamage = calculateWeaponDamage(damageMin, damageMax, attackSpeed, bonusDamages);
    }

    if (itemClass == 4) { // armor properties

      // output armor
      itemArmor = calculateArmor(itemSlotKey, itemType, itemLevel, itemQuality);
      // calc armor first, then add bonus armor, then make the stat green
      // extra armor is stored in ArmorDamageModifier
      if(itemSlotKey == 14) {
        blockValue = calculateShieldBlock(itemLevel, itemQuality);
      }
    }
    
    // durability

    let tooltipHtml = createTooltipHTML(itemQuality, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotName, getItemTypeHTML(), weaponDamage, itemArmor, blockValue, whiteStatsHtml, greenStatsHtml);
    $('#output .tooltip').html(tooltipHtml);

  });

});