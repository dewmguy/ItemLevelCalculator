# Model audit and proposed validation plan

## Purpose understood

The calculator is an engineering aid for creating, modifying, and validating
World of Warcraft emulator items across Vanilla, The Burning Crusade, and Wrath
of the Lich King. Its output is best understood as an **effective power level**,
not a promise to reproduce every Blizzard `ItemLevel` label. Blizzard's labels
remain useful observations, but tier flattening, deliberate exceptions, data
errors, sockets, procs, set effects, and unmodeled mechanics make them noisy.

The evidence hierarchy for future work should be:

1. AzerothCore identifiers and runtime behavior for what the server actually
   interprets.
2. Mechanically clean item-template observations for fitting and validation.
3. Blizzard's listed `ItemLevel` as a noisy label, stratified rather than pooled.
4. Community formulas as hypotheses that must survive the same benchmark.

## Equation audit

The current forward model uses

```text
p = log(2) / log(1.5) = 1.709511...
z_i = amount_i * StatMod_i
StatBudget = sum(z_i ^ p)
ItemBudget = SlotMod * StatBudget
accept level L when
(QualityMod(L) * SlotMod) ^ p >= ItemBudget
```

Equivalently:

```text
sum(z_i ^ p) <= QualityMod(L)^p * SlotMod^(p - 1)
```

This is a power-law / Lp-style model. It is not exponential. The Discord
critique correctly recognized the simplified shape
`QualityMod^p * SlotMod^(p-1)`, but substituted `log(3)/log(2)` for the actual
code exponent. The current exponent is `log(2)/log(1.5)`, chosen so
`1.5^p = 2`.

That choice makes one effective stat of 100 approximately equivalent to:

- two effective stats of 66.67 each; or
- three effective stats of 52.59 each.

The README's “100 versus about 53 + 53 + 53” example therefore supports the
current exponent much more closely than `p = 3/2`.

The inverse transform must be:

```text
amount_i = allocatedBudget_i^(1/p) / StatMod_i
```

The previous implementation used `(allocatedBudget_i / StatMod_i)^(1/p)`,
which is only correct when `StatMod_i = 1`. This has been corrected.

## Peer formula audit

The proposed formula was:

```text
alpha_i = weight_i / totalWeight
D = (sum(alpha_i^(3/2)))^(2/3)
itemBudget = SlotMod * QualityMod * D
statBudget_i = itemBudget * alpha_i
```

For a split distribution, `D <= 1`. Multiplying by `D` reduces the total
budget as stats are distributed, which is the opposite of the stated goal if
the allocation shares are also used to produce raw stat amounts. A
norm-consistent 3/2 formulation would place this factor in the denominator:

```text
itemBudget = SlotMod * QualityMod / D
```

There is also an unresolved definition problem: the peer formula uses “weight”
for both stat cost and allocation share, while this calculator has distinct
`StatMod` costs and requested distribution percentages. It should be tested
exactly as written, but not adopted without resolving that ambiguity and
refitting quality, slot, and stat coefficients.

## AzerothCore identity contract

`InventoryType`, weapon subclass, and armor subclass are separate namespaces.
The calculator must validate the complete tuple:

```text
(class, InventoryType, subclass)
```

Examples:

- A shirt is armor class 4, `INVTYPE_BODY` 4, armor subclass 0
  (`MISCELLANEOUS`), not armor subclass 1 (`CLOTH`).
- A shield is armor subclass 6.
- A polearm is weapon subclass 6.
- A staff is always weapon class 2, `INVTYPE_2HWEAPON` 17, weapon subclass 10.

Caster, melee, and feral are calculator **profiles**, not alternate AzerothCore
subclasses. They must never alter the persisted class / inventory / subclass
tuple. The canonical enums are in
[AzerothCore ItemTemplate.h](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/game/Entities/Item/ItemTemplate.h).

## Caster and feral weapon finding

The app has separate staff DPS regressions. Following this audit it now derives
feral attack power from resolved weapon DPS; it deliberately does not invent
hidden caster spell power.

AzerothCore provides a concrete runtime reference for feral attack power:

```text
FeralAP = max(0, floor((weaponDPS + extraDPS) * 14) - 767)
```

