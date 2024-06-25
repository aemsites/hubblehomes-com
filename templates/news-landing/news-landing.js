/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, p, small, aside, h1, a, strong, hr } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import ArticleList from '../../scripts/article-list.js';

export default async function decorate(doc) {
  const articlesPerPage = Number(getMetadata('articles-per-page'));
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));


  const heroCarouselPromise = loadFragment('/news/news-detail/fragments/hero-carousel');
  
  const [heroCarouselFrag] = await Promise.all([heroCarouselPromise]);

  const $carousel = div({ class: 'hero-carousel' },
    heroCarouselFrag.firstElementChild,
  );

  const $h1 = h1(doc.title);
  // test
  const $breadCrumbs = div({ class: 'breadcrumbs section' },
    a({ href: '/', 'arial-lable': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/news', 'arial-lable': 'View News Page' }, 'News'),
    ' > ',
    $h1.textContent,
  );

  // const thumb = createOptimizedPicture(article.image, article.title, true, [{ width: '200' }]);

  const $articles = div({ class: 'articles' });
  const $article = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '200' }]),
    ),
    div({ class: 'info' },
      h3(article.title),
      small(
        strong('Posted: '), article.publisheddate,
        ' | ',
        strong('Categories: '), article.categories.replace(/,/g, ' |'),
      ),
      p(article.description),
      a({ class: 'btn yellow', href: article.path }, 'Read Article'),
      hr(),
    ),
  );

  const $pagination = div({ class: 'pagination' }, 'LOADING PAGINATION');

  const $categoryFilter = div({ class: 'categories' }, 'LOADING CATEGORIES');

  const $newPage = div({ class: 'section' },
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $articles,
        $pagination,
      ),
      aside(
        h3('Categories'),
        $categoryFilter,
      ),
    ),
  );

  const $page = doc.querySelector('main .section');
  $page.replaceWith($carousel, $breadCrumbs,
    $h1, $newPage);

  const newsArticles = new ArticleList({
    jsonPath: '/news/news-index.json',
    articleContainer: $articles,
    articleCard: $article,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
    filterContainer: $categoryFilter,
    filterRootPath: '/news/category/',
  });
  await newsArticles.render();
}
