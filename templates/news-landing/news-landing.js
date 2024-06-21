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

  const $articleContainer = div({ class: 'articleContainer' }, 'LOADING ARTICLES');
  const $article = (article) => div({ class: 'article' },
    h3(article.title),
    small(article.publisheddate, article.categories),
    p(article.description),
    article.image,
  );

  const $pagination = div({ class: 'pagination' }, 'LOADING PAGINATION');

  const $categories = div({ class: 'categories' }, 'LOADING CATEGORIES');

  const $newPage = div({ class: 'section' },
    $breadCrumbs,
    $h1,
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $pagination,
        $articleContainer,
      ),
      aside(
        $categories,
      ),
    ),
  );
  const $page = doc.querySelector('main .section');
  $page.replaceWith($newPage);

  const dataPage = new DataPage({
    jsonPath: '/news/news-index.json',
    articleContainer: $articleContainer,
    article: $article,
    articlesPerPage: 10,
    paginationContainer: $pagination,
    paginationMaxBtns: 9,
    categoryFilter: $categories,
  });
  await dataPage.render();
}
