# Item Level Calculator

[Open the calculator](https://dewmguy.github.io/ItemLevelCalculator/) · [View the changelog](CHANGELOG.md)

![Screenshot of the Item Level Calculator](screenshot.png?raw=true)

Item Level Calculator is a browser-based tool for creating and checking armor and weapons for World of Warcraft emulator projects. It covers the item ranges used by Vanilla, The Burning Crusade, and Wrath of the Lich King, and it produces a familiar in-game tooltip so the calculated result is easy to inspect.

The calculator works in two directions:

- **Calculate Level** estimates the lowest item level that can hold the stats entered.
- **Calculate Stats** starts with an item level and divides its available power among the selected stats.

It also calculates armor, shield block, weapon damage, attack speed, caster weapon spell power, druid form attack power, and vendor prices when the selected item type supports them.

## Using the calculator

Choose armor or weapon, then select the quality, slot, and subtype. In **Calculate Level** mode, enter the actual amount of each stat. In **Calculate Stats** mode, enter each stat's share to the nearest hundredth of a percent. The shares do not need to total 100% before calculation. Rows left at zero divide the percentage remaining after nonzero entries evenly, then each row except the bottom one snaps to the nearest whole stat point and the bottom stat receives the final balance. In a percentage field, the Up and Down arrow keys move to the percentage for the next or previous whole stat point at the selected item level.

A negative stat is treated as a sacrifice. Its cost is subtracted from the item, leaving more room for positive stats. For example, a negative allocation above the bottom row increases the balance available to the bottom stat.

Sockets use part of the same available power as ordinary stats. Optional tooltip fields, such as item name, required level, flavor text, bonus armor, and bonus elemental damage, affect the display only when they are provided. Leaving Required Level blank leaves that line out of the tooltip.

The supported item-level range is 1 through 300. Results are most dependable inside the ranges represented by game data. Values beyond ordinary item patterns should be treated as estimates.

## What an item budget means

An item budget is a common unit used to compare different stats. One point of Strength does not always cost the same amount of item power as one point of mana regeneration, spell power, armor, or a socket. The calculator therefore gives each stat a cost multiplier.

Let:

- $a_i$ be the amount of stat $i$;
- $m_i$ be that stat's cost multiplier;
- $p$ be the shared power, defined as:

$$
p = \frac{\log(2)}{\log(1.5)} \approx 1.7095
$$

The cost of one stat is:

$$
B_i =
\mathrm{sgn}(a_i)
\left(\lvert a_i\rvert m_i\right)^p
$$

The item's used budget is the sum of those costs:

$$
B_{\text{used}} = \sum_i B_i
$$

The power $p$ makes a large amount of one stat cost more than spreading similar power across several stats. With equal multipliers, the following two sides are close:

$$
100^p \approx 2{,}624
$$

$$
53^p + 53^p + 53^p \approx 2{,}659
$$

That is why roughly 100 points of one stat can occupy about the same budget as 53 points in each of three different stats. The exact result changes when the selected stats have different multipliers.

Negative amounts use the same calculation and then subtract their result:

$$
B_i =
-\left(\lvert a_i\rvert m_i\right)^p
\quad\text{when } a_i < 0
$$

This lets a penalty pay for part of the item's positive stats without changing the value assigned to either stat.

## Why the data tables are necessary

World of Warcraft does not use one fixed amount of power for every quality, slot, level, or weapon type. A chest, ring, staff, and wand at the same item level do not have the same room for stats. Their armor, damage, and price patterns also change across level ranges.

The project keeps these observed differences in data tables. The tables answer questions such as:

- Which capacity series belongs to this quality and inventory slot?
- How expensive is this stat at this level?
- How much budget does a socket consume?
- Which damage curve and default speed belong to this weapon?
- Which price samples apply to this armor or weapon?

Once the correct row or curve is selected, formulas turn it into a continuous result. This separation matters: the tables preserve differences found in the game data, while the formulas fill the gaps between known item levels and apply the same rules in both calculator modes.

| File | Purpose |
|---|---|
| [`random-property-points.js`](random-property-points.js) | Exact uncommon reference rows from `RandPropPoints.dbc` and smooth capacity curves for uncommon, rare, and epic items |
| [`budget-model.js`](budget-model.js) | Stat costs, socket costs, slot rules, item capacity, and item-level search |
| [`uncommon-weapon-model.js`](uncommon-weapon-model.js) | Uncommon weapon DPS curves, observed caster-staff points, damage spreads, and default attack speeds |
| [`weapon-specialization-model.js`](weapon-specialization-model.js) | Caster weapon spell power and passive druid form attack power |
| [`pricing-model.js`](pricing-model.js) | Vendor-price samples, slot multipliers, subtype multipliers, and fallback price formulas |
| [`script.js`](script.js) | Armor, shield block, rare and epic weapon damage, tooltip assembly, and browser interaction |
| [`calculator-core.js`](calculator-core.js) | Reusable stat, level, damage, and price calculations without the browser interface |

## Capacity at an item level

The Wrath client table `RandPropPoints.dbc` provides stat-capacity values by item level, quality, and inventory group. The project retains the exact uncommon rows for comparison and uses fitted curves across item levels 10 through 300 for the live calculations. A curve has the general form:

$$
C(q,s,L) =
c_4L^4 + c_3L^3 + c_2L^2 + c_1L + c_0
$$

Here $L$ is item level, $q$ is quality, $s$ is the inventory slot group, and the $c$ values come from the matching data table. Some modelled properties use fewer or more terms when the source pattern requires it.

The capacity becomes the maximum item budget:

$$
B_{\max}(q,s,L) = C(q,s,L)^p
$$

If the item contains sockets, their costs are reserved first:

$$
B_{\text{stats}} =
B_{\max} -
\sum_j m_{\text{socket},j}^{\,p}
$$

Socket costs vary by quality, level, socket color, and whether the item is an accessory, armor piece, or weapon. This prevents a socketed item from receiving the same ordinary stats as an otherwise identical item with no sockets.

## Calculating item level from stats

For each candidate level from 1 through 300, the calculator selects the matching capacity and stat multipliers. It chooses the first level where the entered stats fit:

$$
L_{\text{result}} =
\min \lbrace
L :
\sum_i
\mathrm{sgn}(a_i)
\left(\lvert a_i\rvert m_i(L)\right)^p
\leq
C(q,s,L)^p
\rbrace
$$

This repeated check is important because some stat and socket costs change at particular level boundaries. Evaluating each level with its own table values avoids applying a later rule to an earlier item.

## Calculating stats from an item level

In Calculate Stats mode, each requested percentage $r_i$ receives part of the budget left after sockets:

$$
B_i = B_{\text{stats}}\frac{r_i}{100}
$$

The amount of that stat is the reverse of the cost equation:

$$
a_i =
\mathrm{sgn}(B_i)
\frac{\lvert B_i\rvert^{1/p}}{m_i}
$$

For every row except the bottom one, the calculator rounds this amount to the nearest whole stat point and replaces its requested share with that point's exact budget share. The bottom row receives the budget left after those snapped allocations. Displayed percentages are rounded to hundredths and the bottom display absorbs any hundredth-percent rounding remainder, so the visible total is exactly 100%.

Tooltip stats must be whole numbers, so the calculator reconciles the balancing row without exceeding the total budget. The generated item is then sent back through Calculate Level as a check.

## Armor and shield block

Armor is modelled separately for cloth, leather, mail, plate, and shields. The selected quality and armor type choose a level curve $f_{q,t}(L)$. The inventory slot supplies a fraction $s_{\text{armor}}$, because a chest naturally has more armor than bracers:

$$
\text{Armor} =
\max\left(
\left\lceil
f_{q,t}(L)s_{\text{armor}}
\right\rceil,
0
\right)
+
\text{BonusArmor}
$$

Bonus Armor entered as a stat is added after the base armor calculation and is shown in green.

Shield block uses a quality-specific curve $g_q(L)$ and never displays less than 7:

$$
\text{Block} =
\max\left(
\left\lceil g_q(L)\right\rceil,
7
\right)
$$

The coefficients for these curves are stored with the live calculator because they are display properties rather than part of the ordinary stat-budget exchange.

## Weapon damage

Weapon type, quality, item level, and weapon profile select a DPS curve or a pair of nearby observed points. Let $D$ be the selected damage per second, $T$ the attack delay in milliseconds, and $w$ the width of the damage range. Average damage per attack is:

$$
\text{AverageSwing} = D\frac{T}{1000}
$$

The minimum and maximum values are placed evenly around that average:

$$
\text{MinimumDamage} =
\text{AverageSwing}\left(1-\frac{w}{2}\right)
$$

$$
\text{MaximumDamage} =
\text{AverageSwing}\left(1+\frac{w}{2}\right)
$$

One-hand, two-hand, ranged, caster, and uncommon random-enchantment weapons use different rows where the source data shows different behavior. Custom attack speed changes the damage per swing while preserving the selected DPS. Bonus elemental damage is displayed on its own line and does not inflate the physical damage range.

### Druid weapons

Eligible weapons can display the passive attack power used by Cat, Bear, Dire Bear, and Moonkin forms. The conversion follows the AzerothCore 3.3.5 rule:

$$
\text{FeralAttackPower} =
\max\left(
0,
\left\lfloor
14(D + D_{\text{bonus}})
\right\rfloor - 767
\right)
$$

Here $D_{\text{bonus}}$ is the DPS contributed by separately displayed bonus damage.

### Caster weapons

Caster staves, maces, swords, and daggers use a caster damage profile that cannot exceed the ordinary physical profile for the same weapon. At Wrath item levels, base spell power follows the full-weapon capacity:

$$
\text{BaseSpellPower} =
\mathrm{round}\left(
\frac{12}{5}C(q,\text{two-hand},L)
\right)
\quad\text{for } L > 165
$$

For earlier items, the calculator grants spell power only for DPS given up by the caster profile, at four spell power per point of sacrificed DPS, capped by the same full-weapon ceiling:

$$
\text{BaseSpellPower} =
\min\left(
\left\lceil
4\max(D_{\text{default}}-D_{\text{caster}},0)
\right\rceil,
\mathrm{round}\left(
\frac{12}{5}C(q,\text{two-hand},L)
\right)
\right)
$$

This base spell power is locked because it comes from the weapon profile. Additional spell power selected as a normal stat still uses the editable item budget.

## Vendor prices

Uncommon random-enchantment weapons and armor use observed AzerothCore sell-price points. When the requested level falls between two points, the calculator fills the gap with a straight line:

$$
P(L) =
P_0 +
\frac{L-L_0}{L_1-L_0}
(P_1-P_0)
$$

Other supported items use a quality-based base price:

$$
P_{\text{base}}(L)=
\begin{cases}
439L & \text{uncommon}\\
500+525L & \text{rare}\\
10{,}000+600L+(0.16L)^2 & \text{epic}
\end{cases}
$$

The sell price is:

$$
P_{\text{sell}} =
\left\lfloor
P_{\text{base}}
\times
M_{\text{slot}}
\times
M_{\text{subtype}}
\right\rfloor
$$

Vendor buy price is five times the sell price for most items and four times the sell price for necks, rings, and held off-hand armor:

$$
P_{\text{buy}} =
\begin{cases}
4P_{\text{sell}} & \text{neck, ring, or held off-hand armor}\\
5P_{\text{sell}} & \text{other supported items}
\end{cases}
$$

All price calculations are performed in copper and converted to gold, silver, and copper for the tooltip.

## Accuracy and limits

The calculator describes the regular patterns found across large groups of items. It does not claim that every Blizzard item follows those patterns. Quest rewards, boss drops, proc effects, set bonuses, deliberately unusual items, and source-data mistakes can all produce real items that appear above or below their labelled item level.

For that reason, the result is best used as a consistent baseline for custom-item design and as a warning that an existing item deserves closer inspection. It should not be treated as proof that an unusual original item is wrong.

The live equations and tables in the JavaScript modules are authoritative. Supporting audits explain the source coverage and known exclusions:

- [`docs/UNCOMMON_RANDOM_ENCHANTMENT_AUDIT.md`](docs/UNCOMMON_RANDOM_ENCHANTMENT_AUDIT.md)
- [`docs/SOCKET_BUDGET_AUDIT.md`](docs/SOCKET_BUDGET_AUDIT.md)
- [`docs/EPIC_BUDGET_AUDIT.md`](docs/EPIC_BUDGET_AUDIT.md)

## Running and testing

The calculator is a static web application. It can be served by any local web server or opened through the hosted link above. The model tests use Node's built-in test runner:

```powershell
node --test .\tests\*.test.js
```

The browser loads the model files before [`script.js`](script.js), which connects them to the form and tooltip. Keep that load order when embedding or repackaging the calculator.

## Sources and attribution

The model draws on the Wrath 3.3.5 `RandPropPoints.dbc` table, AzerothCore `item_template` data and code, observed in-game items, and earlier community research into itemization:

- [AzerothCore item_template documentation](https://www.azerothcore.org/wiki/item_template)
- [AzerothCore ItemTemplate source reference](https://www.azerothcore.org/doxygen/d4/d69/structItemTemplate.html)
- [AzerothCore Player source reference](https://www.azerothcore.org/doxygen/d2/d4b/classPlayer.html)
- [Turtle WoW forum discussion](https://forum.turtle-wow.org/viewtopic.php?t=1567)
- [Allakhazam itemization formulas](https://wow.allakhazam.com/wiki/Itemization_Formulas_%28wow%29)
- [WowWiki archive: Item level](https://wowwiki-archive.fandom.com/wiki/Item_level)
- [WoWpedia archive: Stat budget](https://wowpedia.fandom.com/wiki/Stat_budget)
- [Elitist Jerks item-level mechanics archive](https://web.archive.org/web/20111109062432/http://elitistjerks.com/f15/t44718-item_level_mechanics/)
- [RS_Degen's WotLK random-item spreadsheet](https://old.reddit.com/r/wowservers/comments/wipl9j/wotlk_random_item_generator/)

Item-display images were compiled by [ReynoldsCahoon](https://github.com/ReynoldsCahoon). The fitted expressions were developed and checked with [Polynomial Visualizer](https://github.com/dewmguy/PolynomialVisualizer).
