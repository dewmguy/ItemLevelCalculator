$(document).ready(function() {
  let statCount = 0;
  
  const itemSlots = {
    "1": { label: "Head", value: 1.00, type: 4, types: [1, 2, 3, 4] },
    "2": { label: "Neck", value: 0.55, type: 4, types: [0] },
    "3": { label: "Shoulder", value: 0.77, type: 4, types: [1, 2, 3, 4] },
    "16": { label: "Back", value: 0.55, type: 4, types: [1] },
    "5": { label: "Chest", value: 1.00, type: 4, types: [1, 2, 3, 4] },
    "20": { label: "Chest (Robe)", value: 1.00, type: 4, types: [1, 2, 3, 4] },
    "4": { label: "Shirt", value: 0.55, type: 4, types: [1, 2, 3, 4] },
    "19": { label: "Tabard", value: 0.55, type: 4, types: [0] },
    "9": { label: "Wrists", value: 0.55, type: 4, types: [1, 2, 3, 4] },
    "10": { label: "Hands", value: 0.77, type: 4, types: [1, 2, 3, 4] },
    "6": { label: "Waist", value: 0.77, type: 4, types: [1, 2, 3, 4] },
    "7": { label: "Legs", value: 1.00, type: 4, types: [1, 2, 3, 4] },
    "8": { label: "Feet", value: 0.77, type: 4, types: [1, 2, 3, 4] },
    "11": { label: "Finger", value: 0.55, type: 4, types: [0] },
    "12": { label: "Trinket", value: 0.70, type: 4, types: [0] },
    "14": { label: "Shield", value: 0.55, type: 4, types: [6] },
    "23": { label: "Held in Off-hand", value: 0.55, type: 4, types: [0] },
    "28": { label: "Relic", value: 0.55, type: 4, types: [7, 8, 9, 10] },
    "21": { label: "Main-Hand", value: 0.42, type: 2, types: [0, 4, 7, 15, 13] },
    "22": { label: "Off-Hand", value: 0.42, type: 2, types: [0, 4, 7, 15, 13] },
    "13": { label: "One-Hand", value: 0.42, type: 2, types: [0, 4, 7, 15, 13] },
    "17": { label: "Two-Hand", value: 1.00, type: 2, types: [1, 5, 8, 6, 10] },
    //"15": { label: "Bow", value: 1.00, type: 2, types: [2] },
    "25": { label: "Thrown", value: 0.42, type: 2, types: [16] },
    "26": { label: "Ranged", value: 0.42, type: 2, types: [2, 3, 18, 19] }, // modified to include bow
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
    "2": { label: "Bow", see: 1 },
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

  const statData = {
    "3": { label: "Agility", value: 1, type: 0 },
    "4": { label: "Strength", value: 1, type: 0 },
    "5": { label: "Intellect", value: 1, type: 0 },
    "6": { label: "Spirit", value: 1, type: 0 },
    "7": { label: "Stamina", value: 0.67, type: 0 },
    "12": { label: "Defense Rating", value: 1, type: 1 },
    "13": { label: "Dodge Rating", value: 1, type: 1 },
    "14": { label: "Parry Rating", value: 1, type: 1 },
    "15": { label: "Block Rating", value: 1, type: 1 },
    "31": { label: "Hit Rating", value: 1, type: 1 },
    "32": { label: "Crit Rating", value: 1, type: 1 },
    "35": { label: "Resilience Rating", value: 1, type: 1 },
    "36": { label: "Haste Rating", value: 1, type: 1 },
    "37": { label: "Expertise Rating", value: 1, type: 1 },
    "38": { label: "Attack Power", value: 0.5, type: 1 },
    "43": { label: "Mana Regen MP5", value: 2.5, type: 1 },
    "44": { label: "Armor Penetration Rating", value: 1, type: 1 },
    "45": { label: "Spell Power", value: 0.7, type: 1 },
    "46": { label: "Health Regen HP5", value: 1, type: 1 },
    "47": { label: "Spell Penetration", value: 0.9, type: 1 },
    "48": { label: "Block Value", value: 0.65, type: 1 },
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
    const damageTypeSelect = $('#item-damage');
    damageTypeSelect.empty().append('<option value="">Extra Damage</option>');
    $.each(weaponDamage, function(key, data) {
      damageTypeSelect.append(`<option value="${key}">${data.label}</option>`);
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
            <input type="number" class="stat-amount" id="stat-amount-${statCount}" value="0" />
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

  function calculateStatValue() {
    let totalValue = 0;
    let statValue = 0;
    $('#stats .group').each(function() {
      let statType = $(this).find('.stat-type').val();
      let statAmount = parseFloat($(this).find('.stat-amount').val());
      let statCoefficient = statData[statType] ? statData[statType].value : 1;
      console.log(`stat type: ${statType} / ${statAmount} / ${statCoefficient}`);
      statValue = Math.pow(statAmount * statCoefficient, 1.5);
      console.log(`stat value: ${statValue}`);
      totalValue += statValue;
    });
    console.log(`estimated statBudget: ${totalValue}`);
    return totalValue;
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
      case "43": return `Restores ${statAmount} mana per 5 sec.`;
      case "44": return `Increases your armor penetration rating by ${statAmount}.`;
      case "45": return `Increases spell power by ${statAmount}.`;
      case "46": return `Restores ${statAmount} health per 5 sec.`;
      case "47": return `Increases spell penetration by ${statAmount}.`;
      case "48": return `Increases the block value of your shield by ${statAmount}.`;
      default: return `broken`;
    }
  }
  
  function createTooltipHTML(itemQuality, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotHTML, typeHTML, bonusDamage, whiteStatsHtml, greenStatsHtml) {
    return `
      <div class="item-name ${itemQuality}">${itemName}</div>
      ${bindHTML}
      ${uniqueHTML}
      <div class="group spread">
        <div class="item-slot">${slotHTML}</div>
        ${typeHTML}
      </div>
      ${bonusDamage}
      <div class="white stats">${whiteStatsHtml}</div>
      <div class="item-reqlvl">Requires Level ${itemReqLevel}</div>
      <div class="item-level">Item Level ${itemLevel}</div>
      <div class="green stats">${greenStatsHtml}</div>
    `;
  }

  $(document).on('click', '#stats .group .delete', function() {
    updateStatGroup('delete');
    $(this).parent(".group").remove();
  });

  $(document).on('change input', '#stats .stat-amount', function() {
    if ($(this).val() <= 0) { $(this).val(''); }
    if ($(this).val() >= 999) { $(this).val('999'); }
  });

  $("#output").hide();
  $("#warning").hide();
  $(".itemType").hide();

  $("#armor").click(function() {
    let itemClass = $('input[name="itemClass"]:checked').val();
    populateItemSlots(itemClass);
    $('.itemSlot').show();
    $(".itemType").hide();
    $("#item-damage").empty();
    $("#damageMax, #damageMin").val('');
    $(".damageType").hide();
  });
  $("#weapon").click(function() {
    let itemClass = $('input[name="itemClass"]:checked').val();
    populateItemSlots(itemClass);
    $('.itemSlot').show();
    $(".itemType").hide();
  });

  $('#item-level').hide();
  $('.textStats').hide();
  $(".damageType").hide();
  $("#selectLevel").click(function() {
    $("#item-level").val('').hide();
    $(".textStats").hide();
    $(".textLevel").show();
    $("#statMethod").html("number");
    $("#item-level").attr("required", false)
  });
  $("#selectStats").click(function() {
    $("#item-level").val('').show();
    $(".textStats").show();
    $(".textLevel").hide();
    $("#statMethod").html("percentage");
    $("#item-level").attr("required", true);
    $("#item-level").focus();
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
    if (selectedType == 2) {
      $(".damageType").show();
      populateWeaponDamageTypes();
    }
  });
  
  $('#item-slot').on('change', function() {
    const selectedSlot = $(this).find('option:selected').data('key');
    const selectedType = $(this).find('option:selected').data('type');
    if (selectedSlot) { populateItemTypes(itemSlots[selectedSlot].types, selectedType); }
    $(".itemType").show();
  });

  $('#calculator').submit(function(e) { e.preventDefault(); });
  
  populateItemSlots($('input[name="itemClass"]:checked').val());
  
  $('.calculate').click(function() {

    if($('input[name="calcMethod"]:checked').val() == "stats" && ($("#item-level").val() == undefined || $("#item-level").val() == "")) { return; }
    if(!$('input[name="itemQuality"]:checked').val()) { return; }

    $("#output").show();
    
    let itemName = $("#item-name").val();
    let itemLevel = $('#item-level').val() || null;
    console.log(`itemLevel: ${itemLevel}`);
    let itemBind = $('input[name="itemBind"]:checked').val() || null;
    let itemUnique = $('input[name="itemUnique"]:checked').val() || null;
    let itemQuality = $('input[name="itemQuality"]:checked').val() || null;
    console.log(`itemQuality: ${itemQuality}`);
    let itemSlot = parseFloat($('#item-slot').val()) || null;
    console.log(`itemSlot: ${$('#item-slot').val() ? itemSlots[Object.keys(itemSlots).find(key => itemSlots[key].value == $('#item-slot').val())].label : 'None selected'} (${itemSlot})`);

    let itemQualityCoefficient;
    switch (itemQuality) {
      case 'uncommon':
        itemQualityCoefficient = ilvl => ilvl * 0.5 - 2;
        break;
      case 'rare':
        itemQualityCoefficient = ilvl => ilvl * 0.625 - 1.15;
        break;
      case 'epic':
        itemQualityCoefficient = ilvl => ilvl * 0.77 - 1;
        break;
      case 'legendary':
        itemQualityCoefficient = ilvl => ilvl * 0.90;
        break;
      case 'artifact':
        itemQualityCoefficient = ilvl => ilvl;
        break;
    }

    let statValue = calculateStatValue();

    if (!itemLevel) {
        let iterationCount = 0;
        let maxIterations = 999;
        let ilvl = 1;
        while (iterationCount < maxIterations) {
            let potentialBudget = Math.pow(itemQualityCoefficient(ilvl) * itemSlot, 1.5);
            if (potentialBudget >= statValue) { itemLevel = ilvl; break; }
            ilvl++;
            iterationCount++;
        }
    }

    let statBudget = Math.pow(itemQualityCoefficient(itemLevel) * itemSlot, 1.5);
    console.log(`statBudget limit: ${statBudget}`);
    $("#budgetLimit").html(statBudget);
    $("#budgetActual").html(statValue);
    $("#budgetRemain").html(statBudget - statValue);
    if (statBudget < statValue) {
      let message = "The item has more stat points than allowed by the item level.";
      $("#warning").show().html(message);
      console.error(message);
    }
    else {
      $("#warning").hide().html('');
    }
    
    // tooltip output

    let bindHTML = '';
    let uniqueHTML = '';
    let whiteStatsHtml = '';
    let greenStatsHtml = '';
    let bonusDamage = '';

    $('#stats .group.select').each(function() {
      let statTypeKey = $(this).find('.stat-type option:selected').val();
      let statTypeText = $(this).find('.stat-type option:selected').text();
      let statAmount = $(this).find('.stat-amount').val();
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

    let slotHTML = $('#item-slot option:selected').text();
    
    let itemReqLevel = $("#item-reqlvl").val() || 0;

    let itemtype = $('#item-slot option:selected').data('type');
    if (itemtype == 2) {
      // output damage
      if($("#item-damage option:selected").val() >= 0 && $("#damageMin").val() >= 0 && $("#damageMax").val() >= 0) {
        let bonusDamageType = $("#item-damage option:selected").text();
        let bonusDamageMin = $("#damageMin").val();
        let bonusDamageMax = $("#damageMax").val();
        bonusDamage = `<div>+${bonusDamageMin} - ${bonusDamageMax} ${bonusDamageType} Damage</div>`;
      }
      else { bonusDamage = ''; }
    }
    if (itemtype == 4) {
      // output armor
    }

    let tooltipHtml = createTooltipHTML(itemQuality, itemName, itemLevel, itemReqLevel, bindHTML, uniqueHTML, slotHTML, getItemTypeHTML(), bonusDamage, whiteStatsHtml, greenStatsHtml);
    $('#output .tooltip').html(tooltipHtml);
    
  });
  
});
