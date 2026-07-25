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

  function calculateStats(request) {
    const mode = 'stats';
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
    if (!Array.isArray(request.stats) || request.stats.length === 0) {
      return error(mode, 'stats must contain at least one percentage allocation.');
    }
    if (sockets === null) {
      return error(mode, 'sockets must be an array of socket type strings.');
    }

    const exponent = finiteNumber(request.exponent) ??
      modelMath.DEFAULT_EXPONENT;
    if (!modelMath.isFinitePositive(exponent)) {
      return error(mode, 'exponent must be a positive finite number.');
    }

    const stats = request.stats.map(stat => ({
      type: stat?.type,
      percent: finiteNumber(stat?.percent ?? stat?.amount)
    }));
    if (stats.some(stat =>
      stat.type == null ||
      stat.percent === null ||
      stat.percent < 0
    )) {
      return error(mode, 'Every stat requires a type and non-negative percent.');
    }
    const percentTotal = stats.reduce(
      (sum, stat) => sum + stat.percent,
      0
    );
    if (Math.abs(percentTotal - 100) > 1e-9) {
      return error(mode, `Stat percentages total ${percentTotal}, not 100.`);
    }

    const capacity = capacityDetails(common, level, exponent);
    const distributableBudget = budgetModel.itemBudgetAtLevel({
      ...common,
      level,
      socketTypes: sockets,
      exponent
    });
    if (!modelMath.isFinitePositive(distributableBudget)) {
      return error(mode, 'No positive item budget exists for this configuration.');
    }

    const allocations = [];
    for (const stat of stats) {
      const statMod = budgetModel.statMod(
        stat.type,
        common.inventoryType,
        common.quality,
        level
      );
      if (!modelMath.isFinitePositive(statMod)) {
        return error(mode, `Unsupported stat type: ${stat.type}.`);
      }
      const allocatedBudget = distributableBudget * stat.percent / 100;
      allocations.push({
        type: stat.type,
        percent: stat.percent,
        statMod,
        allocatedBudget,
        exactAmount: modelMath.statAmountFromBudget(
          allocatedBudget,
          statMod,
          exponent
        )
      });
    }

    const reconciled = modelMath.reconcileIntegerStatAmounts(
      allocations,
      distributableBudget,
      exponent
    );
    if (!reconciled) {
      return error(mode, 'Integer stat reconciliation failed.');
    }

    const outputStats = allocations.map((allocation, index) => ({
      type: allocation.type,
      percent: allocation.percent,
      amount: reconciled.amounts[index]
    }));
    const recalculatedLevel = budgetModel.calculateLevel({
      ...common,
      stats: [
        ...outputStats,
        ...sockets.map(type => ({ type, amount: 1 }))
      ],
      exponent
    });
    const socketBudget = capacity.thresholdBudget - distributableBudget;

    return {
      ok: true,
      mode,
      input: {
        ...common,
        level,
        stats,
        sockets,
        exponent
      },
      result: {
        level,
        stats: outputStats,
        sockets: sockets.map(type => ({ type, amount: 1 })),
        recalculatedLevel
      },
      equations: {
        exponent,
        capacity,
        totalBudget: capacity.thresholdBudget,
        socketBudget,
        distributableBudget,
        allocations: allocations.map((allocation, index) => ({
          ...allocation,
          roundedAmount: reconciled.amounts[index],
          roundedBudget: modelMath.statBudget(
            reconciled.amounts[index],
            allocation.statMod,
            exponent
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
        level
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
      !modelMath.isFinitePositive(stat.amount)
    )) {
      return error(mode, 'Every stat requires a type and positive amount.');
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
    calculateLevel,
    calculatePrice,
    calculateDamage
  });
});
