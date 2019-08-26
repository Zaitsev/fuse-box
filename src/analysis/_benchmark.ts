const { performance } = require('perf_hooks');
import * as acorn from 'acorn';
import * as cherow from 'cherow';
import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../logging/logging';
import { fastAnalysis } from './fastAnalysis';
import { scanner } from './scanner';
import * as meriyah from 'meriyah';
import { fastAstAnalysis } from './fastAstAnalysis';
const str = fs.readFileSync(path.join(__dirname, 'file.js')).toString();

function parseWithAcorn(input) {
  acorn.parse(input, {
    sourceType: 'module',
    tolerant: true,
    locations: true,
    ranges: true,
    ecmaVersion: '2018',
  });
}

function parseWithCherow(input) {
  cherow.parse(input);
}

const result: any = {};

function measure(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const time = performance.now() - start;
  if (!result[name]) {
    result[name] = [];
  }
  result[name].push(time);
  //console.log(`${name} in: ${time}ms`);
  return name;
}

const logger = getLogger({ level: 'succinct' });

//logger.withSpinner();
logger.info('Starting benchmark');

function parseWithScanner(str) {
  scanner(str);
}

function parsemeriyah(str) {
  return meriyah.parseModule(str);
}

function doFastAst(str) {
  fastAstAnalysis({ input: str });
}

const maxIteration = 100;
for (let i = 0; i <= maxIteration; i++) {
  logger.info(`bench: ${i} / ${maxIteration}`);
  measure('parseWithAcorn', () => parseWithAcorn(str));

  measure('parseWithCherow', () => parseWithCherow(str));

  measure('meriyah', () => parsemeriyah(str));

  measure('fastAnalysis', () => fastAnalysis({ input: str }));

  // measure('doFastAst', () => doFastAst(str));
}

logger.stopSpinner();
for (const item in result) {
  const totalRuns = result[item].length;
  let totalTime = 0;
  result[item].map(time => {
    totalTime += time;
  });
  const avgTime = totalTime / totalRuns;
  console.log(`${item}: ${avgTime}ms (${totalRuns} runs)`);
}

// //const acornTime = ;

// function parseWithShit(input) {
// 	console.log(result);
// 	return performance.now() - start;
// }