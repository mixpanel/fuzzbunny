declare module "fuzzbunny" {
    export type FuzzyFilterResult<Item> = {
        item: Item;
        score: number;
        highlights: { [K in keyof Item]?: string[] | undefined; };
    };
    /**
     * @template Item
     * @typedef {{item: Item, score: number, highlights: {[K in keyof Item]?: string[]}}} FuzzyFilterResult
     */
    /**
     * Searches an array of items on props and returns filtered + sorted array with scores and highlights
     * @template Item
     * @param {Item[]} items
     * @param {(keyof Item)[]} props
     * @param {string} searchStr
     * @returns {FuzzyFilterResult<Item>[]}
     */
    export function fuzzyFilter<Item>(items: Item[], props: (keyof Item)[], searchStr: string): {
        item: Item;
        score: number;
        highlights: { [K in keyof Item]?: string[] | undefined; };
    }[];
    /**
     * Fuzzy match and return the score, highlights, and lowercased matchStr (for sort)
     * @param {string} targetStr - target to search on / haystack string
     * @param {string} searchStr - search filter / needle string
     * @returns {{score: number, highlights: string[]} | null} - null if no match
     */
    export function fuzzyMatch(targetStr: string, searchStr: string): {
        score: number;
        highlights: string[];
    } | null;
    /**
     * fuzzyMatchSanitized is called by fuzzyMatch, it's a slightly lower level call
     * If perf is of importance and you want to avoid lowercase + trim + highlighting on every item
     * Use this and only call highlightsFromRanges for only the items that are displayed
     * @param {string} targetStr - lowercased trimmed target string to search on
     * @param {string} searchStr - lowercased trimmed search string
     * @returns {{score: number, ranges: number[]} | null} - null if no match
     */
    export function fuzzyMatchSanitized(targetStr: string, searchStr: string): {
        score: number;
        ranges: number[];
    } | null;
    /**
     * Returns the string parts for highlighting from the matched ranges
     * @example ('my example', [3, 2]) would return ['my ', 'ex', 'ample']
     * @param {string} targetStr - the string that was matched
     * @param {number[]} ranges - [idx1, len1, idx2, len2] matched ranges
     * @returns {string[]} - ['no match', 'match', 'no match', 'match']
     */
    export function highlightsFromRanges(targetStr: string, ranges: number[]): string[];
}
