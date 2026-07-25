# Uncommon Random-Enchantment Audit

This audit targets uncommon (`Quality = 2`) armor and weapons with a
`RandomProperty` or `RandomSuffix` group in the AzerothCore WotLK world
database. It deliberately uses Blizzard's random-enchantment families as the
reference population instead of hand-picked quest, dungeon, or raid items.

## Reproduce the corpus

Use Python 3 and Node.js 20 or newer:

```powershell
python tools/audit_random_enchantments.py --fetch `
  --source-dir Test/uncommon-audit-source `
  --output-dir Test/uncommon-audit-results

node tools/run_random_enchantment_audit.js `
  --input Test/uncommon-audit-results/cases.json `
  --output Test/uncommon-audit-results/calculator-audit.json
```

Downloaded source files and generated results stay under ignored `Test/`.
`manifest.json` records SHA-256 hashes for every input so a run can be traced
to its exact source files.

The 2026-07-25 corpus contains:

- 80,495 item/enchantment cases from 3,176 unique items
- 769 unique property/suffix groups and 962 unique enchantments
- 49,806 random-property cases and 30,689 random-suffix cases
- observed item levels 10 through 182
- 80,103 clean stat cases after excluding baked stats, sockets, resistances,
  and spell-based effects that are outside the random-enchantment budget

The generator expands each applicable enchantment group, applies suffix
allocations with the same integer floor used by the server, merges duplicate
stats, and preserves the original item level and sell price.

## Findings and changes

### Uncommon capacity and rounding

The prior linear quality approximation produced a full/two-hand capacity of
`0.801 * 182 - 38.3 = 107.482`. The source table capacity is exactly `108`.
Using the exact `RandPropPoints.dbc` uncommon columns fixes both reported
Spirit directions:

- item level 182, two-hand, 100% Spirit generates 108 Spirit
- 108 Spirit resolves to item level 182

The generator still performs integer reconciliation after the inverse
power-law calculation. The fix is therefore not a blanket "round everything
up" rule; it corrects the capacity before rounding.

### MP5 and health regeneration

The single-stat suffix allocations for MP5 and health-per-5 are
`4000 / 10000`, implying a common-cost modifier of `2.5`. Uncommon MP5
previously used `2.875`, which over-priced the stat in reverse calculations.
With a `2.5` modifier, Invasion Blade of the Elder
(`85 Stamina, 56 Intellect, 22 MP5`) resolves to item level 181—within one
level of the listed 182 instead of 188.

### Weapon damage ranges

Clean random-enchantment weapons cluster around a damage-range coefficient of
`0.4` for two-hand weapons and `0.6` for one-hand/ranged weapons. The uncommon
model now uses those family coefficients. The existing continuous DPS
polynomials remain in use.

For Invasion Blade, the source damage is 388–583 at 3.5 seconds
(138.714 DPS). The model produces 390–584 and 138.929 DPS.

### Vendor values

The old uncommon fallback was `439 * itemLevel`, which necessarily returned
79,898 copper for any full-price item-level 182 item. It could not represent
weapon-family price series. The uncommon weapon model now interpolates
canonical sell-price anchors by InventoryType and subclass. Invasion Blade is
an exact anchor at 144,223 copper (14g 42s 23c).

Armor retains slot and subclass scaling, applied to a monotone empirical
uncommon armor base curve.

## Measured results

The clean stat corpus after the changes:

| Population | Cases | Mean absolute level error | Within ±1 | Within ±2 | P95 absolute error |
|---|---:|---:|---:|---:|---:|
| All clean cases | 80,103 | 2.083 | 52.80% | 72.31% | 6 |
| Random suffixes | 30,297 | 1.759 | 64.91% | 78.31% | 6 |
| Item levels 130–182 | 15,120 | 1.083 | 75.87% | 85.93% | 4 |

The remaining signed bias is -1.310 levels overall. This is retained rather
than adding a global offset: the error varies materially by level band and
enchantment family, and a blanket correction would make the strongest
Wrath-era band worse.

For vendor values, all 649 observed uncommon random-enchantment weapons are
within 5% of their source sell price; 91.06% are exact anchors. Across 2,527
armor items, 77.13% are within 5%. Armor is intentionally represented by a
normalized curve rather than thousands of exact item overrides.

The clean physical-weapon DPS audit covers 588 unique weapons. Its mean
absolute error is 2.671 DPS, mean absolute percentage error is 4.19%, and
62.41% are within 5%. This is a regression approximation, not a lookup table.
The corrected range coefficients reduce mean absolute min/max endpoint error
from 16.786 to 7.561 damage; 26.79% of endpoints are within two damage.

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
  },
  {
    "mode": "damage",
    "itemClass": 2,
    "inventoryType": 17,
    "subclass": 8,
    "quality": 2,
    "level": 182,
    "delay": 3500
  },
  {
    "mode": "price",
    "itemClass": 2,
    "inventoryType": 17,
    "subclass": 8,
    "quality": 2,
    "level": 182
  }
]
'@ | node tools/calculator_cli.js
```

`stats` output includes capacity, total/distributable/socket budgets, exact
stat amounts, integer amounts, and used/unused budget. `level` includes the
previous and selected thresholds and margins. `damage` includes the DPS
polynomial result, swing damage, range coefficient, exact endpoints, and
rounded endpoints. `price` records the selected source series and copper
arithmetic.

## Validation boundary

The level metrics exclude 392 cases from items with baked stats, sockets,
resistances, or spell effects. Those effects need an independently validated
budget mapping; treating them as zero-cost or guessing a conversion would
distort the comparison. The audit still retains these cases in its full output
and labels them with `clean_stat_model: false`.

The observed source population ends at item level 182. The exact uncommon
capacity table continues through 300, but levels above 182 are table-supported
extrapolation territory for this particular item corpus, not empirically
validated random-item coverage.
