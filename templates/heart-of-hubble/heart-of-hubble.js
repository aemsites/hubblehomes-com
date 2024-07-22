/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, p, small, a, strong, hr } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import formatTimeStamp from '../../scripts/utils.js';
import ArticleList from '../../scripts/article-list.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');

  const heading = $page.querySelector('.default-content-wrapper > h1');
  const $totalContribution = div({ class: 'total-contribution' });
  $totalContribution.innerHTML = `<div><p>Total Donations</p></div><div><p>${getMetadata('total-donations')}</p></div>`;
  heading.after($totalContribution);
  const articlesPerPage = Number(getMetadata('articles-per-page'));
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));

  const $pagination = div({ class: 'pagination' });
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

  const $newsPage = div({ class: 'section' },
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $articles,
        $pagination,
      ),
    ),
  );
  $page.append(
    $newsPage,
  );

  await new ArticleList({
    jsonPath: '/news/news-index.json',
    articleContainer: $articles,
    articleCard: $articleCard,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
    categoryContainer: null,
    categoryPath: '',
  }).renderArticlesByCategory('heart-of-hubble');
}
