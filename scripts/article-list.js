/* eslint-disable function-call-argument-newline, max-len, function-paren-newline, object-curly-newline */

/*
### NOTES:

Category filter functionality is depentant on fstab.yaml folder mappings

This should match the 'filterRootPath'

fstab.yaml
folders:
  /news/category/: /news

### USAGE EXAMPLE:
  const dataPage = new ArticleList({
    jsonPath: '/news/news-index.json', // required
    articleContainer: $dataContainer, // optional: article list container (required for data list to show)
    articleCard: $article, // optional: article card object (required for data list to show)
    articlesPerPage: 10, // optional: max articles show per page (default = 10)
    paginationContainer: $dataPagination, // optional: paginationContair
    paginationMaxBtns: 7, // optional: default = 7
    filterContainer: $dataFilter, // optional: containerContainer (required for category filter)
    categoryPath: '/news/category/', // WIP optional: container-root apth (required for category filter)
  });

*/

import { button, ul, li, a, small } from './dom-helpers.js';

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

    this.currentPage = 0;
    this.totalArticles = 0;
    this.selectedCategory = null;
    this.allArticles = [];
  }

  async getArticles(page) {
    if (this.allArticles.length === 0) {
      // get articles if they don't already exist - CHECK WHY THIS IS NECESSARY
      const response = await fetch(this.jsonPath);
      const json = await response.json();
      this.allArticles = json.data; // ADDED: Store fetched articles
    }

    let articles = this.allArticles;

    if (this.selectedCategory) {
      console.log('this.selectedCategory =', this.selectedCategory);
      articles = articles.filter((article) => article.categories.toLowerCase().replace(/\s+/g, '-').includes(this.selectedCategory));
      // update article length for pagination
      this.totalArticles = articles.length;
    } else {
      // use length of all articles
      console.log('for what');
      this.totalArticles = articles.length;
    }

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
    const $pageBtn = button({ class: n === this.currentPage ? 'active yellow' : '' }, (n + 1).toString());
    $pageBtn.addEventListener('click', () => {
      if (this.currentPage !== n) {
        this.currentPage = n;
        this.getArticles(this.currentPage);
      }
    });
    return $pageBtn;
  }

  updatePagination() {
    // exit if paginationContainer doesn't
    if (!this.paginationContainer) return;

    this.paginationContainer.innerHTML = '';
    const p = document.createDocumentFragment();

    const $prev = button({ class: 'prev' }, '«');
    $prev.addEventListener('click', () => {
      if (this.currentPage > 0) {
        this.currentPage -= 1;
        this.getArticles(this.currentPage);
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
        this.getArticles(this.currentPage);
      }
    });
    $next.disabled = this.currentPage === totalPages - 1;
    p.appendChild($next);

    this.paginationContainer.appendChild(p);
  }

  generateCategoryList(data) {
    const categories = {};

    data.forEach((article) => {
      article.categories.split(', ').forEach((category) => {
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += 1;
      });
    });

    const $categories = ul({ class: 'filter' });

    Object.keys(categories).forEach((category) => {
      const categoryPath = this.filterRootPath + this.selectedCategory;
      console.log(categoryPath);
      const $a = a({ href: categoryPath }, `${category} `, small(`(${categories[category]})`));
      const $li = li($a);
      $a.addEventListener('click', (event) => {
        if (this.articleCard && this.articleContainer) event.preventDefault();
        this.selectedCategory = category.toLowerCase().replace(/\s+/g, '-');
        this.getArticles(0);
        this.updateUrl();
      });
      $categories.appendChild($li);
    });

    this.filterContainer.innerHTML = '';
    this.filterContainer.appendChild($categories);
  }

  setCategory() {
    const { pathname } = new URL(window.location.href);
    const pathSegments = pathname.split('/').filter(Boolean);
    const filterRootPathIndex = pathSegments.indexOf(this.filterRootPath);

    console.log('selectedCategory', this.selectedCategory);
    this.selectedCategory = (filterRootPathIndex !== -1 && pathSegments[filterRootPathIndex + 1]) || '';
    console.log('selectedCategory', this.selectedCategory);
  }

  updateUrl() {
    window.history.pushState(null, '', this.filterRootPath + this.selectedCategory);
  }

  onPopState() {
    this.setCategory();
    this.getArticles(this.currentPage);
  }

  async render() {
    const response = await fetch(this.jsonPath);
    const json = await response.json();

    // if categoryFilter is defined render it
    if (this.filterContainer) {
      this.generateCategoryList(json.data);
    }

    // if articleCard & articleContainer are defined render them
    if (this.articleCard && this.articleContainer) {
      this.setCategory();
      await this.getArticles(this.currentPage);
      window.addEventListener('popstate', (event) => this.onPopState(event));
    }

    // todo add history and push state
  }
} // end ArticleList
