const assert = require(`assert`);
const {fuzzyFilter} = require(`../fuzzbunny`);

// from https://en.wikipedia.org/wiki/List_of_Heroes_characters#Main_characters
const heroesCsv = `Claire Bennet, Rapid cellular regeneration
Elle Bishop, Electrokinesis
Monica Dawson, Adaptive muscle memory
D. L. Hawkins, Phasing
Maya Herrera, Poison emission
Isaac Mendez, Precognition
Adam Monroe, Immortality
Hiro Nakamura, Space-time manipulation
Matt Parkman, Telepathy
Angela Petrelli, Enhanced dreaming
Nathan Petrelli, Flight
Peter Petrelli, Empathic mimicry then tactile power mimicry
Micah Sanders, Technopathy
Niki Sanders, Enhanced strength
Tracy Strauss, Cryokinesis
Samuel Sullivan, Terrakinesis
Gabriel Gray / Sylar, Power mimicry and amplification`;

const heroes = heroesCsv
  .trim()
  .split(`\n`)
  .map((line) => line.split(`, `))
  .map(([name, ability]) => ({name, ability}));

function getHighlights(searchStr) {
  return fuzzyFilter(heroes, searchStr).map((result) => result.highlights);
}

describe(`fuzzyFilter`, function() {
  it(`matches at the beginning of a string`, function() {
    assert.deepStrictEqual(getHighlights(`cyro`), []);
  });

  it(`matches in the middle/end of a string`, function() {});

  it(`returns empty list for non-matches`, function() {
    // assert.deepStrictEqual(getHighlights(`asdfa`), []);
  });

  it(`matches prefix filter characters (fuzzy)`, function() {
    // assert.deepStrictEqual(getHighlights(`ab cdefg`, `ac`), [``, `a`, `b `, `c`, `defg`]);
  });

  it(`is case-insensitive`, function() {});
});
