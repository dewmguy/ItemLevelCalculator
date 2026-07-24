#!/usr/bin/env python3
"""Reproducible full-corpus benchmark for ItemLevelCalculator stat models.

The script reads XLSM files as ZIP/XML using only the Python standard library.
It does not use cached spreadsheet formulas and does not modify source files.

Primary candidate models:
  1. Current Lp model, p = log(2) / log(1.5).
  2. Current Lp structure with p = 1.5.
  3. Current Lp structure with p = log(3) / log(2).
  4. Peer 3/2 distribution factor exactly as written.
  5. Reciprocal-corrected peer factor. With effective-cost shares this is
     algebraically identical to candidate 2 and is reported as a duplicate.

The peer wording calls both stat cost and allocation share "weight". Primary
peer results define shares from effective-cost values z_i = amount_i * StatMod_i.
Sensitivity-only models define shares from raw amounts while retaining StatMod
for total cost. Those sensitivity models are clearly labeled and are not
counted among the five primary candidates.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import random
import statistics
import sys
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Iterable, Iterator, Sequence


CURRENT_EXPONENT = math.log(2) / math.log(1.5)
LOG2_THREE = math.log(3) / math.log(2)
MAX_LEVEL = 300
FAILURE_LEVEL = 301

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"

SUPPORTED_STATS = {
    3, 4, 5, 6, 7, 12, 13, 14, 15, 21, 31, 32, 35, 36, 37, 38, 43, 44,
    45, 46, 47, 48, 49,
}
STATIC_STAT_MODS = {
    3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0,
    12: 1.0, 13: 1.0, 14: 1.0, 15: 1.0, 21: 1.0, 31: 1.0,
    32: 1.0, 35: 1.0, 36: 1.0, 37: 1.0, 38: 8 / 16,
    44: 1.0, 47: 12 / 16,
}

ARMOR_COMPATIBILITY = {
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
}
WEAPON_COMPATIBILITY = {
    13: {0, 4, 7, 13, 15},
    15: {2},
    17: {1, 5, 6, 8, 10},
    21: {0, 4, 7, 13, 15},
    22: {0, 4, 7, 13, 15},
    25: {16},
    26: {3, 18, 19},
}

ARMOR_EXPANSION_FILES = (
    ("vanilla", "epic - vanilla.xlsm"),
    ("tbc", "epic - tbc.xlsm"),
    ("wotlk", "epic - wotlk.xlsm"),
    ("vanilla", "rare - vanilla.xlsm"),
    ("vanilla", "rare - vanilla - actual.xlsm"),
    ("tbc", "rare - tbc.xlsm"),
    ("wotlk", "rare - wotlk.xlsm"),
    ("vanilla", "uncommon - vanilla.xlsm"),
    ("vanilla", "uncommon - vanilla - alt.xlsm"),
    ("tbc", "uncommon - tbc.xlsm"),
    ("wotlk", "uncommon - wotlk.xlsm"),
)


@dataclass(frozen=True)
class Component:
    key: str
    amount: float


@dataclass
class BenchmarkItem:
    entry: int
    actual_level: int
    item_class: int
    quality: int
    slot: int
    subclass: int
    components: list[Component]
    socket_count: int
    stat_count: int
    cohort: str
    expansion: str
    expansion_sources: str
    split: str


@dataclass(frozen=True)
class ModelSpec:
    model_id: str
    label: str
    family: str
    exponent: float | None = None
    share_basis: str = "effective_cost"
    reciprocal: bool = False
    primary_candidate: bool = True
    duplicate_of: str = ""
    interpretation: str = ""


PRIMARY_MODELS = (
    ModelSpec(
        "current_lp",
        "Current Lp p=ln(2)/ln(1.5)",
        "lp",
        exponent=CURRENT_EXPONENT,
        interpretation="Exact script.js forward level model.",
    ),
    ModelSpec(
        "lp_p_1_5",
        "Lp p=1.5",
        "lp",
        exponent=1.5,
        interpretation="Current structure and coefficients; exponent only changed.",
    ),
    ModelSpec(
        "lp_p_log2_3",
        "Lp p=ln(3)/ln(2)",
        "lp",
        exponent=LOG2_THREE,
        interpretation="Exponent mistakenly attributed to the app by the peer critique.",
    ),
    ModelSpec(
        "peer_exact_effective_share",
        "Peer formula as written",
        "peer",
        exponent=1.5,
        share_basis="effective_cost",
        reciprocal=False,
        interpretation=(
            "alpha_i uses z_i=amount_i*StatMod_i. The written D factor is kept "
            "in the capacity numerator; current slot normalization is retained."
        ),
    ),
    ModelSpec(
        "peer_reciprocal_effective_share",
        "Reciprocal-corrected peer 3/2 norm",
        "peer",
        exponent=1.5,
        share_basis="effective_cost",
        reciprocal=True,
        duplicate_of="lp_p_1_5",
        interpretation=(
            "alpha_i uses z_i=amount_i*StatMod_i. Z*D equals ||z||_1.5, "
            "so this is algebraically identical to lp_p_1_5."
        ),
    ),
)

SENSITIVITY_MODELS = (
    ModelSpec(
        "peer_exact_raw_share_sensitivity",
        "Peer written; raw-amount shares",
        "peer",
        exponent=1.5,
        share_basis="raw_amount",
        reciprocal=False,
        primary_candidate=False,
        interpretation=(
            "Sensitivity only: alpha_i uses raw amounts, while StatMod remains "
            "the separate total-cost transform."
        ),
    ),
    ModelSpec(
        "peer_reciprocal_raw_share_sensitivity",
        "Peer reciprocal; raw-amount shares",
        "peer",
        exponent=1.5,
        share_basis="raw_amount",
        reciprocal=True,
        primary_candidate=False,
        interpretation=(
            "Sensitivity only: alpha_i uses raw amounts, while StatMod remains "
            "the separate total-cost transform."
        ),
    ),
)
ALL_MODELS = PRIMARY_MODELS + SENSITIVITY_MODELS


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def column_number(cell_reference: str) -> int:
    letters = "".join(character for character in cell_reference if character.isalpha())
    result = 0
    for character in letters:
        result = result * 26 + ord(character.upper()) - 64
    return result - 1


def scalar(value: str | None, cell_type: str | None, shared: Sequence[str]) -> Any:
    if value is None or value == "":
        return None
    if cell_type == "s":
        return shared[int(value)]
    if cell_type in {"str", "inlineStr"}:
        return value
    if cell_type == "b":
        return value == "1"
    try:
        number = float(value)
    except ValueError:
        return value
    return int(number) if number.is_integer() else number


def workbook_sheet_targets(archive: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    target_by_id = {
        relationship.attrib["Id"]: relationship.attrib["Target"]
        for relationship in relationships.findall(f"{{{PKG_REL_NS}}}Relationship")
    }
    targets: list[tuple[str, str]] = []
    sheets = workbook.find(f"{{{MAIN_NS}}}sheets")
    if sheets is None:
        return targets
    for sheet in sheets:
        relationship_id = sheet.attrib[f"{{{REL_NS}}}id"]
        target = target_by_id[relationship_id].lstrip("/")
        if not target.startswith("xl/"):
            target = str(PurePosixPath("xl") / target)
        targets.append((sheet.attrib["name"], target))
    return targets


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for item in root.findall(f"{{{MAIN_NS}}}si"):
        values.append("".join(text.text or "" for text in item.iter(f"{{{MAIN_NS}}}t")))
    return values


def iter_xlsx_rows(path: Path, sheet_name: str | None = None) -> Iterator[dict[str, Any]]:
    """Yield worksheet rows as header-keyed dictionaries without formula evaluation."""
    with zipfile.ZipFile(path) as archive:
        targets = workbook_sheet_targets(archive)
        if not targets:
            return
        if sheet_name is None:
            _, target = targets[0]
        else:
            matching = [target for name, target in targets if name.casefold() == sheet_name.casefold()]
            if not matching:
                raise KeyError(f"Sheet {sheet_name!r} not found in {path}")
            target = matching[0]
        shared = shared_strings(archive)
        headers: list[str] | None = None
        with archive.open(target) as worksheet:
            for _, element in ET.iterparse(worksheet, events=("end",)):
                if element.tag != f"{{{MAIN_NS}}}row":
                    continue
                values_by_column: dict[int, Any] = {}
                for cell in element.findall(f"{{{MAIN_NS}}}c"):
                    reference = cell.attrib.get("r", "")
                    cell_type = cell.attrib.get("t")
                    value_node = cell.find(f"{{{MAIN_NS}}}v")
                    value = value_node.text if value_node is not None else None
                    if cell_type == "inlineStr":
                        inline = cell.find(f"{{{MAIN_NS}}}is")
                        if inline is not None:
                            value = "".join(
                                text.text or "" for text in inline.iter(f"{{{MAIN_NS}}}t")
                            )
                    values_by_column[column_number(reference)] = scalar(value, cell_type, shared)
                if headers is None:
                    width = max(values_by_column, default=-1) + 1
                    headers = [
                        str(values_by_column.get(index) or "").strip()
                        for index in range(width)
                    ]
                else:
                    yield {
                        header: values_by_column.get(index)
                        for index, header in enumerate(headers)
                        if header
                    }
                element.clear()


def integer(value: Any) -> int | None:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value.strip()))
        except ValueError:
            return None
    return None


def number(value: Any) -> float | None:
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)) and math.isfinite(float(value)):
        return float(value)
    if isinstance(value, str):
        try:
            parsed = float(value.strip())
        except ValueError:
            return None
        return parsed if math.isfinite(parsed) else None
    return None


def is_supported_tuple(item_class: int, slot: int, subclass: int) -> bool:
    compatibility = (
        ARMOR_COMPATIBILITY if item_class == 4
        else WEAPON_COMPATIBILITY if item_class == 2
        else {}
    )
    return subclass in compatibility.get(slot, set())


def quality_mod(quality: int, level: int) -> float:
    if quality == 4:
        if level >= 200:
            return 1.320 * level - 120
        if level >= 100:
            return 0.700 * level - 2
        return 0.689 * level + 1
    if quality == 3:
        if level >= 136:
            return 0.880 * level - 39.25
        if level >= 80:
            return 0.674 * level - 8
        return 0.641 * level - 4
    if quality == 2:
        if level >= 130:
            return 0.801 * level - 38.3
        if level >= 80:
            return 0.505 * level - 4.5
        return 0.495 * level - 2.85
    return math.nan


def slot_mod(item_class: int, slot: int, quality: int, level: int) -> float | None:
    if item_class == 2:
        return {
            13: 7 / 16,
            15: 16 / 16,
            17: 16 / 16,
            21: 7 / 16,
            22: 7 / 16,
            25: 5 / 16,
            26: 5 / 16,
        }.get(slot)
    if item_class != 4:
        return None
    if slot in {4, 19, 28}:
        return 1 / 32
    if slot in {5, 20}:
        return 16 / 16
    if slot == 23:
        return 3 / 16
    if slot == 12:
        if quality == 4:
            return 6 / 16 if level >= 90 else 8 / 16
        if quality == 3:
            return 11 / 16 if level >= 80 else 8 / 16
        return 8 / 16
    if slot == 14:
        return 3 / 16 if quality == 4 and level >= 90 else 4 / 16
    if slot == 16:
        if quality == 4:
            return 3 / 16 if level >= 90 else 4 / 16
        if quality == 2:
            return 4 / 16 if level >= 80 else 3 / 16
        return 4 / 16
    base = {
        1: 16 / 16,
        2: 4 / 16,
        3: 8 / 16,
        6: 8 / 16,
        7: 16 / 16,
        8: 8 / 16,
        9: 4 / 16,
        10: 8 / 16,
        11: 4 / 16,
    }.get(slot)
    if base is None:
        return None
    if quality == 4 and 90 <= level < 200:
        return base * 0.75
    return base


def stat_mod(key: str, slot: int, quality: int, level: int) -> float | None:
    if key.startswith("res_"):
        return 1.0
    stat_type = int(key)
    if stat_type in STATIC_STAT_MODS:
        return STATIC_STAT_MODS[stat_type]
    if stat_type == 49:
        if quality == 4 or (quality == 3 and level >= 80):
            return 2 / 32
        return 3 / 32
    if stat_type == 7:
        if (
            (quality == 4 and level >= 90)
            or (quality in {2, 3} and level >= 80)
        ):
            return 2 / 3
        return 1.0
    if stat_type == 43:
        accessory = slot in {2, 11, 12, 23}
        if accessory:
            if quality == 4 and level >= 200:
                return 24 / 16
            if quality == 4:
                return 32 / 16
            if quality == 3 and level >= 80:
                return 32 / 16
            return 48 / 16
        if quality == 4:
            return 32 / 16
        if quality == 3 and level >= 80:
            return 32 / 16
        return 92 / 32
    if stat_type == 45:
        if quality == 4 and level >= 90:
            return 45 / 64
        if quality == 2 and level < 80:
            return 45 / 64
        return 55 / 64
    if stat_type == 46:
        accessory = slot in {2, 11, 12, 23}
        if accessory:
            if quality == 4 and level >= 200:
                return 4 / 16
            if quality == 4 and level >= 90:
                return 8 / 16
            if quality == 4:
                return 16 / 16
            return 32 / 16
        if quality == 4 and level >= 200:
            return 8 / 16
        if quality == 4 and level >= 90:
            return 16 / 16
        if quality == 4:
            return 32 / 16
        return 64 / 16
    if stat_type == 48:
        accessory = slot in {2, 11, 12, 14}
        if accessory and quality == 4 and level >= 200:
            return 4 / 64
        if quality == 2 and level < 80:
            return 16 / 16
        return 21 / 64
    return None


def socket_mod(slot: int, quality: int, level: int) -> float:
    accessory = slot in {2, 11, 14, 23}
    if accessory:
        if quality == 4 and level >= 200:
            return 24.0
        if quality == 2:
            return 5.0
        return 10.0
    if quality == 4 and level >= 200:
        return 24.0
    if quality == 4 and level >= 90:
        return 10.0
    if quality == 2:
        return 10.0
    return 20.0


def expansion_map(data_dir: Path) -> tuple[dict[int, str], dict[int, str], dict[str, Any]]:
    labels: dict[int, set[str]] = defaultdict(set)
    sources: dict[int, set[str]] = defaultdict(set)
    source_counts: dict[str, int] = {}
    for expansion, filename in ARMOR_EXPANSION_FILES:
        path = data_dir / "armor" / filename
        if not path.exists():
            source_counts[str(path)] = -1
            continue
        count = 0
        for row in iter_xlsx_rows(path):
            entry = integer(row.get("entry"))
            if entry is None:
                continue
            count += 1
            labels[entry].add(expansion)
            sources[entry].add(filename)
        source_counts[str(path)] = count
    resolved: dict[int, str] = {}
    resolved_sources: dict[int, str] = {}
    for entry, entry_labels in labels.items():
        resolved[entry] = (
            next(iter(entry_labels)) if len(entry_labels) == 1 else "ambiguous"
        )
        resolved_sources[entry] = ";".join(sorted(sources[entry]))
    summary = {
        "source_row_counts": source_counts,
        "labeled_entries": len(resolved),
        "ambiguous_entries": sum(label == "ambiguous" for label in resolved.values()),
        "label_counts": dict(sorted(Counter(resolved.values()).items())),
        "method": (
            "Entry-ID union of curated Data/armor filenames. Alternate same-era "
            "workbooks contribute labels but never additional benchmark rows. "
            "Weapon expansion labels are left unknown because the two weapon "
            "workbooks are byte-identical despite conflicting filenames."
        ),
    }
    return resolved, resolved_sources, summary


def deterministic_split(entry: int, seed: str, test_fraction: float) -> str:
    digest = hashlib.sha256(f"{seed}:{entry}".encode("utf-8")).digest()
    value = int.from_bytes(digest[:8], "big") / 2**64
    return "test" if value < test_fraction else "train"


def level_band(level: int) -> str:
    if level <= 79:
        return "001-079"
    if level <= 89:
        return "080-089"
    if level <= 99:
        return "090-099"
    if level <= 129:
        return "100-129"
    if level <= 135:
        return "130-135"
    if level <= 199:
        return "136-199"
    return "200-300"


def build_corpus(
    workbook: Path,
    expansion_by_entry: dict[int, str],
    expansion_sources: dict[int, str],
    seed: str,
    test_fraction: float,
    max_rows: int | None = None,
) -> tuple[list[BenchmarkItem], list[dict[str, Any]], Counter[str]]:
    items: list[BenchmarkItem] = []
    dispositions: list[dict[str, Any]] = []
    exclusion_counts: Counter[str] = Counter()
    seen: set[int] = set()

    resistance_columns = {
        "fire_res": "res_fire",
        "nature_res": "res_nature",
        "frost_res": "res_frost",
        "shadow_res": "res_shadow",
        "arcane_res": "res_arcane",
    }
    for row_number, row in enumerate(iter_xlsx_rows(workbook, "all items"), start=2):
        if max_rows is not None and row_number > max_rows + 1:
            break
        reasons: list[str] = []
        details: list[str] = []
        entry = integer(row.get("entry"))
        actual_level = integer(row.get("ItemLevel"))
        item_class = integer(row.get("class"))
        quality = integer(row.get("Quality"))
        slot = integer(row.get("InventoryType"))
        subclass = integer(row.get("subclass"))

        if entry is None:
            reasons.append("missing_entry")
            entry = -row_number
        elif entry in seen:
            reasons.append("duplicate_entry")
        else:
            seen.add(entry)
        if actual_level is None or not 1 <= actual_level <= MAX_LEVEL:
            reasons.append("item_level_out_of_range")
        if quality not in {2, 3, 4}:
            reasons.append("unsupported_quality")
        if (
            item_class is None
            or slot is None
            or subclass is None
            or not is_supported_tuple(item_class, slot, subclass)
        ):
            reasons.append("unsupported_item_tuple")

        components: list[Component] = []
        observed_types: set[int] = set()
        for number_index in range(1, 11):
            stat_type = integer(row.get(f"stat_type{number_index}"))
            stat_value = number(row.get(f"stat_value{number_index}"))
            stat_type = stat_type or 0
            stat_value = stat_value or 0.0
            if stat_type == 0 and stat_value == 0:
                continue
            if stat_type == 0 or stat_value == 0:
                reasons.append("incomplete_stat_pair")
                details.append(f"stat_pair_{number_index}={stat_type}:{stat_value:g}")
                continue
            if stat_value < 0:
                reasons.append("negative_stat_value")
                details.append(f"stat_{stat_type}={stat_value:g}")
                continue
            if stat_type not in SUPPORTED_STATS:
                reasons.append("unsupported_stat_type")
                details.append(f"stat_type={stat_type}")
                continue
            if stat_type in observed_types:
                reasons.append("duplicate_stat_type")
                details.append(f"stat_type={stat_type}")
                continue
            observed_types.add(stat_type)
            components.append(Component(str(stat_type), stat_value))

        holy = number(row.get("holy_res")) or 0.0
        if holy:
            reasons.append("holy_resistance_unsupported")
            details.append(f"holy_res={holy:g}")
        for column, key in resistance_columns.items():
            value = number(row.get(column)) or 0.0
            if value < 0:
                reasons.append("negative_stat_value")
                details.append(f"{column}={value:g}")
            elif value > 0:
                components.append(Component(key, value))

        spell_ids = [
            integer(row.get(f"spellid_{number_index}")) or 0
            for number_index in range(1, 6)
        ]
        if any(spell_id != 0 for spell_id in spell_ids):
            reasons.append("spell_effect_present")

        socket_values = [
            integer(row.get(f"socketColor_{number_index}")) or 0
            for number_index in range(1, 4)
        ]
        socket_count = sum(value != 0 for value in socket_values)
        for socket_index in range(socket_count):
            components.append(Component(f"socket_{socket_index + 1}", 1.0))

        stat_count = len(components) - socket_count
        if not components:
            reasons.append("no_budget_components")

        reasons = list(dict.fromkeys(reasons))
        included = not reasons
        expansion = expansion_by_entry.get(entry, "unknown")
        sources = expansion_sources.get(entry, "")
        cohort = "socket_augmented" if socket_count else "pure_stats"
        split = deterministic_split(entry, seed, test_fraction)
        if included:
            assert actual_level is not None
            assert item_class is not None
            assert quality is not None
            assert slot is not None
            assert subclass is not None
            items.append(BenchmarkItem(
                entry=entry,
                actual_level=actual_level,
                item_class=item_class,
                quality=quality,
                slot=slot,
                subclass=subclass,
                components=components,
                socket_count=socket_count,
                stat_count=stat_count,
                cohort=cohort,
                expansion=expansion,
                expansion_sources=sources,
                split=split,
            ))
        else:
            exclusion_counts.update(reasons)
        dispositions.append({
            "source_row": row_number,
            "entry": entry,
            "included": included,
            "exclusion_reasons": ";".join(reasons),
            "exclusion_details": ";".join(details),
            "actual_level": actual_level,
            "class": item_class,
            "quality": quality,
            "slot": slot,
            "subclass": subclass,
            "stat_count": stat_count,
            "socket_count": socket_count,
            "cohort": cohort if included else "",
            "split": split if included else "",
            "expansion": expansion,
            "expansion_sources": sources,
        })
    return items, dispositions, exclusion_counts


def effective_components(item: BenchmarkItem, level: int) -> tuple[list[float], list[float]] | None:
    effective: list[float] = []
    raw: list[float] = []
    for component in item.components:
        if component.key.startswith("socket_"):
            modifier = socket_mod(item.slot, item.quality, level)
        else:
            modifier = stat_mod(component.key, item.slot, item.quality, level)
        if modifier is None or modifier <= 0 or not math.isfinite(modifier):
            return None
        effective.append(component.amount * modifier)
        raw.append(component.amount)
    return effective, raw


def distribution_factor(values: Sequence[float]) -> float:
    total = sum(values)
    if total <= 0:
        return math.nan
    return sum((value / total) ** 1.5 for value in values) ** (2 / 3)


def model_margin(
    model: ModelSpec,
    quality_value: float,
    slot_value: float,
    effective: Sequence[float],
    raw: Sequence[float],
) -> float | None:
    if quality_value <= 0 or slot_value <= 0 or not effective:
        return None
    if model.family == "lp":
        assert model.exponent is not None
        norm = sum(value ** model.exponent for value in effective) ** (1 / model.exponent)
        required = norm / slot_value ** ((model.exponent - 1) / model.exponent)
        return quality_value / required if required > 0 else None
    if model.duplicate_of == "lp_p_1_5":
        norm = sum(value ** 1.5 for value in effective) ** (2 / 3)
        required = norm / slot_value ** (1 / 3)
        return quality_value / required if required > 0 else None
    share_values = effective if model.share_basis == "effective_cost" else raw
    factor = distribution_factor(share_values)
    total_effective = sum(effective)
    if not math.isfinite(factor) or factor <= 0 or total_effective <= 0:
        return None
    # Retain current p=1.5 slot normalization so only the distribution factor
    # changes. The exact written factor requires Z/D; reciprocal correction Z*D.
    shape_required = (
        total_effective * factor if model.reciprocal
        else total_effective / factor
    )
    required = shape_required / slot_value ** (1 / 3)
    return quality_value / required if required > 0 else None


def evaluate_items(
    items: Sequence[BenchmarkItem],
) -> tuple[list[dict[str, Any]], dict[tuple[str, int], dict[str, float]]]:
    predictions: list[dict[str, Any]] = []
    monotonic: dict[tuple[str, int], dict[str, float]] = defaultdict(
        lambda: {
            "comparisons": 0,
            "decreases": 0,
            "eligibility_reversals": 0,
            "sum_relative_drop": 0.0,
            "max_relative_drop": 0.0,
        }
    )
    for item in items:
        first_level: dict[str, int | None] = {model.model_id: None for model in ALL_MODELS}
        previous_margin: dict[str, float | None] = {model.model_id: None for model in ALL_MODELS}
        for level in range(1, MAX_LEVEL + 1):
            quality_value = quality_mod(item.quality, level)
            slot_value = slot_mod(item.item_class, item.slot, item.quality, level)
            values = effective_components(item, level)
            if slot_value is None or values is None:
                continue
            effective, raw = values
            for model in ALL_MODELS:
                margin = model_margin(
                    model, quality_value, slot_value, effective, raw
                )
                if margin is None or not math.isfinite(margin):
                    previous_margin[model.model_id] = None
                    continue
                if first_level[model.model_id] is None and margin >= 1:
                    first_level[model.model_id] = level
                previous = previous_margin[model.model_id]
                if previous is not None:
                    record = monotonic[(model.model_id, level)]
                    record["comparisons"] += 1
                    if margin < previous - 1e-12:
                        relative_drop = (previous - margin) / previous
                        record["decreases"] += 1
                        record["sum_relative_drop"] += relative_drop
                        record["max_relative_drop"] = max(
                            record["max_relative_drop"], relative_drop
                        )
                        if previous >= 1 and margin < 1:
                            record["eligibility_reversals"] += 1
                previous_margin[model.model_id] = margin

        for model in ALL_MODELS:
            predicted = first_level[model.model_id]
            failure = "" if predicted is not None else "no_level_1_to_300_meets_budget"
            error = predicted - item.actual_level if predicted is not None else None
            penalty_error = (
                error if error is not None
                else FAILURE_LEVEL - item.actual_level
            )
            predictions.append({
                "entry": item.entry,
                "actual_level": item.actual_level,
                "predicted_level": predicted,
                "error": error,
                "absolute_error": abs(error) if error is not None else None,
                "failure_penalty_error": penalty_error,
                "failure_penalty_absolute_error": abs(penalty_error),
                "failure_reason": failure,
                "model_id": model.model_id,
                "model_label": model.label,
                "primary_candidate": model.primary_candidate,
                "duplicate_of": model.duplicate_of,
                "share_basis": model.share_basis,
                "interpretation": model.interpretation,
                "split": item.split,
                "cohort": item.cohort,
                "expansion": item.expansion,
                "quality": item.quality,
                "class": item.item_class,
                "slot": item.slot,
                "level_band": level_band(item.actual_level),
                "socket_count": item.socket_count,
                "stat_count": item.stat_count,
            })
    return predictions, monotonic


def percentile(values: Sequence[float], probability: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = max(0, math.ceil(probability * len(ordered)) - 1)
    return float(ordered[index])


def summarize(rows: Sequence[dict[str, Any]]) -> dict[str, Any]:
    predicted_rows = [row for row in rows if row["error"] is not None]
    errors = [float(row["error"]) for row in predicted_rows]
    absolute = [abs(error) for error in errors]
    penalty_absolute = [
        float(row["failure_penalty_absolute_error"]) for row in rows
    ]
    return {
        "n_total": len(rows),
        "n_predicted": len(predicted_rows),
        "failures": len(rows) - len(predicted_rows),
        "failure_rate": (len(rows) - len(predicted_rows)) / len(rows) if rows else None,
        "mae": statistics.fmean(absolute) if absolute else None,
        "mae_with_level_301_failure_penalty": (
            statistics.fmean(penalty_absolute) if penalty_absolute else None
        ),
        "median_absolute_error": statistics.median(absolute) if absolute else None,
        "rmse": (
            math.sqrt(statistics.fmean(error * error for error in errors))
            if errors else None
        ),
        "bias": statistics.fmean(errors) if errors else None,
        "exact_rate": (
            sum(value == 0 for value in absolute) / len(absolute) if absolute else None
        ),
        "within_1_rate": (
            sum(value <= 1 for value in absolute) / len(absolute) if absolute else None
        ),
        "within_2_rate": (
            sum(value <= 2 for value in absolute) / len(absolute) if absolute else None
        ),
        "p90_absolute_error": percentile(absolute, 0.90),
        "p95_absolute_error": percentile(absolute, 0.95),
        "max_absolute_error": max(absolute) if absolute else None,
    }


def stratified_metrics(predictions: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    dimensions = ("expansion", "quality", "class", "slot", "level_band", "socket_count", "stat_count")
    by_model: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in predictions:
        by_model[row["model_id"]].append(row)
    model_lookup = {model.model_id: model for model in ALL_MODELS}
    for model_id, model_rows in by_model.items():
        model = model_lookup[model_id]
        for split in ("all", "train", "test"):
            split_rows = (
                model_rows if split == "all"
                else [row for row in model_rows if row["split"] == split]
            )
            for cohort in ("all", "pure_stats", "socket_augmented"):
                cohort_rows = (
                    split_rows if cohort == "all"
                    else [row for row in split_rows if row["cohort"] == cohort]
                )
                if not cohort_rows:
                    continue
                base = {
                    "model_id": model_id,
                    "model_label": model.label,
                    "primary_candidate": model.primary_candidate,
                    "duplicate_of": model.duplicate_of,
                    "split": split,
                    "cohort": cohort,
                }
                records.append({
                    **base,
                    "dimension": "overall",
                    "stratum": "all",
                    **summarize(cohort_rows),
                })
                for dimension in dimensions:
                    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
                    for row in cohort_rows:
                        grouped[str(row[dimension])].append(row)
                    for stratum, rows in sorted(grouped.items()):
                        records.append({
                            **base,
                            "dimension": dimension,
                            "stratum": stratum,
                            **summarize(rows),
                        })
    return records


def bootstrap_test_mae(
    predictions: Sequence[dict[str, Any]],
    seed: str,
    repetitions: int,
) -> dict[str, Any]:
    rows = [
        row for row in predictions
        if row["split"] == "test"
        and row["cohort"] == "pure_stats"
        and row["primary_candidate"]
    ]
    by_model_entry = {
        (row["model_id"], row["entry"]): float(row["failure_penalty_absolute_error"])
        for row in rows
    }
    entries = sorted({row["entry"] for row in rows})
    models = [model.model_id for model in PRIMARY_MODELS]
    rng = random.Random(seed)
    samples: dict[str, list[float]] = {model_id: [] for model_id in models}
    deltas: dict[str, list[float]] = {
        model_id: [] for model_id in models if model_id != "current_lp"
    }
    if not entries or repetitions <= 0:
        return {"repetitions": 0, "n_entries": len(entries), "models": {}}
    for _ in range(repetitions):
        sampled = [entries[rng.randrange(len(entries))] for _ in entries]
        means = {
            model_id: statistics.fmean(
                by_model_entry[(model_id, entry)] for entry in sampled
            )
            for model_id in models
        }
        for model_id, value in means.items():
            samples[model_id].append(value)
        for model_id in deltas:
            deltas[model_id].append(means[model_id] - means["current_lp"])
    result: dict[str, Any] = {
        "repetitions": repetitions,
        "n_entries": len(entries),
        "metric": "MAE with no-prediction rows penalized as level 301",
        "models": {},
    }
    for model_id in models:
        model_result = {
            "mae_mean": statistics.fmean(samples[model_id]),
            "mae_ci95": [
                percentile(samples[model_id], 0.025),
                percentile(samples[model_id], 0.975),
            ],
        }
        if model_id != "current_lp":
            model_result["delta_mae_vs_current_mean"] = statistics.fmean(deltas[model_id])
            model_result["delta_mae_vs_current_ci95"] = [
                percentile(deltas[model_id], 0.025),
                percentile(deltas[model_id], 0.975),
            ]
        result["models"][model_id] = model_result
    return result


def monotonicity_records(
    monotonic: dict[tuple[str, int], dict[str, float]],
) -> list[dict[str, Any]]:
    model_lookup = {model.model_id: model for model in ALL_MODELS}
    records: list[dict[str, Any]] = []
    for (model_id, to_level), values in sorted(monotonic.items()):
        if not values["decreases"]:
            continue
        model = model_lookup[model_id]
        records.append({
            "model_id": model_id,
            "model_label": model.label,
            "primary_candidate": model.primary_candidate,
            "from_level": to_level - 1,
            "to_level": to_level,
            "comparisons": int(values["comparisons"]),
            "decreases": int(values["decreases"]),
            "decrease_rate": values["decreases"] / values["comparisons"],
            "eligibility_reversals": int(values["eligibility_reversals"]),
            "mean_relative_drop_when_decreasing": (
                values["sum_relative_drop"] / values["decreases"]
            ),
            "max_relative_drop": values["max_relative_drop"],
        })
    return records


def write_csv(path: Path, rows: Sequence[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    headers: list[str] = []
    seen: set[str] = set()
    for row in rows:
        for key in row:
            if key not in seen:
                headers.append(key)
                seen.add(key)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def json_ready(value: Any) -> Any:
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if isinstance(value, dict):
        return {str(key): json_ready(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_ready(item) for item in value]
    return value


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(json_ready(value), indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def benchmark_readme(manifest: dict[str, Any], bootstrap: dict[str, Any]) -> str:
    return f"""# Full model benchmark results

