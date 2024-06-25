/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, a, strong, small } from '../../scripts/dom-helpers.js';
import ArticleList from '../../scripts/article-list.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $mainContent = div();
  [...$page.children].forEach((child) => $mainContent.append(child));

  const heroCarouselPromise = loadFragment('/news/news-detail/fragments/hero-carousel');
  const asidePromise = loadFragment('/news/news-detail/fragments/right-sidebar');
  const [heroCarouselFrag] = await Promise.all([heroCarouselPromise, asidePromise]);

  const $carousel = div({ class: 'hero-carousel' },
    heroCarouselFrag.firstElementChild,
  );

  // subhead
  const $postMeta = small({ class: 'post-metadata' },
    strong('Posted: '), getMetadata('publisheddate'),
    ' | ',
    strong('Categories: '), getMetadata('categories'),
  );
  const $h1 = $mainContent.querySelector('h1');
  $h1.insertAdjacentElement('afterend', $postMeta);

  // breadcrumbs
  const $breadCrumbs = div({ class: 'breadcrumbs' },
    a({ href: '/', 'arial-lable': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/news', 'arial-lable': 'View News Page' }, 'News'),
    ' > ',
    $h1.textContent,
  );

  // optimize images
  $mainContent.querySelectorAll('picture').forEach((pic) => {
    const image = pic.querySelector('img');
    const opt = createOptimizedPicture(image.src, 'alt', true, [{ width: '900' }]);
    pic.replaceWith(opt);
  });

  // social share
  const $socialShare = div({ class: 'social-share' },
    a({ class: 'facebook' }, 'Share'),
    a({ class: 'twitter' }, 'Tweet'),
    a({ class: 'pinterest' }, 'Pin'),
    a({ class: 'email' }, 'Email'),
    a({ class: 'sharethis' }, 'Share'),
  );

  const $categories = div();

  const $newPage = div({ class: 'section' }, $breadCrumbs,
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $mainContent,
        $socialShare,
      ),
      aside(
        $categories,
      ),
    ),
  );

  const newsArticles = new ArticleList({
    jsonPath: '/news/news-index.json',
    filterContainer: $categories,
    filterRootPath: '/news/category/',
  });
  await newsArticles.render();

  $page.replaceWith($carousel, $newPage);
}
