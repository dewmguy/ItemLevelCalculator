#!/usr/bin/env python3
"""Fit continuous capacity curves to RandPropPoints DBC-to-SQL data.

The output coefficients use descending powers so they can be pasted directly
into random-property-points.js and evaluated with Horner's method.
Only the Python standard library is required.
"""

from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path
from typing import Sequence


QUALITY_COLUMNS = {
    "4": (1, 6),   # Epic
    "3": (6, 11),  # Superior / Rare
    "2": (11, 16), # Good / Uncommon
}


def parse_rows(path: Path) -> list[list[int]]:
    rows: list[list[int]] = []
    pattern = re.compile(r"VALUES\s*\(([^)]+)\)")
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        match = pattern.search(line)
        if match:
            rows.append([
                int(value.strip())
                for value in match.group(1).split(",")
            ])
    if not rows:
        raise ValueError(f"No RandPropPoints rows found in {path}")
    return rows


def solve(matrix: list[list[float]], values: list[float]) -> list[float]:
    size = len(values)
    augmented = [
        [*matrix[row], values[row]]
        for row in range(size)
    ]
    for column in range(size):
        pivot = max(
            range(column, size),
            key=lambda row: abs(augmented[row][column]),
        )
        if abs(augmented[pivot][column]) < 1e-15:
            raise ValueError("Polynomial normal equation is singular")
        augmented[column], augmented[pivot] = (
            augmented[pivot],
            augmented[column],
        )
        divisor = augmented[column][column]
        augmented[column] = [
            value / divisor for value in augmented[column]
        ]
        for row in range(size):
            if row == column:
                continue
            factor = augmented[row][column]
            augmented[row] = [
                left - factor * right
                for left, right in zip(
                    augmented[row],
                    augmented[column],
                )
            ]
    return [augmented[row][-1] for row in range(size)]


def polynomial_fit(
    x_values: Sequence[float],
    y_values: Sequence[float],
    degree: int,
) -> list[float]:
    order = degree + 1
    sums = [
        sum(x ** power for x in x_values)
        for power in range(degree * 2 + 1)
    ]
    matrix = [
        [sums[row + column] for column in range(order)]
        for row in range(order)
    ]
    values = [
        sum(y * x ** power for x, y in zip(x_values, y_values))
        for power in range(order)
    ]
    return list(reversed(solve(matrix, values)))


def evaluate(coefficients: Sequence[float], value: float) -> float:
    result = 0.0
    for coefficient in coefficients:
        result = result * value + coefficient
    return result


def metrics(
    coefficients: Sequence[float],
    x_values: Sequence[float],
    y_values: Sequence[float],
) -> dict[str, float]:
    errors = [
        evaluate(coefficients, x) - y
        for x, y in zip(x_values, y_values)
    ]
    return {
        "mean_absolute_error": (
            sum(abs(error) for error in errors) / len(errors)
        ),
        "maximum_absolute_error": max(abs(error) for error in errors),
        "rounded_exact_rate": (
            sum(
                math.floor(evaluate(coefficients, x) + 0.5) == y
                for x, y in zip(x_values, y_values)
            ) / len(y_values)
        ),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--degree", type=int, default=4)
    parser.add_argument("--start-level", type=int, default=10)
    args = parser.parse_args()

    rows = [
        row for row in parse_rows(args.input)
        if row[0] >= args.start_level
    ]
    output: dict[str, list[dict[str, object]]] = {}
    for quality, (start, end) in QUALITY_COLUMNS.items():
        output[quality] = []
        for column in range(start, end):
            x_values = [float(row[0]) for row in rows]
            y_values = [float(row[column]) for row in rows]
            coefficients = polynomial_fit(
                x_values,
                y_values,
                args.degree,
            )
            output[quality].append({
                "group": column - start,
                "coefficients": coefficients,
                "metrics": metrics(
                    coefficients,
                    x_values,
                    y_values,
                ),
            })
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
