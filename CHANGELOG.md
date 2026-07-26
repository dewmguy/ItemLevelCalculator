# Changelog

This changelog is grouped from the repository's pushed commit history. Commit hashes identify the changes summarized in each entry.

## 2026-07-26

- Added hundredth-percent stat allocation, contextual one-stat arrow-key stepping, and automatic bottom-row budget balancing.
- Refined caster and druid weapon calculations and improved tooltip presentation (`763ca08`).

## 2026-07-25

- Added empirical uncommon, rare, and epic budget curves; calibrated socket, armor, weapon, and random-enchantment budgets (`4a74c71`, `f3147ce`, `28d4aa9`, `b09c3f3`).
- Added weapon Armor as a balanced stat and allowed negative stat sacrifices (`220a4e9`, `05e18f0`).
- Reworked caster and druid weapons, restricted invalid stat input, and removed superseded UI commentary (`ba069a0`, `0cc31ab`, `e72c08d`).
- Made optional fields and validation failures unobtrusive and removed superseded research scripts (`376df61`, `629f89b`).
- Updated the application screenshot (`a9f069c`).

## 2026-07-24

- Hardened item-budget inversion, level reconciliation, identifier validation, weapon-profile selection, output escaping, and related model behavior (`7e88580`).
- Restored the visible GitHub repository link (`ee32981`).

## 2026-07-23

- Corrected pricing, weapon-range boundaries, damage-method selection, level thresholds, socket costs, slot modifiers, armor display, and unsupported tooltip values (`183eda7` through `ff8e0d4`).
- Added the hosted build marker and refined the calculator's form, populated-state, and cross-browser select styling (`cacb1df` through `5d0677c`).
- Kept local source-data files outside version control (`646b9f8`).

## 2024-07 to 2024-08

- Created the calculator and completed both level-to-stats and stats-to-level workflows.
- Added armor, shield block, weapon damage, sockets, vendor prices, and tooltip customization.
- Reworked coefficients and fitted curves across Vanilla, The Burning Crusade, and Wrath item ranges.
- Refined the interface, validation, documentation, and screenshots.
