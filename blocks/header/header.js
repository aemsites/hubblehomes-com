import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function buildSecNav() {
  const html = `
    <div><p><a href="https://www.hubblehomes.com/promotions/promotions-detail/quick-move-ins">$25K Your Way | Quick Move-Ins</p>
      <p class='get-details'>Get Details <i class="fas fa-chevron-right" style="color:#fcd700;"></i></p></a></div>
    <div><input type='text' placeholder='Type plan, city, zip, community, phrase or MLS#'/></div>
    <div><a href="tel:208-620-2607" aria-label="Call Us">208-620-2607</a></div>`;
  const secNav = document.createElement('div');
  secNav.classList.add('secondary-nav');
  secNav.innerHTML = html;
  return secNav;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(buildSecNav());
  block.append(navWrapper);
}
