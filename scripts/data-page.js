import { button } from './dom-helpers.js';

export default class DataPage {
  constructor(options) {
    const {
      jsonPath,
      articleContainer,
      article,
      articlesPerPage,
      paginationContainer,
      paginationMaxBtns,
      categoryFilter,
    } = options;

    this.jsonPath = jsonPath;
    this.articleContainer = articleContainer;
    this.article = article;
    this.articlesPerPage = articlesPerPage;
    this.paginationContainer = paginationContainer;
    this.maxBtns = paginationMaxBtns;
    this.categoryFilter = categoryFilter;

    this.currentPage = 0;
    this.totalArticles = 0;
  }

  async getArticles(page) {
    const offset = page * this.articlesPerPage;
    const response = await fetch(`${this.jsonPath}?offset=${offset}&limit=${this.articlesPerPage}`);
    const data = await response.json();
    const newsArticles = data.data;

    this.totalArticles = data.total;
    this.renderArticles(newsArticles);
    this.updatePagination();
  }

  renderArticles(articles) {
    this.articleContainer.innerHTML = '';
    const article = document.createDocumentFragment();
    articles.forEach((a) => {
      article.appendChild(this.article(a));
    });
    this.articleContainer.appendChild(article);
  }

  addPageBtn(n) {
    const $pageBtn = button({ class: n === this.currentPage ? 'active' : '' }, (n + 1).toString());
    $pageBtn.addEventListener('click', () => {
      if (this.currentPage !== n) {
        this.currentPage = n;
        this.getArticles(this.currentPage);
      }
    });
    return $pageBtn;
  }

  updatePagination() {
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

    if (totalPages <= this.maxBtns + 2) {
      Array.from({ length: totalPages }, (_, i) => p.appendChild(this.addPageBtn(i)));
    } else {
      const half = Math.floor((this.maxBtns - 3) / 2); // buttons on either side of current
      const extra = (this.maxBtns - 1) % 2; // if remainder exists
      let startPage;
      let endPage;
      const $spaceBtn = button({ class: 'space' }, '...');
      $spaceBtn.disabled = true;

      // determine start/end values
      if (this.currentPage < totalPages - half * 2 + 1 + extra) {
        startPage = Math.max(1, this.currentPage - half);
        endPage = Math.max(this.maxBtns - 2, this.currentPage + half + extra);
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



  // put category logic here




  
  async render() {
    await this.getArticles(this.currentPage);
  }
}
