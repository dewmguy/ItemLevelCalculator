# Formula validation protocol

## Scope and decision rule

This document defines how stat-budget formulas and production coefficients
must be compared before one is selected for the calculator. It is deliberately
separate from the historical discussion in `MODEL_RESEARCH.md`.

The goal is an effective item-power model for mechanically clean Vanilla,
Burning Crusade, and Wrath items. Blizzard's displayed `ItemLevel` is a noisy
observation, not an unquestioned ground truth. A candidate must therefore pass
both mathematical property tests and held-out empirical tests. Aggregate fit
to the same rows used to estimate coefficients is not sufficient.

No formula is accepted merely because it has a familiar exponent. The
incumbent remains in production unless an alternative clears all hard gates and
the predeclared improvement thresholds below.

## Common notation

For stat `i`, define:

```text
x_i       raw integer stat amount
w_i       positive StatMod converting x_i to common-cost units
z_i       w_i * x_i
Z         sum(z_i)
alpha_i   z_i / Z
r_k       directly interpretable raw-capacity ratio for slot k; chest is 1
Q_q(L)    positive quality/progression capacity for quality q at level L
p         candidate distribution exponent, greater than 1
```

The normalized Lp capacity and required quality are:

```text
C_p(z) = (sum(z_i^p))^(1/p)
R_p(z, k) = C_p(z) / r_k
```

An item fits level `L` when `R_p <= Q_q(L)`.

The production code stores a nonlinear `SlotMod`, `s`, rather than `r`.
For the current equation:

```text
r = s^(1 - 1/p)
s = r^(p/(p - 1))
```

This conversion is essential when comparing exponents. Holding `s` fixed while
changing `p` silently changes the physical meaning of the slot coefficient.
For example, with the incumbent exponent, `s = 1/2` represents `r = 3/4`;
treating the same `s` linearly represents `r = 1/2`.

## Candidate formulas

### A. Incumbent Lp model

```text
p = log(2) / log(1.5) = 1.709511291...
R_A = C_p(z) / r_k
```

This exponent encodes `1.5^p = 2`. One 100-point stat therefore has the
same cost as two 66.667-point stats and approximately the same cost as three
52.59-point stats.

### B. Three-halves Lp model

```text
p = 3/2
R_B = C_(3/2)(z) / r_k
```

This is the norm-consistent interpretation of a three-halves power law.

### C. Misquoted log2(3) Lp model

```text
p = log(3) / log(2) = 1.584962501...
R_C = C_p(z) / r_k
```

This candidate is retained as a diagnostic because it was attributed to the
app, not because the current code uses it.

### D. Peer formula exactly as written

Assuming the peer's allocation shares are shares of common-cost points:

```text
D = (sum(alpha_i^(3/2)))^(2/3)
generated total Z = r_k * Q_q(L) * D
R_D = Z / (r_k * D)
    = Z^2 / (r_k * C_(3/2)(z))
```

For a split distribution, `D < 1`; this formula reduces the available linear
total as stats are distributed. That is a distribution penalty. It is
mathematically distinct and should be tested exactly as written.

If the peer means raw-stat shares rather than common-cost shares, or folds
`StatMod` into the word "weight", that is a different model and must be written
down explicitly before testing. Raw shares and stat-cost coefficients cannot
be interchanged.

### E. Reciprocal-corrected peer derivation

```text
generated total Z = r_k * Q_q(L) / D
R_E = Z * D / r_k
```

Since `Z * D = C_(3/2)(z)`, candidate E is exactly candidate B when `alpha`
is defined from `z`. It is not an independent fifth model, even for
heterogeneous `StatMod` values. It may be shown as an explanatory derivation,
but it must not be counted as separate evidence or an extra model-selection
trial.

## Identifiability and confounding

The following parameters cannot all be estimated freely:

- Multiplying every `w_i` and every `Q_q` by the same constant leaves all
  predictions unchanged.
- Multiplying every `r_k` and dividing every `Q_q` by the same constant also
  leaves all predictions unchanged.
- With only one slot, slot effects cannot be estimated.
- With only unit-cost stats, relative `StatMod` values cannot be estimated.
- If stat composition is correlated with slot, quality, expansion, or tier,
  exponent error can be absorbed by those coefficients.
- Repeated tier labels provide little information about within-tier slope.
  More knots can merely learn Blizzard's label plateaus.
