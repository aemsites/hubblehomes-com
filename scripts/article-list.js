/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */

/*
## NOTES:

The ArticleList class is used to render a list of artilces, pagination and a categor filter,
it can be customized to suit different needs:

### EXAMPLE USAGE:
  const articleList = new ArticleList({
    jsonPath: '/news/news-index.json', // required
    articleContainer: $dataContainer, // optional: (will not render if object isn't passed)
    articleCard: $article, // optional: (will not render if object isn't passed && articleContainer)
    articlesPerPage: 10, // optional: (default = 10)
    paginationContainer: $dataPagination, // optional: (will not render if object isn't passed)
    paginationMaxBtns: 7, // optional: (default = 7)
    filterContainer: $dataFilter, // optional: (will not render if object isn't passed)
    filterRootPath: '/news/category/', // optional: (filterContainer must be present)
  });
await articleList.render();

*/

import { button, ul, li, a, small } from './dom-helpers.js';

function getPageN() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  return page ? parseInt(page, 10) : 0; // set to 0 if page is not set
}

export default class ArticleList {
  constructor(options) {
    const {
      jsonPath,
      articleContainer,
      articleCard,
      articlesPerPage = 10,
      paginationContainer,
      paginationMaxBtns = 7,
      filterContainer,
      filterRootPath,
    } = options;

    this.jsonPath = jsonPath;
    this.articleContainer = articleContainer;
    this.articleCard = articleCard;
    this.articlesPerPage = articlesPerPage;
    this.paginationContainer = paginationContainer;
    this.paginationMaxBtns = paginationMaxBtns;
    this.filterContainer = filterContainer;
    this.filterRootPath = filterRootPath;
    this.currentPage = getPageN();
    this.totalArticles = 0;
    this.urlCategory = null;
    this.allArticles = [];
  }

  async getArticles() {
    const page = this.currentPage;
    let articles = this.allArticles;

    // filter if category is present
    if (this.urlCategory) {
      articles = articles.filter((article) => {
        const articleCategories = article.categories.toLowerCase().replace(/\s+/g, '-');
        return articleCategories.includes(this.urlCategory);
      });
    }

    // sort articles by publisheddate
    articles = articles.sort((A, B) => parseInt(B.publisheddate, 10) - parseInt(A.publisheddate, 10));

    this.totalArticles = articles.length;
    this.renderArticles(articles.slice(page * this.articlesPerPage, (page + 1) * this.articlesPerPage));
    this.updatePagination();
  }

  renderArticles(articles) {
    this.articleContainer.innerHTML = '';
    const article = document.createDocumentFragment();
    articles.forEach((card) => {
      article.appendChild(this.articleCard(card));
    });
    this.articleContainer.appendChild(article);
  }

  addPageBtn(n) {
    const $pageBtn = button({ class: n === this.currentPage ? 'active' : '' }, (n + 1).toString());
    $pageBtn.addEventListener('click', () => {
      if (this.currentPage !== n) {
        this.currentPage = n;
        this.getArticles();
      }
    });
    return $pageBtn;
  }

  updatePagination() {
    if (!this.paginationContainer) return;
    this.paginationContainer.innerHTML = '';

    // exit if paginationContainer isn't present or article count is < maxpage count
    if (!this.paginationContainer || this.totalArticles < this.articlesPerPage) return;

    const p = document.createDocumentFragment();

    const $prev = button({ class: 'prev' }, '«');
    $prev.addEventListener('click', () => {
      if (this.currentPage > 0) {
        this.currentPage -= 1;
        this.getArticles();
      }
    });
    $prev.disabled = this.currentPage === 0;
    p.appendChild($prev);

    const totalPages = Math.ceil(this.totalArticles / this.articlesPerPage);

    if (totalPages <= this.paginationMaxBtns + 2) {
      Array.from({ length: totalPages }, (_, i) => p.appendChild(this.addPageBtn(i)));
    } else {
      const half = Math.floor((this.paginationMaxBtns - 3) / 2); // buttons on either side of active
      const extra = (this.paginationMaxBtns - 1) % 2; // remainder (if maxBtns is an even n)
      let startPage;
      let endPage;
      const $spaceBtn = button({ class: 'space' }, ' - ');
      $spaceBtn.disabled = true;

      // determine start/end values
      if (this.currentPage < totalPages - half * 2 + 1 + extra) {
        startPage = Math.max(1, this.currentPage - half);
        endPage = Math.max(this.paginationMaxBtns - 2, this.currentPage + half + extra);
      } else {
        startPage = totalPages - half * 2 - 2 - extra;
        endPage = totalPages - 1;
      }

      // 1st btn + space
      p.appendChild(this.addPageBtn(0));
      if (startPage > 1) p.appendChild($spaceBtn.cloneNode(true));

      // middle btns
      for (let i = startPage; i <= endPage; i += 1) {
        p.appendChild(this.addPageBtn(i));
      }

      // space + last btn
      if (endPage < totalPages - 2) {
        p.appendChild($spaceBtn.cloneNode(true));
        p.appendChild(this.addPageBtn(totalPages - 1));
      } else if (endPage === totalPages - 2) {
        p.appendChild(this.addPageBtn(totalPages - 1));
      }
    }

    const $next = button({ class: 'next' }, '»');
    $next.addEventListener('click', () => {
      if (this.currentPage < totalPages - 1) {
        this.currentPage += 1;
        this.getArticles();
      }
    });
    $next.disabled = this.currentPage === totalPages - 1;
    p.appendChild($next);

    this.paginationContainer.appendChild(p);
    this.updateUrl();
  }

  generateFilterList() {
    const categories = {};

    this.allArticles.forEach((article) => {
      article.categories.split(', ').forEach((category) => {
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += 1;
      });
    });

    const $categories = ul({ class: 'filter' });

    Object.keys(categories).forEach((category) => {
      const cat = category.toLowerCase().replace(/\s+/g, '-');
      const $a = a({ href: this.filterRootPath + cat }, `${category} `, small(`(${categories[category]})`));
      const $li = li({ class: this.urlCategory === cat ? 'active' : '' }, $a);
      $a.addEventListener('click', (event) => {
        if (this.articleCard && this.articleContainer) event.preventDefault();
        this.urlCategory = cat;
        this.currentPage = 0;
        this.getArticles();
        this.updateUrl();
        this.generateFilterList();
      });
      $categories.appendChild($li);
    });

    this.filterContainer.innerHTML = '';
    this.filterContainer.appendChild($categories);
  }

  getCategory() {
    [this.urlCategory] = window.location.pathname
      .replace(this.filterRootPath, '')
      .split('/');
  }

  updateUrl() {
    const url = new URL(window.location);
    url.pathname = this.filterRootPath + this.urlCategory;
    // only update ?page if it is not 0
    if (this.currentPage !== 0) url.searchParams.set('page', this.currentPage);
    else url.searchParams.delete('page');
    // only update if category exists
    if (this.urlCategory) window.history.pushState(null, '', url);
  }

  onPopState() {
    this.getCategory();
    this.generateFilterList();
    this.getArticles();
  }

  async render() {
    const response = await fetch(this.jsonPath);
    const json = await response.json();
    this.allArticles = json.data;

    this.getCategory();

    // if categoryFilter is defined render it
    if (this.filterContainer) this.generateFilterList();

    // if articleCard & articleContainer are defined render them
    if (this.articleCard && this.articleContainer) {
      await this.getArticles();
      window.addEventListener('popstate', (event) => this.onPopState(event));
    }
  }
}
