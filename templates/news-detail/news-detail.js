/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, ul, li, a, strong, small, h3, hr, script } from '../../scripts/dom-helpers.js';
import ArticleList from '../../scripts/article-list.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import { loadTemplate } from '../../scripts/scripts.js';

export default async function decorate(doc) {
  await loadTemplate(doc, 'default');
  const $page = doc.querySelector('main .section');

  const heroFrag = await loadFragment('/news/news-hero');
  const $hero = heroFrag.querySelector('.carousel-wrapper').cloneNode(true);

  const $breadcrumbs = doc.querySelector('.breadcrumbs');

  const $mainContent = $page.cloneNode(true).querySelector('.default-content-wrapper');
  $page.innerHTML = '';

  // subhead
  const $postMeta = small({ class: 'post-metadata' },
    strong('Posted: '), getMetadata('publisheddate'),
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

  const $categories = div();
  const $recentNews = ul({ class: 'recent-news' });
  const $recentNewsArticle = (article) => li(a({ href: article.path }, article.title));

  const $newsDetailPage = div({ class: 'section' },
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $mainContent,
        div({ class: 'sharethis sharethis-inline-share-buttons' }),
      ),
      aside(
        h3('Categories'),
        $categories,
        hr(),
        h3('Recent News'),
        $recentNews,
        hr(),
      ),
    ),
  );

  $page.append(
    $hero,
    $breadcrumbs,
    $newsDetailPage,
  );

  const categories = new ArticleList({
    jsonPath: '/news/news-index.json',
    categoryContainer: $categories,
    categoryPath: '/news/category/',
  });
  await categories.render();

  const recentNews = new ArticleList({
    jsonPath: '/news/news-index.json',
    articleContainer: $recentNews,
    articleCard: $recentNewsArticle,
    articlesPerPage: 5,
  });
  await recentNews.render();

  const shareThisScript = script({
    type: 'text/javascript',
    src: '//platform-api.sharethis.com/js/sharethis.js#property=5cd459d83255ff0012e3808f&product=\'inline-share-buttons\'',
    async: true,
  });
  doc.head.appendChild(shareThisScript);
}
