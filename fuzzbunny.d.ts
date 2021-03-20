declare module "fuzzbunny" {
    export type FuzzyFilterResult<Item> = {
        item: Item;
        score: number;
        highlights: { [K in keyof Item]?: string[] | undefined; };
    };
    export type FuzzyFilterOptions<Item> = {
        /**
         * - fields of the item object that will be searched
         */
        fields: (keyof Item)[];
        /**
         * - maximum number of results that will be displayed in UI.
         * Since sorting large arrays is expensive, only top N items are sorted
         */
        numMaxResults?: number;
    };
    /**
     * @template Item
     * @typedef {{item: Item, score: number, highlights: {[K in keyof Item]?: string[]}}} FuzzyFilterResult
     */
    /**
     * @template Item
     * @typedef {Object} FuzzyFilterOptions
     * @prop {(keyof Item)[]} fields - fields of the item object that will be searched
     * @prop {number} [numMaxResults] - maximum number of results that will be displayed in UI.
     *   Since sorting large arrays is expensive, only top N items are sorted
     */
    /**
     * Searches an array of items on props and returns filtered + sorted array with scores and highlights
     * @template Item
     * @param {Item[]} items - list of objects to search on
     * @param {string} searchStr - the search string
     * @param {FuzzyFilterOptions<Item>} options - what fields to search on, and other options
     * @returns {FuzzyFilterResult<Item>[]}
     *
     * @example
     *  fuzzyFilter([
     *    {frist: 'Hello', last: 'World'},
     *    {frist: 'Foo', last: 'Bar'},
     *  ], {
     *    fields: ['first', 'last'],
     *  })
     */
    export function fuzzyFilter<Item>(items: Item[], searchStr: string, options: FuzzyFilterOptions<Item>): {
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
     * fuzzyScoreItem is called by fuzzyMatch, it's a slightly lower level call
     * If perf is of importance and you want to avoid lowercase + trim + highlighting on every item
     * Use this and only call highlightsFromRanges for only the items that are displayed
     * @param {string} targetStr - lowercased trimmed target string to search on
     * @param {string} searchStr - lowercased trimmed search string
     * @returns {{score: number, ranges: number[]} | null} - null if no match
     */
    export function fuzzyScoreItem(targetStr: string, searchStr: string): {
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
