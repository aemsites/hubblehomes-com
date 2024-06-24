/* eslint-disable function-call-argument-newline,  max-len, function-paren-newline, object-curly-newline */

/*
Notes:

Category filter functionality is depentant on fstab.yaml folder mappings

fstab.yaml
folders:
  /news/category/: /news

*/

import { button, ul, li, a, small } from './dom-helpers.js';

export default class DataPage {
  constructor(options) {
    const {
      jsonPath,
      articleContainer,
      articleCard,
      articlesPerPage = 10,
      paginationContainer,
      paginationMaxBtns = 7,
      categoryFilter,
    } = options;

    this.jsonPath = jsonPath;
    this.articleContainer = articleContainer;
    this.articleCard = articleCard;
    this.articlesPerPage = articlesPerPage;
    this.paginationContainer = paginationContainer;
    this.paginationMaxBtns = paginationMaxBtns;
    this.categoryFilter = categoryFilter;

    this.currentPage = 0;
    this.totalArticles = 0;
    this.selectedCategory = null;
    this.allArticles = []; // ADDED: Store all articles
  }

  async getArticles(page) {
    if (this.allArticles.length === 0) { // ADDED: Fetch articles only if not already fetched
      const response = await fetch(this.jsonPath);
      const json = await response.json();
      this.allArticles = json.data; // ADDED: Store fetched articles
    }

    let articles = this.allArticles;

    if (this.selectedCategory) {
      articles = articles.filter((article) => article.categories.includes(this.selectedCategory));
      this.totalArticles = articles.length; // update article length for pagination
    } else {
      this.totalArticles = articles.length; // use length of all articles
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
    // ingore if paginationContainer doesn't exist
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
      const $spaceBtn = button({ class: 'space' }, '...');
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

    const $categoryList = ul({ class: 'filter' });

    Object.keys(categories).forEach((category) => {
      const $categoryItem = li(
        a({ href: '#' },
          `${category} `, small(`(${categories[category]})`),
        ),
      );

      $categoryItem.querySelector('a').addEventListener('click', (event) => {
        event.preventDefault();
        this.selectedCategory = category;
        this.currentPage = 0;
        this.getArticles(this.currentPage);
      });

      $categoryList.appendChild($categoryItem);
    });

    this.categoryFilter.innerHTML = '';
    this.categoryFilter.appendChild($categoryList);
  }

  async render() {
    const response = await fetch(this.jsonPath);
    const json = await response.json();

    // render if categoryFilter is defined
    if (this.categoryFilter) this.generateCategoryList(json.data);

    // render if articleCard & articleContainer are defined
    if (this.articleCard && this.articleContainer) {
      // Todo: read page count and use article card to create skeleton loader

      await this.getArticles(this.currentPage);
    }

    // todo add history and push state
  }
}
