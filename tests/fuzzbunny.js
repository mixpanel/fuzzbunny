const assert = require(`assert`);
const {stringFilterMatches} = require(`..`);

describe(`stringFilterMatches`, function() {
  it(`matches at the beginning of a string`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `abc`), [``, `abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `def`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `efg`), [`abcd`, `efg`]);
  });

  it(`returns null for non-matches`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `zx`), null);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    assert.deepStrictEqual(stringFilterMatches(`ab cdefg`, `ac`), [``, `a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `dEf`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(stringFilterMatches(`abCDEfg`, `dEF`), [`abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `   def`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `abc   `), [``, `abc`, `defg`]);
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `  abc `), [``, `abc`, `defg`]);
  });

  it(`matches when one search term is a substring of another`, function() {
    assert.deepStrictEqual(stringFilterMatches(`This is a test`, `this is`), [``, `This is`, ` a test`]);
    assert.deepStrictEqual(stringFilterMatches(`This should not match`, `this is`), null);
  });

  it(`matches when no filter string is passed`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, ``), [`abcdefg`]);
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, null), [`abcdefg`]);
  });

  it(`merges contiguous matches`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcd efg`, `bcd efg`), [`a`, `bcd efg`]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    assert.deepStrictEqual(stringFilterMatches(`abcdefg`, `abc xxx`), null);
  });

  it(`matches only substrings when filter string is quoted`, function() {
    assert.deepStrictEqual(stringFilterMatches(`a b c abC def`, `"abc d"`), [`a b c `, `abC d`, `ef`]);
    assert.deepStrictEqual(stringFilterMatches(`a bc def`, `"abc d"`), null);
    assert.deepStrictEqual(stringFilterMatches(`Las Vegas`, `"la`), [``, `La`, `s Vegas`]);
    assert.deepStrictEqual(stringFilterMatches(`Los Angeles`, `"LA`), null);
  });
});
