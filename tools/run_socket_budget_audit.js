#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const budgetModel = require('../budget-model.js');
const identifiers = require('../item-identifiers.js');
const modelMath = require('../model-math.js');

const DEFAULT_EXPONENT = modelMath.DEFAULT_EXPONENT;
const MAXIMUM_LEVEL = budgetModel.MAXIMUM_ITEM_LEVEL;

function parseArgs(argv) {
  const options = {
    input: 'Test/socket-budget-audit/cases.json',
    output: 'Test/socket-budget-audit/report.json'
  };
  for (let index = 2; index < argv.length; index++) {
    if (argv[index] === '--input') {
      options.input = argv[++index];
    }
    else if (argv[index] === '--output') {
      options.output = argv[++index];
    }
    else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

function splitForEntry(entry) {
  const digest = crypto
    .createHash('sha256')
    .update(`socket-budget-audit-v1:${entry}`)
    .digest();
  return digest.readUInt32BE(0) / 0x100000000 < 0.2 ? 'test' : 'train';
}

function category(auditCase) {
  if ([2, 11, 14, 23].includes(auditCase.inventory_type)) {
    return 'accessory';
  }
  return auditCase.item_class === 2 ? 'weapon' : 'armor';
}

function levelBand(level) {
  if (level <= 129) {
    return '100-129';
  }
  if (level <= 159) {
    return '130-159';
  }
  if (level <= 189) {
    return '160-189';
  }
  return '190-200';
}

function baseStatBudget(auditCase, level, exponent = DEFAULT_EXPONENT) {
  let total = 0;
  for (const stat of auditCase.stats) {
    const statMod = budgetModel.statMod(
      stat.type,
      auditCase.inventory_type,
      auditCase.quality,
      level,
      auditCase.item_class
    );
    if (!modelMath.isFinitePositive(statMod) ||
        !modelMath.isFinitePositive(stat.amount)) {
      return null;
    }
    total += modelMath.statBudget(stat.amount, statMod, exponent);
  }
  return total;
}

function thresholdBudget(auditCase, level, exponent = DEFAULT_EXPONENT) {
  const capacity = budgetModel.budgetCapacityAtLevel({
    itemClass: auditCase.item_class,
    inventoryType: auditCase.inventory_type,
    quality: auditCase.quality,
    level,
    exponent
  });
  return modelMath.isFinitePositive(capacity)
    ? Math.pow(capacity, exponent)
    : null;
}

function predictedLevel(
  auditCase,
  socketCostAtLevel,
  exponent = DEFAULT_EXPONENT
) {
  for (let level = 1; level <= MAXIMUM_LEVEL; level++) {
    const threshold = thresholdBudget(auditCase, level, exponent);
    const stats = baseStatBudget(auditCase, level, exponent);
    if (!modelMath.isFinitePositive(threshold) ||
        stats === null) {
      continue;
    }
    const socketCost = socketCostAtLevel(auditCase, level);
    const socketBudget = auditCase.sockets.length *
      Math.pow(socketCost, exponent);
    if (threshold >= stats + socketBudget) {
      return level;
    }
  }
  return null;
}

function percentile(values, probability) {
  if (!values.length) {
    return null;
  }
  const ordered = [...values].sort((left, right) => left - right);
  const index = (ordered.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return ordered[lower];
  }
  const weight = index - lower;
  return ordered[lower] * (1 - weight) + ordered[upper] * weight;
}

function metrics(rows) {
  const predicted = rows.filter(row => row.predicted_level !== null);
  const errors = predicted.map(row => row.error);
  const absolute = errors.map(Math.abs);
  return {
    count: rows.length,
    predicted_count: predicted.length,
    mae: absolute.length
      ? absolute.reduce((sum, value) => sum + value, 0) / absolute.length
      : null,
    bias: errors.length
      ? errors.reduce((sum, value) => sum + value, 0) / errors.length
      : null,
    median_absolute_error: percentile(absolute, 0.5),
    within_1: absolute.length
      ? absolute.filter(value => value <= 1).length / absolute.length
      : null,
    within_2: absolute.length
      ? absolute.filter(value => value <= 2).length / absolute.length
      : null,
    p95_absolute_error: percentile(absolute, 0.95)
  };
}

function groupMetrics(rows, keyFunction) {
  const groups = new Map();
  for (const row of rows) {
    const key = String(keyFunction(row));
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(row);
  }
  return Object.fromEntries(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => [key, metrics(values)])
  );
}

function evaluate(cases, socketCostAtLevel, label) {
  return cases.map(auditCase => {
    const itemCategory = category(auditCase);
    const level = predictedLevel(auditCase, socketCostAtLevel);
    const socketCost = auditCase.sockets.length
      ? socketCostAtLevel(auditCase, auditCase.actual_level)
      : 0;
    return {
      model: label,
      entry: auditCase.entry,
      name: auditCase.name,
      actual_level: auditCase.actual_level,
      predicted_level: level,
      error: level === null ? null : level - auditCase.actual_level,
      item_class: auditCase.item_class,
      inventory_type: auditCase.inventory_type,
      category: itemCategory,
      socket_count: auditCase.sockets.length,
      socket_cost: socketCost,
      split: splitForEntry(auditCase.entry),
      level_band: levelBand(auditCase.actual_level)
    };
  });
}

function objective(rows) {
  const summary = metrics(rows);
  return [
    summary.mae ?? Number.POSITIVE_INFINITY,
    Math.abs(summary.bias ?? Number.POSITIVE_INFINITY)
  ];
}

function isBetter(candidate, incumbent) {
  return candidate[0] < incumbent[0] - 1e-12 ||
    (Math.abs(candidate[0] - incumbent[0]) <= 1e-12 &&
     candidate[1] < incumbent[1]);
}

function fitCost(cases) {
  let best = {
    cost: null,
    objective: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
  };
  for (let cost = 1; cost <= 80; cost += 0.25) {
    const rows = evaluate(
      cases,
      () => cost,
      'candidate'
    );
    const candidateObjective = objective(rows);
    if (isBetter(candidateObjective, best.objective)) {
      best = { cost, objective: candidateObjective };
    }
  }
  return best;
}

function summarizeModel(rows) {
  return {
    all: metrics(rows),
    socketed: metrics(rows.filter(row => row.socket_count > 0)),
    unsocketed: metrics(rows.filter(row => row.socket_count === 0)),
    socketed_test: metrics(rows.filter(
      row => row.socket_count > 0 && row.split === 'test'
    )),
    socketed_by_category: groupMetrics(
      rows.filter(row => row.socket_count > 0),
      row => row.category
    ),
    socketed_test_by_category: groupMetrics(
      rows.filter(
        row => row.socket_count > 0 && row.split === 'test'
      ),
      row => row.category
    ),
    socketed_by_class: groupMetrics(
      rows.filter(row => row.socket_count > 0),
      row => row.item_class
    ),
    socketed_by_slot: groupMetrics(
      rows.filter(row => row.socket_count > 0),
      row => row.inventory_type
    ),
    socketed_by_count: groupMetrics(
      rows.filter(row => row.socket_count > 0),
      row => row.socket_count
    ),
    socketed_by_level_band: groupMetrics(
      rows.filter(row => row.socket_count > 0),
      row => row.level_band
    )
  };
}

function impliedCosts(cases) {
  return cases
    .filter(auditCase => auditCase.sockets.length > 0)
    .map(auditCase => {
      const threshold = thresholdBudget(auditCase, auditCase.actual_level);
      const stats = baseStatBudget(auditCase, auditCase.actual_level);
      const remaining = threshold - stats;
      const perSocketBudget = remaining / auditCase.sockets.length;
      return {
        entry: auditCase.entry,
        name: auditCase.name,
        actual_level: auditCase.actual_level,
        item_class: auditCase.item_class,
        inventory_type: auditCase.inventory_type,
        category: category(auditCase),
        socket_count: auditCase.sockets.length,
        remaining_budget: remaining,
        implied_socket_cost: perSocketBudget > 0
          ? Math.pow(perSocketBudget, 1 / DEFAULT_EXPONENT)
          : null
      };
    });
}

function impliedSummary(rows) {
  const valid = rows.filter(row => row.implied_socket_cost !== null);
  const values = valid.map(row => row.implied_socket_cost);
  return {
    count: rows.length,
    positive_count: valid.length,
    median: percentile(values, 0.5),
    p25: percentile(values, 0.25),
    p75: percentile(values, 0.75)
  };
}

function main() {
  const options = parseArgs(process.argv);
  const payload = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  const cases = payload.cases.filter(auditCase =>
    identifiers.isSupportedItemTuple(
      auditCase.item_class,
      auditCase.inventory_type,
      auditCase.subclass
    )
  );
  const socketedTrain = cases.filter(auditCase =>
    auditCase.sockets.length > 0 &&
    splitForEntry(auditCase.entry) === 'train'
  );
  const fittedCosts = {};
  for (const itemCategory of ['accessory', 'armor', 'weapon']) {
    const categoryCases = socketedTrain.filter(
      auditCase => category(auditCase) === itemCategory
    );
    fittedCosts[itemCategory] = categoryCases.length
      ? fitCost(categoryCases).cost
      : null;
  }
  const currentCosts = {
    accessory: 10,
    armor: 20,
    weapon: 20
  };
  const currentCostAtLevel = auditCase => currentCosts[category(auditCase)];
  const fittedCostAtLevel = auditCase => fittedCosts[category(auditCase)];
  const levelScaledCost = (_auditCase, level) => level / 5;
  const wrathScaledCost = (auditCase, level) => level >= 130
    ? level / 5
    : currentCostAtLevel(auditCase, level);
  const wrathScaledAccessoryCost = (auditCase, level) => {
    if (level < 130) {
      return currentCostAtLevel(auditCase, level);
    }
    return level / (category(auditCase) === 'accessory' ? 6 : 5);
  };
  const continuousRampCost = (auditCase, level) => {
    const itemCategory = category(auditCase);
    const base = itemCategory === 'accessory' ? 10 : 20;
    const slope = itemCategory === 'accessory' ? 0.3 : 0.25;
    return base + Math.max(0, level - 120) * slope;
  };
  const continuousWrathRampCost = (auditCase, level) => {
    const itemCategory = category(auditCase);
    const base = itemCategory === 'accessory' ? 10 : 20;
    const slope = itemCategory === 'accessory' ? 1 / 3 : 2 / 7;
    return base + Math.max(0, level - 130) * slope;
  };
  const currentRows = evaluate(cases, currentCostAtLevel, 'current');
  const fittedRows = evaluate(cases, fittedCostAtLevel, 'fitted_constant');
  const levelScaledRows = evaluate(
    cases,
    levelScaledCost,
    'level_divided_by_5'
  );
  const wrathScaledRows = evaluate(
    cases,
    wrathScaledCost,
    'wrath_level_divided_by_5'
  );
  const wrathScaledAccessoryRows = evaluate(
    cases,
    wrathScaledAccessoryCost,
    'wrath_scaled_accessory'
  );
  const continuousRampRows = evaluate(
    cases,
    continuousRampCost,
    'continuous_ramp'
  );
  const continuousWrathRampRows = evaluate(
    cases,
    continuousWrathRampCost,
    'continuous_wrath_ramp'
  );
  const implied = impliedCosts(cases);
  const report = {
    source_summary: payload.summary,
    modeled_cases: cases.length,
    modeled_socketed_cases: cases.filter(
      auditCase => auditCase.sockets.length > 0
    ).length,
    current_costs: currentCosts,
    fitted_costs: fittedCosts,
    current: summarizeModel(currentRows),
    fitted: summarizeModel(fittedRows),
    level_scaled: summarizeModel(levelScaledRows),
    wrath_scaled: summarizeModel(wrathScaledRows),
    wrath_scaled_accessory: summarizeModel(wrathScaledAccessoryRows),
    continuous_ramp: summarizeModel(continuousRampRows),
    continuous_wrath_ramp: summarizeModel(continuousWrathRampRows),
    implied_socket_cost: {
      all: impliedSummary(implied),
      by_category: Object.fromEntries(
        ['accessory', 'armor', 'weapon'].map(itemCategory => [
          itemCategory,
          impliedSummary(implied.filter(
            row => row.category === itemCategory
          ))
        ])
      ),
      by_socket_count: Object.fromEntries(
        [1, 2, 3].map(count => [
          String(count),
          impliedSummary(implied.filter(row => row.socket_count === count))
        ])
      )
    },
    examples: {
      patina_coated_breastplate: continuousWrathRampRows.find(
        row => row.entry === 37672
      ),
      bonegrinder_breastplate: continuousWrathRampRows.find(
        row => row.entry === 37612
      )
    },
    predictions: continuousWrathRampRows,
    implied_rows: implied
  };
  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    modeled_cases: report.modeled_cases,
    modeled_socketed_cases: report.modeled_socketed_cases,
    current_costs: report.current_costs,
    fitted_costs: report.fitted_costs,
    current_socketed: report.current.socketed,
    fitted_socketed: report.fitted.socketed,
    current_socketed_test: report.current.socketed_test,
    fitted_socketed_test: report.fitted.socketed_test,
    level_scaled_socketed: report.level_scaled.socketed,
    level_scaled_socketed_test: report.level_scaled.socketed_test,
    wrath_scaled_socketed: report.wrath_scaled.socketed,
    wrath_scaled_socketed_test: report.wrath_scaled.socketed_test,
    wrath_scaled_accessory_socketed: report.wrath_scaled_accessory.socketed,
    wrath_scaled_accessory_socketed_test:
      report.wrath_scaled_accessory.socketed_test,
    continuous_ramp_socketed: report.continuous_ramp.socketed,
    continuous_ramp_socketed_test: report.continuous_ramp.socketed_test,
    continuous_wrath_ramp_socketed:
      report.continuous_wrath_ramp.socketed,
    continuous_wrath_ramp_socketed_test:
      report.continuous_wrath_ramp.socketed_test,
    implied_socket_cost: report.implied_socket_cost,
    examples: report.examples
  }, null, 2));
  console.log(`Wrote ${options.output}`);
}

main();
