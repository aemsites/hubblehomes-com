/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, p, a, strong, small, h3, hr, script } from '../../scripts/dom-helpers.js';
import ArticleList from '../../scripts/article-list.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import formatTimeStamp from '../../scripts/utils.js';

export default async function decorate(doc) {
  const $mainSection = doc.querySelector('main .section');

  const heroFrag = await loadFragment('/news/news-hero');
  const $hero = heroFrag.querySelector('.carousel-wrapper').cloneNode(true);

  const $mainContent = $mainSection.cloneNode(true);
  $mainSection.innerHTML = '';

  // subhead
  const $postMeta = small({ class: 'post-metadata' },
    strong('Posted: '), getMetadata('published-date'),
    ' | ',
    strong('Categories: '), getMetadata('categories'),
  );

  const $h1 = $mainContent.querySelector('h1');
  $h1.insertAdjacentElement('afterend', $postMeta);

  // optimize images
  $mainContent.querySelectorAll('picture').forEach((pic) => {
    const image = pic.querySelector('img');
    const opt = createOptimizedPicture(image.src, 'alt', true, [{ width: '900' }]);
    pic.replaceWith(opt);
  });

  const $categoryFilter = div();
  const $recentNews = div();

  const $recentNewsArticle = (article) => div({ class: 'card' },
    a({ class: 'thumb', href: article.path },
      createOptimizedPicture(article.image, article.title, true, [{ width: '200' }]),
    ),
    div({ class: 'info' },
      h3(a({ href: article.path }, article.title)),
      small(
        strong('Posted: '), formatTimeStamp(article.publisheddate),
        ' | ',
        strong('Categories: '), article.categories.replace(/,/g, ' |'),
      ),
      p(article.description),
    ),
  );

  const $categoryList = div({ class: 'select' },
    h3('Categories'),
    $categoryFilter,
  );

  const $newsDetailPage = div({ class: 'section' },
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        ...$mainContent.children,
        div({ class: 'sharethis sharethis-inline-share-buttons' }),
        div({ class: 'recent-news' },
          h3('Recent News'),
          $recentNews,
        ),
      ),
      aside(
        $categoryList,
        hr(),
      ),
    ),
  );

  $mainSection.append(
    $hero,
    $newsDetailPage,
  );

  const categories = new ArticleList({
    jsonPath: '/news/news-index.json',
    categoryContainer: $categoryFilter,
    categoryPath: '/news/category/',
  });
  await categories.render();

  const recentNews = new ArticleList({
    jsonPath: '/news/news-index.json',
    articleContainer: $recentNews,
    articleCard: $recentNewsArticle,
    articlesPerPage: 3,
  });
  await recentNews.render();

  const shareThisScript = script({
    type: 'text/javascript',
    src: '//platform-api.sharethis.com/js/sharethis.js#property=5cd459d83255ff0012e3808f&product=\'inline-share-buttons\'',
    async: true,
  });

  doc.head.appendChild(shareThisScript);

  function filterDropdown() {
    if ($categoryList.classList.contains('active')) {
      $categoryList.classList.remove('active');
    } else {
      $categoryList.classList.add('active');
    }
  }

  function mobileView(event) {
    if (event.matches) {
      // mobile view
      $categoryList.addEventListener('click', filterDropdown);
    } else {
      $categoryList.removeEventListener('click', filterDropdown);
      $categoryList.classList.remove('active');
    }
  }
  const mobileMediaQuery = window.matchMedia('(max-width: 991px)');
  mobileMediaQuery.addEventListener('change', mobileView);
  mobileView(mobileMediaQuery);
}
