/* eslint-disable function-paren-newline, object-curly-newline */
import {
  a,
  div,
  form,
  img,
  input,
  label,
  nav,
  span,
  waitForElement,
} from '../../scripts/dom-helpers.js';
import { loadFragment } from '../fragment/fragment.js';
import {
  getCommunitiesSheet,
  getStaffSheet,
  getModelsSheet,
  getInventorySheet,
} from '../../scripts/workbook.js';
import {
  formatCommunities,
  formatStaff,
  formatModels,
  formatInventory,
  throttle,
} from '../../scripts/search-helper.js';
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
                const opt = createOptimizedPicture(image.src, 'alt', true, [
                  { width: '240' },
                ]);
                pic.replaceWith(opt);
              });

              $rColContent.querySelectorAll('a').forEach((aEl) => {
                aEl.classList.remove('fancy');
                aEl.classList.add('yellow');
                aEl.classList.add('btn');
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

/**
 * Sets up the autocomplete functionality for the search input.
 * @returns {Promise<void>}
 */
/**
 * Sets up the autocomplete functionality for the search input.
 * @returns {Promise<void>}
 */
async function setupAutocomplete() {
  const searchInput = await waitForElement('#navSearch');
  const autocompleteList = await waitForElement('#autocomplete-list');

  // Fetch data from various sheets
  const communityResult = await getCommunitiesSheet();
  const staffResult = await getStaffSheet();
  const modelResult = await getModelsSheet();
  const inventoryResult = await getInventorySheet();

  // Format the data for autocomplete
  const communityData = formatCommunities(communityResult.data);
  const staffData = formatStaff(staffResult.data);
  const modelData = formatModels(modelResult.data);
  const inventoryData = formatInventory(inventoryResult.data);

  // Combine all formatted data
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
  }, 200); // Adjust the throttle limit as needed

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

  const $promo = a(
    {
      id: 'promo',
      href: '/promotions/promotions-detail/quick-move-ins',
    },
    '$25K Your Way | Quick Move-Ins',
    span('Get Details'),
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
  setupAutocomplete();

  block.append($logo, $promo, $search, $phone, $chat, $bgrBtn);
}
