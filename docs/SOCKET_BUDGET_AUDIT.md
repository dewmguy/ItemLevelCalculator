# Rare Socket-Budget Audit

This audit evaluates socket costs for rare (`Quality = 3`) armor and weapons
from item level 100 through 200. It treats listed item level as a noisy
diagnostic label rather than unquestioned ground truth.

## Reproduce

Use the canonical ignored workbook and the local spell-description extract:

```powershell
python tools/extract_socket_audit_cases.py
node tools/run_socket_budget_audit.js
```

Generated cases and reports are written under ignored
`Test/socket-budget-audit/`. The extractor preserves the source workbook and
maps only simple passive equip effects, such as spell power, attack power, and
MP5. Items with proc, on-use, class-specific, malformed, or unsupported effects
are excluded.

## Corpus

- 2,142 calculator-supported rare armor/weapon items
- 543 socketed and 1,599 unsocketed items
- 1,169 items with simple passive spell effects converted to calculator stats
- 515 socketed armor items
- 20 socketed accessory-slot items
- 8 socketed weapons

Socket bonuses are not added as guaranteed stats because they are conditional
on gem-color matching. Their typical design value is therefore implicitly part
of the empirically fitted socket cost.

## Finding

The prior rare socket cost was static: 10 for accessory slots and 20
elsewhere. That is close to the observed ilvl 100–129 population, but is
systematically too low in the Wrath-era range:

| Actual item-level band | Cases | Prior MAE | Prior bias | Median implied socket cost |
|---|---:|---:|---:|---:|
| 100–129 | 347 | 6.32 | +1.57 | 19.44 |
| 160–189 | 39 | 8.74 | -8.74 | 30.36 |
| 190–200 | 155 | 8.25 | -7.99 | 37.98 |

Only two clean cases fall in 130–159, so this sparse transition band should
not define a separate step.

The implemented model retains the prior costs through ilvl 130, then uses
continuous ramps:

```text
rare accessory socket = 10 + (itemLevel - 130) / 3
rare other socket     = 20 + 2(itemLevel - 130) / 7
```

At ilvl 200, the costs are 33.33 and 40. The ramp is continuous at the
breakpoint and avoids a reverse-calculation discontinuity.

## Validation

Across all 543 socketed cases, mean absolute level error improves from 7.06 to
5.46 and signed bias moves from -1.95 to +1.42. On the deterministic 98-item
held-out set, error improves from 6.30 to 4.29 and bias from -2.56 to +0.57.

For the strongest observed bands:

| Actual item-level band | New MAE | New bias |
|---|---:|---:|
| 160–189 | 3.56 | -0.90 |
| 190–200 | 3.35 | +1.15 |

Patina-Coated Breastplate remains exactly ilvl 200. Bonegrinder Breastplate
moves from calculated ilvl 190 to 200 when its two sockets use the ilvl-200
cost of 40. Sword of Justice, the only clean socketed ilvl-200 rare weapon in
the corpus, also resolves exactly to 200 with the shared cost.

## Limitations

The evidence strongly supports rare armor because it supplies 515 socketed
cases. The eight clean socketed weapons are too few and too heterogeneous for
a separate weapon fit; the shared rule is used because a socket accepts the
same gem regardless of item class. Weapon-specific conclusions should remain
tentative until a larger clean corpus includes independently modeled weapon
damage.

The remaining residual spread is not socket-only evidence. Blizzard tiering,
coarse source-level labels, conditional socket bonuses, unmodeled hidden
effects, and noisy fixed-item stat allocation all contribute.
