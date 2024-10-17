import {
  a, div, img, input, label, nav, span, waitForElement,
} from '../../scripts/dom-helpers.js';
import {
  getCommunitiesSheet,
  getStaffSheet,
  getModelsSheet,
  getInventorySheet,
  getHomePlansSheet, getCitySheet,
} from '../../scripts/workbook.js';
import {
  formatCommunities,
  formatStaff,
  formatModels,
  formatInventory,
  formatHomePlans, formatCities, handleSearchNav,
} from '../../scripts/search-helper.js';
import { debounce } from '../../scripts/utils.js';

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

    // Remove any text nodes that are direct children of <ul> elements
    $nav.querySelectorAll('ul').forEach((ul) => {
      ul.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.remove();
        }
      });
    });

    $header.append($nav);
  }
}

async function setupAutocomplete() {
  const searchInput = await waitForElement('#navSearch');

  const tabToSearchNav = (e) => {
    if (e.key === 'ArrowDown') {
      const firstItem = document.querySelector('#autocomplete-list .search-item');
      if (firstItem) {
        searchInput.blur();
        const list = document.querySelector('#autocomplete-list');
        list.focus();
        list.dispatchEvent(new Event('focus'));
        handleSearchNav(e);
      }
    }
  };

  searchInput.addEventListener('keydown', tabToSearchNav);

  const autocompleteList = await waitForElement('#autocomplete-list');
  autocompleteList.addEventListener(
    'focusin',
    () => autocompleteList.addEventListener('keydown', handleSearchNav),
  );
  autocompleteList.addEventListener(
    'focusout',
    () => autocompleteList.removeEventListener('keydown', handleSearchNav),
  );
  autocompleteList.addEventListener('mouseover', () => {
    // remove any active elements
    const activeItem = document.querySelector('.search-item.active');
    if (activeItem) activeItem.classList.remove('active');
    // remove any elements with focus
    const focusedItem = document.querySelector('.search-item:focus');
    if (focusedItem) focusedItem.blur();
  });

  const communityResult = await getCommunitiesSheet('data');
  const staffResult = await getStaffSheet();
  const modelResult = await getModelsSheet('data');
  const homePlans = await getHomePlansSheet('data');
  const inventoryResult = await getInventorySheet('data');
  const regionsResult = await getCitySheet('data');

  const communityData = formatCommunities(communityResult);
  const staffData = formatStaff(staffResult);
  const modelData = formatModels(modelResult);
  const inventoryData = formatInventory(inventoryResult);
  const homePlanData = formatHomePlans(homePlans);
  const cityData = formatCities(regionsResult);

  const allSuggestions = [
    ...communityData.sort((c1, c2) => c1.display.localeCompare(c2.display)),
    ...staffData.sort((s1, s2) => s1.display.localeCompare(s2.display)),
    ...modelData.sort((m1, m2) => m1.display.localeCompare(m2.display)),
    ...inventoryData.sort((i1, i2) => i1.display.localeCompare(i2.display)),
    ...homePlanData.sort((p1, p2) => p1.display.localeCompare(p2.display)),
    ...cityData.sort((c1, c2) => c1.display.localeCompare(c2.display)),
  ];

  const handleInput = debounce(() => {
    const value = searchInput.value.toLowerCase();
    autocompleteList.innerHTML = '';

    if (value.length < 2) return;

    const filteredSuggestions = allSuggestions
      .filter((item) => item.display.toLowerCase().includes(value));

    filteredSuggestions.forEach((suggestion) => {
      autocompleteList.append(
        div({ class: 'search-item', tabIndex: '-1' }, a({
          class: 'search-item-link',
          tabIndex: '-1',
          href: suggestion.path,
          onclick: () => {
            autocompleteList.innerHTML = '';
            searchInput.value = suggestion.value;
          },
        }, suggestion.display)),
      );
    });
  }, 200);

  searchInput.addEventListener('input', handleInput);

  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
      autocompleteList.innerHTML = '';
    }
  });
}

export default async function decorate(block) {
  block.innerHTML = '';

  const $logo = a(
    {
      id: 'logo',
      href: '/',
      'aria-label': 'Visit Home Page',
    },
    img({
      src: '/icons/hubble-homes-logo.svg',
      width: '110',
      height: '56',
      alt: 'Hubble Homes, LLC',
    }),
  );

  const $search = div(
    { id: 'search' },
    label(
      {
        class: 'sr-only',
        for: 'navSearch',
      },
      'Type plan, city, community, phrase or MLS',
    ),
    div(
      { class: 'search-icon' },
      img({
        src: '/icons/search.svg',
        height: 25,
        width: 25,
        alt: 'search',
      }),
    ),
    input({
      type: 'text',
      name: 'navSearch',
      id: 'navSearch',
      placeholder: 'Type plan, city, community, phrase or MLS#',
    }),
    div({ id: 'autocomplete-list', class: 'autocomplete-items' }),
  );
  const $bgrBtn = div({ class: 'bgr-btn' }, span(), span(), span());
  $bgrBtn.addEventListener('click', () => {
    const navTransitionTime = 600;
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
  setupAutocomplete();

  block.append($logo, $search, $bgrBtn);
}
