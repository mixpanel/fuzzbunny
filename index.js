// @ts-check

const SCORE_START_STR = 1000;
const SCORE_PREFIX = 200;
const SCORE_CONTIGUOUS = 300;

/**
 * @param {number} idx - index of the match
 * @param {number} len - length of the match
 * @param {boolean} isPrefix - was it a prefix of a word
 * @returns {number} - score of the match, higher is better
 */
function _getMatchScore(idx, len, isPrefix) {
  let score = 0;

  // increase score exponentially per letter matched so that contiguous matches are ranked higher
  // i.e '[abc]' ranks higher than '[ab]ott [c]hemicals'
  score += SCORE_CONTIGUOUS * len * len;

  if (idx === 0) {
    // matching at the start of string gets a ranking bonus
    score += SCORE_START_STR;
  } else if (isPrefix) {
    // closer to the start, the higher it ranks
    score += SCORE_PREFIX - idx;
  }

  return score;
}

// Ascii codes: <w_space>!"#$%&'()*+,-./0123456789:;<=>?@
// ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
const CODE_A = `a`.charCodeAt(0);
const CODE_Z = `z`.charCodeAt(0);
const CODE_0 = `0`.charCodeAt(0);
const CODE_9 = `9`.charCodeAt(0);
const CODE_EXCL_MARK = `!`.charCodeAt(0);
const CODE_SLASH = `/`.charCodeAt(0);
const CODE_COLON = `:`.charCodeAt(0);
const CODE_AT = `@`.charCodeAt(0);
const CODE_SQ_BKT = `[`.charCodeAt(0);
const CODE_CARET = `\``.charCodeAt(0);
const CODE_CRLY_BKT = `{`.charCodeAt(0);
const CODE_TILDE = `~`.charCodeAt(0);
const CODE_START_UNICODE = 127;

/**
 * @param {number} charCode
 * @returns {boolean}
 */
function _isCodeAlphaNum(charCode) {
  // 0 - 126 charCodes are ascii, 127 onwards are unicode code points
  // str will be lowercased so we only check for lowercased codes
  return (
    (charCode >= CODE_A && charCode <= CODE_Z) ||
    (charCode >= CODE_0 && charCode <= CODE_9) ||
    charCode >= CODE_START_UNICODE
  );
}

/**
 * @param {number} charCode
 * @returns {boolean}
 */
function _isCodePunctuation(charCode) {
  // rather than create a uint8 typed array as a lookup table
  // uglifyjs inlines this function in prod builds. JIT should inline too.
  // we're calling it charCode rather than 'code' because of an uglifyjs bug
  // see: https://github.com/mishoo/UglifyJS2/issues/2842
  return (
    (charCode >= CODE_EXCL_MARK && charCode <= CODE_SLASH) ||
    (charCode >= CODE_COLON && charCode <= CODE_AT) ||
    (charCode >= CODE_SQ_BKT && charCode <= CODE_CARET) ||
    (charCode >= CODE_CRLY_BKT && charCode <= CODE_TILDE)
  );
}

/**
 * A skip index marks word and punctuation boundaries
 * We use this to skip around the targetStr and quickly find prefix matches
 * @param {string} targetStr
 * @returns {number[]}
 */
function _getTargetSkips(targetStr) {
  const targetSkips = [];
  let wasAlphaNum = false;

  for (let i = 0, len = targetStr.length; i < len; ++i) {
    const code = targetStr.charCodeAt(i);
    const isAlphaNum = _isCodeAlphaNum(code);

    if (isAlphaNum && !wasAlphaNum) {
      targetSkips.push(i);
    } else if (_isCodePunctuation(code)) {
      targetSkips.push(i);
    }

    wasAlphaNum = isAlphaNum;
  }

  // We push the length as the last skip so when matching
  // every segment aligns between skip[i] and skip[i + 1]
  // and we don't have to do extraneous overflow checks
  targetSkips.push(targetStr.length);

  // these can possibly be cached on the items for a faster search next time
  return targetSkips;
}

/**
 * performs a prefix match e.g 'usam' matches '[u]nited [s]tates of [am]erica
 * @param {number} skipIdx - skip index where to start search from
 * @param {string} searchStr - lowercased search string
 * @param {string} targetStr - lowercased target string
 * @param {number[]} targetSkips - skip boundary indices
 * @returns {number[]} - the [idx, len, ...] segments where the match occured
 */
function _fuzzyPrefixMatch(skipIdx, searchStr, targetStr, targetSkips) {
  let searchIdx = 0;
  const searchLen = searchStr.length;
  const segments = [];

  for (let skipLen = targetSkips.length - 1; skipIdx < skipLen; ++skipIdx) {
    const startIdx = targetSkips[skipIdx];
    const endIdx = targetSkips[skipIdx + 1];
    let targetIdx = startIdx;
    let matchLen = 0;

    while (targetIdx < endIdx && searchIdx < searchLen) {
      const targetChar = targetStr[targetIdx];
      const searchChar = searchStr[searchIdx];

      if (targetChar === searchChar) {
        ++targetIdx;
        ++searchIdx;
        ++matchLen;
        continue;
      }

      // spaces shouldn't break matching
      if (targetChar === ` `) {
        ++targetIdx;
        continue;
      }
      if (searchChar === ` `) {
        ++searchIdx;
        continue;
      }

      break;
    }

    if (matchLen) {
      // make contiguous segments if possible
      const segLen = segments.length;
      if (segLen >= 2 && segments[segLen - 2] + segments[segLen - 1] === startIdx) {
        segments[segLen - 1] += matchLen;
      } else {
        segments.push(startIdx, matchLen);
      }
    }

    if (searchIdx === searchLen) {
      // search is fully matched, return segments
      return segments;
    }
  }

  return null;
}

