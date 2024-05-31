/* eslint-disable function-paren-newline, object-curly-newline */
import { nav, div, span, a, img, form, label, input } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../fragment/fragment.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const $body = document.body;

function closeDropdown($nav) {
  const $on = $nav.querySelector('.on');
  if ($on) $on.classList.remove('on');
}

async function buildNav() {
  const fetchNav = await fetch('/nav/nav.plain.html');
  const navHTML = await fetchNav.text();
  const $nav = nav();
  $nav.innerHTML = navHTML;

  if (navHTML) {
    const $header = document.querySelector('header .header');

    // top level dropdowns
    const l1LIs = $nav.querySelectorAll('div > ul > li');
    l1LIs.forEach((li) => {
      li.addEventListener('click', () => {
        const isOn = li.classList.contains('on');
        if (!isOn) closeDropdown($nav);
        li.classList.toggle('on');
      });
    });

    $body.addEventListener('click', (e) => {
      if (!$nav.contains(e.target)) closeDropdown($nav);
    });

    // 2nd level lis - build right column fragment
    const l2LIs = $nav.querySelectorAll('li > ul > li');
    l2LIs.forEach(async (li) => {
      if (li.textContent.includes('RIGHT-COLUMN:')) {
        const link = li.querySelector('a');
        if (link) {
          const href = link.getAttribute('href');
          const rColFrag = await loadFragment(href);
          if (rColFrag) {
            const $rCol = div({ class: 'r-col' });
            while (rColFrag.firstElementChild) {
              const $rColContent = rColFrag.firstElementChild;

              // optimize pic
              $rColContent.querySelectorAll('picture').forEach((pic) => {
                const image = pic.querySelector('img');
                const opt = createOptimizedPicture(image.src, 'alt', true, [{ width: '240' }]);
                pic.replaceWith(opt);
              });

              $rCol.append($rColContent);
            }
            li.parentNode.append($rCol);
          } else {
            // eslint-disable-next-line no-console
            console.error('Failed to load login fragment.');
          }
        }
        li.remove();
      }
    });

    $header.append($nav);
  }
}

export default async function decorate(block) {
  block.innerHTML = '';

  const $logo = a({ id: 'logo', href: '/', 'aria-label': 'Visit Home Page' }, img({
    src: '/icons/hubble-homes-logo.svg',
    width: '110',
    height: '56',
    alt: 'Hubble Homes, LLC',
  }));

  const $promo = a({ id: 'promo', href: '/promotions/promotions-detail/quick-move-ins' },
    '$25K Your Way | Quick Move-Ins',
    span('Get Details'),
  );

  // TODO: add autocomplete
  const $search = form({ id: 'search' },
    label({ class: 'sr-only', for: 'navSearch' }, 'Type plan, city, zip, community, phrase or MLS'),
    div({ class: 'search-icon' }, img({ src: '/icons/search.svg', height: 17, width: 17, alt: 'search' })),
    input({ type: 'text', name: 'navSearch', placeholder: 'Type plan, city, zip, community, phrase or MLS#' }),
  );

  const $phone = a({ id: 'phone', href: 'tel:208-620-2607' }, '208-620-2607');

  const $chat = div({ id: 'chat', class: 'livechat_button', 'data-id': 'TeyAs9pDGZ1' }, a({ href: '#' },
    img({ src: '/icons/lets-chat.png', width: '81', height: '38', alt: 'Let\'s chat with Hubble Homes and get all the info you need for your next new home.' }),
  ));

  const $bgrBtn = div({ class: 'bgr-btn' }, span(), span(), span());
  $bgrBtn.addEventListener('click', () => {
    const navTransitionTime = 600; // match css -> nav>div
    if (!$body.classList.contains('mobile-nav-open')) {
      $body.classList.add('mobile-nav-open');
      setTimeout(() => {
        $body.classList.add('done');
      }, navTransitionTime);
    } else {
      $body.classList.remove('mobile-nav-open', 'done');
    }
  });

  buildNav();

  block.append($logo, $promo, $search, $phone, $chat, $bgrBtn);
}
