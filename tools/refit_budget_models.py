#!/usr/bin/env python3
"""Train-only coefficient refit for the five stat-budget model candidates.

This script deliberately does not modify live application coefficients. It
uses the exact pure-stat corpus and deterministic entry-ID split produced by
``full_model_benchmark.py``. Each unique model family receives:

* positive monotone quality curves, represented by isotonic log-quality knots;
* positive, static/raw InventoryType ratios, anchored at armor chest = 1;
* positive stat multipliers, anchored at Strength = 1.

The reciprocal-corrected effective-share peer model is an algebraic duplicate
of the p=1.5 Lp model, so it reuses that fit and is reported as a duplicate.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
import statistics
import sys
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence

import numpy as np

from full_model_benchmark import (
    CURRENT_EXPONENT,
    FAILURE_LEVEL,
    LOG2_THREE,
    MAX_LEVEL,
    BenchmarkItem,
    build_corpus,
    json_ready,
    level_band,
    percentile,
    sha256_file,
    write_csv,
    write_json,
)


QUALITY_KNOTS = np.array([1, 40, 80, 100, 130, 136, 160, 200, 240, 300], dtype=float)
QUALITY_IDS = (2, 3, 4)
HUBER_DELTA = 0.15


@dataclass(frozen=True)
class RefitModel:
    model_id: str
    label: str
    family: str
    exponent: float
    duplicate_of: str = ""


MODELS = (
    RefitModel(
        "current_lp",
        "Current Lp p=ln(2)/ln(1.5)",
        "lp",
        CURRENT_EXPONENT,
    ),
    RefitModel("lp_p_1_5", "Lp p=1.5", "lp", 1.5),
    RefitModel(
        "lp_p_log2_3",
        "Lp p=ln(3)/ln(2)",
        "lp",
        LOG2_THREE,
    ),
    RefitModel(
        "peer_exact_effective_share",
        "Peer formula as written",
        "peer_exact",
        1.5,
    ),
    RefitModel(
        "peer_reciprocal_effective_share",
        "Reciprocal-corrected peer 3/2 norm",
        "lp",
        1.5,
        duplicate_of="lp_p_1_5",
    ),
)


@dataclass
class Arrays:
    entries: np.ndarray
    levels: np.ndarray
    quality_index: np.ndarray
    slot_index: np.ndarray
    amounts: np.ndarray
    items: list[BenchmarkItem]
    stat_keys: list[str]
    slot_keys: list[str]


@dataclass
class Fit:
    model: RefitModel
    quality_log_knots: np.ndarray
    slot_log_ratios: np.ndarray
    stat_log_multipliers: np.ndarray
    history: list[dict[str, Any]]
    iterations: int
    final_train_loss: float


def pava_non_decreasing(values: np.ndarray) -> np.ndarray:
    """Unweighted least-squares isotonic projection."""
    levels: list[float] = []
    weights: list[int] = []
    for value in values.tolist():
        levels.append(float(value))
        weights.append(1)
        while len(levels) >= 2 and levels[-2] > levels[-1]:
            combined_weight = weights[-2] + weights[-1]
            combined_level = (
                levels[-2] * weights[-2] + levels[-1] * weights[-1]
            ) / combined_weight
            levels[-2:] = [combined_level]
            weights[-2:] = [combined_weight]
    result: list[float] = []
    for level, weight in zip(levels, weights):
        result.extend([level] * weight)
    return np.asarray(result, dtype=float)


def quality_interpolation(levels: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    high = np.searchsorted(QUALITY_KNOTS, levels, side="right")
    high = np.clip(high, 1, len(QUALITY_KNOTS) - 1)
    low = high - 1
    span = QUALITY_KNOTS[high] - QUALITY_KNOTS[low]
    weight_high = (levels - QUALITY_KNOTS[low]) / span
    return low, high, weight_high


def current_quality_initial(quality: int) -> np.ndarray:
    from full_model_benchmark import quality_mod

    values = np.asarray([
        max(float(quality_mod(quality, int(level))), 0.1)
        for level in QUALITY_KNOTS
    ])
    values = np.maximum.accumulate(values)
    return np.log(values)


def current_slot_initial(slot_key: str) -> float:
    from full_model_benchmark import slot_mod

    item_class, slot = (int(value) for value in slot_key.split(":"))
    value = slot_mod(item_class, slot, 2, 1)
    return math.log(value if value and value > 0 else 1.0)


def load_fixed_expansion_and_split(
    fixed_results: Path,
) -> tuple[dict[int, str], dict[int, str], dict[str, Any]]:
    manifest = json.loads((fixed_results / "manifest.json").read_text(encoding="utf-8"))
    expansion: dict[int, str] = {}
    split: dict[int, str] = {}
    with (fixed_results / "row-disposition.csv").open(
        newline="", encoding="utf-8"
    ) as handle:
        for row in csv.DictReader(handle):
            if row["included"].casefold() != "true":
                continue
            entry = int(row["entry"])
            expansion[entry] = row["expansion"]
            split[entry] = row["split"]
    return expansion, split, manifest


def load_pure_corpus(
    workbook: Path,
    fixed_results: Path,
) -> tuple[list[BenchmarkItem], dict[str, Any]]:
    expansion, expected_split, fixed_manifest = load_fixed_expansion_and_split(
        fixed_results
    )
    configuration = fixed_manifest["configuration"]
    items, _, _ = build_corpus(
        workbook,
        expansion,
        {},
        configuration["split_seed"],
        float(configuration["test_fraction"]),
    )
    pure = [item for item in items if item.cohort == "pure_stats"]
    mismatches = [
        item.entry
        for item in pure
        if expected_split.get(item.entry) != item.split
    ]
    if mismatches:
        raise RuntimeError(
            f"{len(mismatches)} split assignments differ from fixed benchmark"
        )
    expected_count = fixed_manifest["corpus"]["included_by_cohort"]["pure_stats"]
    if len(pure) != expected_count:
        raise RuntimeError(
            f"Pure corpus count {len(pure)} differs from fixed result {expected_count}"
        )
    return pure, fixed_manifest


def make_arrays(items: Sequence[BenchmarkItem]) -> Arrays:
    stat_keys = sorted(
        {component.key for item in items for component in item.components},
        key=lambda key: (not key.isdigit(), int(key) if key.isdigit() else key),
    )
    slot_keys = sorted(
        {f"{item.item_class}:{item.slot}" for item in items},
        key=lambda key: tuple(int(value) for value in key.split(":")),
    )
    stat_index = {key: index for index, key in enumerate(stat_keys)}
    slot_index = {key: index for index, key in enumerate(slot_keys)}
    amounts = np.zeros((len(items), len(stat_keys)), dtype=float)
    for row_index, item in enumerate(items):
        for component in item.components:
            amounts[row_index, stat_index[component.key]] += component.amount
    return Arrays(
        entries=np.asarray([item.entry for item in items], dtype=np.int64),
        levels=np.asarray([item.actual_level for item in items], dtype=float),
        quality_index=np.asarray(
            [QUALITY_IDS.index(item.quality) for item in items], dtype=np.int64
        ),
        slot_index=np.asarray(
            [slot_index[f"{item.item_class}:{item.slot}"] for item in items],
            dtype=np.int64,
        ),
        amounts=amounts,
        items=list(items),
        stat_keys=stat_keys,
        slot_keys=slot_keys,
    )


def quality_log_at(
    quality_log_knots: np.ndarray,
    quality_index: np.ndarray,
    levels: np.ndarray,
) -> np.ndarray:
    low, high, weight_high = quality_interpolation(levels)
    return (
        quality_log_knots[quality_index, low] * (1 - weight_high)
        + quality_log_knots[quality_index, high] * weight_high
    )


def requirement_and_gradient(
    model: RefitModel,
    amounts: np.ndarray,
    stat_log_multipliers: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    multipliers = np.exp(stat_log_multipliers)
    effective = amounts * multipliers[None, :]
    if model.family == "peer_exact":
        total = effective.sum(axis=1)
        powered = effective ** 1.5
        powered_total = powered.sum(axis=1)
        share_one = np.divide(
            effective,
            total[:, None],
            out=np.zeros_like(effective),
            where=total[:, None] > 0,
        )
        share_power = np.divide(
            powered,
            powered_total[:, None],
            out=np.zeros_like(powered),
            where=powered_total[:, None] > 0,
        )
        log_required = 2 * np.log(total) - (1 / 1.5) * np.log(powered_total)
        derivative = 2 * share_one - share_power
        return log_required, derivative
    powered = effective ** model.exponent
    powered_total = powered.sum(axis=1)
    log_required = np.log(powered_total) / model.exponent
    derivative = np.divide(
        powered,
        powered_total[:, None],
        out=np.zeros_like(powered),
        where=powered_total[:, None] > 0,
    )
    return log_required, derivative


def slot_exponent(model: RefitModel) -> float:
    return (model.exponent - 1) / model.exponent


def objective_and_gradients(
    model: RefitModel,
    arrays: Arrays,
    mask: np.ndarray,
    quality_log_knots: np.ndarray,
    slot_log_ratios: np.ndarray,
    stat_log_multipliers: np.ndarray,
    ridge: float,
) -> tuple[float, np.ndarray, np.ndarray, np.ndarray, dict[str, float]]:
    amounts = arrays.amounts[mask]
    levels = arrays.levels[mask]
    qualities = arrays.quality_index[mask]
    slots = arrays.slot_index[mask]
    log_quality = quality_log_at(quality_log_knots, qualities, levels)
    log_required, requirement_derivative = requirement_and_gradient(
        model, amounts, stat_log_multipliers
    )
    exponent = slot_exponent(model)
    residual = (
        log_quality + exponent * slot_log_ratios[slots] - log_required
    )
    absolute = np.abs(residual)
    losses = np.where(
        absolute <= HUBER_DELTA,
        0.5 * residual**2,
        HUBER_DELTA * (absolute - 0.5 * HUBER_DELTA),
    )
    psi = np.where(
        absolute <= HUBER_DELTA,
        residual,
        HUBER_DELTA * np.sign(residual),
    ) / len(residual)

    quality_gradient = np.zeros_like(quality_log_knots)
    low, high, weight_high = quality_interpolation(levels)
    np.add.at(
        quality_gradient,
        (qualities, low),
        psi * (1 - weight_high),
    )
    np.add.at(
        quality_gradient,
        (qualities, high),
        psi * weight_high,
    )
    slot_gradient = np.zeros_like(slot_log_ratios)
    np.add.at(slot_gradient, slots, psi * exponent)
    stat_gradient = -(psi[:, None] * requirement_derivative).sum(axis=0)

    slot_gradient += ridge * slot_log_ratios
    stat_gradient += ridge * stat_log_multipliers
    loss = float(losses.mean()) + 0.5 * ridge * float(
        np.sum(slot_log_ratios**2) + np.sum(stat_log_multipliers**2)
    )
    diagnostics = {
        "loss": loss,
        "log_capacity_mae": float(np.mean(absolute)),
        "log_capacity_rmse": float(np.sqrt(np.mean(residual**2))),
        "log_capacity_bias": float(np.mean(residual)),
    }
    return loss, quality_gradient, slot_gradient, stat_gradient, diagnostics


def fit_model(
    model: RefitModel,
    arrays: Arrays,
    train_mask: np.ndarray,
    iterations: int,
    learning_rate: float,
    ridge: float,
) -> Fit:
    quality_logs = np.vstack([
        current_quality_initial(quality) for quality in QUALITY_IDS
    ])
    slot_logs = np.asarray([
        current_slot_initial(slot_key) for slot_key in arrays.slot_keys
    ])
    stat_logs = np.zeros(len(arrays.stat_keys), dtype=float)

    chest_anchor = arrays.slot_keys.index("4:5")
    strength_anchor = arrays.stat_keys.index("4")
    slot_logs -= slot_logs[chest_anchor]
    stat_logs -= stat_logs[strength_anchor]

    moments = [
        np.zeros_like(quality_logs),
        np.zeros_like(slot_logs),
        np.zeros_like(stat_logs),
    ]
    velocities = [np.zeros_like(value) for value in moments]
    history: list[dict[str, Any]] = []
    best_loss = math.inf
    stale_checks = 0
    beta_one, beta_two = 0.9, 0.999
    completed = 0

    for iteration in range(1, iterations + 1):
        loss, quality_gradient, slot_gradient, stat_gradient, diagnostics = (
            objective_and_gradients(
                model,
                arrays,
                train_mask,
                quality_logs,
                slot_logs,
                stat_logs,
                ridge,
            )
        )
        gradients = [quality_gradient, slot_gradient, stat_gradient]
        parameters = [quality_logs, slot_logs, stat_logs]
        for index, (parameter, gradient) in enumerate(zip(parameters, gradients)):
            moments[index] = beta_one * moments[index] + (1 - beta_one) * gradient
            velocities[index] = (
                beta_two * velocities[index] + (1 - beta_two) * gradient**2
            )
            corrected_moment = moments[index] / (1 - beta_one**iteration)
            corrected_velocity = velocities[index] / (1 - beta_two**iteration)
            parameter -= (
                learning_rate
                * corrected_moment
                / (np.sqrt(corrected_velocity) + 1e-8)
            )

        for quality_index in range(len(QUALITY_IDS)):
            quality_logs[quality_index] = pava_non_decreasing(
                np.clip(quality_logs[quality_index], math.log(0.05), math.log(1000))
            )
        slot_logs[:] = np.clip(slot_logs, -4, 4)
        stat_logs[:] = np.clip(stat_logs, -4, 4)
        slot_logs -= slot_logs[chest_anchor]
        stat_logs -= stat_logs[strength_anchor]
        completed = iteration

        if iteration == 1 or iteration % 25 == 0 or iteration == iterations:
            history.append({
                "model_id": model.model_id,
                "iteration": iteration,
                **diagnostics,
            })
        if iteration % 50 == 0:
            if best_loss - loss > 1e-8:
                best_loss = loss
                stale_checks = 0
            else:
                stale_checks += 1
            if stale_checks >= 8:
                break

    final_loss, _, _, _, _ = objective_and_gradients(
        model,
        arrays,
        train_mask,
        quality_logs,
        slot_logs,
        stat_logs,
        ridge,
    )
    return Fit(
        model=model,
        quality_log_knots=quality_logs,
        slot_log_ratios=slot_logs,
        stat_log_multipliers=stat_logs,
        history=history,
        iterations=completed,
        final_train_loss=final_loss,
    )


def fitted_log_margin(
    fit: Fit,
    arrays: Arrays,
) -> np.ndarray:
    log_quality = quality_log_at(
        fit.quality_log_knots, arrays.quality_index, arrays.levels
    )
    log_required, _ = requirement_and_gradient(
        fit.model, arrays.amounts, fit.stat_log_multipliers
    )
    return (
        log_quality
        + slot_exponent(fit.model) * fit.slot_log_ratios[arrays.slot_index]
        - log_required
    )


def quality_log_scalar(
    fit: Fit,
    quality_index: int,
    level: int,
) -> float:
    levels = np.asarray([level], dtype=float)
    qualities = np.asarray([quality_index], dtype=np.int64)
    return float(quality_log_at(fit.quality_log_knots, qualities, levels)[0])


def item_required_log(fit: Fit, amounts: np.ndarray) -> float:
    required, _ = requirement_and_gradient(
        fit.model,
        amounts[None, :],
        fit.stat_log_multipliers,
    )
    return float(required[0])


def predict_levels(fit: Fit, arrays: Arrays) -> list[int | None]:
    required = [
        item_required_log(fit, arrays.amounts[index])
        for index in range(len(arrays.items))
    ]
    exponent = slot_exponent(fit.model)
    predictions: list[int | None] = []
    for index, item in enumerate(arrays.items):
        slot_capacity = exponent * fit.slot_log_ratios[arrays.slot_index[index]]
        predicted = None
        for level in range(1, MAX_LEVEL + 1):
            log_capacity = (
                quality_log_scalar(fit, arrays.quality_index[index], level)
                + slot_capacity
            )
            if log_capacity >= required[index]:
                predicted = level
                break
        predictions.append(predicted)
    return predictions


def metric_summary(rows: Sequence[dict[str, Any]]) -> dict[str, Any]:
    predicted = [row for row in rows if row["level_error"] is not None]
    level_errors = [float(row["level_error"]) for row in predicted]
    absolute = [abs(value) for value in level_errors]
    penalty = [float(row["failure_penalty_absolute_error"]) for row in rows]
    log_errors = [float(row["log_capacity_error"]) for row in rows]
    return {
        "n_total": len(rows),
        "n_predicted": len(predicted),
        "failures": len(rows) - len(predicted),
        "log_capacity_mae": statistics.fmean(abs(value) for value in log_errors),
        "log_capacity_rmse": math.sqrt(
            statistics.fmean(value * value for value in log_errors)
        ),
        "log_capacity_bias": statistics.fmean(log_errors),
        "item_level_mae": statistics.fmean(absolute) if absolute else None,
        "item_level_mae_with_level_301_failure_penalty": statistics.fmean(penalty),
        "item_level_median_absolute_error": (
            statistics.median(absolute) if absolute else None
        ),
        "item_level_rmse": (
            math.sqrt(statistics.fmean(value * value for value in level_errors))
            if level_errors else None
        ),
        "item_level_bias": (
            statistics.fmean(level_errors) if level_errors else None
        ),
        "item_level_exact_rate": (
            sum(value == 0 for value in absolute) / len(absolute)
            if absolute else None
        ),
        "item_level_within_1_rate": (
            sum(value <= 1 for value in absolute) / len(absolute)
            if absolute else None
        ),
        "item_level_within_2_rate": (
            sum(value <= 2 for value in absolute) / len(absolute)
            if absolute else None
        ),
        "item_level_p90_absolute_error": percentile(absolute, 0.90),
        "item_level_p95_absolute_error": percentile(absolute, 0.95),
    }


def make_predictions(
    fits: Sequence[Fit],
    arrays: Arrays,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for fit in fits:
        margins = fitted_log_margin(fit, arrays)
        predicted_levels = predict_levels(fit, arrays)
        for index, item in enumerate(arrays.items):
            predicted = predicted_levels[index]
            error = predicted - item.actual_level if predicted is not None else None
            penalty_error = (
                error if error is not None else FAILURE_LEVEL - item.actual_level
            )
            rows.append({
                "entry": item.entry,
                "model_id": fit.model.model_id,
                "model_label": fit.model.label,
                "duplicate_of": fit.model.duplicate_of,
                "split": item.split,
                "expansion": item.expansion,
                "quality": item.quality,
                "class": item.item_class,
                "slot": item.slot,
                "level_band": level_band(item.actual_level),
                "stat_count": item.stat_count,
                "actual_level": item.actual_level,
                "predicted_level": predicted,
                "level_error": error,
                "absolute_level_error": abs(error) if error is not None else None,
                "failure_penalty_absolute_error": abs(penalty_error),
                "failure_reason": (
                    "" if predicted is not None
                    else "fitted_quality_curve_does_not_reach_required_capacity"
                ),
                "log_capacity_error": float(margins[index]),
            })
    return rows


def stratified_metrics(predictions: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    dimensions = ("quality", "class", "slot", "level_band", "stat_count", "expansion")
    by_model: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in predictions:
        by_model[row["model_id"]].append(row)
    records: list[dict[str, Any]] = []
    for model in MODELS:
        model_rows = by_model[model.model_id]
        for split in ("train", "test", "all"):
            split_rows = (
                model_rows if split == "all"
                else [row for row in model_rows if row["split"] == split]
            )
            base = {
                "model_id": model.model_id,
                "model_label": model.label,
                "duplicate_of": model.duplicate_of,
                "split": split,
            }
            records.append({
                **base,
                "dimension": "overall",
                "stratum": "all",
                **metric_summary(split_rows),
            })
            for dimension in dimensions:
                grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
                for row in split_rows:
                    grouped[str(row[dimension])].append(row)
                for stratum, rows in sorted(grouped.items()):
                    records.append({
                        **base,
                        "dimension": dimension,
                        "stratum": stratum,
                        **metric_summary(rows),
                    })
    return records


def bootstrap_held_out(
    predictions: Sequence[dict[str, Any]],
    seed: str,
    repetitions: int,
) -> dict[str, Any]:
    held_out = [row for row in predictions if row["split"] == "test"]
    entries = sorted({int(row["entry"]) for row in held_out})
    by_model_entry = {
        (row["model_id"], int(row["entry"])): row for row in held_out
    }
    rng = random.Random(seed)
    samples: dict[str, dict[str, list[float]]] = {
        model.model_id: {"log_mae": [], "level_penalty_mae": []}
        for model in MODELS
    }
    deltas: dict[str, dict[str, list[float]]] = {
        model.model_id: {"log_mae": [], "level_penalty_mae": []}
        for model in MODELS if model.model_id != "current_lp"
    }
    for _ in range(repetitions):
        sampled = [entries[rng.randrange(len(entries))] for _ in entries]
        means: dict[str, dict[str, float]] = {}
        for model in MODELS:
            rows = [
                by_model_entry[(model.model_id, entry)] for entry in sampled
            ]
            means[model.model_id] = {
                "log_mae": statistics.fmean(
                    abs(float(row["log_capacity_error"])) for row in rows
                ),
                "level_penalty_mae": statistics.fmean(
                    float(row["failure_penalty_absolute_error"]) for row in rows
                ),
            }
            for metric, value in means[model.model_id].items():
                samples[model.model_id][metric].append(value)
        for model_id in deltas:
            for metric in deltas[model_id]:
                deltas[model_id][metric].append(
                    means[model_id][metric] - means["current_lp"][metric]
                )
    result: dict[str, Any] = {
        "repetitions": repetitions,
        "n_entries": len(entries),
        "sampling_unit": "held-out entry ID",
        "models": {},
        "selected_pairwise_deltas": {},
    }
    for model in MODELS:
        model_result: dict[str, Any] = {}
        for metric, values in samples[model.model_id].items():
            model_result[metric] = {
                "mean": statistics.fmean(values),
                "ci95": [
                    percentile(values, 0.025),
                    percentile(values, 0.975),
                ],
            }
            if model.model_id != "current_lp":
                delta_values = deltas[model.model_id][metric]
                model_result[metric]["delta_vs_current_mean"] = statistics.fmean(
                    delta_values
                )
                model_result[metric]["delta_vs_current_ci95"] = [
                    percentile(delta_values, 0.025),
                    percentile(delta_values, 0.975),
                ]
        result["models"][model.model_id] = model_result
    for left, right in (
        ("lp_p_log2_3", "lp_p_1_5"),
        ("lp_p_1_5", "current_lp"),
    ):
        comparison: dict[str, Any] = {}
        for metric in ("log_mae", "level_penalty_mae"):
            values = [
                left_value - right_value
                for left_value, right_value in zip(
                    samples[left][metric], samples[right][metric]
                )
            ]
            comparison[metric] = {
                "mean": statistics.fmean(values),
                "ci95": [
                    percentile(values, 0.025),
                    percentile(values, 0.975),
                ],
            }
        result["selected_pairwise_deltas"][f"{left}_minus_{right}"] = comparison
    return result


def coefficient_outputs(
    fits: Sequence[Fit],
    arrays: Arrays,
) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    document: dict[str, Any] = {}
    flat: list[dict[str, Any]] = []
    quality_curves: list[dict[str, Any]] = []
    for fit in fits:
        qualities: dict[str, Any] = {}
        for quality_index, quality in enumerate(QUALITY_IDS):
            knot_values = [
                {
                    "level": int(level),
                    "quality_value": math.exp(
                        fit.quality_log_knots[quality_index, knot_index]
                    ),
                }
                for knot_index, level in enumerate(QUALITY_KNOTS)
            ]
            qualities[str(quality)] = knot_values
            for knot in knot_values:
                flat.append({
                    "model_id": fit.model.model_id,
                    "coefficient_group": "quality_knot",
                    "key": f"quality={quality};level={knot['level']}",
                    "value": knot["quality_value"],
                    "anchor": False,
                })
            for level in range(1, MAX_LEVEL + 1):
                quality_curves.append({
                    "model_id": fit.model.model_id,
                    "quality": quality,
                    "level": level,
                    "quality_value": math.exp(
                        quality_log_scalar(fit, quality_index, level)
                    ),
                })
        slots = {
            key: math.exp(fit.slot_log_ratios[index])
            for index, key in enumerate(arrays.slot_keys)
        }
        stats = {
            key: math.exp(fit.stat_log_multipliers[index])
            for index, key in enumerate(arrays.stat_keys)
        }
        for key, value in slots.items():
            flat.append({
                "model_id": fit.model.model_id,
                "coefficient_group": "slot_ratio",
                "key": key,
                "value": value,
                "anchor": key == "4:5",
            })
        for key, value in stats.items():
            flat.append({
                "model_id": fit.model.model_id,
                "coefficient_group": "stat_multiplier",
                "key": key,
                "value": value,
                "anchor": key == "4",
            })
        document[fit.model.model_id] = {
            "model": asdict(fit.model),
            "quality_knots": qualities,
            "slot_ratios": slots,
            "stat_multipliers": stats,
            "anchors": {
                "strength_stat_key": "4",
                "strength_multiplier": stats["4"],
                "armor_chest_slot_key": "4:5",
                "armor_chest_ratio": slots["4:5"],
            },
            "iterations": fit.iterations,
            "final_train_loss": fit.final_train_loss,
        }
    return document, flat, quality_curves


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--workbook",
        type=Path,
        default=Path("Data/item_template_pruned.xlsm"),
    )
    parser.add_argument(
        "--fixed-results",
        type=Path,
        default=Path("Test/benchmark-results"),
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("Test/benchmark-refit-results"),
    )
    parser.add_argument("--iterations", type=int, default=1200)
    parser.add_argument("--learning-rate", type=float, default=0.03)
    parser.add_argument("--ridge", type=float, default=0.0001)
    parser.add_argument("--bootstrap-reps", type=int, default=500)
    return parser.parse_args()


def readme(manifest: dict[str, Any]) -> str:
    return f"""# Candidate-specific coefficient refit