In AzerothCore this applies to weapon InventoryTypes 13, 17, 21, and 22, not
only to staffs. The relevant implementation is `ItemTemplate::getFeralBonus`
in [ItemTemplate.h](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/game/Entities/Item/ItemTemplate.h).

There is no equivalent generic AzerothCore function that infers base caster
spell power solely from weapon DPS. Caster spell power therefore needs an
empirical item-template model, with spell-based and explicit-stat variants
separated. It should not be guessed from the feral conversion.

## Confirmed implementation defects

The audit found and locally corrected these unambiguous defects:

- The stat-generation inverse placed `StatMod` inside the root.
- Scalar negative subclass rules such as `-10` did not exclude staff subclass
  10 correctly; epic and rare non-staff two-hand damage could fail to resolve.
- The rare main-hand caster row lacked its caster profile tag.
- Shirt used the wrong armor subclass.
- Unsupported identifier tuples, non-finite budgets, and item levels outside
  1–300 could fall through to misleading output.
- A ranged-slot UI check used InventoryType 2 instead of 15.
- User-entered item name and flavor text were inserted into HTML unescaped.
- `buyPriceHTML` leaked into global scope.
- Independent upward rounding could overspend the nonlinear item budget.
- Bonus elemental damage was included in both the physical damage line and its
  separate tooltip line.
- Dynamic stat and socket rows could receive duplicate DOM IDs.
- The documented rare druid-staff curve was tagged as caster.
- Epic generic two-hand DPS rows overlapped from levels 91 through 100.

Regression tests now cover exponent identity, weighted forward/inverse
round-trips, scalar subclass exclusions, profile selection, quality support,
and key identifier tuples.

## Remaining model risks

- Quality functions are discontinuous and sometimes decrease at breakpoints:
  epic 99→100, rare 79→80 and 135→136, and uncommon 79→80.
- Some low-level rare and uncommon quality values are non-positive.
- README equations and tables have drifted from `script.js`, including shield,
  MP5, hit rating, shield-block, armor, weapon-DPS, and epic sell-value details.
- Sockets, procs/on-use spells, resistances, base armor, bonus armor, and set
  effects are not yet handled by a single auditable budget model.
- Caster spell-power generation remains an empirical-model gap. The app now
  generates AzerothCore-compatible feral AP for supported feral profiles.
- Other piecewise weapon ranges should still be tested at every boundary.

## Benchmark corpus

Use `Data/item_template_pruned.xlsm`, sheet `all items`, as the canonical raw
source: 18,229 unique entries. Do not treat cached formula output from
`item_template_calc.xlsm` as ground truth; sampled formula caches are empty and
its lookup tables contain older coefficients.

The primary benchmark should:

- keep qualities 2, 3, and 4 and supported identifier tuples;
- keep item levels 1–300;
- reject negative stats and unsupported stat IDs;
- exclude spell/proc/on-use items from the primary pure-stat cohort;
- exclude sockets initially, then evaluate them as a separate stratum;
- keep one record per entry;
- label expansions by joining curated entry-ID lists, not by pooling duplicate
  workbooks;
- report MAE, median absolute error, RMSE, signed bias, exact/±1/±2 rates,
  P90/P95 error, and failures;
- stratify by expansion, quality, class, slot, level band, socket count, and
  stat count;
- use a held-out test set and bootstrap confidence intervals when coefficients
  are refitted.

`tools/compare_budget_models.py` provides a deliberately narrow smoke test on
pure-stat chest items where slot and stat costs do not confound the exponent.
It compares:

1. current `p = log(2)/log(1.5)`;
2. `p = 3/2` in the current structure;
3. the mistakenly attributed `p = log2(3)`;
4. the peer formula exactly as written; and
5. its reciprocal-corrected 3/2 derivation.

On the current 64-row clean chest cohort, the preliminary results were:

