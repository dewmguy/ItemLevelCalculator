#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const calculator = require('../calculator-core.js');

function argumentValue(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function percentile(sorted, fraction) {
  if (!sorted.length) {
    return null;
  }
  return sorted[Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * fraction)
  )];
}

function levelMetrics(rows) {
  const completed = rows.filter(row => Number.isFinite(row.error));
  const errors = completed.map(row => row.error);
  const absolute = errors.map(Math.abs).sort((left, right) => left - right);
  const totalChance = completed.reduce(
    (sum, row) => sum + row.chance,
    0
  );
  const weighted = predicate => totalChance === 0
    ? null
    : completed.reduce(
        (sum, row) => sum + (predicate(row.error) ? row.chance : 0),
        0
      ) / totalChance;
  return {
    cases: rows.length,
    completed: completed.length,
    failures: rows.length - completed.length,
    meanAbsoluteError: absolute.length
      ? absolute.reduce((sum, value) => sum + value, 0) / absolute.length
      : null,
    signedBias: errors.length
      ? errors.reduce((sum, value) => sum + value, 0) / errors.length
      : null,
    exactRate: absolute.length
      ? absolute.filter(value => value === 0).length / absolute.length
      : null,
    withinOneRate: absolute.length
      ? absolute.filter(value => value <= 1).length / absolute.length
      : null,
    withinTwoRate: absolute.length
      ? absolute.filter(value => value <= 2).length / absolute.length
      : null,
    chanceWeightedWithinOneRate: weighted(error => Math.abs(error) <= 1),
    chanceWeightedWithinTwoRate: weighted(error => Math.abs(error) <= 2),
    p95AbsoluteError: percentile(absolute, 0.95)
  };
}

function priceMetrics(rows) {
  const valid = rows.filter(row =>
    Number.isFinite(row.predictedSellPrice) &&
    row.expectedSellPrice > 0
  );
  const absolute = valid.map(row =>
    Math.abs(row.predictedSellPrice - row.expectedSellPrice)
  );
  const percentages = valid.map((row, index) =>
    absolute[index] / row.expectedSellPrice
  ).sort((left, right) => left - right);
  return {
    items: rows.length,
    completed: valid.length,
    failures: rows.length - valid.length,
    meanAbsoluteCopperError: absolute.length
      ? absolute.reduce((sum, value) => sum + value, 0) / absolute.length
      : null,
    meanAbsolutePercentageError: percentages.length
      ? percentages.reduce((sum, value) => sum + value, 0) /
        percentages.length
      : null,
    exactRate: valid.length
      ? valid.filter(row =>
          row.predictedSellPrice === row.expectedSellPrice
        ).length / valid.length
      : null,
    withinFivePercentRate: percentages.length
      ? percentages.filter(value => value <= 0.05).length /
        percentages.length
      : null,
    p95AbsolutePercentageError: percentile(percentages, 0.95)
  };
}

function damageMetrics(rows) {
  const valid = rows.filter(row =>
    Number.isFinite(row.predictedDps) &&
    Number.isFinite(row.expectedDps) &&
    row.expectedDps > 0
  );
  const absolute = valid.map(row =>
    Math.abs(row.predictedDps - row.expectedDps)
  );
  const percentages = valid.map((row, index) =>
    absolute[index] / row.expectedDps
  ).sort((left, right) => left - right);
  const endpointErrors = valid.flatMap(row => [
    Math.abs(row.predictedMinimum - row.expectedMinimum),
    Math.abs(row.predictedMaximum - row.expectedMaximum)
  ]);
  return {
    items: rows.length,
    completed: valid.length,
    failures: rows.length - valid.length,
    meanAbsoluteDpsError: absolute.length
      ? absolute.reduce((sum, value) => sum + value, 0) / absolute.length
      : null,
    meanAbsolutePercentageError: percentages.length
      ? percentages.reduce((sum, value) => sum + value, 0) /
        percentages.length
      : null,
    withinOneDpsRate: absolute.length
      ? absolute.filter(value => value <= 1).length / absolute.length
      : null,
    withinFivePercentRate: percentages.length
      ? percentages.filter(value => value <= 0.05).length /
        percentages.length
      : null,
    meanAbsoluteDamageEndpointError: endpointErrors.length
      ? endpointErrors.reduce((sum, value) => sum + value, 0) /
        endpointErrors.length
      : null,
    endpointsWithinTwoRate: endpointErrors.length
      ? endpointErrors.filter(value => value <= 2).length /
        endpointErrors.length
      : null,
    p95AbsoluteDpsError: percentile(
      absolute.sort((left, right) => left - right),
      0.95
    )
  };
}

function levelBand(level) {
  if (level <= 59) return '010-059';
  if (level <= 79) return '060-079';
  if (level <= 120) return '080-120';
  if (level <= 129) return '121-129';
  return '130-182';
}

function groupMetrics(rows, keyFunction) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyFunction(row);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(row);
  }
  return Object.fromEntries(
    [...grouped.entries()]
      .sort(([left], [right]) => String(left).localeCompare(String(right)))
      .map(([key, values]) => [key, levelMetrics(values)])
  );
}

