#!/usr/bin/env python3
"""Extract clean rare item cases for the socket-budget audit.

The canonical workbook is read without modifying it. Simple passive equip
spells are converted to the calculator's equivalent stat types; proc, on-use,
class-specific, and otherwise unsupported effects exclude the item.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from xlsx_rows import integer, iter_xlsx_rows, number  # noqa: E402


STAT_COLUMNS = tuple(range(1, 11))
SUPPORTED_STAT_TYPES = {
    3, 4, 5, 6, 7, 12, 13, 14, 15, 21, 31, 32, 35, 36, 37,
    38, 43, 44, 45, 46, 47, 48,
}
RESISTANCE_COLUMNS = {
    "arcane_res": "arcane_res",
    "fire_res": "fire_res",
    "nature_res": "nature_res",
    "frost_res": "frost_res",
    "shadow_res": "shadow_res",
}
SOCKET_TYPES = {
    1: "meta_socket",
    2: "red_socket",
    4: "yellow_socket",
    8: "blue_socket",
}
PASSIVE_PATTERNS = (
    (re.compile(r"^Increases spell power by (\d+)\.$"), "45"),
    (re.compile(r"^Increases attack power by (\d+)\.$"), "38"),
    (re.compile(r"^Restores (\d+) mana per 5 sec\.$"), "43"),
    (re.compile(r"^Restores (\d+) health per 5 sec\.$"), "46"),
    (re.compile(r"^Increases defense rating by (\d+)\.$"), "12"),
    (re.compile(r"^Increases your dodge rating by (\d+)\.$"), "13"),
    (re.compile(r"^Increases your parry rating by (\d+)\.$"), "14"),
    (re.compile(r"^Increases your shield block rating by (\d+)\.$"), "15"),
    (re.compile(r"^Increases your hit rating by (\d+)\.$"), "31"),
    (re.compile(r"^Increases your critical strike rating by (\d+)\.$"), "32"),
    (re.compile(r"^Increases your resilience rating by (\d+)\.$"), "35"),
    (re.compile(r"^Increases your haste rating by (\d+)\.$"), "36"),
    (re.compile(r"^Increases your expertise rating by (\d+)\.$"), "37"),
    (re.compile(r"^Increases your armor penetration rating by (\d+)\.$"), "44"),
    (re.compile(r"^Increases spell penetration by (\d+)\.$"), "47"),
    (re.compile(r"^Increases the block value of your shield by (\d+)\.$"), "48"),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("Data/item_template_pruned.xlsm"),
    )
    parser.add_argument(
        "--spells",
        type=Path,
        default=Path("Data/SpellDBCtrimmed.csv"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("Test/socket-budget-audit/cases.json"),
    )
    parser.add_argument("--minimum-level", type=int, default=100)
    parser.add_argument("--maximum-level", type=int, default=200)
    return parser.parse_args()


def load_spell_descriptions(path: Path) -> dict[int, str]:
    descriptions: dict[int, str] = {}
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.reader(handle):
            if len(row) < 3:
                continue
            try:
                descriptions[int(row[0])] = row[2]
            except ValueError:
                continue
    return descriptions


def passive_spell_stat(description: str) -> tuple[str, float] | None:
    for pattern, stat_type in PASSIVE_PATTERNS:
        match = pattern.fullmatch(description)
        if match:
            return stat_type, float(match.group(1))
    return None


def merge_stat(stats: dict[str, float], stat_type: str, amount: float) -> None:
    stats[stat_type] = stats.get(stat_type, 0.0) + amount


def extract_cases(args: argparse.Namespace) -> dict[str, Any]:
    spell_descriptions = load_spell_descriptions(args.spells)
    cases: list[dict[str, Any]] = []
    dispositions: Counter[str] = Counter()
    unsupported_spells: Counter[str] = Counter()

    for row in iter_xlsx_rows(args.input):
        quality = integer(row.get("Quality"))
        level = integer(row.get("ItemLevel"))
        item_class = integer(row.get("class"))
        if quality != 3:
            dispositions["not_rare"] += 1
            continue
        if level is None or not args.minimum_level <= level <= args.maximum_level:
            dispositions["outside_level_range"] += 1
            continue
        if item_class not in (2, 4):
            dispositions["not_armor_or_weapon"] += 1
            continue

        stats: dict[str, float] = {}
        reasons: list[str] = []
        for index in STAT_COLUMNS:
            stat_type = integer(row.get(f"stat_type{index}")) or 0
            stat_amount = number(row.get(f"stat_value{index}")) or 0.0
            if stat_type == 0 and stat_amount == 0:
                continue
            if stat_type not in SUPPORTED_STAT_TYPES:
                reasons.append("unsupported_stat_type")
                continue
            if stat_amount <= 0:
                reasons.append("nonpositive_stat")
                continue
            merge_stat(stats, str(stat_type), stat_amount)

        for column, stat_type in RESISTANCE_COLUMNS.items():
            amount = number(row.get(column)) or 0.0
            if amount < 0:
                reasons.append("negative_resistance")
            elif amount > 0:
                merge_stat(stats, stat_type, amount)

        mapped_spell_ids: list[int] = []
        for index in range(1, 6):
            spell_id = integer(row.get(f"spellid_{index}")) or 0
            if spell_id == 0:
                continue
            trigger = integer(row.get(f"spelltrigger_{index}"))
            description = spell_descriptions.get(spell_id, "")
            mapped = passive_spell_stat(description) if trigger == 1 else None
            if mapped is None:
                reasons.append("unsupported_spell_effect")
                unsupported_spells[description or f"<missing:{spell_id}>"] += 1
                continue
            merge_stat(stats, mapped[0], mapped[1])
            mapped_spell_ids.append(spell_id)

        sockets: list[str] = []
        socket_colors: list[int] = []
        for index in range(1, 4):
            color = integer(row.get(f"socketColor_{index}")) or 0
            if color == 0:
                continue
            socket_type = SOCKET_TYPES.get(color)
            if socket_type is None:
                reasons.append("unsupported_socket_color")
                continue
            sockets.append(socket_type)
            socket_colors.append(color)

        reasons = list(dict.fromkeys(reasons))
        if not stats and not sockets:
            reasons.append("no_budget_components")
        if reasons:
            dispositions.update(reasons)
            continue

        cases.append({
            "entry": integer(row.get("entry")),
            "name": row.get("name") or "",
            "actual_level": level,
            "item_class": item_class,
            "inventory_type": integer(row.get("InventoryType")),
            "subclass": integer(row.get("subclass")),
            "quality": quality,
            "stats": [
                {"type": stat_type, "amount": amount}
                for stat_type, amount in sorted(stats.items())
            ],
            "sockets": sockets,
            "socket_colors": socket_colors,
            "socket_bonus": integer(row.get("socketBonus")) or 0,
            "mapped_spell_ids": mapped_spell_ids,
        })

    return {
        "configuration": {
            "input": str(args.input),
            "spells": str(args.spells),
            "minimum_level": args.minimum_level,
            "maximum_level": args.maximum_level,
            "quality": 3,
            "classes": [2, 4],
        },
        "summary": {
            "included_cases": len(cases),
            "socketed_cases": sum(bool(case["sockets"]) for case in cases),
            "unsocketed_cases": sum(not case["sockets"] for case in cases),
            "mapped_spell_cases": sum(
                bool(case["mapped_spell_ids"]) for case in cases
            ),
            "dispositions": dict(dispositions.most_common()),
            "top_unsupported_spells": unsupported_spells.most_common(25),
        },
        "cases": cases,
    }


def main() -> None:
    args = parse_args()
    payload = extract_cases(args)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    print(json.dumps(payload["summary"], indent=2))
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
