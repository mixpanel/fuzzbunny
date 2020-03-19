declare module "index" {
    /**
     * Split a string into match and non-match substrings based on finding
     * all whitespace-separated terms in a given filter string (for UI search
     * bars).
     * @param {string} targetStr - string to match on (haystack)
     * @param {string} searchStr - search filter string (needle)
     * @returns {string[] | null} list of alternating matching and non-matching substrings
     * in order of the original string; even = match, odd = no match
     * @example
     * stringFilterMatches(`my example string`, `myexstr`);
     * // [`my`, ` `, `ex`, `ample `, `str`, `ing`]
     */
    export function stringFilterMatches(targetStr: string, searchStr: string): string[] | null;
    /**
     * Fuzzy match and return the score, matchParts, and lowercased matchStr (for sort)
     * @param {string} targetStr - target to search on / haystack string
     * @param {string} searchStr - search filter / needle string
     * @returns {{score: number, matchParts: string[], matchStr: string} | null}
     */
    export function fuzzyMatch(targetStr: string, searchStr: string): {
        score: number;
        matchParts: string[];
        matchStr: string;
    } | null;
    /**
     * fuzzyMatchSanitized is called by fuzzyMatch, it's a slightly lower level call
     * If perf is of importance and you want to avoid lowercase + trim + highlighting on every item
     * Use this and only call matchPartsFromSegments for only the items that are displayed
     * @param {string} targetStr - lowercased trimmed target string to search on
     * @param {string} searchStr - lowercased trimmed search string
     * @returns {{score: number, segments: number[]} | null}
     */
    export function fuzzyMatchSanitized(targetStr: string, searchStr: string): {
        score: number;
        segments: number[];
    } | null;
    /**
     * Returns the string parts for highlighting from the matched segments
     * @example ('my example', [3, 2]) would return ['my ', 'ex', 'ample']
     * @param {string} targetStr - the string that was matched
     * @param {number[]} segments - [idx1, len1, idx2, len2] matched segments
     * @returns {string[]} - ['no match', 'match', 'no match', 'match']
     */
    export function matchPartsFromSegments(targetStr: string, segments: number[]): string[];
}