Generated by `tools/full_model_benchmark.py` at {manifest['generated_at_utc']}.

## Scope

- Canonical input: `Data/item_template_pruned.xlsm`, raw `all items` sheet.
- Source rows: {manifest['corpus']['source_rows']:,}.
- Modeled rows: {manifest['corpus']['included_rows']:,}.
- Excluded rows: {manifest['corpus']['excluded_rows']:,}.
- Train/test assignment is an entry-ID hash split with seed
  `{manifest['configuration']['split_seed']}` and test fraction
  {manifest['configuration']['test_fraction']:.1%}.
- Bootstrap: {bootstrap.get('repetitions', 0)} deterministic resamples of the
  held-out, pure-stat cohort.

## Files

- `manifest.json`: inputs, hashes, configuration, model definitions, and counts.
- `row-disposition.csv`: one row per canonical item, either modeled or excluded
  with explicit reasons.
- `exclusion-counts.csv` / `.json`: exclusion reason counts. Reasons can overlap.
- `predictions.csv`: item/model predictions and residuals.
- `metrics.csv` / `.json`: aggregate and stratified metrics.
- `bootstrap.json`: held-out MAE confidence intervals and paired deltas.
- `monotonicity.csv` / `.json`: decreases in the combined eligibility margin,
  grouped by model and level transition.