Generated at {manifest['generated_at_utc']} by `tools/refit_budget_models.py`.

The refit uses the same {manifest['corpus']['rows']:,} pure-stat items and the
same deterministic entry-ID train/test split as `Test/benchmark-results/`.
Coefficients are fit on train rows only. Held-out metrics are in `metrics.csv`
and `metrics.json`.

Each candidate receives positive monotone quality curves, positive raw/static
InventoryType ratios, and positive stat multipliers. Strength is fixed at 1 and
armor chest is fixed at 1 to remove scale indeterminacy. Quality is represented
by monotone log-linear knots at levels
{', '.join(str(value) for value in manifest['configuration']['quality_knots'])}.
The training objective is Huber loss on log capacity at the listed item level.

`peer_reciprocal_effective_share` is not independent: with
`alpha_i = z_i / sum(z)` and `z_i = amount_i * StatMod_i`, its reciprocal
correction is exactly the p=1.5 Lp norm. It therefore reuses the
`lp_p_1_5` fit.

## Limitations

- ItemLevel is a noisy diagnostic label, not unquestioned ground truth.
- Splitting is by entry ID, not item family/set/drop source. Related item
  families may cross train and test.
- No nested cross-validation or hyperparameter selection was implemented.
- Expansion labels are incomplete for weapons.
- Spell/proc/on-use and socket-bearing items are excluded by using the fixed
  benchmark's pure-stat cohort.
