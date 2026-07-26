(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports
      ? require('./model-math.js')
      : root.ItemModelMath,
    typeof module === 'object' && module.exports
      ? require('./budget-model.js')
      : root.ItemBudgetModel,
    typeof module === 'object' && module.exports
      ? require('./pricing-model.js')
      : root.ItemPricingModel,
    typeof module === 'object' && module.exports
      ? require('./uncommon-weapon-model.js')
      : root.ItemUncommonWeaponModel
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ItemCalculatorCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (
  modelMath,
  budgetModel,
  pricingModel,
  uncommonWeaponModel
) {
  'use strict';

  if (!modelMath || !budgetModel || !pricingModel || !uncommonWeaponModel) {
    throw new Error(
      'Math, budget, and pricing models are required by ItemCalculatorCore.'
    );
  }

  function finiteNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeCommon(request) {
    const itemClass = finiteNumber(request.itemClass);
    const inventoryType = finiteNumber(request.inventoryType);
    const quality = finiteNumber(request.quality);
    if (![itemClass, inventoryType, quality].every(Number.isInteger)) {
      return null;
    }
    return { itemClass, inventoryType, quality };
  }

  function capacityDetails(common, level, exponent) {
    const value = budgetModel.budgetCapacityAtLevel({
      ...common,
      level,
      exponent
    });
    const dbcReference = budgetModel.dbcReferenceCapacityAtLevel({
      ...common,
      level
    });
    return {
      level,
      value,
      source: [2, 3, 4].includes(common.quality)
        ? 'quartic fit to RandPropPoints.dbc'
        : 'quality-and-slot model',
      qualityMod: budgetModel.qualityMod(common.quality, level),
      slotMod: budgetModel.slotMod(
        common.itemClass,
        common.inventoryType,
        common.quality,
        level
      ),
      thresholdBudget: modelMath.isFinitePositive(value)
        ? Math.pow(value, exponent)
        : null,
      dbcReference,
      fitResidual: Number.isFinite(dbcReference) &&
        Number.isFinite(value)
          ? value - dbcReference
          : null
    };
  }

  function normalizedSockets(request) {
    if (request.sockets == null) {
      return [];
    }
    if (!Array.isArray(request.sockets)) {
      return null;
    }
    const sockets = request.sockets.map(socket =>
      typeof socket === 'object' && socket !== null ? socket.type : socket
    );
    return sockets.every(type => typeof type === 'string')
      ? sockets
      : null;
  }

  function error(mode, messages) {
    return {
      ok: false,
      mode,
      errors: Array.isArray(messages) ? messages : [messages]
    };
  }

  function roundToHundredth(value) {
    return Math.sign(value) * (
      Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100
    );
  }

  function nearestInteger(value) {
    return Math.sign(value) * Math.round(Math.abs(value));
  }

  function populateUnassignedPercentages(stats) {
    const unassignedCount = stats.filter(stat => stat.percent === 0).length;
    if (unassignedCount === 0) {
      return stats.map(stat => ({
        ...stat,
        enteredPercent: stat.percent,
        autoPopulated: false
      }));
    }

    const assignedTotal = stats.reduce(
      (sum, stat) => stat.percent === 0 ? sum : sum + stat.percent,
      0
    );
    const unassignedShare = (100 - assignedTotal) / unassignedCount;
    return stats.map(stat => ({
      ...stat,
      enteredPercent: stat.percent,
      percent: stat.percent === 0 ? unassignedShare : stat.percent,
      autoPopulated: stat.percent === 0
    }));
  }

  function statCalculationContext(request, mode = 'stats') {
    const common = normalizeCommon(request);
    const level = finiteNumber(request.level);
    const sockets = normalizedSockets(request);
    if (!common) {
      return error(mode, 'itemClass, inventoryType, and quality must be integers.');
    }
    if (!Number.isInteger(level) ||
        level < 1 ||
        level > budgetModel.MAXIMUM_ITEM_LEVEL) {
      return error(
        mode,
        `level must be an integer from 1 to ${budgetModel.MAXIMUM_ITEM_LEVEL}.`
      );
    }
    if (sockets === null) {
      return error(mode, 'sockets must be an array of socket type strings.');
    }

    const exponent = finiteNumber(request.exponent) ??
      modelMath.DEFAULT_EXPONENT;
    if (!modelMath.isFinitePositive(exponent)) {
      return error(mode, 'exponent must be a positive finite number.');
    }

    const distributableBudget = budgetModel.itemBudgetAtLevel({
      ...common,
      level,
      socketTypes: sockets,
      exponent
    });
    if (!modelMath.isFinitePositive(distributableBudget)) {
      return error(mode, 'No positive item budget exists for this configuration.');
    }

    return {
      ok: true,
      common,
      level,
      sockets,
      exponent,
      distributableBudget
    };
  }

  function normalizeStatAllocations(
    stats,
    common,
    level,
    distributableBudget,
    exponent
  ) {
    const allocations = [];
    let assignedBudget = 0;

    for (const [index, stat] of stats.entries()) {
      const statMod = budgetModel.statMod(
        stat.type,
        common.inventoryType,
        common.quality,
        level,
        common.itemClass
      );
      if (!modelMath.isFinitePositive(statMod)) {
        return {
          ok: false,
          message: `Unsupported stat type: ${stat.type}.`
        };
      }

      const isBalancingStat = index === stats.length - 1;
      let allocatedBudget;
      let exactAmount;
      if (isBalancingStat) {
        allocatedBudget = distributableBudget - assignedBudget;
        exactAmount = modelMath.statAmountFromBudget(
          allocatedBudget,
          statMod,
          exponent
        );
      }
      else {
        const requestedBudget =
          distributableBudget * stat.percent / 100;
        exactAmount = nearestInteger(modelMath.statAmountFromBudget(
          requestedBudget,
          statMod,
          exponent
        ));
        allocatedBudget = modelMath.statBudget(
          exactAmount,
          statMod,
          exponent
        );
        assignedBudget += allocatedBudget;
      }

      allocations.push({
        type: stat.type,
        enteredPercent: stat.enteredPercent,
        requestedPercent: stat.percent,
        autoPopulated: stat.autoPopulated,
        percent: allocatedBudget / distributableBudget * 100,
        statMod,
        allocatedBudget,
        exactAmount,
        balancing: isBalancingStat
      });
    }

    let displayedTotal = 0;
    allocations.forEach((allocation, index) => {
      if (index === allocations.length - 1) {
        allocation.displayPercent = roundToHundredth(100 - displayedTotal);
      }
      else {
        allocation.displayPercent = roundToHundredth(allocation.percent);
        displayedTotal += allocation.displayPercent;
      }
    });

    return { ok: true, allocations };
  }

  function stepStatPercentage(request) {
    const mode = 'stat-percentage-step';
    const context = statCalculationContext(request, mode);
    if (!context.ok) {
      return context;
    }

    const percent = finiteNumber(request.percent);
    const direction = finiteNumber(request.direction);
    if (request.type == null || percent === null) {
      return error(mode, 'type and percent are required.');
    }
    if (direction !== -1 && direction !== 1) {
      return error(mode, 'direction must be -1 or 1.');
    }

    const statMod = budgetModel.statMod(
      request.type,
      context.common.inventoryType,
      context.common.quality,
      context.level,
      context.common.itemClass
    );
    if (!modelMath.isFinitePositive(statMod)) {
      return error(mode, `Unsupported stat type: ${request.type}.`);
    }

    const currentExactAmount = modelMath.statAmountFromBudget(
      context.distributableBudget * percent / 100,
      statMod,
      context.exponent
    );
    const currentAmount = nearestInteger(currentExactAmount);
    const currentPointPercent = roundToHundredth(
      modelMath.statBudget(
        currentAmount,
        statMod,
        context.exponent
      ) / context.distributableBudget * 100
    );
    const isAtStatPoint =
      roundToHundredth(percent) === currentPointPercent;
    const targetAmount = isAtStatPoint
      ? currentAmount + direction
      : direction > 0
        ? Math.ceil(currentExactAmount)
        : Math.floor(currentExactAmount);
    const exactPercent = modelMath.statBudget(
      targetAmount,
      statMod,
      context.exponent
    ) / context.distributableBudget * 100;

    return {
      ok: true,
      mode,
      input: {
        ...context.common,
        level: context.level,
        sockets: context.sockets,
        type: request.type,
        percent,
        direction,
        exponent: context.exponent
      },
      result: {
        currentAmount,
        targetAmount,
        exactPercent,
        percent: roundToHundredth(exactPercent),
        isAtStatPoint
      },
      equations: {
        statMod,
        distributableBudget: context.distributableBudget,
        currentExactAmount
      }
    };
  }

  function calculateStats(request) {
    const mode = 'stats';
    const context = statCalculationContext(request, mode);
    if (!context.ok) {
      return context;
    }
    if (!Array.isArray(request.stats) || request.stats.length === 0) {
      return error(mode, 'stats must contain at least one percentage allocation.');
    }

    const stats = request.stats.map(stat => ({
      type: stat?.type,
      percent: finiteNumber(stat?.percent ?? stat?.amount)
    }));
    if (stats.some(stat =>
      stat.type == null ||
      stat.percent === null
    )) {
      return error(mode, 'Every stat requires a type and finite percent.');
    }

    const populatedStats = populateUnassignedPercentages(stats);
    const normalized = normalizeStatAllocations(
      populatedStats,
      context.common,
      context.level,
      context.distributableBudget,
      context.exponent
    );
    if (!normalized.ok) {
      return error(mode, normalized.message);
    }
    const allocations = normalized.allocations;

    const reconciled = modelMath.reconcileIntegerStatAmounts(
      allocations,
      context.distributableBudget,
      context.exponent
    );
    if (!reconciled) {
      return error(mode, 'Integer stat reconciliation failed.');
    }

    const outputStats = allocations.map((allocation, index) => ({
      type: allocation.type,
      percent: allocation.displayPercent,
      amount: reconciled.amounts[index]
    }));
    const recalculatedLevel = budgetModel.calculateLevel({
      ...context.common,
      stats: [
        ...outputStats,
        ...context.sockets.map(type => ({ type, amount: 1 }))
      ],
      exponent: context.exponent
    });
    const capacity = capacityDetails(
      context.common,
      context.level,
      context.exponent
    );
    const socketBudget =
      capacity.thresholdBudget - context.distributableBudget;

    return {
      ok: true,
      mode,
      input: {
        ...context.common,
        level: context.level,
        stats,
        sockets: context.sockets,
        exponent: context.exponent
      },
      result: {
        level: context.level,
        stats: outputStats,
        sockets: context.sockets.map(type => ({ type, amount: 1 })),
        recalculatedLevel
      },
      equations: {
        exponent: context.exponent,
        capacity,
        totalBudget: capacity.thresholdBudget,
        socketBudget,
        distributableBudget: context.distributableBudget,
        allocations: allocations.map((allocation, index) => ({
          ...allocation,
          roundedAmount: reconciled.amounts[index],
          roundedBudget: modelMath.statBudget(
            reconciled.amounts[index],
            allocation.statMod,
            context.exponent
          )
        })),
        usedBudget: reconciled.usedBudget,
        unusedBudget: reconciled.unusedBudget
      }
    };
  }

  function levelEquation(common, level, stats, exponent) {
    if (!Number.isInteger(level) || level < 1) {
      return null;
    }
    const capacity = capacityDetails(common, level, exponent);
    if (!modelMath.isFinitePositive(capacity.value)) {
      return {
        level,
        capacity,
        stats: [],
        usedBudget: null,
        margin: null,
        fits: false
      };
    }

    const statEquations = [];
    let usedBudget = 0;
    for (const stat of stats) {
      const statMod = budgetModel.statMod(
        stat.type,
        common.inventoryType,
        common.quality,
        level,
        common.itemClass
      );
      if (!modelMath.isFinitePositive(statMod)) {
        return null;
      }
      const budget = modelMath.statBudget(
        stat.amount,
        statMod,
        exponent
      );
      usedBudget += budget;
      statEquations.push({
        type: stat.type,
        amount: stat.amount,
        statMod,
        budget
      });
    }
    const margin = capacity.thresholdBudget - usedBudget;
    const tolerance = Math.max(1, capacity.thresholdBudget) * 1e-12;
    return {
      level,
      capacity,
      stats: statEquations,
      usedBudget,
      margin,
      fits: margin >= -tolerance
    };
  }

  function calculateLevel(request) {
    const mode = 'level';
    const common = normalizeCommon(request);
    if (!common) {
      return error(mode, 'itemClass, inventoryType, and quality must be integers.');
    }
    if (!Array.isArray(request.stats) || request.stats.length === 0) {
      return error(mode, 'stats must contain at least one stat amount.');
    }

    const exponent = finiteNumber(request.exponent) ??
      modelMath.DEFAULT_EXPONENT;
    if (!modelMath.isFinitePositive(exponent)) {
      return error(mode, 'exponent must be a positive finite number.');
    }
    const stats = request.stats.map(stat => ({
      type: stat?.type,
      amount: finiteNumber(stat?.amount)
    }));
    if (stats.some(stat =>
      stat.type == null ||
      stat.amount === null ||
      stat.amount === 0
    )) {
      return error(mode, 'Every stat requires a type and non-zero amount.');
    }

    const maximumLevel = finiteNumber(request.maximumLevel) ??
      budgetModel.MAXIMUM_ITEM_LEVEL;
    const level = budgetModel.calculateLevel({
      ...common,
      stats,
      exponent,
      maximumLevel
    });
    if (level === null) {
      return error(mode, `Stats do not fit by item level ${maximumLevel}.`);
    }

    const selected = levelEquation(common, level, stats, exponent);
    const previous = levelEquation(common, level - 1, stats, exponent);
    return {
      ok: true,
      mode,
      input: {
        ...common,
        stats,
        exponent,
        maximumLevel
      },
      result: { level },
      equations: {
        exponent,
        previousLevel: previous,
        selectedLevel: selected
      }
    };
  }

  function calculatePrice(request) {
    const mode = 'price';
    const common = normalizeCommon(request);
    const subclass = finiteNumber(request.subclass);
    const level = finiteNumber(request.level);
    if (!common || !Number.isInteger(subclass)) {
      return error(
        mode,
        'itemClass, inventoryType, subclass, and quality must be integers.'
      );
    }
    if (!Number.isInteger(level) ||
        level < 1 ||
        level > budgetModel.MAXIMUM_ITEM_LEVEL) {
      return error(
        mode,
        `level must be an integer from 1 to ${budgetModel.MAXIMUM_ITEM_LEVEL}.`
      );
    }
    const prices = pricingModel.prices({
      ...common,
      subclass,
      level
    });
    if (!prices) {
      return error(mode, 'No price model exists for this configuration.');
    }
    return {
      ok: true,
      mode,
      input: {
        ...common,
        subclass,
        level
      },
      result: prices,
      equations: {
        source: prices.source,
        buyCopper: prices.sell.totalCopper * prices.vendorMultiplier,
        sellCopper: prices.sell.totalCopper,
        vendorMultiplier: prices.vendorMultiplier
      }
    };
  }

  function calculateDamage(request) {
    const mode = 'damage';
    const common = normalizeCommon(request);
    const subclass = finiteNumber(request.subclass);
    const level = finiteNumber(request.level);
    const delay = request.delay == null ? null : finiteNumber(request.delay);
    if (!common || !Number.isInteger(subclass)) {
      return error(
        mode,
        'itemClass, inventoryType, subclass, and quality must be integers.'
      );
    }
    if (common.itemClass !== 2 || common.quality !== 2) {
      return error(mode, 'JSON damage mode currently supports uncommon weapons.');
    }
    if (!Number.isInteger(level) ||
        level < 1 ||
        level > budgetModel.MAXIMUM_ITEM_LEVEL) {
      return error(
        mode,
        `level must be an integer from 1 to ${budgetModel.MAXIMUM_ITEM_LEVEL}.`
      );
    }
    if (request.delay != null && (!Number.isFinite(delay) || delay <= 0)) {
      return error(mode, 'delay must be a positive number of milliseconds.');
    }
    const damage = uncommonWeaponModel.calculate({
      level,
      inventoryType: common.inventoryType,
      subclass,
      profile: request.profile ?? null,
      delay
    });
    if (!damage) {
      return error(mode, 'No uncommon weapon damage model exists.');
    }
    return {
      ok: true,
      mode,
      input: {
        ...common,
        subclass,
        level,
        profile: request.profile ?? null,
        delay
      },
      result: {
        dps: damage.dps,
        delay: damage.delay,
        coefficient: damage.coefficient,
        minimum: damage.minimum,
        maximum: damage.maximum
      },
      equations: damage.equations
    };
  }

  function calculate(request) {
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      return error(null, 'Request must be a JSON object.');
    }
    if (request.mode === 'stats') {
      return calculateStats(request);
    }
    if (request.mode === 'level') {
      return calculateLevel(request);
    }
    if (request.mode === 'price') {
      return calculatePrice(request);
    }
    if (request.mode === 'damage') {
      return calculateDamage(request);
    }
    return error(
      request.mode ?? null,
      'mode must be "stats", "level", "price", or "damage".'
    );
  }

  return Object.freeze({
    calculate,
    calculateStats,
    stepStatPercentage,
    calculateLevel,
    calculatePrice,
    calculateDamage
  });
});
