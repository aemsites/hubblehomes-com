/* eslint-disable function-paren-newline, object-curly-newline */
import { nav, div, span, a, img, button, i } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../fragment/fragment.js';


const $body = document.body;
let $nav;


async function buildNav() {
  const fetchNav = await fetch('/nav/nav.plain.html');
  const navHTML = await fetchNav.text();
  $nav = nav();
  $nav.innerHTML = navHTML;

  if (navHTML) {
    const $header = document.querySelector('header');
    $header.append($nav);

    function closeDropdown() {
      const $on = $nav.querySelector('.on');
      if ($on) $on.classList.remove('on');
    }

    // top level dropdown
    const l1_LIs = $nav.querySelectorAll('div > ul > li');
    l1_LIs.forEach(li => {
      li.addEventListener('click', (e) => {
        closeDropdown()
        li.classList.toggle('on');
      });
    });

    $body.addEventListener('click', (e) => {
      if (!$nav.contains(e.target)) closeDropdown()
    });
    
    // 2nd level li - build right column 
    const l2_LIs = $nav.querySelectorAll('li > ul > li');
    l2_LIs.forEach(async li => {
        if (li.textContent.includes("RIGHT-COLUMN:")) {
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
  }
}


export default async function decorate(block) {
  buildNav();
  // nav burger menu
  const $navBtn = div({ class: 'nav-btn' }, span(), span(), span());
  $navBtn.addEventListener('click', () => {
    if (!$body.classList.contains('nav-open')) {
      if (!$nav) buildNav();
      else open('nav');
      close('modal');
    } else {
      close('nav');
    }
  });

  const $logo = a({ class: 'logo', href: '/' }, img({
    src: '/icons/hubble-homes-logo.svg',
    width: '130',
    height: '65',
    alt: 'Hubble Homes, LLC',
  }));



  block.replaceWith($logo, $navBtn,);

}