- Stat multipliers are static in this refit. It does not reproduce the app's
  level-, quality-, and slot-dependent special-stat breakpoints.
- Quality curves share fixed knots selected before fitting; alternative knot
  counts were not tuned on a nested validation set.
- Coefficients are experimental outputs only and are not written into the app.

## Outputs

- `manifest.json`: configuration, hashes, corpus counts, and model definitions.
- `coefficients.json` / `.csv`: fitted quality, slot, and stat parameters.
- `quality-curves.csv`: fitted positive monotone values for levels 1-300.
- `predictions.csv`: train/test log-capacity and item-level residuals.
- `metrics.csv` / `.json`: overall and stratified train/test metrics.
- `bootstrap.json`: paired held-out confidence intervals by entry ID.
- `training-history.csv`: deterministic optimizer diagnostics.

## Reproduce

Run the fixed-coefficient benchmark first, then:

```powershell
python tools/refit_budget_models.py --iterations 1200 --output-dir Test/benchmark-refit-results
```
"""


def main() -> None:
    args = parse_args()
    items, fixed_manifest = load_pure_corpus(args.workbook, args.fixed_results)
    arrays = make_arrays(items)
    train_mask = np.asarray([item.split == "train" for item in items], dtype=bool)
    test_mask = ~train_mask

    fits_by_id: dict[str, Fit] = {}
    training_history: list[dict[str, Any]] = []
    for model in MODELS:
        if model.duplicate_of:
            source = fits_by_id[model.duplicate_of]
            fit = Fit(
                model=model,
                quality_log_knots=source.quality_log_knots.copy(),
                slot_log_ratios=source.slot_log_ratios.copy(),
                stat_log_multipliers=source.stat_log_multipliers.copy(),
                history=[],
                iterations=source.iterations,
                final_train_loss=source.final_train_loss,
            )
        else:
            fit = fit_model(
                model,
                arrays,
                train_mask,
                args.iterations,
                args.learning_rate,
                args.ridge,
            )
            training_history.extend(fit.history)
        fits_by_id[model.model_id] = fit
    fits = [fits_by_id[model.model_id] for model in MODELS]

    predictions = make_predictions(fits, arrays)
    metrics = stratified_metrics(predictions)
    bootstrap = bootstrap_held_out(
        predictions,
        fixed_manifest["configuration"]["split_seed"] + ":refit-bootstrap",
        args.bootstrap_reps,
    )
    coefficients, coefficient_rows, quality_curves = coefficient_outputs(
        fits, arrays
    )

    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    write_json(output_dir / "coefficients.json", coefficients)
    write_csv(output_dir / "coefficients.csv", coefficient_rows)
    write_csv(output_dir / "quality-curves.csv", quality_curves)
    write_csv(output_dir / "predictions.csv", predictions)
    write_csv(output_dir / "metrics.csv", metrics)
    write_json(output_dir / "metrics.json", metrics)
    write_json(output_dir / "bootstrap.json", bootstrap)
    write_csv(output_dir / "training-history.csv", training_history)

    manifest = {
        "schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "generator": str(Path(__file__).resolve()),
        "python_version": sys.version,
        "numpy_version": np.__version__,
        "inputs": {
            "canonical_workbook": str(args.workbook.resolve()),
            "canonical_workbook_sha256": sha256_file(args.workbook),
            "fixed_results_manifest": str(
                (args.fixed_results / "manifest.json").resolve()
            ),
            "fixed_results_manifest_sha256": sha256_file(
                args.fixed_results / "manifest.json"
            ),
        },
        "configuration": {
            "iterations_requested": args.iterations,
            "learning_rate": args.learning_rate,
            "ridge": args.ridge,
            "huber_delta": HUBER_DELTA,
            "quality_knots": QUALITY_KNOTS.astype(int).tolist(),
            "quality_parameterization": (
                "positive exp(logQ), piecewise linear in logQ, PAVA-projected "
                "nondecreasing after every optimizer step"
            ),
            "slot_anchor": "class=4,InventoryType=5 => 1",
            "stat_anchor": "Strength stat_type=4 => 1",
            "split_seed": fixed_manifest["configuration"]["split_seed"],
            "test_fraction": fixed_manifest["configuration"]["test_fraction"],
            "nested_cross_validation": False,
            "split_group": "entry ID",
            "bootstrap_repetitions": args.bootstrap_reps,
        },
        "models": [asdict(model) for model in MODELS],
        "corpus": {
            "rows": len(items),
            "train_rows": int(train_mask.sum()),
            "test_rows": int(test_mask.sum()),
            "by_expansion": dict(sorted(Counter(item.expansion for item in items).items())),
            "by_quality": dict(sorted(Counter(item.quality for item in items).items())),
            "stat_keys": arrays.stat_keys,
            "slot_keys": arrays.slot_keys,
        },
        "outputs": {
            "coefficients_json": "coefficients.json",
            "coefficients_csv": "coefficients.csv",
            "quality_curves": "quality-curves.csv",
            "predictions": "predictions.csv",
            "metrics_csv": "metrics.csv",
            "metrics_json": "metrics.json",
            "bootstrap": "bootstrap.json",
            "training_history": "training-history.csv",
        },
        "limitations": [
            "Entry-ID split, not item-family grouping.",
            "No nested cross-validation or hyperparameter tuning.",
            "Incomplete expansion labels, especially for weapons.",
            "Pure-stat rows only; spells/procs and sockets excluded.",
            "Static fitted stat multipliers do not reproduce dynamic special-stat breakpoints.",
            "Experimental coefficients are not applied to the live app.",
        ],
    }
    write_json(output_dir / "manifest.json", manifest)
    (output_dir / "README.md").write_text(readme(manifest), encoding="utf-8")

    held_out = [
        row for row in metrics
        if row["split"] == "test"
        and row["dimension"] == "overall"
    ]
    print(json.dumps(json_ready({
        "corpus": manifest["corpus"],
        "held_out_overall": held_out,
        "output_dir": str(output_dir.resolve()),
    }), indent=2))


if __name__ == "__main__":
    main()