- Unmodeled sockets, procs, set bonuses, resistances, base caster spell power,
  and feral attack power bias coefficients toward whichever item groups contain
  them.

Every fit must therefore use these anchors:

```text
Strength StatMod = 1
Chest raw slot ratio r_chest = 1
```

Equivalent anchors are acceptable only if they are declared before fitting and
converted back to the same scale for comparison.

The primary clean cohort must exclude unpriced effects. Caster and feral
weapons remain separate cohorts until base spell power, feral AP, and reduced
weapon DPS can be valued jointly. Mirrored faction items, heroic/normal
variants, random-suffix families, and set families must share a group ID so
they cannot leak across train and test sets.

## Fair refit requirements

Model comparison has two passes.

### Pass 1: structural comparison

- Use the same rows, exclusions, folds, stat vocabulary, breakpoint candidates,
  loss function, and number of fitted degrees of freedom for every exponent.
- Express slot effects as `r_k`, not the exponent-dependent stored `s`.
- Fit `Q_q(L)`, `r_k`, and supported `w_i` independently for each candidate.
- Use positive, monotone quality curves. Use the same spline basis or same
  maximum number of piecewise-linear segments for all candidates.
- Select knots and regularization only inside training folds.
- Keep a final grouped test set untouched until the model family and tuning
  rules are frozen.

This pass isolates distribution shape. Reusing coefficients estimated for the
incumbent is a smoke test only and cannot select a winner.

### Pass 2: candidate-specific calibration

- Allow candidate-specific knots only under the same complexity budget.
- Use nested grouped cross-validation for tuning.
- Penalize or reject extra parameters that do not improve untouched holdout
  performance.
- Publish fitted coefficients, sample counts, exclusions, folds, and residuals
  so every result is reproducible.

At least 20% of clean item families should be reserved for the final test set.
If an expansion/quality/slot stratum has fewer than 30 independent families,
report it but do not use it alone to approve a production replacement.

## Empirical estimands

Listed item-level error is secondary. The primary structural evidence is:

1. within-family dispersion of `log(R_candidate)` for item variants expected
   to share power;
2. held-out absolute log-capacity residual after calibration;
3. residual trend versus stat count and concentration
   `(sum(alpha_i^p))^(1/p)`;
4. matched one-stat versus multi-stat exchanges;
5. held-out raw stat prediction error for clean item families.

For a matched one-stat amount `X` and `n` equal common-cost stats `Y`, estimate:

```text
p_hat = log(n) / log(X / Y)
```

Bootstrap whole families, not individual rows. Report median absolute error,
RMSE, signed bias, P90/P95 absolute error, exact/within-1/within-2 item-level
rates, and 95% family-bootstrap confidence intervals. Always publish failures
and excluded-row counts.

## Production boundaries

### Quality curve domain and jumps

The current quality functions are positive over these actual domains:

| Quality | Positive domain | Boundary | Previous value | New value | Change |
|---|---:|---:|---:|---:|---:|
| Epic | 1-300 | 100 | `Q(99)=69.211` | `Q(100)=68.000` | -1.211 |
| Epic | 1-300 | 200 | `Q(199)=137.300` | `Q(200)=144.000` | +6.700 |
| Rare | 7-300 | 80 | `Q(79)=46.639` | `Q(80)=45.920` | -0.719 |
| Rare | 7-300 | 136 | `Q(135)=82.990` | `Q(136)=80.430` | -2.560 |
| Uncommon | 6-300 | 80 | `Q(79)=36.255` | `Q(80)=35.900` | -0.355 |
| Uncommon | 6-300 | 130 | `Q(129)=60.645` | `Q(130)=65.830` | +5.185 |

Rare levels 1-6 and uncommon levels 1-5 are not valid just because the UI's
global maximum is 300. A production model must either fit positive values for
those levels or declare the quality-specific lower bounds.

### Slot coefficient jumps

The current stored `s` changes at:

- Epic level 90: head `16/16 -> 11/16`; neck, wrists, finger, shield, and back
  `4/16 -> 3/16`; shoulder, waist, feet, hands, and trinket
  `8/16 -> 6/16`; legs `16/16 -> 12/16`.
- Epic level 200: head and legs return to `16/16`; neck, wrists, and finger
  return to `4/16`; shoulder, waist, feet, and hands return to `8/16`.
  Trinket remains `6/16`; shield and back remain `3/16`.
- Rare level 80: trinket `8/16 -> 11/16`.
- Uncommon level 80: back `3/16 -> 4/16`.

