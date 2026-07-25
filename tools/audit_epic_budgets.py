#!/usr/bin/env python3
"""Audit fixed epic armor and weapon stat budgets against the calculator."""

from __future__ import annotations

import argparse
import json
import math
import statistics
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "tools"))

from extract_socket_audit_cases import (  # noqa: E402
    PASSIVE_PATTERNS,
    RESISTANCE_COLUMNS,
    SOCKET_TYPES,
    SUPPORTED_STAT_TYPES,
    integer,
    iter_xlsx_rows,
    load_spell_descriptions,
    merge_stat,
    number,
)


EXTRA_PASSIVE_PATTERNS = (
    ("Increases your spell penetration by ", "47"),
    ("Increases armor penetration rating by ", "44"),
)

BANDS = (
    (1, 59),
    (60, 89),
    (90, 129),
    (130, 159),
    (160, 199),
    (200, 226),
    (227, 244),
    (245, 258),
    (259, 271),
    (272, 277),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=PROJECT_ROOT / "Data/item_template_pruned.xlsm",
    )
    parser.add_argument(
        "--spells",
        type=Path,
        default=PROJECT_ROOT / "Data/SpellDBCtrimmed.csv",
    )
    parser.add_argument(
        "--node",
        type=Path,
        default=Path("node"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=PROJECT_ROOT / "Test/epic-budget-audit/report.json",
    )
    parser.add_argument("--minimum-level", type=int, default=1)
    parser.add_argument("--maximum-level", type=int, default=277)
    return parser.parse_args()


def parse_extra_passive(description: str) -> tuple[str, float] | None:
    for prefix, stat_type in EXTRA_PASSIVE_PATTERNS:
        if description.startswith(prefix) and description.endswith("."):
            raw = description[len(prefix):-1]
            if raw.isdigit():
                return stat_type, float(raw)
    return None


def passive_spell_stat(description: str) -> tuple[str, float] | None:
    for pattern, stat_type in PASSIVE_PATTERNS:
        match = pattern.fullmatch(description)
        if match:
            return stat_type, float(match.group(1))
    return parse_extra_passive(description)


def extract_cases(args: argparse.Namespace) -> tuple[list[dict[str, Any]], Counter[str]]:
    descriptions = load_spell_descriptions(args.spells)
    cases: list[dict[str, Any]] = []
    dispositions: Counter[str] = Counter()

    for row in iter_xlsx_rows(args.input):
        if integer(row.get("Quality")) != 4:
            dispositions["not_epic"] += 1
            continue
        level = integer(row.get("ItemLevel"))
        if level is None or not args.minimum_level <= level <= args.maximum_level:
            dispositions["outside_level_range"] += 1
            continue
        item_class = integer(row.get("class"))
        if item_class not in {2, 4}:
            dispositions["not_armor_or_weapon"] += 1
            continue

        stats: dict[str, float] = {}
        unsupported_stat = False
        for index in range(1, 11):
            stat_type = integer(row.get(f"stat_type{index}")) or 0
            amount = number(row.get(f"stat_value{index}")) or 0.0
            if stat_type == 0 and amount == 0:
                continue
            if stat_type not in SUPPORTED_STAT_TYPES or amount <= 0:
                unsupported_stat = True
                break
            merge_stat(stats, str(stat_type), amount)
        if unsupported_stat:
            dispositions["unsupported_stat"] += 1
            continue

        for column, stat_type in RESISTANCE_COLUMNS.items():
            amount = number(row.get(column)) or 0.0
            if amount > 0:
                merge_stat(stats, stat_type, amount)

        mapped_spells: list[int] = []
        unsupported_spell = False
        for index in range(1, 6):
            spell_id = integer(row.get(f"spellid_{index}")) or 0
            if not spell_id:
                continue
            if integer(row.get(f"spelltrigger_{index}")) != 1:
                unsupported_spell = True
                break
            description = descriptions.get(spell_id, "")
            mapped = passive_spell_stat(description)
            if mapped is None:
                unsupported_spell = True
                break
            stat_type, amount = mapped
            merge_stat(stats, stat_type, amount)
            mapped_spells.append(spell_id)
        if unsupported_spell:
            dispositions["unsupported_spell"] += 1
            continue

        sockets: list[str] = []
        unsupported_socket = False
        for index in range(1, 4):
            color = integer(row.get(f"socketColor_{index}")) or 0
            if color == 0:
                continue
            socket_type = SOCKET_TYPES.get(color)
            if socket_type is None:
                unsupported_socket = True
                break
            sockets.append(socket_type)
        if unsupported_socket:
            dispositions["unsupported_socket"] += 1
            continue
        if not stats and not sockets:
            dispositions["no_modeled_budget"] += 1
            continue

        inventory_type = integer(row.get("InventoryType"))
        request_stats = [
            {"type": int(key) if key.isdigit() else key, "amount": amount}
            for key, amount in stats.items()
        ]
        request_stats.extend(
            {"type": socket_type, "amount": 1}
            for socket_type in sockets
        )
        cases.append({
            "entry": integer(row.get("entry")),
            "name": str(row.get("name") or ""),
            "actual_level": level,
            "item_class": item_class,
            "inventory_type": inventory_type,
            "subclass": integer(row.get("subclass")),
            "socket_count": len(sockets),
            "socket_bonus": integer(row.get("socketBonus")) or 0,
            "mapped_spell_count": len(mapped_spells),
            "stat_types": sorted(stats),
            "request": {
                "mode": "level",
                "itemClass": item_class,
                "inventoryType": inventory_type,
                "quality": 4,
                "maximumLevel": 300,
                "stats": request_stats,
            },
        })
        dispositions["included"] += 1
    return cases, dispositions


def run_calculator(
    node: Path,
    cases: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    completed = subprocess.run(
        [
            str(node),
            str(PROJECT_ROOT / "tools/calculator_cli.js"),
            "--compact",
        ],
        input=json.dumps([case["request"] for case in cases]),
        text=True,
        capture_output=True,
        check=False,
        cwd=PROJECT_ROOT,
    )
    if completed.returncode not in {0, 1}:
        raise RuntimeError(completed.stderr.strip() or "Calculator CLI failed.")
    return json.loads(completed.stdout)


def percentile(values: list[float], fraction: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    share = position - lower
    return ordered[lower] * (1 - share) + ordered[upper] * share


def metrics(rows: Iterable[dict[str, Any]]) -> dict[str, Any]:
    selected = list(rows)
    errors = [row["error"] for row in selected]
    absolute = [abs(value) for value in errors]
    return {
        "count": len(selected),
        "bias": statistics.fmean(errors) if errors else None,
        "mae": statistics.fmean(absolute) if absolute else None,
        "median_error": statistics.median(errors) if errors else None,
        "median_absolute_error": statistics.median(absolute) if absolute else None,
        "p10_error": percentile(errors, 0.10),
        "p90_error": percentile(errors, 0.90),
        "within_1": sum(value <= 1 for value in absolute) / len(absolute)
        if absolute else None,
        "within_5": sum(value <= 5 for value in absolute) / len(absolute)
        if absolute else None,
        "within_10": sum(value <= 10 for value in absolute) / len(absolute)
        if absolute else None,
    }


def band_name(level: int) -> str:
    for minimum, maximum in BANDS:
        if minimum <= level <= maximum:
            return f"{minimum}-{maximum}"
    return "other"


def grouped_metrics(
    rows: list[dict[str, Any]],
    key,
) -> dict[str, dict[str, Any]]:
    groups: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        groups[str(key(row))].append(row)
    return {
        name: metrics(group)
        for name, group in sorted(groups.items())
    }


def membership_metrics(
    rows: list[dict[str, Any]],
    key: str,
) -> dict[str, dict[str, Any]]:
    groups: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        for value in row[key]:
            groups[str(value)].append(row)
    return {
        name: metrics(group)
        for name, group in sorted(groups.items())
    }


def main() -> None:
    args = parse_args()
    cases, dispositions = extract_cases(args)
    cases_path = args.output.with_name("cases.json")
    cases_path.parent.mkdir(parents=True, exist_ok=True)
    cases_path.write_text(
        json.dumps(cases, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    outputs = run_calculator(args.node, cases)
    modeled: list[dict[str, Any]] = []
    failures: Counter[str] = Counter()

    for case, output in zip(cases, outputs, strict=True):
        if not output.get("ok"):
            failure = output.get("error")
            if failure is None:
                failure = "; ".join(output.get("errors", []))
            failures[str(failure or "unknown calculator failure")] += 1
            continue
        predicted = int(output["result"]["level"])
        level_band = band_name(case["actual_level"])
        modeled.append({
            **{key: value for key, value in case.items() if key != "request"},
            "predicted_level": predicted,
            "error": predicted - case["actual_level"],
            "category": "weapon" if case["item_class"] == 2 else "armor",
            "level_band": level_band,
            "stat_type_bands": [
                f"{stat_type}:{level_band}"
                for stat_type in case["stat_types"]
            ],
        })

    report = {
        "source": {
            "workbook": str(args.input),
            "minimum_level": args.minimum_level,
            "maximum_level": args.maximum_level,
            "quality": 4,
            "method": (
                "Fixed epic armor/weapons with supported direct stats, "
                "resistances, sockets, and simple passive equip effects."
            ),
            "cases": str(cases_path),
        },
        "dispositions": dict(dispositions),
        "calculator_failures": dict(failures),
        "overall": metrics(modeled),
        "by_category": grouped_metrics(modeled, lambda row: row["category"]),
        "by_level_band": grouped_metrics(modeled, lambda row: row["level_band"]),
        "by_category_and_band": grouped_metrics(
            modeled,
            lambda row: f'{row["category"]}:{row["level_band"]}',
        ),
        "by_socket_state": grouped_metrics(
            modeled,
            lambda row: "socketed" if row["socket_count"] else "unsocketed",
        ),
        "by_socket_and_band": grouped_metrics(
            modeled,
            lambda row: (
                f'{"socketed" if row["socket_count"] else "unsocketed"}:'
                f'{row["level_band"]}'
            ),
        ),
        "by_category_band_socket": grouped_metrics(
            modeled,
            lambda row: (
                f'{row["category"]}:{row["level_band"]}:'
                f'{"socketed" if row["socket_count"] else "unsocketed"}'
            ),
        ),
        "by_inventory_type": grouped_metrics(
            modeled,
            lambda row: row["inventory_type"],
        ),
        "by_exact_level": grouped_metrics(
            modeled,
            lambda row: row["actual_level"],
        ),
        "by_category_and_exact_level": grouped_metrics(
            modeled,
            lambda row: f'{row["category"]}:{row["actual_level"]}',
        ),
        "by_category_inventory_and_band": grouped_metrics(
            modeled,
            lambda row: (
                f'{row["category"]}:{row["inventory_type"]}:'
                f'{row["level_band"]}'
            ),
        ),
        "by_category_subclass_and_band": grouped_metrics(
            modeled,
            lambda row: (
                f'{row["category"]}:{row["subclass"]}:'
                f'{row["level_band"]}'
            ),
        ),
        "by_socket_count_and_band": grouped_metrics(
            modeled,
            lambda row: f'{row["socket_count"]}:{row["level_band"]}',
        ),
        "by_stat_type": membership_metrics(modeled, "stat_types"),
        "by_stat_type_and_band": membership_metrics(
            modeled,
            "stat_type_bands",
        ),
        "notable_items": [
            row
            for row in modeled
            if row["entry"] in {51274, 51275, 51277, 51279}
        ],
        "largest_negative_errors": sorted(
            modeled,
            key=lambda row: (row["error"], row["actual_level"]),
        )[:40],
        "largest_positive_errors": sorted(
            modeled,
            key=lambda row: (-row["error"], -row["actual_level"]),
        )[:40],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(report, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    print(json.dumps({
        "modeled": len(modeled),
        "overall": report["overall"],
        "by_category": report["by_category"],
        "by_level_band": report["by_level_band"],
        "notable_items": report["notable_items"],
        "calculator_failures": report["calculator_failures"],
        "output": str(args.output),
    }, indent=2))


if __name__ == "__main__":
    main()
