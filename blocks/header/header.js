/* eslint-disable function-paren-newline, object-curly-newline */
import { nav, div, span, a, img, form, label, input } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../fragment/fragment.js';


const $body = document.body;

async function buildNav() {
  const fetchNav = await fetch('/nav/nav.plain.html');
  const navHTML = await fetchNav.text();
  const $nav = nav();
  $nav.innerHTML = navHTML;

  if (navHTML) {
    const $header = document.querySelector('header .header');

    function closeDropdown() {
      const $on = $nav.querySelector('.on');
      if ($on) $on.classList.remove('on');
    }

    // top level dropdowns
    const l1_LIs = $nav.querySelectorAll('div > ul > li');
    l1_LIs.forEach(li => {
      li.addEventListener('click', (e) => {
        closeDropdown();
        li.classList.toggle('on');
      });
    });

    $body.addEventListener('click', (e) => {
      if (!$nav.contains(e.target)) closeDropdown();
    });
    
    // 2nd level lis (build right column)
    const l2_LIs = $nav.querySelectorAll('li > ul > li');
    l2_LIs.forEach(async li => {
        if (li.textContent.includes('RIGHT-COLUMN:')) {
            const a = li.querySelector('a');
            if (a) {
                const href = a.getAttribute('href');
                const rightColFrag = await loadFragment(href);
                if (rightColFrag) {
                  const $rightCol = div({ class: 'right-col'});
                  while (rightColFrag.firstElementChild) $rightCol.append(rightColFrag.firstElementChild);
                  li.parentNode.append($rightCol);
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

  const $search = form({id: 'search'}, 
    label({ class: 'sr-only', for: 'navSearch'}, 'Type plan, city, zip, community, phrase or MLS'),
    div({ class: 'search-icon' }, img({ src: '/icons/search.svg', height: 17, width: 17})),
    input({ type: 'text', name: 'navSearch', placeholder: 'Type plan, city, zip, community, phrase or MLS#'}),
  );

  const $phone = a({ id: 'phone', href: 'tel:208-620-2607'}, '208-620-2607');

  const $chat = div({ id: 'chat'}, img({ src: '/icons/lets-chat.png', width: '81', height: '38'}))

  const $bgrBtn = div({ class: 'burger-btn' }, span(), span(), span());
  $bgrBtn.addEventListener('click', () => {
    if (!$body.classList.contains('mobile-nav-open')) {
      $body.classList.add('mobile-nav-open');
    } else {
      $body.classList.remove('mobile-nav-open');
    }
  });

  buildNav();

  block.append($logo, $promo, $search, $phone, $chat, $bgrBtn);
}
