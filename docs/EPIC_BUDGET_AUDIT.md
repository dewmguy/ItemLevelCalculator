# Epic Armor and Weapon Budget Audit

This audit evaluates fixed epic (`Quality = 4`) armor and weapons through item
level 277. The calculator's continuous `RandPropPoints.dbc` capacity curves
remain unchanged; the implemented correction is limited to class-aware spell
power and socket costs.

## Reproduce

Use the canonical ignored workbook and spell-description extract:

```powershell
python tools/audit_epic_budgets.py
```

If Node.js is not on `PATH`, pass its executable with `--node`. Generated cases
and reports are written beneath ignored `Test/epic-budget-audit/`.

The extractor includes direct stats, resistances, recognized sockets, and
simple passive equip effects. Proc, on-use, class-specific, malformed, and
otherwise unsupported effects are excluded.

## Baseline finding

The original model was systematically low for fixed epic armor beginning at
the ilvl-90 coefficient transition. The strongest populated bands were:

| Actual level band | Armor cases | Prior bias | Prior MAE |
|---|---:|---:|---:|
| 90-129 | 1,012 | -12.10 | 12.25 |
| 130-159 | 987 | -11.09 | 11.83 |
| 200-226 | 1,806 | -8.62 | 8.68 |
| 227-244 | 658 | -7.22 | 7.26 |
| 245-258 | 1,284 | -8.21 | 8.21 |
| 259-271 | 489 | -8.55 | 8.55 |
| 272-277 | 201 | -8.32 | 8.32 |

High-level weapons were much closer: the 272-277 population had a prior bias
and MAE of -3.74. Older caster main-hands contain large spell-power outliers
and should not be fitted with the armor spell-power rule.

## Implemented equations

Epic armor spell power retains a cost of `55/64` from ilvl 90 upward. Epic
weapons retain `45/64`.

Through ilvl 200, epic sockets share the continuous rare-socket calibration:

```text
accessory socket = 10 + max(0, itemLevel - 130) / 3
other socket     = 20 + 2 max(0, itemLevel - 130) / 7
```

Above ilvl 200:

```text
weapon socket       = 40
ordinary armor      = valueAt200 + (48 - valueAt200) (itemLevel - 200) / 77
meta armor socket   = 40 + (80 - 40) (itemLevel - 200) / 77
```

The armor equations continue beyond 277 for creative extrapolation through the
calculator's ilvl-300 range. Stamina remains `2/3`; increasing it to `3/4`
matched selected tier pieces exactly but worsened deterministic held-out
results.

## Validation

On the full 8,411-item supported corpus, overall MAE improves from 9.46 to
4.42. Armor alone improves to 2.83 MAE with -1.23 bias. The remaining overall
weapon spread is dominated by older caster-weapon outliers.

The corrected high-level bands are:

| Actual level band | Combined cases | New bias | New MAE |
|---|---:|---:|---:|
| 200-226 | 2,005 | -0.02 | 2.60 |
| 227-244 | 783 | -0.58 | 1.81 |
| 245-258 | 1,441 | -0.88 | 1.72 |
| 259-271 | 561 | -1.00 | 1.53 |
| 272-277 | 232 | -1.09 | 1.78 |

On the deterministic 20% diagnostic split, top-epic armor improves from 8.02
to 1.47 MAE and top-epic weapons improve from 4.04 to 1.67.

As a separate regression check, the epic subset of the random-enchantment
audit improves from 7.19 MAE with -7.19 bias to 3.68 MAE with -3.68 bias.
Uncommon and rare coefficients remain unchanged.

Representative ilvl-277 plate results retain a deliberate residual rather than
being forced to the published tier:

| Item | Prior | Current |
|---|---:|---:|
| Sanctified Lightsworn Tunic | 266 | 275 |
| Sanctified Lightsworn Battleplate | 270 | 273 |
| Sanctified Lightsworn Helmet | 267 | 273 |
| Sanctified Lightsworn Shoulderplates | 272 | 274 |
