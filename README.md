# ItemLevelCalculator

An item level calculator for World of Warcraft emulators, designed to help create, modify, and validate ilvl balanced armor and weapons.

### Key Terms

The formula is based on the following parameters:

- **StatValue**: The quantity of a stat on an item.
- **StatMod**: The weight coefficient per stat.
- **ItemValue**: The total budget of stat points for an item.
- **SlotMod**: The weight coefficient per equipment slot.
- **ItemSlotValue**: The modified budget of stat points per item type.
- **QualityMods**: The weight coefficients per equipment quality.
- **ilvl**: The effective level of an item.

### Formula

The formula is designed to calculate the ItemValue by taking each modified stat value to the power of 1.7095, summing these powered terms, and then finding the 1.7095 root of the sum. This method ensures that single, high-value stats are more expensive compared to multiple, lower-value stats.

The formula for calculating **ItemValue** is:

```
ItemValue = [(StatValue[1] * StatMod[1])^1.7095 + (StatValue[2] * StatMod[2])^1.7095 + ...]^(1/1.7095)

ItemSlotValue = ItemValue / SlotMod

ilvl = ItemSlotValue * QualityMult + QualityBase
```

If the ItemSlotValue is 100, and the item quality is Rare (QualityMult: 9/5, QualityBase: 3/4), then the ilvl would be 180.75

## QualityMods

| Item Quality | QualityMult | QualityBase |
|--------------|-------------|-------------|
| Uncommon     | (2/1)       | (8/1)       |
| Rare         | (9/5)       | (3/4)       |
| Epic         | (3/2)       | (26/1)      |

Lastly, the quality of the item provides the final modification, resulting in a calculated value for the given item level:

## StatMods

| General Stats     | StatMod Value |
|-------------------|---------------|
| Bonus Armor       | (1/14)        |
| Strength          | (1/1)         |
| Agility           | (1/1)         |
| Intellect         | (1/1)         |
| Spirit            | (1/1)         |
| Stamina           | (2/3)         |
| Hit Rating        | (1/1)         |
| Crit Rating       | (1/1)         |
| Haste Rating      | (1/1)         |
| Defense Rating    | (1/1)         |
| Expertise Rating  | (1/1)         |
| Dodge Rating      | (1/1)         |
| Parry Rating      | (1/1)         |
| Block Rating      | (1/1)         |
| Attack Power      | (1/2)         |
| Spell Damage      | (6/7)         |
| Resiliance        | (1/1)         |
| Resistance        | (1/1)         |
| Armor Penetration | (1/7)         |
| Spell Penetration | (4/5)         |
| Block Value       | (2/3)         |
| Mana Regen Per 5  | (5/2)         |
| Life Regen Per 5  | (3/2)         |

| Vanilla Only Stats                    | StatMod Value |
|---------------------------------------|---------------|
| Stamina                               | (1/1)         |
| Spell Healing                         | (5/11)        |
| Attack Power (Beasts, Demons, Undead) | (1/3)         |
| Spell Damage (Beasts, Demons, Undead) | (11/20)       |
| Spell Damage (One School)             | (7/10)        |
| Ranged Attack Power                   | (2/5)         |
| Damage Shield                         | (63/20)       |

| Ring Only Stats         | StatMod Value |
|-------------------------|---------------|
| Resistance (All)        | (9/5)         |
| Resistance (One School) | (18/25)       |
| Life Regen Per 5        | (7/2)         |

| Neck Only Stats  | StatMod Value |
|------------------|---------------|
| Life Regen Per 5 | (7/2)         |

| Shield Only Stats | StatMod Value |
|-------------------|---------------|
| Block Value       | (3/5)         |
| Defense           | (6/5)         |

## Slot Modifiers

| Item Type                                   | SlotMod Value |
|---------------------------------------------|---------------|
| Head, Chest, Legs, 2H Weapon                | 1/1           |
| Shoulder, Hands, Waist, Feet                | 3/4           |
| Wrist, Neck, Back, Finger, Off-hand, Shield | 9/16          |
| 1H Weapon                                   | 27/64         |
| Ranged                                      | 8/25          |

## Armor Calculation

