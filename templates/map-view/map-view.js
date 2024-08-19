/* eslint-disable no-use-before-define, no-undef, no-promise-executor-return */
/* eslint-disable function-paren-newline, object-curly-newline */
import { a, aside, button, div, h3, li, p, span, strong, ul } from '../../scripts/dom-helpers.js';
import { filterHomes, getAllInventoryHomes } from '../../scripts/inventory.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import buildFilters from './map-filters.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import { calculateMonthlyPayment, loadRates } from '../../scripts/mortgage.js';

let map;
const markers = [];
const BATCH_SIZE = 10;
let currentIndex = BATCH_SIZE;
let filtersToApply;
let inventory;

/**
 * Fits a marker within the map bounds.
 * @function fitMarkerWithinBounds
 * @param {HTMLElement} marker - The marker element.
 */
function fitMarkerWithinBounds(marker) {
  // padding around marker when moved into view
  const padding = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 40,
  };

  const markerRect = marker.getBoundingClientRect();
  const mapContainer = document.getElementById('google-map');
  const mapRect = mapContainer.getBoundingClientRect();
  const { top: markerTop, left: markerLeft, right: markerRight, bottom: markerBottom } = markerRect;
  const { top: mapTop, left: mapLeft, right: mapRight, bottom: mapBottom } = mapRect;

  // calculate distances
  const markerPXfromTop = markerTop - mapTop;
  const markerPXfromLeft = markerLeft - mapLeft;
  const markerPXfromRight = mapRight - markerRight;
  const markerPXfromBottom = mapBottom - markerBottom;

  let panX = 0;
  let panY = 0;

  if (markerPXfromTop < padding.top) {
    panY = (padding.top - markerPXfromTop) * -1;
  } else if (markerPXfromBottom < padding.bottom) {
    panY = (padding.bottom - markerPXfromBottom);
  }

  if (markerPXfromLeft < padding.left) {
    panX = (padding.left - markerPXfromLeft) * -1;
  } else if (markerPXfromRight < padding.right) {
    panX = (padding.right - markerPXfromRight);
  }

  // pan the map if needed
  if (panX !== 0 || panY !== 0) {
    const currentCenter = map.getCenter();
    const projection = map.getProjection();
    const currentCenterPX = projection.fromLatLngToPoint(currentCenter);
    currentCenterPX.y += (panY / 2 ** map.getZoom());
    currentCenterPX.x += (panX / 2 ** map.getZoom());
    const newCenter = projection.fromPointToLatLng(currentCenterPX);
    map.panTo(newCenter);
  }
}

/**
 * Adds map markers for the given homes.
 * @async
 * @function addMapMarkers
 * @param {Array} homes - The inventory data.
 * @returns {Promise<void>}
 */
async function addMapMarkers(homes) {
  if (typeof window.addMapMarkers === 'function') {
    await window.addMapMarkers(homes);
  }
}

/**
 * Builds the map elements and placeholder image.
 */
function buildMap() {
  const mapContainer = document.getElementById('google-map');
  const loader = div({ class: 'map-skeleton' },
    createOptimizedPicture('/icons/map-placeholder.jpg', 'Map loading', true, [{ width: '1024' }]),
  );
  mapContainer.appendChild(loader);
}

/**
 * Sets up event listeners for filter changes.
 * @function filterListeners
 */
function filterListeners() {
  window.addEventListener('filtersChanged', async (event) => {
    // when working with filters, we use the entire inventory not just the current batch
    currentIndex = inventory.length;
    const updatedFilters = event.detail.chosenFilters;
    filtersToApply = updatedFilters.map((filter) => filter.value).join(',');
    const inventoryData = filterHomes(inventory, filtersToApply);
    const inventoryContainer = document.querySelector('.listings-wrapper');
    const inventoryCards = buildInventoryCards(inventoryData);
    inventoryContainer.innerHTML = inventoryCards.length === 0 ? 'No homes found.' : '';
    inventoryCards.forEach((card) => inventoryContainer.appendChild(card));
    await addMapMarkers(inventoryData);

    document.querySelector('.scroll-container').scrollTo({
      top: 0,
      behavior: 'instant',
    });
  });
}

let isHighlighting = false;
let loadingNewHomes = false;

