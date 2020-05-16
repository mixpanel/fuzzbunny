import {FuzzyFilterResult} from 'fuzzbunny';

// using require because typescript imports .d.ts for 'fuzzbunny' instead of module
// this is only an issue because docs/index.ts references the module directly and not through node_modules/fuzzbunny
const {fuzzyFilter} = require(`../fuzzbunny`);

interface Article {
  id: string;
  name: string;
}

interface ArticleListState {
  articles: Article[];
  numItemsToShow: number;
  searchFilter: string;
}

const NUM_INITIAL_ITEMS_TO_SHOW = 50;

function getArticleUrl(id: string): string {
  return `https://www.gutenberg.org/ebooks/${id}`;
}

async function fetchArticles(): Promise<Article[]> {
  const storageKey = `gutenberg-catalog`;
  const catalogUrl = `gutenberg-catalog.txt`;

  // save in local storage for fast 2nd load
  let catalog = localStorage.getItem(storageKey);
  if (!catalog) {
    catalog = await (await fetch(catalogUrl)).text();
    localStorage.setItem(storageKey, catalog);
  }

  return catalog
    .trim()
    .split(`\n`)
    .slice(1) // ignore comment
    .reverse()
    .map((line) => {
      // parse article's name and id into object
      const [_, name, id] = line.match(/^(.*?)\s+(\d+)$/) || [];
      return {name, id};
    });
}

class ArticleList {
  private elRefs: Record<string, HTMLElement>;
  private state: ArticleListState;
  private searchFilterDebounceTimeout: number = -1;

  constructor(articles: Article[], elRefs: Record<string, HTMLElement>) {
    this.state = {
      articles,
      numItemsToShow: NUM_INITIAL_ITEMS_TO_SHOW,
      searchFilter: ``,
    };
    this.elRefs = elRefs;
    this.elRefs.search.addEventListener(`input`, this.handleSearchInput.bind(this));
    this.elRefs.results.addEventListener(`scroll`, this.handleResultsScroll.bind(this));
    this.update({});
  }

  // Simple update -> render lifecycle;
  update(props: Partial<ArticleListState> = {}) {
    Object.assign(this.state, props);
    this.render();
  }

  handleSearchInput(ev: Event) {
    this.elRefs.results.scrollTop = 0;
    const searchFilter = (ev.currentTarget as HTMLInputElement).value;
    const numItemsToShow = NUM_INITIAL_ITEMS_TO_SHOW;

    // debounce searchFilter for 100ms if input length is <= 3
    // for large set of results (>10k) the native js .sort() overheard could be >100ms
    window.clearTimeout(this.searchFilterDebounceTimeout);
    if (searchFilter && searchFilter.length <= 3) {
      this.searchFilterDebounceTimeout = window.setTimeout(() => this.update({searchFilter, numItemsToShow}), 100);
    } else {
      this.update({searchFilter, numItemsToShow});
    }
  }

  handleResultsScroll(ev: Event) {
    const {articles, numItemsToShow} = this.state;
    const resultsEl = this.elRefs.results;
    const distanceToBottom = resultsEl.scrollHeight - resultsEl.clientHeight - resultsEl.scrollTop;
    const distanceThreshold = 100;

    if (distanceToBottom < distanceThreshold) {
      this.update({
        numItemsToShow: Math.min(numItemsToShow + NUM_INITIAL_ITEMS_TO_SHOW, articles.length),
      });
    }
  }

  fuzzyFilterArticles(): Array<FuzzyFilterResult<Article>> {
    const {articles, searchFilter} = this.state;
    return fuzzyFilter(articles, searchFilter, {fields: [`name`]});
  }

  render() {
    const {numItemsToShow} = this.state;
    const startTime = Date.now();
    const filteredArticles = this.fuzzyFilterArticles();
    const elapsedMs = Date.now() - startTime;

    this.elRefs.results.innerHTML = filteredArticles
      .slice(0, numItemsToShow)
      .map(
        (match) =>
          // @ts-ignore - object possibly undefined (we're sure they're non-null)
          `<a href='${getArticleUrl(match.item.id)}' target='_blank'>${match.highlights.name
            .map((part) => `<span>${part}</span>`)
            .join(``)}</a>`,
      )
      .join(``);

    this.elRefs.stats.innerHTML = `Found ${filteredArticles.length.toLocaleString()} results in ${elapsedMs}ms`;
  }
}

document.addEventListener(`DOMContentLoaded`, function() {
  fetchArticles().then((articles) => {
    new ArticleList(articles, {
      search: document.querySelector(`.search`),
      results: document.querySelector(`.results`),
      stats: document.querySelector(`.stats`),
    } as Record<string, HTMLElement>);
  });
});