## Important limitations

Listed ItemLevel is treated as a noisy diagnostic label, not unquestioned ground
truth. The clean corpus excludes all rows with spell/proc/on-use IDs, unsupported
identifier tuples, unsupported stat IDs, negative values, malformed stat pairs,
or no budget-bearing components. Base armor, damage, sell value, set bonuses,
required level, and hidden effects are not part of this stat-budget benchmark.

Socket-bearing, spell-free rows are modeled as a separate `socket_augmented`
cohort using the current executable socket costs. Primary conclusions should use
the `pure_stats` held-out cohort first.

Expansion labels are defensible only for entries found in the curated armor
workbooks. Alternate same-era workbooks contribute entry labels but never extra
benchmark observations. Weapon expansion remains `unknown` because the two
weapon macro workbooks are byte-identical despite conflicting filenames.

The five primary candidates hold the current quality, slot, stat, and socket
coefficients fixed. This run does not refit those coefficients. Consequently it
tests model-shape compatibility with the current calibration, not the best
possible independent calibration of every family.

For peer models, `StatMod` remains stat cost. Primary `alpha_i` shares use
effective-cost values `z_i = amount_i * StatMod_i`. Raw-amount-share variants are
reported only as sensitivity analyses. The reciprocal-corrected effective-share
model is an algebraic duplicate of the `p=1.5` Lp candidate; it is retained in
outputs to make that derivation testable rather than presented as independent
evidence.

