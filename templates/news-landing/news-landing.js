/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, p, small, aside, h1, a } from '../../scripts/dom-helpers.js';
import DataPage from '../../scripts/data-page.js';

export default async function decorate(doc) {
  const $h1 = h1(doc.title);
  // test
  const $breadCrumbs = div({ class: 'breadcrumbs' },
    a({ href: '/', 'arial-lable': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/news', 'arial-lable': 'View News Page' }, 'News'),
    ' > ',
    $h1.textContent,
  );

  const $dataContainer = div({ class: 'articleContainer' }, 'LOADING ARTICLES');
  const $article = (article) => div({ class: 'article' },
    h3(article.title),
    small(article.publisheddate, article.categories),
    p(article.description),
    a({ class: 'btn yellow', href: article.path }, 'Read Article'),
    article.image,
  );

  const $dataPagination = div({ class: 'pagination' }, 'LOADING PAGINATION');

  const $dataFilter = div({ class: 'categories' }, 'LOADING CATEGORIES');

  const $newPage = div({ class: 'section' },
    $breadCrumbs,
    $h1,
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $dataPagination,
        $dataContainer,
      ),
      aside(
        $dataFilter,
      ),
    ),
  );
  const $page = doc.querySelector('main .section');
  $page.replaceWith($newPage);

  const dataPage = new DataPage({
    jsonPath: '/news/news-index.json', // required
    articleContainer: $dataContainer, // optional: article list container (required for data list to show)
    articleCard: $article, // optional: article card object (required for data list to show)
    articlesPerPage: 10, // optional: max articles show per page (default = 10)
    paginationContainer: $dataPagination, // optional: paginationContair
    paginationMaxBtns: 7, // optional: default = 7
    categoryFilter: $dataFilter, // optional: containerContainer (required for category filter)
    categoryPath: '/news/category/', // WIP optional: container-root apth (required for category filter)
  });
  await dataPage.render();
}
