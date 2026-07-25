(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ItemModelMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_EXPONENT = Math.log(2) / Math.log(1.5);
  const FERAL_WEAPON_INVENTORY_TYPES = Object.freeze([13, 17, 21, 22]);

  function statBudget(statAmount, statMod, exponent = DEFAULT_EXPONENT) {
    return Math.sign(statAmount) * Math.pow(
      Math.abs(statAmount) * statMod,
      exponent
    );
  }

  function statAmountFromBudget(statBudgetValue, statMod, exponent = DEFAULT_EXPONENT) {
    return Math.sign(statBudgetValue) * (
      Math.pow(Math.abs(statBudgetValue), 1 / exponent) / statMod
    );
  }

  function reconcileIntegerStatAmounts(
    allocations,
    totalBudget,
    exponent = DEFAULT_EXPONENT
  ) {
    if (!Array.isArray(allocations) ||
        !Number.isFinite(totalBudget) ||
        totalBudget < 0) {
      return null;
    }

    const normalized = allocations.map((allocation, index) => {
      if (!Number.isFinite(allocation.exactAmount) ||
          !isFinitePositive(allocation.statMod)) {
        return null;
      }
      const amount = Math.floor(allocation.exactAmount);
      return {
        index,
        amount,
        exactAmount: allocation.exactAmount,
        statMod: allocation.statMod
      };
    });
    if (normalized.some(allocation => allocation === null)) {
      return null;
    }

    let usedBudget = normalized.reduce(
      (sum, allocation) =>
        sum + statBudget(allocation.amount, allocation.statMod, exponent),
      0
    );
    const tolerance = Math.max(1, totalBudget) * 1e-12;
    if (usedBudget > totalBudget + tolerance) {
      return null;
    }

    const candidates = normalized
      .filter(allocation => allocation.exactAmount > allocation.amount)
      .sort((left, right) =>
        (right.exactAmount - right.amount) -
          (left.exactAmount - left.amount) ||
        left.index - right.index
      );

    for (const allocation of candidates) {
      const incrementCost =
        statBudget(allocation.amount + 1, allocation.statMod, exponent) -
        statBudget(allocation.amount, allocation.statMod, exponent);
      if (usedBudget + incrementCost <= totalBudget + tolerance) {
        allocation.amount += 1;
        usedBudget += incrementCost;
      }
    }

    normalized.sort((left, right) => left.index - right.index);
    return {
      amounts: normalized.map(allocation => allocation.amount),
      usedBudget,
      unusedBudget: Math.max(0, totalBudget - usedBudget)
    };
  }

  function isFeralWeaponInventoryType(inventoryTypeId) {
    return FERAL_WEAPON_INVENTORY_TYPES.includes(inventoryTypeId);
  }

  function feralAttackPowerFromDps(weaponDps, extraDps = 0) {
    if (!Number.isFinite(weaponDps) ||
        weaponDps < 0 ||
        !Number.isFinite(extraDps) ||
        extraDps < 0) {
      return null;
    }

    return Math.max(0, Math.trunc((weaponDps + extraDps) * 14) - 767);
  }

  function matchesSubclassRule(rule, subclassId) {
    if (rule == null) {
      return true;
    }

    const rules = Array.isArray(rule) ? rule : [rule];
    const included = rules.filter(value => value >= 0);
    const excluded = rules.filter(value => value < 0).map(value => -value);

    if (excluded.includes(subclassId)) {
      return false;
    }

    return included.length === 0 || included.includes(subclassId);
  }

  function findPiecewiseRow(rows, { subclassId, profile, level }) {
    const matchingRows = rows.filter(row =>
      matchesSubclassRule(row.sub, subclassId) &&
      level >= row.min &&
      level <= row.max
    );

    const profileMatch = matchingRows.find(row => row.type === profile);
    if (profileMatch) {
      return profileMatch;
    }

    // Named caster/feral profiles require their own validated regression.
    // Only the melee profile may intentionally use an untagged default row.
    if (profile != null && profile !== 'melee') {
      return null;
    }

    return matchingRows.find(row => row.type == null) || null;
  }

  function isFinitePositive(value) {
    return Number.isFinite(value) && value > 0;
  }

  return Object.freeze({
    DEFAULT_EXPONENT,
    FERAL_WEAPON_INVENTORY_TYPES,
    statBudget,
    statAmountFromBudget,
    reconcileIntegerStatAmounts,
    isFeralWeaponInventoryType,
    feralAttackPowerFromDps,
    matchesSubclassRule,
    findPiecewiseRow,
    isFinitePositive
  });
});