| model | MAE | RMSE | bias | within ±2 |
|---|---:|---:|---:|---:|
| current `p=1.709511` | 4.062 | 12.181 | -4.000 | 67.2% |
| `p=1.5` | 3.781 | 12.093 | -2.344 | 75.0% |
| misquoted `p=log2(3)` | 3.484 | 12.040 | -3.078 | 85.9% |
| peer formula as written | 23.047 | 39.831 | +18.016 | 37.5% |
| reciprocal-corrected 3/2 norm | 3.781 | 12.093 | -2.344 | 75.0% |

When allocation shares are defined from the common-cost values
`z_i = amount_i * StatMod_i`, the reciprocal-corrected expression is
algebraically identical to the 3/2 Lp norm for every item. It is therefore a
derivation of candidate 2, not a fifth independent model. This small cohort
shows that the peer formula as written behaves poorly, but its large outliers
and contradictory ranking versus the Tier-0 smoke test show why a held-out,
stratified benchmark and coefficient refit are required before choosing an
exponent.

This smoke test is not sufficient to select the production model. A separate
32-row Tier-0 Paladin check favored the current exponent (MAE 3.19, RMSE 5.37,
65.6% within ±2) over `p = 1.5` (MAE 5.56, RMSE 6.60, 21.9% within ±2), but it
is small, paired, vanilla-only, and directionally useful rather than decisive.

## Approved roadmap

### Phase 1 — Establish a trustworthy baseline

1. Freeze the identifier contract and add exhaustive tuple/boundary tests.
2. Extract the pure-stat benchmark and expansion labels reproducibly.
3. Replay the exact current app model and publish stratified residuals.
4. Reconcile README tables against executable constants.

Exit criterion: every benchmark row is either modeled or excluded with a
machine-readable reason, and README equations match tested code.

### Phase 2 — Compare stat-budget models fairly

1. Evaluate the five candidate models above with current coefficients.
2. Refit quality/slot/stat coefficients independently for each candidate.
3. Select hyperparameters on training folds and compare on a held-out test set.
4. Inspect error by stat count and tier to detect distribution bias hidden by
   aggregate MAE.

Exit criterion: retain the current exponent unless an alternative produces a
material, repeatable held-out improvement without worse monotonicity or
interpretability.

### Phase 3 — Correct discontinuities and rounding

1. Replace falling quality breakpoints with continuous piecewise fits or
   explicitly justified era transitions.
2. Budget sockets before allocating stats and reconcile rounding so displayed
   output stays within tolerance.
3. Add property tests for monotonicity, round-trip behavior, and all breakpoint
   boundaries.

Exit criterion: increasing item level never silently reduces the supported
budget within a declared model segment, and generated items round-trip within
the accepted tolerance.

### Phase 4 — Complete weapon profiles

1. Keep AzerothCore identity fixed and make weapon profile explicit.
2. Maintain the implemented AzerothCore feral-AP formula for every eligible
   weapon InventoryType and add coverage as new feral profiles are modeled.
3. Build separate empirical cohorts for caster weapons with explicit spell
   power, spell 46749, and neither mechanism.
4. Fit and validate caster base spell-power models by quality, slot, era, and
   weapon subtype.
5. Validate damage, spell power, and feral AP together so power is not counted
   twice.

Exit criterion: caster and feral weapon outputs reproduce clean held-out items
within declared error bands and serialize valid AzerothCore identifiers.

### Phase 5 — Broaden modeled effects

Add sockets, resistances, base/bonus armor, proc/on-use effects, and set effects
one category at a time, each with its own evidence, exclusions, and tests.

Exit criterion: no effect is silently treated as free or double-counted.

### Phase 6 — Safe AzerothCore SQL output

This is intentionally a late-stage goal after the calculator's data,
identifiers, and modeled effects have been validated.

1. Map each calculator output to an explicit AzerothCore `item_template`
   column and record its provenance.
2. Validate the target AzerothCore schema/version and rerun the canonical
   class, subclass, quality, and InventoryType tuple checks before export.
3. Generate explicit-column `INSERT` or `UPDATE` statements as preview text
   only, with deterministic escaping and no implicit database execution.
4. Round-trip exported rows through a parser/test fixture and compare every
   populated field with the calculator state.

Exit criterion: the preview is schema-valid, identifier-safe, reproducible,
and cannot silently serialize calculator-only concepts such as weapon profiles
into AzerothCore fields.