/**
 * Highlights the active home on both the map and the listing.
 * @function highlightActiveHome
 * @param {number} i - The index of the home to highlight.
 */
function highlightActiveHome(i) {
  if (isHighlighting) return;
  isHighlighting = true;

  resetActiveHomes();

  // card actions
  const $card = document.querySelector(`[data-card="${i}"]`);

  if ($card) {
    $card.classList.add('active');

    // scroll card into view if it's not visible
    const $scrollContainer = document.querySelector('.scroll-container');
    const scrollContainerRect = $scrollContainer.getBoundingClientRect();
    const activeCardRect = $card.getBoundingClientRect();

    const isVisible = (
      // if the active card is partially visible then we consider it visible otherwise
      // the list will continue to scroll and scroll
      activeCardRect.bottom >= scrollContainerRect.top
      // OR if the active card is fully visible then it's in the view
      || (activeCardRect.top >= scrollContainerRect.top
      && activeCardRect.bottom <= scrollContainerRect.bottom)
    );

    if (!isVisible && !loadingNewHomes) {
      // only scroll if the card is not visible and we're not in loading more homes
      const scrollOffset = activeCardRect.top - scrollContainerRect.top
        - (scrollContainerRect.height / 2) + (activeCardRect.height / 2);
      $scrollContainer.scrollBy({ top: scrollOffset, behavior: 'smooth' });
    }
  }

  const $marker = document.querySelector(`[data-marker="${i}"]`);

  if (!$marker) {
    if (map && markers[i] && markers[i].position) {
      map.panTo(markers[i].position);
      setTimeout(() => {
        isHighlighting = false;
        highlightActiveHome(i);
      }, 100);
    } else {
      // Map or marker not loaded yet, just reset the highlighting
      isHighlighting = false;
    }
  } else {
    $marker.classList.add('active');
    $marker.parentNode.parentNode.style.zIndex = '999';
    if (map) {
      fitMarkerWithinBounds($marker);
    }
    isHighlighting = false;
  }
}

/**
 * Resets the active homes on both the map and the listing.
 * @function resetActiveHomes
 */
function resetActiveHomes() {
  const allMarkers = document.querySelectorAll('.marker');
  allMarkers.forEach((marker) => {
    marker.classList.remove('active');
    marker.parentNode.parentNode.style.zIndex = '';
  });
  document.querySelectorAll('.item-listing').forEach((item) => item.classList.remove('active'));
}

/**
 * Builds inventory cards for the given homes.
 * @function buildInventoryCards
 * @param {Array} homes - The homes data.
 * @param {number} [startIndex=0] - The starting index for the homes.
 * @returns {Array} An array of inventory card elements.
 */
function buildInventoryCards(homes, startIndex = 0) {
  return homes.map((home, i) => {
    const globalIndex = startIndex + i;
    const $home = div({ class: `item-listing listing-${globalIndex}`, 'data-card': globalIndex, 'data-mls': home.mls },
      createOptimizedPicture(home.image, home.address, true, [{ width: '300' }]),
      div({ class: 'listing-info' },
        h3(home.address),
        div(span(home.city), span(home['home style'])),
        div(span({ class: 'price' }, formatPrice(home.price)), span({ class: 'price' }, `${calculateMonthlyPayment(home.price)}/mo*`)),
        div(span(home.status)),
        ul({ class: 'specs' },
          li(p('Beds'), p(home.beds)),
          li(p('Baths'), p(home.baths)),
          li(p('Sq. Ft.'), p(home['square feet'])),
          li(p('Cars'), p(home.cars))),
        div(
          a({ class: 'btn yellow', href: home.path }, 'View Details'),
        ),
      ),
    );

    $home.addEventListener('mouseenter', () => {
      highlightActiveHome(globalIndex);
    });

    return $home;
  });
}

/**
 * Adjusts the map-filter-container element height if dynamic header changes.
 * @function adjustMapFilterHeight
 * @param {Document} doc - The document object.
 */
