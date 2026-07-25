#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const calculator = require('../calculator-core.js');

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function readInput() {
  const inputPath = argumentValue('--input');
  return inputPath
    ? fs.readFileSync(path.resolve(inputPath), 'utf8')
    : fs.readFileSync(0, 'utf8');
}

function main() {
  let parsed;
  try {
    parsed = JSON.parse(readInput());
  } catch (error) {
    process.stderr.write(`Invalid JSON input: ${error.message}\n`);
    process.exitCode = 2;
    return;
  }

  const output = Array.isArray(parsed)
    ? parsed.map(request => calculator.calculate(request))
    : calculator.calculate(parsed);
  const serialized = JSON.stringify(
    output,
    null,
    process.argv.includes('--compact') ? 0 : 2
  ) + '\n';
  const outputPath = argumentValue('--output');
  if (outputPath) {
    fs.writeFileSync(path.resolve(outputPath), serialized);
  } else {
    process.stdout.write(serialized);
  }
  const failures = Array.isArray(output)
    ? output.filter(result => !result.ok).length
    : output.ok ? 0 : 1;
  if (failures) {
    process.exitCode = 1;
  }
}

main();
