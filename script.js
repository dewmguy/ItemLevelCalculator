$(document).ready(function() {
    $('#calculateButton').click(function() {
        const itemLevel = parseInt($('#itemLevel').val());
        const quality = $('input[name="quality"]:checked').val();
        const inventoryType = $('input[name="inventoryType"]:checked').val();
        const subclass = $('input[name="subclass"]:checked').val();
        const stats = $('input[name="stats"]:checked').map(function() {
            return $(this).val();
        }).get();

        let result = calculate(itemLevel, quality, inventoryType, subclass, stats);
        $('#result').text(result);
    });

    function calculate(itemLevel, quality, inventoryType, subclass, stats) {
        let result = "";

        // Quality multipliers
        const qualityMultipliers = {
            common: 1.0,
            uncommon: 1.1,
            rare: 1.2,
            epic: 1.25,
            legendary: 1.3,
            artifact: 1.35
        };

        // Armor base values per type
        const armorBaseValues = {
            cloth: itemLevel * 1.19 + 5.1,
            leather: itemLevel * 2.22 + 10,
            mail: itemLevel * 4.9 + 29,
            plate: itemLevel * 9 + 23,
            shield: itemLevel * 85 / 3 + 133
        };

        // Slot multipliers
        const slotMultipliers = {
            chest: 1.0,
            legs: 1.0,
            head: 1.0,
            shoulders: 0.75,
            feet: 0.75,
            hands: 0.75,
            waist: 0.75,
            wrist: 0.5625,
            back: 0.5625
        };

        // Calculate armor
        if (['cloth', 'leather', 'mail', 'plate', 'shield'].includes(subclass)) {
            let baseArmor = armorBaseValues[subclass];
            let qualityMultiplier = qualityMultipliers[quality];
            let slotMultiplier = slotMultipliers[inventoryType] || 1;

            let armor = baseArmor * qualityMultiplier * slotMultiplier;
            result += `Armor: ${armor.toFixed(2)}\n`;
        }

        // Calculate stats
        const statMods = {
            stamina: 2 / 3,
            strength: 1,
            agility: 1,
            intellect: 1,
            spirit: 1,
            hit: 1,
            crit: 1,
            haste: 1,
            expertise: 1,
            armorPen: 1,
            spellPen: 4 / 5,
            defense: 1,
            dodge: 1,
            parry: 1,
            blockRating: 1,
            blockValue: 1,
            attackPower: 1 / 2,
            spellPower: 1,
            hp5: 1,
            mp5: 1,
            resilience: 1,
            fireRes: 1,
            frostRes: 1,
            natureRes: 1,
            arcaneRes: 1,
            shadowRes: 1
        };

        let statValues = "";
        stats.forEach(stat => {
            let statValue = itemLevel * statMods[stat] * qualityMultipliers[quality];
            statValues += `${stat}: ${statValue.toFixed(2)}\n`;
        });

        result += statValues;

        // Calculate weapon DPS
        const weaponDPSFormulas = {
            uncommon: {
                mainHand: itemLevel < 97 ? itemLevel * 0.3448 + 16.7552 : itemLevel * 0.6333 - 10.7,
                oneHand: itemLevel < 97 ? itemLevel * 0.3448 + 16.7552 : itemLevel * 0.6333 - 10.7,
                twoHand: (itemLevel < 97 ? itemLevel * 0.3448 + 16.7552 : itemLevel * 0.6333 - 10.7) * 1.3,
                ranged: itemLevel * 0.5 + 1.4,
                thrown: itemLevel * 0.5542 - 8.8045,
                wand: (itemLevel < 97 ? itemLevel * 0.3448 + 16.7552 : itemLevel * 0.6333 - 10.7) * 1.77
            },
            superior: {
                mainHand: itemLevel < 97 ? itemLevel * 0.4350 + 15.8250 : itemLevel * 0.7488 - 14.4905,
                oneHand: itemLevel < 97 ? itemLevel * 0.4350 + 15.8250 : itemLevel * 0.7488 - 14.4905,
                twoHand: (itemLevel < 97 ? itemLevel * 0.4350 + 15.8250 : itemLevel * 0.7488 - 14.4905) * 1.3,
                ranged: itemLevel * 0.58 - 0.3,
                thrown: itemLevel * 0.6191 - 6.9569,
                wand: (itemLevel < 97 ? itemLevel * 0.4350 + 15.8250 : itemLevel * 0.7488 - 14.4905) * 1.80
            },
            epic: {
                mainHand: itemLevel < 138 ? itemLevel * 0.45 + 36.1 : itemLevel * 0.6 + 15.5,
                oneHand: itemLevel < 138 ? itemLevel * 0.45 + 36.1 : itemLevel * 0.6 + 15.5,
                twoHand: (itemLevel < 138 ? itemLevel * 0.45 + 36.1 : itemLevel * 0.6 + 15.5) * 1.3,
                ranged: itemLevel * 0.4047 + 32.84,
                thrown: itemLevel * 0.4047 + 32.84,
                wand: (itemLevel < 138 ? itemLevel * 0.45 + 36.1 : itemLevel * 0.6 + 15.5) * 1.83
            }
        };

        if (['mainHand', 'oneHand', 'offHand', 'twoHand', 'ranged', 'thrown', 'wand'].includes(inventoryType)) {
            let weaponType = inventoryType;
            let dps = weaponDPSFormulas[quality][weaponType];
            result += `Weapon DPS: ${dps.toFixed(2)}\n`;
        }

        return result;
    }
});