function adjustMapFilterHeight(doc) {
  const $header = doc.querySelector('header');
  const $mapFilterContainer = doc.querySelector('.map-filter-container');
  const $map = doc.querySelector('.map');
  const $scrollContainer = doc.querySelector('.scroll-container');
  const $filterContainer = doc.querySelector('.filter-container');

  function updateHeight() {
    const headerHeight = $header.offsetHeight;
    const windowHeight = window.innerHeight;

    const newHeight = windowHeight - headerHeight;
    $mapFilterContainer.style.height = `${newHeight}px`;
    $map.style.height = `${newHeight}px`;
    $scrollContainer.style.height = `${newHeight - $filterContainer.offsetHeight}px`;
  }

  if ($header && $mapFilterContainer && $map && $scrollContainer) {
    // Initial height adjustment
    updateHeight();

    // Observe header changes
    const headerObserver = new MutationObserver(updateHeight);
    headerObserver.observe($header, { childList: true, subtree: true });

    // Observe window resize
    window.addEventListener('resize', updateHeight);

    // Observe content changes in the listings wrapper
    const $listingsWrapper = doc.querySelector('.listings-wrapper');
    if ($listingsWrapper) {
      const listingsObserver = new MutationObserver(updateHeight);
      listingsObserver.observe($listingsWrapper, { childList: true, subtree: true });
    }
  }
}

export default async function decorate(doc) {
  filterListeners();
  await loadRates();

  inventory = await getAllInventoryHomes();

  const filters = await buildFilters();
  const $page = doc.querySelector('main .section');
  const $footer = doc.querySelector('footer');
  const $toggleViewBtn = button({ class: 'btn toggle-view' }, 'View Map');

  const $mapFilter = div({ class: 'map-filter-container' },
    $toggleViewBtn,
    div({ class: 'map' },
      a({ class: 'download', href: '/available-homes-report.pdf' },
        span('Download'),
        ' our ',
        strong('Available Homes List'),
      ),
      div({ id: 'google-map' }),
    ),
    aside({ style: 'overflow: hidden;' },
      filters,
      div({ class: 'scroll-container', style: 'overflow-y: auto;' },
        div({ class: 'listings-wrapper' },
          ...buildInventoryCards(inventory.slice(0, 10)),
        ),
        $footer,
      ),
    ),
  );

  $page.append($mapFilter);

  $toggleViewBtn.addEventListener('click', () => {
    const text = $toggleViewBtn.textContent;
    $toggleViewBtn.textContent = text === 'View Map' ? 'View List' : 'View Map';
    $mapFilter.setAttribute('data-view', text === 'View Map' ? 'map' : 'list');
  });

  buildMap();
  adjustMapFilterHeight(doc);

  const footerEl = document.querySelector('footer');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      if (currentIndex < inventory.length) {
        const nextBatch = inventory.slice(currentIndex, currentIndex + BATCH_SIZE);
        const newCards = buildInventoryCards(nextBatch, currentIndex);
        const $listingsWrapper = document.querySelector('.listings-wrapper');
        newCards.forEach((card) => $listingsWrapper.appendChild(card));
        currentIndex += BATCH_SIZE;
      }
    }
  }, {
    root: null,
    rootMargin: '200px 0px 0px 0px',
    threshold: 0,
  });
  observer.observe(footerEl);

  // Prevent scroll reset when clicking on markers
  document.addEventListener('click', (event) => {
    if (event.target.closest('.marker')) {
      event.preventDefault();
    }
  }, true);

  window.addEventListener('markerClicked', async (event) => {
    const { index, mls } = event.detail;
    const $listingsWrapper = document.querySelector('.listings-wrapper');
    let existingCard = $listingsWrapper.querySelector(`[data-mls="${mls}"]`);

    if (!existingCard) {
      loadingNewHomes = true;
      let newCards = [];

      const newHomes = inventory.slice(currentIndex, index + BATCH_SIZE);

      if (newHomes.length > 0) {
        newCards = newCards.concat(buildInventoryCards(newHomes, currentIndex));
        currentIndex = (index + BATCH_SIZE) <= inventory.length
          ? index + BATCH_SIZE
          : inventory.length;
        existingCard = newCards.find((card) => card.dataset.mls === mls);
      }

      if (newCards.length > 0) {
        newCards.forEach((card) => $listingsWrapper.appendChild(card));
        await addMapMarkers(inventory.slice(0, currentIndex));
      }
      loadingNewHomes = false;
    }

    if (existingCard) {
      highlightActiveHome(index);
      existingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    adjustMapFilterHeight(doc);
  });
}
