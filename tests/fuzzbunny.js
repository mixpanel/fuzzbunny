const assert = require(`assert`);
const {fuzzyMatch} = require(`../fuzzbunny`);

function getMatchParts(targetStr, searchStr) {
  const match = fuzzyMatch(targetStr, searchStr);
  return match && match.matchParts;
}

describe(`stringFilterMatches`, function() {
  it(`matches at the beginning of a string`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `abc`), [``, `abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `def`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `efg`), [`abcd`, `efg`]);
  });

  it(`returns null for non-matches`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `zx`), null);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    assert.deepStrictEqual(getMatchParts(`ab cdefg`, `ac`), [``, `a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `dEf`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(getMatchParts(`abCDEfg`, `dEF`), [`abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `   def`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `abc   `), [``, `abc`, `defg`]);
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `  abc `), [``, `abc`, `defg`]);
  });

  it(`matches when one search term is a substring of another`, function() {
    assert.deepStrictEqual(getMatchParts(`This is a test`, `this is`), [``, `This is`, ` a test`]);
    assert.deepStrictEqual(getMatchParts(`This should not match`, `this is`), null);
  });

  it(`matches when no filter string is passed`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, ``), [`abcdefg`]);
    assert.deepStrictEqual(getMatchParts(`abcdefg`, null), [`abcdefg`]);
  });

  it(`merges contiguous matches`, function() {
    assert.deepStrictEqual(getMatchParts(`abcd efg`, `bcd efg`), [`a`, `bcd efg`]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    assert.deepStrictEqual(getMatchParts(`abcdefg`, `abc xxx`), null);
  });

  it(`matches only substrings when filter string is quoted`, function() {
    assert.deepStrictEqual(getMatchParts(`a b c abC def`, `"abc d"`), [`a b c `, `abC d`, `ef`]);
    assert.deepStrictEqual(getMatchParts(`a bc def`, `"abc d"`), null);
    assert.deepStrictEqual(getMatchParts(`Las Vegas`, `"la`), [``, `La`, `s Vegas`]);
    assert.deepStrictEqual(getMatchParts(`Los Angeles`, `"LA`), null);
  });
});
