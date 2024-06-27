/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, p, small, aside, h1, a, strong, hr } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadTemplate } from '../../scripts/scripts.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import formatTimeStamp from '../../scripts/utils.js';

import ArticleList from '../../scripts/article-list.js';

export default async function decorate(doc) {
  const articlesPerPage = Number(getMetadata('articles-per-page'));
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));

  const hero = await loadFragment('/news/news-hero');
  const $carousel = div({ class: 'hero-carousel' },
    hero.firstElementChild,
  );

  const $h1 = h1(doc.title);

  const $articles = div({ class: 'articles' });

  const $articleCard = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '200' }]),
    ),
    div({ class: 'info' },
      h3(article.title),
      small(
        strong('Posted: '), formatTimeStamp(article.publisheddate),
        ' | ',
        strong('Categories: '), article.categories.replace(/,/g, ' |'),
      ),
      p(article.description),
      a({ class: 'btn yellow', href: article.path }, 'Read Article'),
      hr(),
    ),
  );

  const $pagination = div({ class: 'pagination' });
  const $categoryFilter = div();

  const $newPage = div({ class: 'section' },
    $h1,
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $articles,
        $pagination,
      ),
      aside(
        h3('Categories'),
        $categoryFilter,
        hr(),
      ),
    ),
  );

  const $page = doc.querySelector('main .section');

  await new ArticleList({
    jsonPath: '/news/news-index.json',
    articleContainer: $articles,
    articleCard: $articleCard,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
    categoryContainer: $categoryFilter,
    categoryPath: '/news/category/',
  }).render();

  $page.append($carousel, $newPage);

  // extend default template
  await loadTemplate(doc, 'default');
}
