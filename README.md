# FuzzBunny

FuzzBunny is a small (1k) fast & memory efficient fuzzy string searching/matching/highlighting library with zero dependencies

[![Travis](https://img.shields.io/travis/mixpanel/fuzzbunny/master.svg)](https://travis-ci.org/mixpanel/fuzzbunny)
[![npm](https://img.shields.io/npm/v/fuzzbunny.svg)](https://www.npmjs.com/package/fuzzbunny)
[![npm](https://img.shields.io/npm/dm/fuzzbunny.svg)](https://www.npmjs.com/package/fuzzbunny)
[![npm](https://img.shields.io/npm/l/fuzzbunny.svg)](https://github.com/mixpanel/fuzzbunny/blob/master/LICENCE)

## Installation

`npm install --save fuzzbunny`

## Demo

[FuzzBunny Gutenberg Catalog Demo →](https://mixpanel.github.io/fuzzbunny)

![fuzzbunny demo](https://user-images.githubusercontent.com/1018196/77124047-0fbf6580-69ff-11ea-8d44-f8006b7770fd.gif)

## Usage

```js
const {fuzzyFilter, fuzzyMatch} = require(`fuzzbunny`);
// or import {fuzzyFilter, fuzzyMatch} from 'fuzzbunny';

const heroes = [
  {
    name: `Claire Bennet`,
    ability: `Rapid cellular regeneration`,
  },
  {
    name: `Micah Sanders`,
    ability: `Technopathy`,
  },
  {
    name: `Hiro Nakamura`,
    ability: `Space-time manipulation`,
  },
  {
    name: `Peter Petrelli`,
    ability: `Tactile power mimicry`,
  },
];

// Use fuzzyFilter to filter an array of items and get filtered + score sorted results with highlights.
const results = fuzzyFilter(heroes, [`name`, `ability`], `stm`);
/*
results = [
  {
    item: {
      name: 'Peter Petrelli',
      ability: 'Tactile power mimicry',
    },
    score: 1786,
    highlights: {
      ability: ['', 'T', 'actile power ', 'm', 'imicry'],
    },
  },
  {
    item: {
      name: 'Hiro Nakamura',
      ability: 'Space-time manipulation',
    },
    score: 983,
    highlights: {
      ability: ['Space-', 't', 'ime ', 'm', 'anipulation'],
    },
  },
];
*/

// Use fuzzyMatch to match a single string to get score + highlights. Returns null if no match found.
const match = fuzzyMatch(heroes[0].name, `ben`);
/*
match = {
  score: 2893,
  highlights: ['Claire ', 'Ben', 'net'],
};
*/
```

## Scoring and Sort order

Fuzzbunny uses a scoring algorithm that prioritizes following signals. See `_getMatchScore` function.

- Start of string - `{Mayfl}ower` ranks above `The {Mayfl}ower`
- Closer to start- `The {Mayfl}ower` ranks above `Story of the {Mayfl}ower`
- Contiguous length - `The {Mayfl}ower` ranks above `{May} {fl}ower`
- Alphabetically - `The {May} {fl}ower` ranks above `This {May} {fl}ower`

Example from demo:

![image](https://user-images.githubusercontent.com/1018196/77127584-58305080-6a0a-11ea-9fee-d8eaf28744b8.png)

## Performance

Fuzzbunny matches ~ million lines/second. See [tests/performance.js](tests/performance.js)

## Types

FuzzBunny comes with autogenerated typescript types. See [index.d.ts](index.d.ts)
