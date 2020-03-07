# FuzzBunny

FuzzBunny is a small (1k) fast & memory efficient fuzzy string searching/matching/highlighting library with zero dependencies

## Installation

`npm install --save fuzzbunny

## Usage

TODO: instructions here

## Demo

TODO: link here (github.io link)

## How it works

FuzzBunny optimizes for speed and return results sorted by relevance score.
It does substring and word prefix based matching.

Example:

- Searching "usa" matches "[U]nited [S]tates of [A]merica". Greedy search would match "[U]nited [S]t[a]tes of America"
- Seaching "ttfr" doesn't match "United States of America". Greedy search would match "United S[t]a[t]es o[f] Ame[r]ica".
- We're good at prefix recalling e.g words starting with "Br" but find words containing "br" is a much harder task.
- Searching "merica" would match "United States of A[merica]" since that is a contiguous substring match.
- FuzzBunny scores by whether the match occurs at the start of sentence, how many letters match together and how early the match occurs.

## API

TODO some docs

## Perf numbers

- See perf-tester.js Fuzzbunny matches ~ million sentences / second

# TODO:

eslint + typescript
travis build