Base Armor is inherent to the ilvl of the item and varies based on item type and quality. Base Armor is not to be confused with Bonus Armor, which is applied to an item as an additional stat like stamina.

### Armor Type Calculation

| Armor Type | Base Calculation  | Uncommon | Rare        | Epic          |
|------------|-------------------|----------|-------------|---------------|
| Back/Cloak | ilvl * 1.19 + 5.1 | Base * 1 | Base * 1.1  | Base * 1.375  |
| Cloth      | ilvl * 1.19 + 5.1 | Base * 1 | Base * 1.1  | Base * 1.375  |
| Leather    | ilvl * 2.22 + 10  | Base * 1 | Base * 1.1  | Base * 1.375  |
| Mail       | ilvl * 4.9 + 29   | Base * 1 | Base * 1.1  | Base * 1.375  |
| Plate      | ilvl * 9 + 23     | Base * 1 | Base * 1.1  | Base * 1.375  |
| Shield     | ilvl * 85/3 + 133 | Base * 1 | Base * 1.22 | Base * 1.5616 |

### Armor Slot Modifiers

| Armor Slot | Coefficient |
|------------|-------------|
| Chest      | 16/16       |
| Legs       | 14/16       |
| Head       | 13/16       |
| Shoulders  | 12/16       |
| Feet       | 11/16       |
| Hands      | 10/16       |
| Waist      | 9/16        |
| Wrist      | 7/16        |
| Back       | 5/16        |
| Shield     | 1/1         |

## Shield Block Calculation

Base Shield Block Value

```
Uncommon = ilvl * 0.5 * 1
Rare = ilvl * 0.5 * 1.22
Epic = ilvl * 0.5 * 1.5616
```

## Weapon DPS

Weapon DPS is inherent to the ilvl of the item and varies based on item type and quality.

| Weapon Type                  | Uncommon DPS            | Rare DPS                | Epic DPS              |
|------------------------------|-------------------------|-------------------------|-----------------------|
| One Handed (ilvl ≤ 97)       | ilvl * 0.3448 + 16.7552 | ilvl * 0.435 + 15.825   | ilvl * 0.45 + 36.1    |
| One Handed (ilvl > 97)       | ilvl * 0.6333 - 10.7    | ilvl * 0.7488 - 14.4905 | ilvl * 0.6 + 15.5     |
| Wands                        | One Handed * 1.77       | One Handed * 1.80       | One Handed * 1.83     |
| Two Handed                   | One Handed * 1.3        | One Handed * 1.3        | One Handed * 1.3      |
| Ranged (Guns/Bows/Crossbows) | ilvl * 0.5 + 1.4        | ilvl * 0.58 - 0.3       | ilvl * 0.4047 + 32.84 |
| Thrown                       | ilvl * 0.5542 - 8.8045  | ilvl * 0.6191 - 6.9569  | ilvl * 0.4047 + 32.84 |

## Druid/Caster Weapon DPS Adjustment

Caster and Druid weapons sacrifice a portion of their DPS to raise the ceiling for item stats, as weapon damage is not used in calculating damage for druids and casters. The amount of Spell Power or Feral Attack Power gained is proportional to the amount of DPS sacrificed.

- **Sacrificed DPS** = Weapon Type DPS - 41.5
- **Spell Power** = Sacrificed DPS * 4
- **Feral Attack Power** = Sacrificed DPS * 18.37 - 12.4843

---

The values outlined in the documentation above are based on various wiki articles, including:

- [Wowwiki Archive](https://wowwiki-archive.fandom.com/wiki/Item_level)
- [Wowpedia](https://wowpedia.fandom.com/wiki/Stat_budget)
- [Classic WoW Archive](https://classic-wow-archive.fandom.com/wiki/Item_level)
- [Wowwiki (HU)](https://wowwiki.fandom.com/hu/wiki/Level_(Item)#Calculating_Item_Level)
- [Elitist Jerks (archive)](https://web.archive.org/web/20111109062432/http://elitistjerks.com/f15/t44718-item_level_mechanics/)
- [Elitist Jerks Summary](https://web.archive.org/web/20120510064628/http://elitistjerks.com/f15/t6928-looking_good_summary_known_info_itemization/#11)