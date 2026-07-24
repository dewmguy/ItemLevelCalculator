'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const math = require('../model-math.js');

const nearlyEqual = (actual, expected, tolerance = 1e-12) => {
  const scale = Math.max(1, Math.abs(actual), Math.abs(expected));
  assert.ok(
    Math.abs(actual - expected) <= tolerance * scale,
    `expected ${actual} to be within ${tolerance} relative tolerance of ${expected}`
  );
};

const lpNorm = (values, exponent) =>
  Math.pow(values.reduce(
    (sum, value) => sum + math.statBudget(value, 1, exponent),
    0
  ), 1 / exponent);

test('stat budget is homogeneous for every candidate Lp exponent', () => {
  const exponents = [
    math.DEFAULT_EXPONENT,
    1.5,
    Math.log(3) / Math.log(2)
  ];

  for (const exponent of exponents) {
    for (const amount of [0.25, 1, 53, 100]) {
      for (const statMod of [0.5, 0.703125, 1, 3]) {
        for (const scale of [0.5, 2, 10]) {
          const base = math.statBudget(amount, statMod, exponent);
          const scaled = math.statBudget(amount * scale, statMod, exponent);
          nearlyEqual(scaled, Math.pow(scale, exponent) * base);
        }
      }
    }
  }
});

test('weighted forward and inverse transforms round trip for each candidate exponent', () => {
  const exponents = [
    math.DEFAULT_EXPONENT,
    1.5,
    Math.log(3) / Math.log(2)
  ];

  for (const exponent of exponents) {
    for (const amount of [0.25, 1, 53, 100, 247]) {
      for (const statMod of [0.5, 0.703125, 1, 3]) {
        const budget = math.statBudget(amount, statMod, exponent);
        const restored = math.statAmountFromBudget(budget, statMod, exponent);
        nearlyEqual(restored, amount);
      }
    }
  }
});

test('unrounded allocation shares exactly exhaust an Lp budget with heterogeneous costs', () => {
  const exponents = [math.DEFAULT_EXPONENT, 1.5];
  const shares = [0.1, 0.2, 0.3, 0.4];
  const statMods = [0.5, 0.703125, 1, 3];
  const totalBudget = 12345.6789;

  for (const exponent of exponents) {
    let restoredBudget = 0;
    for (let index = 0; index < shares.length; index += 1) {
      const allocation = totalBudget * shares[index];
      const amount = math.statAmountFromBudget(
        allocation,
        statMods[index],
        exponent
      );
      restoredBudget += math.statBudget(amount, statMods[index], exponent);
    }
    nearlyEqual(restoredBudget, totalBudget);
  }
});

test('reciprocal-corrected peer expression is identically the 3/2 norm', () => {
  const vectors = [
    [100],
    [50, 50],
    [12, 27, 61],
    [5, 17, 43, 99]
  ];

  for (const values of vectors) {
    const total = values.reduce((sum, value) => sum + value, 0);
    const distributionFactor = Math.pow(
      values.reduce(
        (sum, value) => sum + Math.pow(value / total, 1.5),
        0
      ),
      2 / 3
    );
    nearlyEqual(total * distributionFactor, lpNorm(values, 1.5));
  }
});

test('peer formula as written penalizes equal stat splits', () => {
  for (const count of [2, 3, 4, 10]) {
    const shares = Array(count).fill(1 / count);
    const distributionFactor = Math.pow(
      shares.reduce((sum, share) => sum + Math.pow(share, 1.5), 0),
      2 / 3
    );
    nearlyEqual(distributionFactor, Math.pow(count, -1 / 3));
    assert.ok(distributionFactor < 1);
  }
});

test('independent ceiling can overspend an exactly allocated nonlinear budget', () => {
  const exponent = math.DEFAULT_EXPONENT;
  const statMods = [0.5, 0.703125, 1, 3];
  const shares = [0.1, 0.2, 0.3, 0.4];
  const totalBudget = 1000;

  const roundedCost = shares.reduce((sum, share, index) => {
    const ideal = math.statAmountFromBudget(
      totalBudget * share,
      statMods[index],
      exponent
    );
    return sum + math.statBudget(
      Math.ceil(ideal),
      statMods[index],
      exponent
    );
  }, 0);

  assert.ok(roundedCost > totalBudget);
});
