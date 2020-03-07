const fs = require(`fs`);
const {fuzzyMatchSanitized} = require('../lib/fuzzbunny');

const lines = fs
  .readFileSync(`${__dirname}/fixtures/gutenberg-catalog.txt`, 'utf-8')
  .trim()
  .split(`\n`);

const startTime = Date.now();
const numRuns = 100;
for (let i = 0; i < numRuns; ++i) {
  for (const line of lines) {
    fuzzyMatchSanitized(line.toLowerCase(), 'bible');
  }
}
const elapsedTimeMs = Date.now() - startTime;
const numLinesMatched = lines.length * numRuns;
console.log(`matched ${numLinesMatched.toLocaleString()} lines in ${elapsedTimeMs}ms`);
