import {
  a, div, form, img, input, label, nav, span, waitForElement,
} from '../../scripts/dom-helpers.js';
import {
  getCommunitiesSheet, getStaffSheet, getModelsSheet, getInventorySheet,
} from '../../scripts/workbook.js';
import {
  formatCommunities, formatStaff, formatModels, formatInventory, throttle,
} from '../../scripts/search-helper.js';

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
  const autocompleteList = await waitForElement('#autocomplete-list');

  const communityResult = await getCommunitiesSheet();
  const staffResult = await getStaffSheet();
  const modelResult = await getModelsSheet();
  const inventoryResult = await getInventorySheet();

  const communityData = formatCommunities(communityResult.data);
  const staffData = formatStaff(staffResult.data);
  const modelData = formatModels(modelResult.data);
  const inventoryData = formatInventory(inventoryResult.data);

  const allSuggestions = [
    ...communityData,
    ...staffData,
    ...modelData,
    ...inventoryData,
  ];

  const handleInput = throttle(() => {
    const value = searchInput.value.toLowerCase();
    autocompleteList.innerHTML = '';

    if (value.length < 2) return;

    const filteredSuggestions = allSuggestions.filter((item) => item.display
      .toLowerCase().includes(value));
    filteredSuggestions.forEach((suggestion) => {
      const item = document.createElement('div');
      item.innerHTML = `<a href="${suggestion.path}" class="autocomplete-link">${suggestion.display}</a>`;
      item.addEventListener('click', () => {
        searchInput.value = suggestion.value;
        autocompleteList.innerHTML = '';
      });
      autocompleteList.appendChild(item);
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

  const $search = form(
    { id: 'search' },
    label(
      {
        class: 'sr-only',
        for: 'navSearch',
      },
      'Type plan, city, zip, community, phrase or MLS',
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
      placeholder: 'Type plan, city, zip, community, phrase or MLS#',
    }),
    div({ id: 'autocomplete-list', class: 'autocomplete-items' }),
  );

  const $phone = a(
    {
      id: 'phone',
      href: 'tel:208-620-2607',
    },
    '208-620-2607',
  );

  const $chat = div(
    {
      class: 'chat livechat_button',
      'data-id': 'TeyAs9pDGZ1',
    },
    img({
      src: '/icons/lets-chat.png',
      width: '81',
      height: '38',
      alt: "Let's chat with Hubble Homes and get all the info you need for your next new home.",
    }),
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

  block.append($logo, $search, $phone, $chat, $bgrBtn);
}
