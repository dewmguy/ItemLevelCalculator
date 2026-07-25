#!/usr/bin/env python3
"""Build reproducible random-enchantment calculator audit cases.

The source data is fetched from AzerothCore's world database and the
wowgaming/client-data DBC-to-SQL release. Uncommon, rare, and epic items are
included because RandPropPoints contains all three quality families. Only the
Python standard library is used. Downloaded inputs and generated reports
belong in an ignored directory such as ``Test/random-enchantment-audit``.

Examples:

    python tools/audit_random_enchantments.py --fetch
    python tools/audit_random_enchantments.py --source-dir Test/random-enchantment-audit/source
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import shutil
import statistics
import urllib.request
import zipfile
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Iterator, Sequence


ITEM_TEMPLATE_URL = (
    "https://raw.githubusercontent.com/azerothcore/azerothcore-wotlk/"
    "master/data/sql/base/db_world/item_template.sql"
)
ITEM_ENCHANTMENT_TEMPLATE_URL = (
    "https://raw.githubusercontent.com/azerothcore/azerothcore-wotlk/"
    "master/data/sql/base/db_world/item_enchantment_template.sql"
)
DBC_SQL_URL = (
    "https://github.com/wowgaming/client-data/releases/download/"
    "dbc_sql_v1/AzerothcoreDBCToSQL.zip"
)

SUPPORTED_ITEM_TYPES = {
    2: {
        13: {0, 4, 7, 13, 15},
        15: {2},
        17: {1, 5, 6, 8, 10},
        21: {0, 4, 7, 13, 15},
        22: {0, 4, 7, 13, 15},
        25: {16},
        26: {3, 18, 19},
    },
    4: {
        1: {1, 2, 3, 4},
        2: {0},
        3: {1, 2, 3, 4},
        4: {0},
        5: {1, 2, 3, 4},
        6: {1, 2, 3, 4},
        7: {1, 2, 3, 4},
        8: {1, 2, 3, 4},
        9: {1, 2, 3, 4},
        10: {1, 2, 3, 4},
        11: {0},
        12: {0},
        14: {6},
        16: {1},
        19: {0},
        20: {1, 2, 3, 4},
        23: {0},
        28: {7, 8, 9, 10},
    },
}

SUFFIX_POINT_GROUP = {
    1: 0,   # head
    4: 0,   # body
    5: 0,   # chest
    7: 0,   # legs
    17: 0,  # two-hand weapon
    20: 0,  # robe
    3: 1,   # shoulders
    6: 1,   # waist
    8: 1,   # feet
    10: 1,  # hands
    12: 1,  # trinket
    2: 2,   # neck
    9: 2,   # wrists
    11: 2,  # finger
    14: 2,  # shield
    16: 2,  # cloak
    23: 2,  # holdable
    13: 3,  # one-hand weapon
    21: 3,  # main-hand weapon
    22: 3,  # off-hand weapon
    15: 4,  # bow
    25: 4,  # thrown
    26: 4,  # ranged-right
}

SUPPORTED_STATS = {
    3, 4, 5, 6, 7, 12, 13, 14, 15, 21, 31, 32, 35, 36, 37, 38, 43, 44,
    45, 46, 47, 48,
}

# SpellItemEnchantment entries whose effect is represented by a spell rather
# than an ITEM_ENCHANTMENT_TYPE_STAT row.
SPECIAL_ENCHANT_STATS = {
    2814: 46,  # health per 5 sec
}


@dataclass(frozen=True)
class Item:
    entry: int
    name: str
    item_class: int
    subclass: int
    quality: int
    inventory_type: int
    level: int
    sell_price: int
    random_property_group: int
    random_suffix_group: int
    base_stats: tuple[tuple[int, int], ...]
    clean_stat_model: bool
    damage_min: float
    damage_max: float
    delay: int


@dataclass(frozen=True)
class AuditCase:
    case_id: str
    entry: int
    item_name: str
    enchantment_kind: str
    enchantment_group: int
    enchantment_id: int
    enchantment_name: str
    chance: float
    item_class: int
    subclass: int
    inventory_type: int
    quality: int
    expected_level: int
    sell_price: int
    damage_min: float
    damage_max: float
    delay: int
    suffix_points: int | None
    stats: tuple[tuple[int, int], ...]
    clean_stat_model: bool


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download(url: str, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(target.suffix + ".part")
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "ItemLevelCalculator-random-enchantment-audit"},
    )
    with urllib.request.urlopen(request) as response, temporary.open("wb") as output:
        shutil.copyfileobj(response, output)
    temporary.replace(target)


def ensure_sources(source_dir: Path, fetch: bool) -> dict[str, Path]:
    paths = {
        "item_template": source_dir / "item_template.sql",
        "item_enchantment_template": source_dir / "item_enchantment_template.sql",
        "dbc_archive": source_dir / "AzerothcoreDBCToSQL.zip",
    }
    urls = {
        "item_template": ITEM_TEMPLATE_URL,
        "item_enchantment_template": ITEM_ENCHANTMENT_TEMPLATE_URL,
        "dbc_archive": DBC_SQL_URL,
    }
    for key, path in paths.items():
        if not path.exists():
            if not fetch:
                raise FileNotFoundError(
                    f"Missing {path}. Re-run with --fetch to download sources."
                )
            print(f"Downloading {path.name}...")
            download(urls[key], path)

    extract_dir = source_dir / "dbc-sql"
    required_names = (
        "itemrandomproperties_dbc.sql",
        "itemrandomsuffix_dbc.sql",
        "randproppoints_dbc.sql",
        "spellitemenchantment_dbc.sql",
    )
    located = {
        name: next(extract_dir.rglob(name), None)
        for name in required_names
    } if extract_dir.exists() else {}
    if any(path is None for path in located.values()) or not located:
        extract_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(paths["dbc_archive"]) as archive:
            archive.extractall(extract_dir)
        located = {
            name: next(extract_dir.rglob(name), None)
            for name in required_names
        }
    missing = [name for name, path in located.items() if path is None]
    if missing:
        raise FileNotFoundError(f"DBC archive is missing: {', '.join(missing)}")
    paths.update({name.removesuffix(".sql"): path for name, path in located.items()})
    return paths


def parse_scalar(value: str) -> Any:
    stripped = value.strip()
    if stripped.upper() == "NULL":
        return None
    if stripped == "":
        return ""
    try:
        number = float(stripped)
    except ValueError:
        return stripped
    return int(number) if number.is_integer() else number


def parse_tuple(text: str) -> list[Any]:
    stripped = text.strip().rstrip(",;")
    if not stripped.startswith("(") or not stripped.endswith(")"):
        raise ValueError(f"Not a SQL tuple: {text[:80]!r}")
    reader = csv.reader(
        [stripped[1:-1]],
        delimiter=",",
        quotechar="'",
        escapechar="\\",
        skipinitialspace=True,
    )
    return [parse_scalar(value) for value in next(reader)]


def insert_tuples(path: Path) -> Iterator[list[Any]]:
    with path.open(encoding="utf-8-sig") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped.startswith("INSERT INTO") and " VALUES (" in stripped:
                yield parse_tuple(stripped[stripped.index(" VALUES ") + 8:])
            elif stripped.startswith("("):
                yield parse_tuple(stripped)


def table_columns(path: Path, table: str) -> list[str]:
    columns: list[str] = []
    in_table = False
    create_marker = f"CREATE TABLE `{table}`"
    with path.open(encoding="utf-8-sig") as handle:
        for line in handle:
            if line.startswith(create_marker):
                in_table = True
                continue
            if in_table and line.startswith(") ENGINE"):
                break
            if in_table:
                match = re.match(r"\s*`([^`]+)`", line)
                if match:
                    columns.append(match.group(1))
    if not columns:
        raise ValueError(f"Could not read columns for {table} from {path}")
    return columns


def integer(value: Any, default: int = 0) -> int:
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        return int(value)
    return default


def number(value: Any, default: float = 0.0) -> float:
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        return float(value)
    return default


def load_items(path: Path) -> tuple[list[Item], Counter[str]]:
    columns = table_columns(path, "item_template")
    dispositions: Counter[str] = Counter()
    items: list[Item] = []
    for values in insert_tuples(path):
        if len(values) != len(columns):
            dispositions["column_count_mismatch"] += 1
            continue
        row = dict(zip(columns, values))
        item_class = integer(row.get("class"))
        subclass = integer(row.get("subclass"))
        quality = integer(row.get("Quality"))
        inventory_type = integer(row.get("InventoryType"))
        level = integer(row.get("ItemLevel"))
        random_property_group = integer(row.get("RandomProperty"))
        random_suffix_group = integer(row.get("RandomSuffix"))

        if quality not in (2, 3, 4):
            dispositions["unsupported_quality"] += 1
            continue
        if not (1 <= level <= 300):
            dispositions["level_out_of_range"] += 1
            continue
        if subclass not in SUPPORTED_ITEM_TYPES.get(item_class, {}).get(
            inventory_type, set()
        ):
            dispositions["unsupported_item_tuple"] += 1
            continue
        if not random_property_group and not random_suffix_group:
            dispositions["no_random_enchantment"] += 1
            continue
        if random_property_group and random_suffix_group:
            dispositions["both_random_fields_set"] += 1
            continue

        stats: list[tuple[int, int]] = []
        valid_stats = True
        for index in range(1, 11):
            stat_type = integer(row.get(f"stat_type{index}"))
            stat_value = integer(row.get(f"stat_value{index}"))
            if not stat_type and not stat_value:
                continue
            if stat_type not in SUPPORTED_STATS or stat_value <= 0:
                valid_stats = False
                break
            stats.append((stat_type, stat_value))
        if not valid_stats:
            dispositions["unsupported_base_stat"] += 1
            continue

        items.append(Item(
            entry=integer(row["entry"]),
            name=str(row.get("name") or ""),
            item_class=item_class,
            subclass=subclass,
            quality=quality,
            inventory_type=inventory_type,
            level=level,
            sell_price=integer(row.get("SellPrice")),
            random_property_group=random_property_group,
            random_suffix_group=random_suffix_group,
            base_stats=tuple(stats),
            clean_stat_model=(
                not stats
                and not any(
                    integer(row.get(f"spellid_{index}"))
                    for index in range(1, 6)
                )
                and not any(
                    integer(row.get(f"socketColor_{index}"))
                    for index in range(1, 4)
                )
                and not any(
                    integer(row.get(column))
                    for column in (
                        "holy_res",
                        "fire_res",
                        "nature_res",
                        "frost_res",
                        "shadow_res",
                        "arcane_res",
                    )
                )
            ),
            damage_min=number(row.get("dmg_min1")),
            damage_max=number(row.get("dmg_max1")),
            delay=integer(row.get("delay")),
        ))
        dispositions["included"] += 1
    return items, dispositions


def load_enchantment_groups(path: Path) -> dict[int, list[tuple[int, float]]]:
    groups: dict[int, list[tuple[int, float]]] = defaultdict(list)
    for row in insert_tuples(path):
        if len(row) != 3:
            continue
        groups[integer(row[0])].append((integer(row[1]), number(row[2])))
    return groups


def load_dbc_rows(path: Path) -> dict[int, list[Any]]:
    rows: dict[int, list[Any]] = {}
    for row in insert_tuples(path):
        if row:
            rows[integer(row[0])] = row
    return rows


def spell_enchantment_stats(
    enchantment_id: int,
    spell_enchantments: dict[int, list[Any]],
    suffix_points: int | None,
    allocation: int | None,
) -> list[tuple[int, int]] | None:
    special = SPECIAL_ENCHANT_STATS.get(enchantment_id)
    if special is not None:
        if suffix_points is None or allocation is None:
            return None
        return [(special, math.floor(suffix_points * allocation / 10000))]

    row = spell_enchantments.get(enchantment_id)
    if row is None or len(row) < 15:
        return None
    stats: list[tuple[int, int]] = []
    for effect_index in range(3):
        effect_type = integer(row[2 + effect_index])
        if effect_type == 0:
            continue
        if effect_type != 5:
            return None
        stat_type = integer(row[11 + effect_index])
        if stat_type not in SUPPORTED_STATS:
            return None
        if suffix_points is None:
            amount = integer(row[5 + effect_index])
        else:
            if allocation is None:
                return None
            amount = math.floor(suffix_points * allocation / 10000)
        if amount > 0:
            stats.append((stat_type, amount))
    return stats or None


def merge_stats(stats: Iterable[tuple[int, int]]) -> tuple[tuple[int, int], ...]:
    totals: dict[int, int] = defaultdict(int)
    for stat_type, amount in stats:
        totals[stat_type] += amount
    return tuple(sorted(totals.items()))


def build_cases(
    items: Sequence[Item],
    groups: dict[int, list[tuple[int, float]]],
    random_properties: dict[int, list[Any]],
    random_suffixes: dict[int, list[Any]],
    random_property_points: dict[int, list[Any]],
    spell_enchantments: dict[int, list[Any]],
) -> tuple[list[AuditCase], Counter[str]]:
    cases: list[AuditCase] = []
    dispositions: Counter[str] = Counter()
    for item in items:
        group_id = item.random_suffix_group or item.random_property_group
        enchantments = groups.get(group_id)
        if not enchantments:
            dispositions["missing_enchantment_group"] += 1
            continue
        for enchantment_id, chance in enchantments:
            generated: list[tuple[int, int]] = list(item.base_stats)
            if item.random_suffix_group:
                kind = "suffix"
                suffix = random_suffixes.get(enchantment_id)
                points_row = random_property_points.get(item.level)
                point_group = SUFFIX_POINT_GROUP.get(item.inventory_type)
                if suffix is None or points_row is None or point_group is None:
                    dispositions["missing_suffix_source"] += 1
                    continue
                # RandPropPoints is ID, five epic, five rare, five uncommon.
                quality_offset = {2: 11, 3: 6, 4: 1}[item.quality]
                suffix_points = integer(points_row[quality_offset + point_group])
                enchant_ids = [integer(value) for value in suffix[-10:-5]]
                allocations = [integer(value) for value in suffix[-5:]]
                valid = True
                for suffix_enchant, allocation in zip(enchant_ids, allocations):
                    if not suffix_enchant:
                        continue
                    stats = spell_enchantment_stats(
                        suffix_enchant,
                        spell_enchantments,
                        suffix_points,
                        allocation,
                    )
                    if stats is None:
                        valid = False
                        break
                    generated.extend(stats)
                if not valid or not generated:
                    dispositions["unsupported_suffix_effect"] += 1
                    continue
                enchantment_name = str(suffix[1] or "").strip('"')
            else:
                kind = "property"
                suffix_points = None
                prop = random_properties.get(enchantment_id)
                if prop is None:
                    dispositions["missing_property_source"] += 1
                    continue
                valid = True
                for property_enchant in [integer(value) for value in prop[2:7]]:
                    if not property_enchant:
                        continue
                    stats = spell_enchantment_stats(
                        property_enchant,
                        spell_enchantments,
                        None,
                        None,
                    )
                    if stats is None:
                        valid = False
                        break
                    generated.extend(stats)
                if not valid or not generated:
                    dispositions["unsupported_property_effect"] += 1
                    continue
                enchantment_name = str(prop[1] or "").strip('"')

            combined = merge_stats(generated)
            if not combined:
                dispositions["zero_stat_case"] += 1
                continue
            cases.append(AuditCase(
                case_id=f"{item.entry}:{kind}:{enchantment_id}",
                entry=item.entry,
                item_name=item.name,
                enchantment_kind=kind,
                enchantment_group=group_id,
                enchantment_id=enchantment_id,
                enchantment_name=enchantment_name,
                chance=chance,
                item_class=item.item_class,
                subclass=item.subclass,
                inventory_type=item.inventory_type,
                quality=item.quality,
                expected_level=item.level,
                sell_price=item.sell_price,
                damage_min=item.damage_min,
                damage_max=item.damage_max,
                delay=item.delay,
                suffix_points=suffix_points,
                stats=combined,
                clean_stat_model=item.clean_stat_model,
            ))
            dispositions[f"included_{kind}"] += 1
    return cases, dispositions


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def summarize_cases(cases: Sequence[AuditCase]) -> dict[str, Any]:
    levels = [case.expected_level for case in cases]
    return {
        "case_count": len(cases),
        "unique_items": len({case.entry for case in cases}),
        "unique_enchantment_groups": len({
            (case.enchantment_kind, case.enchantment_group) for case in cases
        }),
        "unique_enchantments": len({
            (case.enchantment_kind, case.enchantment_id) for case in cases
        }),
        "level_min": min(levels) if levels else None,
        "level_max": max(levels) if levels else None,
        "level_median": statistics.median(levels) if levels else None,
        "by_kind": dict(sorted(Counter(
            case.enchantment_kind for case in cases
        ).items())),
        "by_quality": dict(sorted(Counter(
            str(case.quality) for case in cases
        ).items())),
        "clean_stat_cases": sum(case.clean_stat_model for case in cases),
        "by_class": dict(sorted(Counter(
            str(case.item_class) for case in cases
        ).items())),
        "by_inventory_type": dict(sorted(Counter(
            str(case.inventory_type) for case in cases
        ).items())),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path("Test/random-enchantment-audit/source"),
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("Test/random-enchantment-audit/results"),
    )
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="Download missing AzerothCore and DBC-to-SQL inputs.",
    )
    args = parser.parse_args()

    sources = ensure_sources(args.source_dir, args.fetch)
    items, item_dispositions = load_items(sources["item_template"])
    groups = load_enchantment_groups(sources["item_enchantment_template"])
    random_properties = load_dbc_rows(sources["itemrandomproperties_dbc"])
    random_suffixes = load_dbc_rows(sources["itemrandomsuffix_dbc"])
    random_property_points = load_dbc_rows(sources["randproppoints_dbc"])
    spell_enchantments = load_dbc_rows(sources["spellitemenchantment_dbc"])
    cases, case_dispositions = build_cases(
        items,
        groups,
        random_properties,
        random_suffixes,
        random_property_points,
        spell_enchantments,
    )

    manifest = {
        "sources": {
            key: {
                "path": str(path.resolve()),
                "sha256": sha256_file(path),
            }
            for key, path in sources.items()
            if path.is_file()
        },
        "item_dispositions": dict(sorted(item_dispositions.items())),
        "case_dispositions": dict(sorted(case_dispositions.items())),
        "corpus": summarize_cases(cases),
    }
    write_json(args.output_dir / "manifest.json", manifest)
    write_json(args.output_dir / "cases.json", [
        {
            **asdict(case),
            "stats": [
                {"type": stat_type, "amount": amount}
                for stat_type, amount in case.stats
            ],
        }
        for case in cases
    ])

    print(json.dumps(manifest["corpus"], indent=2, sort_keys=True))
    print(f"Wrote {args.output_dir / 'manifest.json'}")
    print(f"Wrote {args.output_dir / 'cases.json'}")


if __name__ == "__main__":
    main()