/**
 * Returns the string parts for highlighting from the matched segments
 * @example ('my example', [3, 2]) would return ['my ', 'ex', 'ample']
 * @param {string} targetStr - the string that was matched
 * @param {number[]} segments - [idx1, len1, idx2, len2] matched segments
 * @returns {string[]} - ['match', 'no match', 'match', 'no match']
 */
export function matchPartsFromSegments(targetStr, segments) {
  const matchParts = [];
  let lastIndex = 0;
  let segmentsIdx = 0;

  // the format should have been odd - no match, even - match
  // but for historical reasons we're doing the other way which adds extra if/else
  if (segments.length >= 2 && segments[0] === 0) {
    lastIndex = segments[1];
    matchParts.push(targetStr.slice(segments[0], lastIndex));
    segmentsIdx += 2;
  } else {
    matchParts.push(``);
  }

  for (; segmentsIdx < segments.length; segmentsIdx += 2) {
    const startIndex = segments[segmentsIdx];
    const endIndex = startIndex + segments[segmentsIdx + 1];
    matchParts.push(targetStr.slice(lastIndex, startIndex));
    matchParts.push(targetStr.slice(startIndex, endIndex));
    lastIndex = endIndex;
  }

  if (lastIndex < targetStr.length) {
    matchParts.push(targetStr.slice(lastIndex));
  }

  return matchParts;
}

/**
 * fuzzyMatchSanitized is called by fuzzyMatch, it's a slightly lower level call
 * If perf is of importance and you want to avoid lowercase + trim + highlighting on every item
 * Use this and only call matchPartsFromSegments for only the items that are dispayed
 * @param {string} targetStr - lowercased trimmed target string to search on
 * @param {string} searchStr - lowercased trimmed search string
 * @returns {{score: number, segments: number[]} | null}
 */
export function fuzzyMatchSanitized(targetStr, searchStr) {
  if (!targetStr) {
    return null;
  }

  // if user enters a quoted search then only perform substring match
  // e.g "la matches [{La}s Vegas] but not [Los Angeles]
  // NOTE: ending quote is optional so user can get incremental matching as they type.
  const isQuotedSearchStr = searchStr.startsWith(`"`);
  if (isQuotedSearchStr) {
    searchStr = searchStr.slice(1, searchStr.endsWith(`"`) ? -1 : searchStr.length);
  }

  // try substring search first
  // js engine uses boyer moore algo which is very fast O(m/n)
  const matchIdx = targetStr.indexOf(searchStr);
  const searchLen = searchStr.length;

  if (matchIdx >= 0) {
    const isWordPrefix = matchIdx > 0 && !_isCodeAlphaNum(targetStr.charCodeAt(matchIdx - 1));
    return {
      score: _getMatchScore(matchIdx, searchLen, isWordPrefix),
      segments: [matchIdx, searchLen],
    };
  }

  // if we didn't match a single character as a substr, we won't fuzzy match it either, exit early.
  // if quoted search, exit after substring search as well, since user doesn't want fuzzy search.
  if (searchLen === 1 || isQuotedSearchStr) {
    return null;
  }

  // fall back to fuzzy matching which matches word prefixes or punctuations
  // because we've precomputed targetSkips, its O(m+n) for avg case
  // the skip array helps us make faster alignments, rather than letter by letter
  const targetSkips = _getTargetSkips(targetStr);

  for (let skipIdx = 0, skipLen = targetSkips.length - 1; skipIdx < skipLen; ++skipIdx) {
    if (targetStr[targetSkips[skipIdx]] === searchStr[0]) {
      // possible alignment, perform prefix match
      const segments = _fuzzyPrefixMatch(skipIdx, searchStr, targetStr, targetSkips);
      if (segments) {
        let score = 0;
        for (let i = 0, len = segments.length; i < len; i += 2) {
          score += _getMatchScore(segments[i], segments[i + 1], true /*isWordPrefix*/);
        }
        return {score, segments};
      }
    }
  }

  return null;
}

/**
 * Fuzzy match and return the score, matchParts, and lowercased matchStr (for sort)
 * @param {string} targetStr - target to search on / haystack string
 * @param {string} searchStr - search filter / needle string
 * @returns {{score: number, matchParts: string[], matchStr: string} | null}
 */
export function fuzzyMatch(targetStr, searchStr) {
  targetStr = (targetStr || ``).trim();
  searchStr = (searchStr || ``).trim().toLowerCase();
  const targetSanitizedStr = targetStr.toLowerCase();
  const match = fuzzyMatchSanitized(targetSanitizedStr, searchStr);

  if (match) {
    return {
      score: match.score,
      matchParts: matchPartsFromSegments(targetStr, match.segments),
      matchStr: targetSanitizedStr,
    };
  }

  return null;
}

/**
 * Split a string into match and non-match substrings based on finding
 * all whitespace-separated terms in a given filter string (for UI search
 * bars).
 * @param {string} targetStr - string to match on (haystack)
 * @param {string} filterStr - search filter string (needle)
 * @returns {string[]} list of alternating matching and non-matching substrings
 * in order of the original string; even = match, odd = no match
 * @example
 * stringFilterMatches(`my example string`, `myexstr`);
 * // [`my`, ` `, `ex`, `ample `, `str`, `ing`]
 */
export function stringFilterMatches(targetStr, filterStr) {
  const match = fuzzyMatch(targetStr, filterStr);
  return match && match.matchParts;
}
