# Random-Enchantment Capacity Audit

This audit uses Blizzard-style random-enchantment families as a calibration
population for the calculator. The main population is uncommon (`Quality = 2`)
armor and weapons, with smaller rare and epic comparison sets.

## Data source and scope

The local `RandPropPoints.dbc` data came from the
[wowgaming/client-data DBC_SQL V1 release](https://github.com/wowgaming/client-data/releases/tag/dbc_sql_v1).
That release converts the WotLK 3.3.5.12340 client DBC files to SQL for
AzerothCore-compatible use.

`RandPropPoints.dbc` is one table with three quality families:

- five Epic capacity columns
- five Superior (rare) capacity columns
- five Good (uncommon) capacity columns

Each family contains Full/2H, medium, small, one-hand, and ranged/thrown
inventory groups. Rare and epic suffix capacities therefore do not require
another table.

The table applies to random suffixes. A random-property item follows a
different path: `ItemRandomProperties.dbc` selects fixed
`SpellItemEnchantment.dbc` values, without multiplying them by
`RandPropPoints`. `ItemRandomSuffix.dbc`, `SpellItemEnchantment.dbc`,
`item_enchantment_template`, and the item database are all needed to recreate
the complete family and its selection chances.

Client DBC files are build-specific. The WotLK table covers the levels known
to that client, including older content, but it is not a cumulative record of
the exact Vanilla, TBC, and WotLK values at each expansion's original release.

## Reproduce the corpus and fit

Use Python 3 and Node.js 20 or newer:

```powershell
python tools/audit_random_enchantments.py --fetch `
  --source-dir Test/uncommon-audit-source `
  --output-dir Test/random-enchantment-all-results

python tools/fit_random_property_points.py `
  Test/uncommon-audit-source/dbc-sql/AzerothcoreDBCToSQL/randproppoints_dbc.sql

node tools/run_random_enchantment_audit.js `
  --input Test/random-enchantment-all-results/cases.json `
  --output Test/random-enchantment-all-results/calculator-audit.json
```

Downloaded source files and generated results stay under ignored `Test/`.
`manifest.json` records SHA-256 hashes so a run can be traced to its inputs.

The 2026-07-25 expanded corpus contains:

- 84,484 item/enchantment cases from 3,443 unique items
- 814 unique property/suffix groups and 984 unique enchantments
- item levels 10 through 200
- 82,858 clean stat cases after excluding baked stats, sockets, resistances,
  and spell effects outside the modeled random-enchantment budget
- 80,103 uncommon, 2,512 rare, and 243 epic clean cases

The generator expands every applicable enchantment group, applies suffix
allocations with the same integer floor used by the server, merges duplicate
stats, and preserves the original item level and sell price.

## Capacity model

Build `2026.07.25.5` fits a separate quartic curve to each of the 15
quality/inventory series across DBC item levels 10–300. The calculator uses
those continuous curves, not exact row lookup. The exact uncommon rows remain
embedded as an independent reference, and verbose JSON output reports the DBC
reference and fit residual when one is available.

This choice has two purposes:

- retain Blizzard's inventory- and quality-specific curve shapes
- permit interpolation, smooth reverse calculation, and mathematical
  extrapolation outside the table

The UI remains capped at item level 300 because the armor, damage, and vendor
models have not all been validated beyond the client table. The capacity
function itself can evaluate beyond 300 for research.

For Invasion Blade at item level 182, the fitted uncommon Full/2H capacity is
approximately `108.494`. Integer reconciliation produces 108 Spirit, and 108
Spirit resolves back to item level 182. This is a capacity correction, not a
global "always round up" rule.

The MP5 and health-per-5 suffix allocations imply a common stat modifier of
`2.5`. With that correction and the continuous curve, Invasion Blade of the
Elder (`85 Stamina, 56 Intellect, 22 MP5`) resolves to item level 180. The
remaining two-level miss is retained instead of introducing a special-case
offset that worsens broader results.

## Low-level random properties

Training Sword is a useful counterexample to treating the DBC as an exact
answer for every random enchantment. Its random-property group contains fixed
enchantment values such as +1 through +4 single stats, paired stats, and
attack power. Those values are not scaled by the item-level-10
`RandPropPoints` Good capacity.

Across all 41 Training Sword property rolls:

| Capacity model | Mean absolute level error | Signed bias | Within ±2 |
|---|---:|---:|---:|
| Exact DBC row lookup | 2.659 | +2.659 | 26.83% |
| New quartic DBC fit | 2.195 | +2.098 | 60.98% |
| Published historical piecewise curve | 1.634 | +1.098 | 87.80% |

The published curve is therefore still better for this specific low-level
property family. A low-level special blend was tested, but it reduced accuracy
over the complete corpus, so it was not added. The audit keeps this limitation
visible rather than overfitting one item family.

## Rare and epic random items

Ribsplitter uses a fixed random-property group, not a separate rare
`RandPropPoints` table. Its item template also includes spell effect 9140, so
its listed item level is not a clean stat-only reference for the calculator.
The audit excludes that kind of item from clean level metrics while retaining
it in the complete output.

The fitted rare and epic curves improve substantially over the old piecewise
model, but evidence is less balanced than for uncommon items:

| Quality | Clean cases | Mean absolute level error | Within ±2 | P95 error |
|---|---:|---:|---:|---:|
| Uncommon | 80,103 | 2.180 | 70.47% | 6 |
| Rare | 2,512 | 3.467 | 52.67% | 11 |
| Epic | 243 | 7.193 | 22.63% | 24 |

For comparison, the prior rare model had 4.832 mean absolute error and 34.95%
within ±2; the prior epic model had 8.539 mean absolute error and 12.35%
within ±2. The rare WotLK high band at item levels 130–182 is much stronger:
1.504 mean absolute error and 88.66% within ±2. The epic sample is only 243
suffix cases concentrated at item levels 80–120, so it is not strong enough
to claim a generally solved epic model.

## Overall measured results

| Population | Cases | Mean absolute level error | Signed bias | Within ±2 | P95 error |
|---|---:|---:|---:|---:|---:|
| All qualities | 82,858 | 2.233 | — | 69.79% | 6 |
| Uncommon random properties | 49,806 | 2.152 | -0.113 | 71.53% | — |
| Uncommon random suffixes | 30,297 | 2.225 | -1.654 | 68.74% | — |
| Uncommon item levels 130–182 | 15,120 | 1.097 | -0.061 | 91.98% | 3 |

The fitted model trades a small amount of exact random-suffix reproduction for
better fixed-property behavior and a continuous capacity function. Exact
uncommon row lookup previously produced 2.083 overall mean absolute error and
72.31% within ±2; the difference is deliberately accepted to preserve formula
behavior and improve the high-level band.

## Weapon damage and vendor values

These models remain empirical regressions rather than DBC capacity lookups.
For Invasion Blade, the source damage is 388–583 at 3.5 seconds
(138.714 DPS); the model produces 390–584 and 138.929 DPS. Its source sell
price is an exact model anchor at 144,223 copper (14g 42s 23c).

All 649 observed uncommon random-enchantment weapons are within 5% of source
sell price; 91.06% are exact anchors. Across 2,527 armor items, 77.13% are
within 5%. The clean physical-weapon audit covers 588 unique weapons with
2.671 DPS mean absolute error and 4.19% mean absolute percentage error.

## JSON calculator

`tools/calculator_cli.js` accepts one request or an array on stdin. Results
include `ok`, normalized inputs, outputs, and verbose equation terms.

```powershell
@'
[
  {
    "mode": "stats",
    "itemClass": 2,
    "inventoryType": 17,
    "quality": 2,
    "level": 182,
    "stats": [{"type": "5", "percent": 100}]
  },
  {
    "mode": "level",
    "itemClass": 2,
    "inventoryType": 17,
    "quality": 2,
    "stats": [{"type": "5", "amount": 108}]
  }
]
'@ | node tools/calculator_cli.js
```

`stats` output includes capacity, DBC reference/residual, total and
distributable budgets, exact and integer stat amounts, and unused budget.
`level` includes the previous and selected thresholds and margins. `damage`
includes the DPS polynomial result, swing damage, range coefficient, and
endpoints. `price` records the selected source series and copper arithmetic.

## Validation boundary

The clean metrics exclude 1,626 cases from items with baked stats, sockets,
resistances, or spell effects. Guessing their conversion would distort the
comparison. The full output retains them with `clean_stat_model: false`.

Random-property groups are fixed enchantment packages and random-suffix groups
are scaled allocations. They are both useful calibration evidence, but neither
proves that every Blizzard item level was assigned from stats alone.
