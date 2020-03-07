const {deepStrictEqual} = require(`assert`);
const {stringFilterMatches} = require(`../lib/fuzzbunny`);

describe(`stringFilterMatches`, function() {
  it(`matches at the beginning of a string`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, `abc`), [`abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, `def`), [``, `abc`, `def`, `g`]);
    deepStrictEqual(stringFilterMatches(`abcdefg`, `efg`), [``, `abcd`, `efg`]);
  });

  it(`returns null for non-matches`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, `zx`), null);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    deepStrictEqual(stringFilterMatches(`ab cdefg`, `ac`), [`a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, `dEf`), [``, `abc`, `def`, `g`]);
    deepStrictEqual(stringFilterMatches(`abCDEfg`, `dEF`), [``, `abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, `   def`), [``, `abc`, `def`, `g`]);
    deepStrictEqual(stringFilterMatches(`abcdefg`, `abc   `), [`abc`, `defg`]);
    deepStrictEqual(stringFilterMatches(`abcdefg`, `  abc `), [`abc`, `defg`]);
  });

  it(`matches when one search term is a substring of another`, function() {
    deepStrictEqual(stringFilterMatches(`This is a test`, `this is`), [`This is`, ` a test`]);
    deepStrictEqual(stringFilterMatches(`This should not match`, `this is`), null);
  });

  it(`matches when no filter string is passed`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, ``), [``, `abcdefg`]);
    deepStrictEqual(stringFilterMatches(`abcdefg`, null), [``, `abcdefg`]);
  });

  it(`merges contiguous matches`, function() {
    deepStrictEqual(stringFilterMatches(`abcd efg`, `bcd efg`), [``, `a`, `bcd efg`]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    deepStrictEqual(stringFilterMatches(`abcdefg`, `abc xxx`), null);
  });

  it(`matches only substrings when filter string is quoted`, function() {
    deepStrictEqual(stringFilterMatches(`a b c abC def`, `"abc d"`), [``, `a b c `, `abC d`, `ef`]);
    deepStrictEqual(stringFilterMatches(`a bc def`, `"abc d"`), null);
    deepStrictEqual(stringFilterMatches(`Las Vegas`, `"la`), [`La`, `s Vegas`]);
    deepStrictEqual(stringFilterMatches(`Los Angeles`, `"LA`), null);
  });
});
