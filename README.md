# [ItemLevelCalculator](https://dewmguy.github.io/ItemLevelCalculator/)

This WIP web application functions as an item level calculator, aiding in the creation, modification, and validation of item level balanced armor and weapons from World of Warcraft Wrath of the Lich King 3.3.5 emulators, such as AzerothCore or TrinityCore.

Many of the values and coefficients in their current form are greatly inaccurate, generally referred to by most of the community as "good enough." The new polynomial curves being introduced will provide significantly more reliable output, intended to match the in-game values as closely as possible. These curves will replace the community-collected data that has largely been inspired by the mathematics introduced by a user known as Hyzenthlei.

The data curves used in these calculations were created with [Polynomial Visualizer](https://github.com/dewmguy/PolynomialVisualizer), another web application I wrote specifically to help me calculate, fine-tune, and graph polynomial coefficients based on plottable item data. I do not consider myself a data scientist nor highly mathematically inclined. If you can contribute more reliable or accurate equations, please do so.

The polynomial curves created and implemented into the calculator function most effectively within the intended item level range of in-game items. Using the calculator to create items with item levels that extend beyond the intended in-game ranges (i.e. uncommon or rare items greater than item level 200) may have undesireable output.

![Screenshot](screenshot.png?raw=true "Screenshot of Item Calculator Interface")

### Key Terms

The formula is based on the following parameters:

- **StatValue**: The quantity of a stat on an item.
- **StatMod**: The weight coefficient per stat.
- **StatBudget**: The total budget of stat points for an item.
- **SlotMod**: The weight coefficient per equipment slot.
- **ItemBudget**: The modified budget of stat points per item type.
- **QualityMods**: The weight coefficients per equipment quality.
- **ilvl**: The effective level of an item.

### Stats Formula

The formula is designed to calculate the ItemValue by taking each modified stat value to the power of 1.5, summing these powered terms. This method ensures that single, high-value stats are more expensive compared to multiple, lower-value stats.

The formula for calculating **ItemValue** is:

```
StatBudget^1.5 = [(StatValue[1] * StatMod[1])^1.5 + (StatValue[2] * StatMod[2])^1.5 + ...]

ItemBudget = StatBudget / SlotMod

ilvl = ItemBudget * qualityMult + qualityBase
```

If the ItemBudget is 100 and the item quality is:
- Epic: (100 \* 3/2 + 26/1), then the ilvl would be 176
- Rare: (100 \* 9/5 + 3/4), then the ilvl would be 180.75
- Uncommon: (100 \* 2/1 + 8/1), then the ilvl would be 208

## QualityMods

| Item Quality | qualityMult | qualityBase |
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
| Head, Chest, Legs, 2H Weapon                | 1.000000      |
| Shoulder, Hands, Waist, Feet                | 0.770000      |
| Wrist, Neck, Back, Finger, Off-hand, Shield | 0.562500      |
| 1H Weapon                                   | 0.421875      |
| Ranged                                      | 0.320000      |

## Armor Calculation

Base Armor is inherent to the ilvl of the item and varies based on item type and quality. Base Armor is not to be confused with Bonus Armor, which is applied to an item as an additional stat like stamina.

### Armor Item Type per Quality Calculation

| Item Type  | Base Calculation  | Uncommon | Rare        | Epic          |
|------------|-------------------|----------|-------------|---------------|
| Back       | ilvl * 1.19 + 5.1 | Base * 1 | Base * 1.1  | Base * 1.375  |
| Cloth      | ilvl * 1.19 + 5.1 | Base * 1 | Base * 1.1  | Base * 1.375  |
| Leather    | ilvl * 2.22 + 10  | Base * 1 | Base * 1.1  | Base * 1.375  |
| Mail       | ilvl * 4.9 + 29   | Base * 1 | Base * 1.1  | Base * 1.375  |
| Plate      | ilvl * 9 + 23     | Base * 1 | Base * 1.1  | Base * 1.375  |
| Shield     | ilvl * 85/3 + 133 | Base * 1 | Base * 1.22 | Base * 1.5616 |

### Armor Item Slot Modifiers

| Item Slot | Coefficient |
|------------|-------------|
| Chest      | 16/16       |
| Legs       | 14/16       |
| Head       | 13/16       |
| Shoulders  | 12/16       |
| Feet       | 11/16       |
| Hands      | 10/16       |
| Waist      | 9/16        |
| Wrists     | 7/16        |
| Back       | 5/16        |
| Shield     | 1/1         |

## Shield Block Calculation

### Uncommon - [Graph](https://github.com/dewmguy/PolynomialVisualizer/?a=0&b=0.4725&c=-0.00668&d=0.0001745&e=-0.00000094&f=0.0000000015&min-x=0&max-x=400&min-y=0&max-y=400&order=5&graph-title=Uncommon+Shield+-+Block+Value&csvPoints=W3sieCI6MTg3LCJ5IjoxODh9LHsieCI6MTgyLCJ5IjoxODV9LHsieCI6MTc4LCJ5IjoxODJ9LHsieCI6MTc0LCJ5IjoxNzZ9LHsieCI6MTcwLCJ5IjoxNzB9LHsieCI6MTY2LCJ5IjoxNjZ9LHsieCI6MTYyLCJ5IjoxNjB9LHsieCI6MTU4LCJ5IjoxNTR9LHsieCI6MTU0LCJ5IjoxNTB9LHsieCI6MTUwLCJ5IjoxNDR9LHsieCI6MTQ2LCJ5IjoxMzh9LHsieCI6MTQyLCJ5IjoxMzN9LHsieCI6MTM4LCJ5IjoxMjh9LHsieCI6MTM0LCJ5IjoxMDB9LHsieCI6MTMwLCJ5Ijo5Nn0seyJ4IjoxMjUsInkiOjkxfSx7IngiOjEyMCwieSI6ODZ9LHsieCI6MTE3LCJ5Ijo4M30seyJ4IjoxMTQsInkiOjgwfSx7IngiOjExMSwieSI6Nzd9LHsieCI6MTA4LCJ5Ijo3NH0seyJ4IjoxMDUsInkiOjcxfSx7IngiOjEwMiwieSI6Njh9LHsieCI6OTksInkiOjY1fSx7IngiOjk2LCJ5Ijo2Mn0seyJ4Ijo5MywieSI6NTl9LHsieCI6OTAsInkiOjU2fSx7IngiOjg3LCJ5Ijo1NH0seyJ4Ijo4NCwieSI6NTF9LHsieCI6ODEsInkiOjQ5fSx7IngiOjY1LCJ5IjozOH0seyJ4Ijo2NCwieSI6Mzd9LHsieCI6NjMsInkiOjM2fSx7IngiOjYyLCJ5IjozNn0seyJ4Ijo2MSwieSI6MzV9LHsieCI6NjAsInkiOjM0fSx7IngiOjU5LCJ5IjozM30seyJ4Ijo1OCwieSI6MzJ9LHsieCI6NTcsInkiOjMxfSx7IngiOjU2LCJ5IjozMH0seyJ4Ijo1NSwieSI6Mjl9LHsieCI6NTQsInkiOjI4fSx7IngiOjUzLCJ5IjoyN30seyJ4Ijo1MiwieSI6MjZ9LHsieCI6NTEsInkiOjI1fSx7IngiOjUwLCJ5IjoyNH0seyJ4Ijo0OSwieSI6MjN9LHsieCI6NDgsInkiOjIzfSx7IngiOjQ3LCJ5IjoyMn0seyJ4Ijo0NiwieSI6MjF9LHsieCI6NDUsInkiOjIwfSx7IngiOjQ0LCJ5IjoyMH0seyJ4Ijo0MywieSI6MTl9LHsieCI6NDIsInkiOjE4fSx7IngiOjQxLCJ5IjoxN30seyJ4Ijo0MCwieSI6MTd9LHsieCI6MzksInkiOjE2fSx7IngiOjM4LCJ5IjoxNX0seyJ4IjozNywieSI6MTV9LHsieCI6MzYsInkiOjE0fSx7IngiOjM1LCJ5IjoxNH0seyJ4IjozNCwieSI6MTN9LHsieCI6MzMsInkiOjEzfSx7IngiOjMyLCJ5IjoxMn0seyJ4IjozMSwieSI6MTJ9LHsieCI6MzAsInkiOjExfSx7IngiOjI5LCJ5IjoxMX0seyJ4IjoyOCwieSI6MTB9LHsieCI6MjcsInkiOjEwfSx7IngiOjI2LCJ5Ijo5fSx7IngiOjI1LCJ5Ijo5fSx7IngiOjI0LCJ5Ijo5fSx7IngiOjIzLCJ5Ijo4fSx7IngiOjIyLCJ5Ijo4fSx7IngiOjIxLCJ5Ijo3fSx7IngiOjIwLCJ5Ijo3fSx7IngiOjE5LCJ5Ijo3fSx7IngiOjE4LCJ5Ijo2fSx7IngiOjE3LCJ5Ijo2fSx7IngiOjE2LCJ5Ijo2fSx7IngiOjE1LCJ5Ijo1fSx7IngiOjE0LCJ5Ijo1fSx7IngiOjEzLCJ5Ijo1fSx7IngiOjEyLCJ5Ijo0fSx7IngiOjExLCJ5Ijo0fV0%3D)

$$ 
0.4725 \cdot \text{ilvl} - 0.00668 \cdot \text{ilvl}^2 + 0.0001745 \cdot \text{ilvl}^3 - 0.00000094 \cdot \text{ilvl}^4 + 0.0000000015 \cdot \text{ilvl}^5 
$$

### Rare - [Graph](https://github.com/dewmguy/PolynomialVisualizer/?a=3&b=0.12125&c=0.00838&d=-0.000018&e=0.00000001&f=-0.00000000009&min-x=0&max-x=400&min-y=0&max-y=400&order=5&graph-title=Rare+Shield+-+Block+Value&csvPoints=W3sieCI6MjAwLCJ5IjoyMDR9LHsieCI6MTg3LCJ5IjoxOTd9LHsieCI6MTc1LCJ5IjoxODd9LHsieCI6MTc0LCJ5IjoxODV9LHsieCI6MTcxLCJ5IjoxODF9LHsieCI6MTY2LCJ5IjoxNzR9LHsieCI6MTU5LCJ5IjoxNjR9LHsieCI6MTU4LCJ5IjoxNjJ9LHsieCI6MTU0LCJ5IjoxNTd9LHsieCI6MTMwLCJ5IjoxMDF9LHsieCI6MTE1LCJ5Ijo4Nn0seyJ4IjoxMTIsInkiOjgzfSx7IngiOjEwOSwieSI6ODB9LHsieCI6OTcsInkiOjcxfSx7IngiOjkxLCJ5Ijo2OH0seyJ4Ijo2OCwieSI6NDN9LHsieCI6NjMsInkiOjQwfSx7IngiOjYyLCJ5IjozOX0seyJ4Ijo2MSwieSI6Mzh9LHsieCI6NjAsInkiOjM4fSx7IngiOjU5LCJ5IjozN30seyJ4Ijo1OCwieSI6MzZ9LHsieCI6NTYsInkiOjM1fSx7IngiOjU1LCJ5IjozNH0seyJ4Ijo1NCwieSI6MzN9LHsieCI6NTMsInkiOjMyfSx7IngiOjUyLCJ5IjozMX0seyJ4Ijo1MCwieSI6Mjl9LHsieCI6NDgsInkiOjI3fSx7IngiOjQ2LCJ5IjoyNX0seyJ4Ijo0NCwieSI6MjN9LHsieCI6NDIsInkiOjIyfSx7IngiOjQwLCJ5IjoyMH0seyJ4IjozOSwieSI6MjB9LHsieCI6MzgsInkiOjE5fSx7IngiOjM3LCJ5IjoxOH0seyJ4IjozNiwieSI6MTd9LHsieCI6MzEsInkiOjE0fSx7IngiOjMwLCJ5IjoxNH0seyJ4IjoyOSwieSI6MTN9LHsieCI6MjgsInkiOjEzfSx7IngiOjI1LCJ5IjoxMX0seyJ4IjoyNCwieSI6MTF9LHsieCI6MjAsInkiOjl9XQ%3D%3D)

$$ 
3.0 + 0.12125 \cdot \text{level} + 0.00838 \cdot \text{level}^2 - 0.000018 \cdot \text{level}^3 + 0.00000001 \cdot \text{level}^4 - 0.0000000001 \cdot \text{level}^5 
$$

### Epic - [Graph](https://github.com/dewmguy/PolynomialVisualizer/?a=3&b=0.35622&c=0.0057&d=0.0000505&e=-0.000000507&f=0.000000000999&min-x=0&max-x=400&min-y=0&max-y=400&order=5&graph-title=Epic+Shield+-+Block+Value&csvPoints=W3sieCI6Mjc3LCJ5IjoyNTl9LHsieCI6MjcwLCJ5IjoyNTN9LHsieCI6MjY0LCJ5IjoyNDh9LHsieCI6MjU4LCJ5IjoyNDN9LHsieCI6MjUyLCJ5IjoyMzh9LHsieCI6MjUxLCJ5IjoyMzd9LHsieCI6MjQ1LCJ5IjoyMzJ9LHsieCI6MjM4LCJ5IjoyMjd9LHsieCI6MjMyLCJ5IjoyMjN9LHsieCI6MjI2LCJ5IjoyMjF9LHsieCI6MjI1LCJ5IjoyMjB9LHsieCI6MjE5LCJ5IjoyMTh9LHsieCI6MjEzLCJ5IjoyMTZ9LHsieCI6MjAwLCJ5IjoyMTF9LHsieCI6MTU5LCJ5IjoxODV9LHsieCI6MTU0LCJ5IjoxNzh9LHsieCI6MTUxLCJ5IjoxNzR9LHsieCI6MTQ2LCJ5IjoxNjd9LHsieCI6MTQxLCJ5IjoxNjB9LHsieCI6MTM2LCJ5IjoxNTJ9LHsieCI6MTI4LCJ5IjoxNDF9LHsieCI6MTI1LCJ5IjoxMzd9LHsieCI6MTIzLCJ5IjoxMzR9LHsieCI6MTE1LCJ5IjoxMjJ9LHsieCI6MTEwLCJ5IjoxMTV9LHsieCI6MTA1LCJ5IjoxMDh9LHsieCI6OTIsInkiOjkwfSx7IngiOjkwLCJ5Ijo4N30seyJ4Ijo4MywieSI6Nzh9LHsieCI6ODEsInkiOjc1fSx7IngiOjc5LCJ5Ijo3M30seyJ4Ijo3OCwieSI6NzN9LHsieCI6NzcsInkiOjcxfSx7IngiOjc1LCJ5Ijo2OH0seyJ4Ijo3NCwieSI6Njd9LHsieCI6NzAsInkiOjYzfSx7IngiOjY4LCJ5Ijo2MX0seyJ4Ijo2NywieSI6NjB9LHsieCI6NjUsInkiOjU4fSx7IngiOjU5LCJ5Ijo1M30seyJ4Ijo1MCwieSI6NDF9LHsieCI6NDYsInkiOjM2fSx7IngiOjQxLCJ5IjozMH1d)

$$ 
3.0 + 0.35622 \cdot \text{level} + 0.0057 \cdot \text{level}^2 + 0.0000505 \cdot \text{level}^3 - 0.000000507 \cdot \text{level}^4 + 0.000000001 \cdot \text{level}^5 
$$

Note: There isn't enough reliable data for higher quality items. I will leave it to someone more mathematically inclined to recommend corrections or suggestions for what those curves would or should look like. For now, the calculator defaults to the epic curve.


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

- [TurtleWoW Forums](https://forum.turtle-wow.org/viewtopic.php?t=1567)
- [Allakhazam Forums](https://wow.allakhazam.com/wiki/Itemization_Formulas_%28wow%29)
- [Wowwiki Archive](https://wowwiki-archive.fandom.com/wiki/Item_level)
- [Wowpedia](https://wowpedia.fandom.com/wiki/Stat_budget)
- [Classic WoW Archive](https://classic-wow-archive.fandom.com/wiki/Item_level)
- [Wowwiki (HU)](https://wowwiki.fandom.com/hu/wiki/Level_(Item)#Calculating_Item_Level)
- [Elitist Jerks (archive)](https://web.archive.org/web/20111109062432/http://elitistjerks.com/f15/t44718-item_level_mechanics/)
- [Elitist Jerks Summary](https://web.archive.org/web/20120510064628/http://elitistjerks.com/f15/t6928-looking_good_summary_known_info_itemization/#11)

The images for item display were compiled by [reynoldscahoon](https://github.com/ReynoldsCahoon).

A not insignificant amount of inspiration for this application was derived from a spreadsheet created by (RS_Degen)[https://old.reddit.com/r/wowservers/comments/wipl9j/wotlk_random_item_generator/]