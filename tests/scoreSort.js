const assert = require(`assert`);
const {inPlaceTopNScoreSort} = require(`../fuzzbunny`);

describe(`fuzzyFilter`, function() {
  it(`top n sort`, function() {
    const items = [
      {score: 1},
      {score: 2},
      {score: 3},
      {score: 4},
      {score: 5},
      {score: 6},
      {score: 7},
      {score: 8},
      {score: 9},
      {score: 10},
    ];
    const sorted = inPlaceTopNScoreSort(items, 3);
    assert.deepStrictEqual(sorted, [
      {score: 10},
      {score: 9},
      {score: 8},
      {score: 4},
      {score: 5},
      {score: 6},
      {score: 7},
      {score: 3},
      {score: 2},
      {score: 1},
    ]);
  });
});