An epic level-90 quality increase does not compensate for many slot drops.
Therefore, checking `Q(L)` alone is insufficient.

### Stat and socket cost jumps

The current `w_i` or socket cost changes at:

- Level 80: rare bonus armor; rare and uncommon stamina; rare MP5; uncommon
  spell power; and uncommon block value.
- Level 90: epic stamina, spell power, and HP5.
- Level 200: epic MP5 on neck/finger/trinket/held-offhand, epic HP5, and epic
  block value on neck/finger/trinket/shield.
- Epic sockets: non-neck/finger/shield/held-offhand slots change `20 -> 10` at
  level 90; all slot groups change to `24` at level 200.

These changes alter the cost of the same fixed observed item during the
level-search loop. A coefficient can be individually decreasing while the
overall eligibility margin increases, or vice versa.

### Required monotonicity test

For every supported quality `q`, slot `k`, stat `i`, and adjacent levels in a
declared continuous model segment, test:

```text
A_i(L) = Q_q(L) * r_k(L) / w_i(L)
A_i(L + 1) >= A_i(L)
```

This per-stat condition guarantees that the fit margin is nondecreasing for
every nonnegative stat vector under an Lp model. Also test sockets separately
because they subtract a discrete cost before stat allocation.

If a historical era transition is intentionally discontinuous, end one model
segment and begin another. The UI and documentation must identify the
transition; a silent decrease is not acceptable. Test `L-1`, `L`, and `L+1`
at every quality, slot, stat, socket, armor, block, and weapon-regression
boundary.

## Integer rounding policy

Forward/inverse validation must use unrounded values first. For every positive
amount, cost, and supported exponent:

```text
inverse(forward(x_i)) = x_i
```

to relative error below `1e-12`.

Independent `ceil` is not budget preserving. If ideal amount `x_i` is rounded
up by `delta_i`, its extra nonlinear cost is:

```text
Delta_i = (w_i * (x_i + delta_i))^p - (w_i * x_i)^p
```

The total overspend can grow with stat count and has no useful constant bound.
Production generation should:

1. calculate ideal unrounded amounts;
2. floor all amounts, producing a vector no more expensive than the target;
3. consider each possible `+1` by its exact marginal nonlinear cost;
4. add points while they fit, minimizing allocation-share error;
5. report unused budget and the generated item's recalculated level.

Zeroed low-share stats must be disclosed instead of silently removed.
Sockets are deducted before rounding stats.

## Acceptance thresholds

### Hard mathematical gates

A production candidate must have:

- no non-finite or non-positive coefficient in its declared domain;
- unrounded forward/inverse relative error below `1e-12`;
- zero unexplained monotonicity failures under the per-stat condition above;
- no displayed generated item above its target nonlinear budget by more than
  `1e-12` relative numerical tolerance;
- deterministic selection at every piecewise boundary;
- no unsupported identifier tuple entering a model cohort;
- no unexplained fit failure on the final clean test set.

An explicitly segmented historical discontinuity is not a failure only if it
is documented, surfaced to the user, and evaluated independently on both
sides.

### Empirical replacement gate

Against the incumbent, an alternative must satisfy all of:

- at least 10% lower primary held-out median absolute log-capacity residual;
- at least 10% lower held-out matched-family dispersion;
- the 95% paired family-bootstrap confidence interval for each primary
  improvement excludes zero;
- held-out item-level MAE improves by at least 10% and at least 0.5 item level
  when listed item level is available;
- P95 absolute item-level error does not worsen by more than 2 levels;
- within-2 accuracy does not worsen by more than 2 percentage points;
- no major stratum with at least 30 independent families worsens in MAE by
  both more than 10% and more than 1 item level;
- residual slope versus stat count and concentration is not significantly
  different from zero at the 5% level after multiplicity correction.

If no candidate clears every replacement gate, retain the incumbent and
publish the result as inconclusive. The 64-row chest smoke test and 32-row
Tier-0 test are diagnostics only; neither can approve a production formula.

### Generated-item gate

On supported targets and allocation profiles:

- 100% remain at or below target budget after integer reconciliation;
- at least 99% recalculate to the requested item level or one level below;
- no target recalculates above the requested level;
- P95 unused normalized budget is below the cost of one cheapest legal
  `+1` increment.

Report these rates by quality, slot, level band, and stat count. Do not average
away a failing boundary stratum.
