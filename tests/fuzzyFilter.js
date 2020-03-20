const assert = require(`assert`);
const {fuzzyFilter} = require(`../fuzzbunny`);

// from https://en.wikipedia.org/wiki/List_of_Heroes_characters#Main_characters
const heroesCsv = `Claire Bennet, Rapid cellular regeneration
Elle Bishop, Electrokinesis
Monica Dawson, Adaptive muscle memory
EL Hawkins, Phasing
Maya Herrera, Poison emission
Isaac Mendez, Precognition
Adam Monroe, Immortality
Hiro Nakamura, Space-time manipulation
Matt Parkman, Telepathy
Angela Petrelli, Enhanced dreaming
Nathan Petrelli, Flight
Peterr Petrelli, Empathic mimicry then tactile power mimicry
Arthur Petrelli, Ability absorption
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
  const results = fuzzyFilter(heroes, [`name`, `ability`], searchStr).map((result) => result.highlights);
  // ⇩ uncomment to generate expected values
  // console.log(require(`util`).inspect(results, {depth: null, breakLength: 120}).replace(/'/g, `\``));
  return results;
}

describe(`fuzzyFilter`, function() {
  it(`empty search preserves order`, function() {
    assert.deepStrictEqual(getHighlights(``), [
      {name: [`Claire Bennet`], ability: [`Rapid cellular regeneration`]},
      {name: [`Elle Bishop`], ability: [`Electrokinesis`]},
      {name: [`Monica Dawson`], ability: [`Adaptive muscle memory`]},
      {name: [`EL Hawkins`], ability: [`Phasing`]},
      {name: [`Maya Herrera`], ability: [`Poison emission`]},
      {name: [`Isaac Mendez`], ability: [`Precognition`]},
      {name: [`Adam Monroe`], ability: [`Immortality`]},
      {name: [`Hiro Nakamura`], ability: [`Space-time manipulation`]},
      {name: [`Matt Parkman`], ability: [`Telepathy`]},
      {name: [`Angela Petrelli`], ability: [`Enhanced dreaming`]},
      {name: [`Nathan Petrelli`], ability: [`Flight`]},
      {name: [`Peterr Petrelli`], ability: [`Empathic mimicry then tactile power mimicry`]},
      {name: [`Arthur Petrelli`], ability: [`Ability absorption`]},
      {name: [`Micah Sanders`], ability: [`Technopathy`]},
      {name: [`Niki Sanders`], ability: [`Enhanced strength`]},
      {name: [`Tracy Strauss`], ability: [`Cryokinesis`]},
      {name: [`Samuel Sullivan`], ability: [`Terrakinesis`]},
      {name: [`Gabriel Gray / Sylar`], ability: [`Power mimicry and amplification`]},
    ]);
  });

  it(`matches at the beginning of a string`, function() {
    assert.deepStrictEqual(getHighlights(`TE`), [
      {ability: [``, `Te`, `lepathy`]},
      {ability: [``, `Te`, `chnopathy`]},
      {ability: [``, `Te`, `rrakinesis`]},
      {name: [`Pe`, `te`, `rr Petrelli`]},
    ]);
  });

  it(`matches in the middle of string`, function() {
    assert.deepStrictEqual(getHighlights(`mimi`), [
      {ability: [`Power `, `mimi`, `cry and amplification`]},
      {ability: [`Empathic `, `mimi`, `cry then tactile power mimicry`]},
    ]);
  });

  it(`matches exact word with "`, function() {
    assert.deepStrictEqual(getHighlights(`"petrelli`), [
      {name: [`Angela `, `Petrelli`]},
      {name: [`Arthur `, `Petrelli`]},
      {name: [`Nathan `, `Petrelli`]},
      {name: [`Peterr `, `Petrelli`]},
    ]);
  });

  it(`sorts by score, then alphabetically`, function() {
    const results = fuzzyFilter(heroes, [`name`, `ability`], `el`).map(({item, score}) => ({score, name: item.name}));
    assert.deepStrictEqual(results, [
      {score: 2200, name: 'EL Hawkins'},
      {score: 2200, name: 'Elle Bishop'},
      {score: 1200, name: 'Angela Petrelli'},
      {score: 1200, name: 'Arthur Petrelli'},
      {score: 1200, name: 'Claire Bennet'},
      {score: 1200, name: 'Gabriel Gray / Sylar'},
      {score: 1200, name: 'Matt Parkman'},
      {score: 1200, name: 'Nathan Petrelli'},
      {score: 1200, name: 'Peterr Petrelli'},
      {score: 1200, name: 'Samuel Sullivan'},
    ]);
  });
});
