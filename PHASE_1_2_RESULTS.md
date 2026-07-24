# Phase 1–2 validation results

Generated from the approved baseline and formula-comparison plan on
2026-07-24. No experimental coefficients in this report have been written into
the live calculator.

## Decision

Keep the current production exponent and coefficients for now.

- Reject the peer formula as written. It performs materially worse before and
  after coefficient refitting.
- Treat the reciprocal-corrected peer expression as a derivation of the
  `p = 1.5` Lp model, not an independent candidate.
- Retain `p = 1.5` and `p = log2(3)` as research finalists.
- Do not deploy `p = log2(3)` despite its lead in the first refit. The refit
  used an entry-ID split rather than item-family grouping, did not use nested
  cross-validation, and simplified the live dynamic stat modifiers into
  static fitted multipliers. Those limitations are large enough to make a
  production change premature.

This conclusion does not treat Blizzard's stored ItemLevel as perfect truth.
It treats held-out error against that field as one diagnostic, alongside
monotonicity, mathematical behavior, corpus provenance, and known unpriced
effects.

## Corpus

| Cohort | Rows |
|---|---:|
| Source workbook | 18,229 |
| Modeled by the fixed benchmark | 10,220 |
| Excluded with machine-readable reasons | 8,009 |
| Pure-stat comparison cohort | 6,058 |
| Socket-augmented diagnostic cohort | 4,162 |
| Pure-stat training rows | 4,834 |
| Pure-stat held-out rows | 1,224 |

The largest exclusion was an unpriced spell/effect field (7,955 rows).
Negative stats, incomplete rows, unsupported tuples, and invalid item levels
are separately recorded in the ignored local artifact
`Test/benchmark-results/row-disposition.csv`.

## Fixed-coefficient comparison

This pass changes only the candidate equation. It deliberately leaves the
current quality, slot, and stat coefficients fixed, so it is a sensitivity
diagnostic rather than a fair final exponent selection.

| Model | Held-out MAE | Penalized MAE | Failures |
|---|---:|---:|---:|
| Current Lp, `p = ln(2)/ln(1.5)` | 10.931 | 13.451 | 44 |
| Lp, `p = 1.5` | 12.506 | 14.716 | 42 |
| Lp, `p = log2(3)` | 11.727 | 13.963 | 42 |
| Peer formula as written | 36.931 | 51.124 | 305 |
| Reciprocal-corrected peer | 12.506 | 14.716 | 42 |

The current model wins when every candidate is forced to use incumbent
coefficients. This does not prove its exponent is best because those
coefficients were calibrated around it.

## Candidate-specific refit

Each candidate received train-only positive monotone quality curves, positive
slot ratios, and positive stat multipliers. Armor chest and Strength were
anchored at 1 to remove scale indeterminacy. All fitted quality curves passed
the level 1–300 monotonicity check.

| Model | Log-capacity MAE | Item-level MAE | Penalized MAE | RMSE | Bias | Within ±2 | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|
| Current Lp | 0.1388 | 7.706 | 7.957 | 13.449 | -4.385 | 32.4% | 2 |
| Lp, `p = 1.5` | 0.1128 | 5.965 | 6.515 | 11.459 | -0.644 | 37.2% | 5 |
| Lp, `p = log2(3)` | **0.1098** | **5.771** | **6.322** | **11.390** | **-0.590** | **38.8%** | 5 |
| Peer formula as written | 0.1992 | 10.178 | 12.161 | 16.773 | -2.360 | 22.3% | 38 |

In 500 entry-level bootstrap resamples, `p = log2(3)` improved penalized MAE
over the current exponent by 1.64 levels, with a 95% interval of 1.33–1.96.
`p = 1.5` improved it by 1.45 levels, interval 1.13–1.77. The difference
between the two finalists is small relative to the validation limitations.

## Confirmed production risks

Corrected in this phase:

- The inverse stat transform had the stat modifier inside the root.
- String IDs could pass tuple validation through JavaScript key coercion.
- Shirts used the Cloth subclass instead of Miscellaneous armor.
- A rare main-hand caster row was missing its profile tag.
- Scalar negative subclass exclusions were mishandled.
- Independent upward rounding could overspend the nonlinear item budget.
- Bonus elemental damage was counted in both the base damage line and its own
  tooltip line.
- Stat and socket rows could receive duplicate DOM IDs.
- Fractional stat amounts were accepted by the integer level-inference mode.
- Named caster/feral profiles could silently fall back to a generic damage
  curve.

Deferred with explicit validation requirements:

- Current combined capacity decreases at several coefficient boundaries,
  including 79→80, 89→90, 99→100, 135→136, and 199→200. Forward-generated
  items can therefore infer to a lower level.
- Caster weapons have no authoritative hidden base-spell-power conversion;
  spell power must remain an explicit allocated stat.
- Uncommon feral staffs have no validated damage model and are rejected
  instead of borrowing a generic melee curve.

Implemented immediately after this report:

- The documented rare druid-staff curve was corrected from a mistaken caster
  profile tag.
- The overlapping epic generic two-hand rows now switch cleanly at level 91.
- Feral attack power now uses AzerothCore's exact DPS conversion for eligible
  weapon InventoryTypes.

## Required next experiment

Before changing the exponent:

1. Define item-family/set/source groups and keep each group wholly within one
   train, validation, or test fold.
2. Use nested cross-validation to select quality knots, regularization, and
   any dynamic stat-modifier structure.
3. Compare only the two finalists (`p = 1.5` and `p = log2(3)`) against the
   incumbent on untouched grouped folds.
4. Require no monotonic-capacity failures and inspect residuals by quality,
   expansion, slot, stat count, and weapon/armor class.
5. Keep the incumbent unless the improvement remains material and consistent
   across folds and important strata.

## Reproduction

```powershell
python tools/full_model_benchmark.py --bootstrap-reps 500 --output-dir Test/benchmark-results
python tools/refit_budget_models.py --iterations 1200 --bootstrap-reps 500 --output-dir Test/benchmark-refit-results
```

Detailed manifests, coefficients, predictions, metrics, bootstrap intervals,
and exclusions are stored locally in the Git-ignored
`Test/benchmark-results/` and `Test/benchmark-refit-results/` directories.
