
describe(`stringFilterMatches`, function() {
  it(`matches at the beginning of a string`, function() {
    expect(stringFilterMatches(`abcdefg`, `abc`).slice()).to.eql([`abc`, `defg`]);
  });

  it(`matches in the middle/end of a string`, function() {
    expect(stringFilterMatches(`abcdefg`, `def`).slice()).to.eql([``, `abc`, `def`, `g`]);
    expect(stringFilterMatches(`abcdefg`, `efg`).slice()).to.eql([``, `abcd`, `efg`]);
  });

  it(`returns null for non-matches`, function() {
    expect(stringFilterMatches(`abcdefg`, `zx`)).to.eql(null);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    expect(stringFilterMatches(`ab cdefg`, `ac`).slice()).to.eql([`a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {
    expect(stringFilterMatches(`abcdefg`, `dEf`).slice()).to.eql([``, `abc`, `def`, `g`]);
    expect(stringFilterMatches(`abCDEfg`, `dEF`).slice()).to.eql([``, `abC`, `DEf`, `g`]);
  });

  it(`ignores whitespace padding`, function() {
    expect(stringFilterMatches(`abcdefg`, `   def`).slice()).to.eql([``, `abc`, `def`, `g`]);
    expect(stringFilterMatches(`abcdefg`, `abc   `).slice()).to.eql([`abc`, `defg`]);
    expect(stringFilterMatches(`abcdefg`, `  abc `).slice()).to.eql([`abc`, `defg`]);
  });

  it(`matches when one search term is a substring of another`, function() {
    expect(stringFilterMatches(`This is a test`, `this is`).slice()).to.eql([`This is`, ` a test`]);
    expect(stringFilterMatches(`This should not match`, `this is`)).to.eql(null);
  });

  it(`matches when no filter string is passed`, function() {
    expect(stringFilterMatches(`abcdefg`, ``)).to.eql([``, `abcdefg`]);
    expect(stringFilterMatches(`abcdefg`, null)).to.eql([``, `abcdefg`]);
  });

  it(`merges contiguous matches`, function() {
    expect(stringFilterMatches(`abcd efg`, `bcd efg`).slice()).to.eql([``, `a`, `bcd efg`]);
  });

  it(`does not match when one or more space-separated terms do not match`, function() {
    expect(stringFilterMatches(`abcdefg`, `abc xxx`)).to.eql(null);
  });

  it(`matches only substrings when filter string is quoted`, function() {
    expect(stringFilterMatches(`a b c abC def`, `"abc d"`)).to.eql([``, `a b c `, `abC d`, `ef`]);
    expect(stringFilterMatches(`a bc def`, `"abc d"`)).to.eql(null);
    expect(stringFilterMatches(`Las Vegas`, `"la`)).to.eql([`La`, `s Vegas`]);
    expect(stringFilterMatches(`Los Angeles`, `"LA`)).to.eql(null);
  });
});
