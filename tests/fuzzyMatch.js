const assert = require(`assert`);
const {fuzzyMatch} = require(`../fuzzbunny`);

describe(`fuzzyMatch`, function() {
  it(`matches at the beginning of a string`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `abc`).highlights, [``, `abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `def`).highlights, [`abc`, `def`, `g`]);
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `efg`).highlights, [`abcd`, `efg`]);
  });

  it(`returns null for non-matches`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `zx`), null);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    assert.deepStrictEqual(fuzzyMatch(`ab cdefg`, `ac`).highlights, [``, `a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `dEf`).highlights, [`abc`, `def`, `g`]);
    assert.deepStrictEqual(fuzzyMatch(`abCDEfg`, `dEF`).highlights, [`abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `   def`).highlights, [`abc`, `def`, `g`]);
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `abc   `).highlights, [``, `abc`, `defg`]);
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `  abc `).highlights, [``, `abc`, `defg`]);
  });

  it(`matches when one search term is a substring of another`, function() {
    assert.deepStrictEqual(fuzzyMatch(`This is a test`, `this is`).highlights, [``, `This is`, ` a test`]);
    assert.deepStrictEqual(fuzzyMatch(`This should not match`, `this is`), null);
  });

  it(`matches when no filter string is passed`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, ``).highlights, [`abcdefg`]);
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, null).highlights, [`abcdefg`]);
  });

  it(`merges contiguous matches`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcd efg`, `bcd efg`).highlights, [`a`, `bcd efg`]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abcdefg`, `abc xxx`), null);
  });

  it(`matches only substrings when filter string is quoted`, function() {
    assert.deepStrictEqual(fuzzyMatch(`a b c abC def`, `"abc d"`).highlights, [`a b c `, `abC d`, `ef`]);
    assert.deepStrictEqual(fuzzyMatch(`a bc def`, `"abc d"`), null);
    assert.deepStrictEqual(fuzzyMatch(`Las Vegas`, `"la`).highlights, [``, `La`, `s Vegas`]);
    assert.deepStrictEqual(fuzzyMatch(`Los Angeles`, `"LA`), null);
  });

  it(`performs regular match when quotes appear in middle of search string`, function() {
    assert.deepStrictEqual(fuzzyMatch(`abc "def"`, `a"def"`).highlights, [``, `a`, `bc `, `"def"`]);
    assert.deepStrictEqual(fuzzyMatch(`Las Vegas`, `la"`), null);
  });

  it(`matches initials in camelCase and TitleCase strings`, function() {
    assert.deepStrictEqual(fuzzyMatch(`FuzzBunny`, `fb`).highlights, [``, `F`, `uzz`, `B`, `unny`]);
    assert.deepStrictEqual(fuzzyMatch(`fuzzBunny.ts`, `fb`).highlights, [``, `f`, `uzz`, `B`, `unny.ts`]);
    assert.deepStrictEqual(fuzzyMatch(`fuzzBunnyIsAwesome`, `bia`).highlights, [
      `fuzz`,
      `B`,
      `unny`,
      `I`,
      `s`,
      `A`,
      `wesome`,
    ]);
  });
});
