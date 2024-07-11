$(document).ready(function() {
  let statCount = 0;
  
  const itemSlots = {
    "1": { label: "Head", value: 1.00 },
    "2": { label: "Neck", value: 0.55 },
    "3": { label: "Shoulder", value: 0.77 },
    "16": { label: "Back", value: 0.55 },
    "5": { label: "Chest", value: 1.00 },
    "20": { label: "Chest (Robe)", value: 1.00 },
    "4": { label: "Shirt", value: 0.55 },
    "19": { label: "Tabard", value: 0.55 },
    "9": { label: "Wrists", value: 0.55 },
    "10": { label: "Hands", value: 0.77 },
    "6": { label: "Waist", value: 0.77 },
    "7": { label: "Legs", value: 1.00 },
    "8": { label: "Feet", value: 0.77 },
    "11": { label: "Finger", value: 0.55 },
    "12": { label: "Trinket", value: 0.70 },
    "21": { label: "Main Handed Weapon", value: 0.42 },
    "22": { label: "Off Handed Weapon", value: 0.42 },
    "13": { label: "One-Handed Weapon", value: 0.42 },
    "17": { label: "Two-Handed Weapon", value: 1.00 },
    "15": { label: "Bow", value: 0.30 },
    "14": { label: "Shield", value: 0.55 },
    "23": { label: "Off-Hand Fringe", value: 0.55 },
    "25": { label: "Throwing Weapon", value: 0.30 },
    "26": { label: "Ranged Weapons (Non-Bow)", value: 0.30 },
    "27": { label: "Quiver", value: 0.55 },
    "28": { label: "Relic", value: 0.55 }
  };

  const statData = {
    "3": { label: "Agility", value: 1 },
    "4": { label: "Strength", value: 1 },
    "5": { label: "Intellect", value: 1 },
    "6": { label: "Spirit", value: 1 },
    "7": { label: "Stamina", value: 0.67 },
    "12": { label: "Defense Rating", value: 1 },
    "13": { label: "Dodge Rating", value: 1 },
    "14": { label: "Parry Rating", value: 1 },
    "15": { label: "Block Rating", value: 1 },
    "31": { label: "Hit Rating", value: 1 },
    "32": { label: "Crit Rating", value: 1 },
    "35": { label: "Resilience Rating", value: 1 },
    "36": { label: "Haste Rating", value: 1 },
    "37": { label: "Expertise Rating", value: 1 },
    "38": { label: "Attack Power", value: 0.5 },
    "43": { label: "Mana Regeneration", value: 2.5 },
    "44": { label: "Armor Penetration Rating", value: 1 },
    "45": { label: "Spell Power", value: 0.7 },
    "46": { label: "Health Regen", value: 1 },
    "47": { label: "Spell Penetration", value: 0.9 },
    "48": { label: "Block Value", value: 0.65 },
    "holy_res": { label: "Resist Holy", value: 1 },
    "fire_res": { label: "Resist Fire", value: 1 },
    "nature_res": { label: "Resist Nature", value: 1 },
    "frost_res": { label: "Resist Frost", value: 1 },
    "shadow_res": { label: "Resist Shadow", value: 1 },
    "arcane_res": { label: "Resist Arcane", value: 1 },
    "resist_all": { label: "Resist All", value: 2.5 }
  };
  
  function populateItemSlots() {
    const itemSlotSelect = $('#item-slot');
    itemSlotSelect.append('<option value="">Choose Item Slot</option>');
    $.each(itemSlots, function(key, data) {
    itemSlotSelect.append(`<option data-key="${key}" value="${data.value}">${data.label}</option>`);
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
      dropdown.append('<option value="">Select Stat</option>');
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
          <div class="group" id="stat-group-${statCount}">
            <div class="delete">X</div>
            ${createStatDropdown(statCount)}
            <input type="number" class="stat-amount no-spinners" id="stat-amount-${statCount}" value="0" />
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

    if (statCount >= 1) { $("#remove-stat").show(); } else { $("#remove-stat").hide(); }
    if (statCount == 10) { $("#add-stat").hide(); } else { $("#add-stat").show(); }
    if (statCount >= 1 && statCount <= 10) { $("#stats").show(); } else { $("#stats").hide(); }
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
    console.log(`total value: ${totalValue}`);
    return totalValue;
  }

  $(document).on('click', '#stats .group .delete', function() {
    updateStatGroup('delete');
    $(this).parent(".group").remove();
  });

  $(document).on('change input', '#stats .stat-amount', function() {
    if ($(this).val() <= 0) { $(this).val(''); }
    if ($(this).val() >= 999) { $(this).val('999'); }
  });

  $('#item-level').on('change input', function() { if ($(this).val() <= 0) { $(this).val(''); } });
  $('#add-stat').click(function() { updateStatGroup('add'); });
  $('#remove-stat').click(function() { updateStatGroup('remove'); });
  $('#stats').on('change', '.stat-type', updateStatDropdowns);
  $("#stats").hide();
  $('input[name="itemQuality"]').click(function(){
    $("#item-name").removeClass("uncommon rare epic legendary artifact");
    $("#item-name").addClass($(this).val());
  });

  $('#calculator').submit(function(e) {
    e.preventDefault();
    $("#tooltip").show();

    let itemName = $("#item-name").val() ? $("#item-name").val() : undefined;
    let itemLevel = $('#item-level').val() ? parseFloat($('#item-level').val()) : undefined;
    console.log(`itemLevel: ${itemLevel}`);
    let itemQuality = $('input[name="itemQuality"]:checked').val();
    console.log(`itemQuality: ${itemQuality}`);
    let itemSlot = parseFloat($('#item-slot').val());
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

    let statBudget;
    let iterationCount = 0;
    let maxIterations = 999;
    let statValue = calculateStatValue();

    if (!itemLevel) {
        let ilvl = 1;
        while (iterationCount < maxIterations) {
            let potentialBudget = Math.pow(itemQualityCoefficient(ilvl) * itemSlot, 1.5);
            if (potentialBudget >= statValue) { itemLevel = ilvl; break; }
            ilvl++;
            iterationCount++;
        }
        if (iterationCount === maxIterations) { console.error('Failed to calculate item level. Please check your inputs.'); }
    }

    let tooltipHtml = `<div class="item-name ${itemQuality}">${itemName}</div>
                <div class="item-level">Item Level ${itemLevel}</div>
                <div class="item-slot">${$('#item-slot option:selected').text()}</div>`;
    $('#stats .group').each(function() {
      let statTypeText = $(this).find('.stat-type option:selected').text();
      let statAmount = $(this).find('.stat-amount').val();
      tooltipHtml += `<div class="stat">+${statAmount} ${statTypeText}</div>`;
    });

    if (itemLevel && statBudget < statValue) { console.error('The item has more stat points than allowed by the item level.'); }

    $('#tooltip').html(tooltipHtml);

  });
  
  populateItemSlots();
  
});