No-prediction rows retain a failure flag. Ordinary MAE uses predicted rows only;
`mae_with_level_301_failure_penalty` prevents a model from improving metrics by
failing on difficult items.

## Reproduce

```powershell
python tools/full_model_benchmark.py --bootstrap-reps 500 --output-dir Test/benchmark-results
```
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--workbook",
        type=Path,
        default=Path("Data/item_template_pruned.xlsm"),
    )
    parser.add_argument("--data-dir", type=Path, default=Path("Data"))
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("Test/benchmark-results"),
    )
    parser.add_argument("--split-seed", default="item-level-benchmark-v1")
    parser.add_argument("--test-fraction", type=float, default=0.20)
    parser.add_argument("--bootstrap-reps", type=int, default=500)
    parser.add_argument("--skip-expansion-joins", action="store_true")
    parser.add_argument("--max-rows", type=int)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not 0 < args.test_fraction < 1:
        raise SystemExit("--test-fraction must be between 0 and 1")
    if not args.workbook.exists():
        raise SystemExit(f"Workbook not found: {args.workbook}")

    if args.skip_expansion_joins:
        expansion_by_entry: dict[int, str] = {}
        expansion_sources: dict[int, str] = {}
        expansion_summary = {
            "method": "Skipped by --skip-expansion-joins",
            "source_row_counts": {},
            "labeled_entries": 0,
            "ambiguous_entries": 0,
            "label_counts": {},
        }
    else:
        expansion_by_entry, expansion_sources, expansion_summary = expansion_map(
            args.data_dir
        )

    items, dispositions, exclusion_counts = build_corpus(
        args.workbook,
        expansion_by_entry,
        expansion_sources,
        args.split_seed,
        args.test_fraction,
        args.max_rows,
    )
    predictions, monotonic = evaluate_items(items)
    metrics = stratified_metrics(predictions)
    bootstrap = bootstrap_test_mae(
        predictions, args.split_seed + ":bootstrap", args.bootstrap_reps
    )
    monotonic_rows = monotonicity_records(monotonic)

    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(output_dir / "row-disposition.csv", dispositions)
    exclusion_rows = [
        {"reason": reason, "count": count}
        for reason, count in sorted(exclusion_counts.items())
    ]
    write_csv(output_dir / "exclusion-counts.csv", exclusion_rows)
    write_json(output_dir / "exclusion-counts.json", exclusion_rows)
    write_csv(output_dir / "predictions.csv", predictions)
    write_csv(output_dir / "metrics.csv", metrics)
    write_json(output_dir / "metrics.json", metrics)
    write_json(output_dir / "bootstrap.json", bootstrap)
    write_csv(output_dir / "monotonicity.csv", monotonic_rows)
    write_json(output_dir / "monotonicity.json", monotonic_rows)

    included_by_cohort = Counter(item.cohort for item in items)
    included_by_split = Counter(item.split for item in items)
    included_by_expansion = Counter(item.expansion for item in items)
    manifest = {
        "schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "generator": str(Path(__file__).resolve()),
        "python_version": sys.version,
        "inputs": {
            "canonical_workbook": str(args.workbook.resolve()),
            "canonical_workbook_sha256": sha256_file(args.workbook),
            "canonical_sheet": "all items",
            "expansion_join": expansion_summary,
        },
        "configuration": {
            "maximum_supported_level": MAX_LEVEL,
            "split_seed": args.split_seed,
            "test_fraction": args.test_fraction,
            "bootstrap_repetitions": args.bootstrap_reps,
            "max_rows": args.max_rows,
            "failure_penalty_level": FAILURE_LEVEL,
        },
        "models": [asdict(model) for model in ALL_MODELS],
        "corpus": {
            "source_rows": len(dispositions),
            "included_rows": len(items),
            "excluded_rows": len(dispositions) - len(items),
            "included_by_cohort": dict(sorted(included_by_cohort.items())),
            "included_by_split": dict(sorted(included_by_split.items())),
            "included_by_expansion": dict(sorted(included_by_expansion.items())),
            "exclusion_reason_counts": dict(sorted(exclusion_counts.items())),
        },
        "outputs": {
            "row_disposition": "row-disposition.csv",
            "exclusion_counts_csv": "exclusion-counts.csv",
            "exclusion_counts_json": "exclusion-counts.json",
            "predictions": "predictions.csv",
            "metrics_csv": "metrics.csv",
            "metrics_json": "metrics.json",
            "bootstrap": "bootstrap.json",
            "monotonicity_csv": "monotonicity.csv",
            "monotonicity_json": "monotonicity.json",
        },
    }
    write_json(output_dir / "manifest.json", manifest)
    (output_dir / "README.md").write_text(
        benchmark_readme(manifest, bootstrap),
        encoding="utf-8",
    )

    print(json.dumps({
        "source_rows": len(dispositions),
        "included_rows": len(items),
        "excluded_rows": len(dispositions) - len(items),
        "included_by_cohort": dict(sorted(included_by_cohort.items())),
        "included_by_split": dict(sorted(included_by_split.items())),
        "output_dir": str(output_dir.resolve()),
    }, indent=2))


if __name__ == "__main__":
    main()