function evaluateLevelCases(cases) {
  return cases.map(auditCase => {
    const calculation = calculator.calculate({
      mode: 'level',
      itemClass: auditCase.item_class,
      inventoryType: auditCase.inventory_type,
      quality: auditCase.quality,
      stats: auditCase.stats
    });
    const predictedLevel = calculation.ok
      ? calculation.result.level
      : null;
    return {
      caseId: auditCase.case_id,
      entry: auditCase.entry,
      enchantmentKind: auditCase.enchantment_kind,
      enchantmentId: auditCase.enchantment_id,
      enchantmentName: auditCase.enchantment_name,
      chance: auditCase.chance,
      clean: auditCase.clean_stat_model,
      itemClass: auditCase.item_class,
      inventoryType: auditCase.inventory_type,
      quality: auditCase.quality,
      expectedLevel: auditCase.expected_level,
      predictedLevel,
      error: predictedLevel === null
        ? null
        : predictedLevel - auditCase.expected_level,
      errors: calculation.ok ? [] : calculation.errors
    };
  });
}

function evaluatePrices(cases) {
  const firstByEntry = new Map();
  for (const auditCase of cases) {
    if (!firstByEntry.has(auditCase.entry)) {
      firstByEntry.set(auditCase.entry, auditCase);
    }
  }
  return [...firstByEntry.values()].map(auditCase => {
    const calculation = calculator.calculate({
      mode: 'price',
      itemClass: auditCase.item_class,
      inventoryType: auditCase.inventory_type,
      subclass: auditCase.subclass,
      quality: auditCase.quality,
      level: auditCase.expected_level
    });
    return {
      entry: auditCase.entry,
      itemName: auditCase.item_name,
      itemClass: auditCase.item_class,
      inventoryType: auditCase.inventory_type,
      subclass: auditCase.subclass,
      level: auditCase.expected_level,
      expectedSellPrice: auditCase.sell_price,
      predictedSellPrice: calculation.ok
        ? calculation.result.sell.totalCopper
        : null,
      source: calculation.ok ? calculation.result.source : null,
      errors: calculation.ok ? [] : calculation.errors
    };
  });
}

function evaluateDamage(cases) {
  const firstByEntry = new Map();
  for (const auditCase of cases) {
    if (auditCase.item_class === 2 &&
        auditCase.quality === 2 &&
        auditCase.clean_stat_model &&
        auditCase.damage_min > 0 &&
        auditCase.damage_max > 0 &&
        auditCase.delay > 0 &&
        !firstByEntry.has(auditCase.entry)) {
      firstByEntry.set(auditCase.entry, auditCase);
    }
  }
  return [...firstByEntry.values()].map(auditCase => {
    const calculation = calculator.calculate({
      mode: 'damage',
      itemClass: auditCase.item_class,
      inventoryType: auditCase.inventory_type,
      subclass: auditCase.subclass,
      quality: auditCase.quality,
      level: auditCase.expected_level,
      delay: auditCase.delay
    });
    const expectedDps =
      (auditCase.damage_min + auditCase.damage_max) / 2 /
      (auditCase.delay / 1000);
    return {
      entry: auditCase.entry,
      itemName: auditCase.item_name,
      inventoryType: auditCase.inventory_type,
      subclass: auditCase.subclass,
      level: auditCase.expected_level,
      expectedDps,
      predictedDps: calculation.ok ? calculation.result.dps : null,
      expectedMinimum: auditCase.damage_min,
      expectedMaximum: auditCase.damage_max,
      predictedMinimum: calculation.ok
        ? calculation.result.minimum
        : null,
      predictedMaximum: calculation.ok
        ? calculation.result.maximum
        : null,
      errors: calculation.ok ? [] : calculation.errors
    };
  });
}

function main() {
  const inputPath = path.resolve(argumentValue(
    '--input',
    'Test/random-enchantment-audit/results/cases.json'
  ));
  const outputPath = path.resolve(argumentValue(
    '--output',
    'Test/random-enchantment-audit/results/calculator-audit.json'
  ));
  const detailsPath = argumentValue('--details');
  const cases = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const levels = evaluateLevelCases(cases);
  const clean = levels.filter(row => row.clean);
  const prices = evaluatePrices(cases.filter(
    auditCase => auditCase.quality === 2
  ));
  const damage = evaluateDamage(cases);
  const report = {
    input: inputPath,
    statLevel: {
      all: levelMetrics(levels),
      clean: levelMetrics(clean),
      cleanByKind: groupMetrics(clean, row => row.enchantmentKind),
      cleanByQuality: groupMetrics(clean, row => String(row.quality)),
      cleanByQualityAndKind: groupMetrics(
        clean,
        row => `${row.quality}:${row.enchantmentKind}`
      ),
      cleanByQualityAndLevelBand: groupMetrics(
        clean,
        row => `${row.quality}:${levelBand(row.expectedLevel)}`
      ),
      cleanByLevelBand: groupMetrics(
        clean,
        row => levelBand(row.expectedLevel)
      ),
      cleanByInventoryType: groupMetrics(
        clean,
        row => String(row.inventoryType)
      )
    },
    sellPrice: {
      all: priceMetrics(prices),
      armor: priceMetrics(prices.filter(row => row.itemClass === 4)),
      weapons: priceMetrics(prices.filter(row => row.itemClass === 2))
    },
    weaponDamage: {
      cleanPhysicalWeapons: damageMetrics(damage)
    },
    requestedSpotChecks: {
      invasionBlade: {
        levelCases: levels.filter(row => row.entry === 36542),
        price: prices.find(row => row.entry === 36542) ?? null,
        damage: damage.find(row => row.entry === 36542) ?? null
      }
    }
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  if (detailsPath) {
    const resolvedDetails = path.resolve(detailsPath);
    fs.mkdirSync(path.dirname(resolvedDetails), { recursive: true });
    fs.writeFileSync(
      resolvedDetails,
      JSON.stringify({ levels, prices, damage }, null, 2) + '\n'
    );
  }
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main();
