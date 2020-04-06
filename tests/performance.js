const fs = require(`fs`);
const assert = require(`assert`);
const {fuzzyMatchSanitized} = require('../fuzzbunny');

const lines = fs
  .readFileSync(`${__dirname}/../docs/gutenberg-catalog.txt`, 'utf-8')
  .trim()
  .split(`\n`)
  .slice(1); // ignore attribution comment on first line

context(`performance`, function() {
  describe(`fuzzyMatchSanitized`, function() {
    it(`matches more than 500k lines/sec`, function() {
      this.slow(1000); // 1 second slow threshold
      const linesPerSecLowBar = 500000;
      const words = [`oliver`, `alice`, `mayflo`, `declofusa`, `audio`];
      const startTime = Date.now();
      for (const word of words) {
        for (const line of lines) {
          fuzzyMatchSanitized(line.toLowerCase(), word);
        }
      }
      const elapsedTimeMs = Date.now() - startTime;
      const numLinesMatched = lines.length * words.length;
      const linesPerSec = Math.round((numLinesMatched * 1000) / elapsedTimeMs);

      // MacBookPro runs at ~1M lines/sec, Travis CI at >700k lines/sec, we limit at 500k / sec as lower bound
      console.log(`${` `.repeat(6)}matched ${linesPerSec.toLocaleString()} lines/sec`);
      assert.ok(linesPerSec > linesPerSecLowBar, `matcher was toooo slooooooow`);
    });
  });
});
