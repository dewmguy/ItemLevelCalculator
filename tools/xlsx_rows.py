#!/usr/bin/env python3
"""Read XLSX/XLSM worksheet rows without evaluating formulas.

This small standard-library helper is shared by audit scripts that need the
canonical local workbook. It never modifies the source file.
"""

from __future__ import annotations

import math
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path, PurePosixPath
from typing import Any, Iterator, Sequence


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


def column_number(cell_reference: str) -> int:
    letters = "".join(
        character for character in cell_reference if character.isalpha()
    )
    result = 0
    for character in letters:
        result = result * 26 + ord(character.upper()) - 64
    return result - 1


def scalar(
    value: str | None,
    cell_type: str | None,
    shared: Sequence[str],
) -> Any:
    if value is None or value == "":
        return None
    if cell_type == "s":
        return shared[int(value)]
    if cell_type in {"str", "inlineStr"}:
        return value
    if cell_type == "b":
        return value == "1"
    try:
        parsed = float(value)
    except ValueError:
        return value
    return int(parsed) if parsed.is_integer() else parsed


def workbook_sheet_targets(
    archive: zipfile.ZipFile,
) -> list[tuple[str, str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationships = ET.fromstring(
        archive.read("xl/_rels/workbook.xml.rels")
    )
    target_by_id = {
        relationship.attrib["Id"]: relationship.attrib["Target"]
        for relationship in relationships.findall(
            f"{{{PKG_REL_NS}}}Relationship"
        )
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
    return [
        "".join(text.text or "" for text in item.iter(f"{{{MAIN_NS}}}t"))
        for item in root.findall(f"{{{MAIN_NS}}}si")
    ]


def iter_xlsx_rows(
    path: Path,
    sheet_name: str | None = None,
) -> Iterator[dict[str, Any]]:
    """Yield worksheet rows as header-keyed dictionaries."""
    with zipfile.ZipFile(path) as archive:
        targets = workbook_sheet_targets(archive)
        if not targets:
            return
        if sheet_name is None:
            _, target = targets[0]
        else:
            matching = [
                target
                for name, target in targets
                if name.casefold() == sheet_name.casefold()
            ]
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
                                text.text or ""
                                for text in inline.iter(f"{{{MAIN_NS}}}t")
                            )
                    values_by_column[column_number(reference)] = scalar(
                        value,
                        cell_type,
                        shared,
                    )
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
