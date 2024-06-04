/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, a, button, strong, small } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $mainContent = div();
  [...$page.children].forEach((child) => $mainContent.append(child));

  const heroCarouselPromise = loadFragment('/news/news-detail/fragments/hero-carousel');
  const asidePromise = loadFragment('/news/news-detail/fragments/right-sidebar');
  const [heroCarouselFrag, asideFrag] = await Promise.all([heroCarouselPromise, asidePromise]);

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

  // reply form
  const $replyForm = div({ class: 'reply-form wip' }, '[reply form placeholder]');

  // social share
  const $socialShare = div({ class: 'social-share' },
    button({ class: 'facebook' }, 'Share'),
    button({ class: 'twitter' }, 'Tweet'),
    button({ class: 'pinterest' }, 'Pin'),
    button({ class: 'email' }, 'Email'),
    button({ class: 'sharethis' }, 'Share'),
  );

  const $newPage = div({ class: 'section' }, $breadCrumbs,
    div({ class: 'content-wrapper' },
      div({ class: 'content' },
        $mainContent,
        $socialShare,
        $replyForm,
      ),
      aside(
        asideFrag.firstElementChild.querySelector('.default-content-wrapper'),
      ),
    ),
  );

  $page.replaceWith($carousel, $newPage);
}
