const assert = require(`assert`);
const {fuzzyMatch} = require(`../fuzzbunny`);

function getHighlights(targetStr, searchStr) {
  const match = fuzzyMatch(targetStr, searchStr);
  return match && match.highlights;
}

describe(`stringFilterMatches`, function() {
  it(`matches at the beginning of a string`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, `abc`), [``, `abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, `def`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(getHighlights(`abcdefg`, `efg`), [`abcd`, `efg`]);
  });

  it(`returns null for non-matches`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, `zx`), null);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    assert.deepStrictEqual(getHighlights(`ab cdefg`, `ac`), [``, `a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, `dEf`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(getHighlights(`abCDEfg`, `dEF`), [`abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, `   def`), [`abc`, `def`, `g`]);
    assert.deepStrictEqual(getHighlights(`abcdefg`, `abc   `), [``, `abc`, `defg`]);
    assert.deepStrictEqual(getHighlights(`abcdefg`, `  abc `), [``, `abc`, `defg`]);
  });

  it(`matches when one search term is a substring of another`, function() {
    assert.deepStrictEqual(getHighlights(`This is a test`, `this is`), [``, `This is`, ` a test`]);
    assert.deepStrictEqual(getHighlights(`This should not match`, `this is`), null);
  });

  it(`matches when no filter string is passed`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, ``), [`abcdefg`]);
    assert.deepStrictEqual(getHighlights(`abcdefg`, null), [`abcdefg`]);
  });

  it(`merges contiguous matches`, function() {
    assert.deepStrictEqual(getHighlights(`abcd efg`, `bcd efg`), [`a`, `bcd efg`]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    assert.deepStrictEqual(getHighlights(`abcdefg`, `abc xxx`), null);
  });

  it(`matches only substrings when filter string is quoted`, function() {
    assert.deepStrictEqual(getHighlights(`a b c abC def`, `"abc d"`), [`a b c `, `abC d`, `ef`]);
    assert.deepStrictEqual(getHighlights(`a bc def`, `"abc d"`), null);
    assert.deepStrictEqual(getHighlights(`Las Vegas`, `"la`), [``, `La`, `s Vegas`]);
    assert.deepStrictEqual(getHighlights(`Los Angeles`, `"LA`), null);
  });
});
