/* eslint-disable no-use-before-define, no-undef, no-promise-executor-return */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, aside, a, strong, p, h3, span, ul, li, button, img } from '../../scripts/dom-helpers.js';
import { getAllInventoryHomes } from '../../scripts/inventory.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import buildFilters from './map-filters.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import { calculateMonthlyPayment, loadRates } from '../../scripts/mortgage.js';
import { debounce } from '../../scripts/utils.js';

let map;
const markers = [];
let reachedEnd = false;

function createMapSkeleton() {
  const skeleton = div({ class: 'map-skeleton' },
    img({ src: '/icons/map-placeholder.jpg', alt: 'Map loading' }),
  );
  return skeleton;
}

function fitMarkerWithinBounds(marker) {
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

async function addMapMarkers(inventory) {
  if (typeof window.addMapMarkers === 'function') {
    await window.addMapMarkers(inventory);
  }
}

async function buildMap() {
  const mapContainer = document.getElementById('google-map');
  mapContainer.appendChild(createMapSkeleton());
}

function filterListeners() {
  window.addEventListener('filtersChanged', async (event) => {
    const updatedFilters = event.detail.chosenFilters;
    const filterValues = updatedFilters.map((filter) => filter.value).join(',');
    const inventoryData = await getAllInventoryHomes(filterValues);
    const inventoryContainer = document.querySelector('.listings-wrapper');
    const inventoryCards = buildInventoryCards(inventoryData);
    inventoryContainer.innerHTML = inventoryCards.length === 0 ? 'No homes found.' : '';
    inventoryCards.forEach((card) => inventoryContainer.appendChild(card));
    addMapMarkers(inventoryData);
  });
}

let isHighlighting = false;
let isInfiniteScrolling = false;

function highlightActiveHome(i) {
  if (isHighlighting) return;
  isHighlighting = true;

  resetActiveHomes();

  const $card = document.querySelector(`[data-card="${i}"]`);
  if ($card) {
    $card.classList.add('active');

    const $scrollContainer = document.querySelector('.scroll-container');
    const scrollContainerRect = $scrollContainer.getBoundingClientRect();
    const activeCardRect = $card.getBoundingClientRect();
    const isVisible = (
      activeCardRect.top >= scrollContainerRect.top
      && activeCardRect.bottom <= scrollContainerRect.bottom
    );

    if (!isVisible && !isInfiniteScrolling) {
      // Only scroll if the card is not visible and we're not in infinite scroll
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

function resetActiveHomes() {
  const allMarkers = document.querySelectorAll('.marker');
  allMarkers.forEach((marker) => {
    marker.classList.remove('active');
    marker.parentNode.parentNode.style.zIndex = '';
  });
  document.querySelectorAll('.item-listing').forEach((item) => item.classList.remove('active'));
}

function buildInventoryCards(homes, startIndex = 0) {
  return homes.map((home, i) => {
    const globalIndex = startIndex + i;
    const $home = div({ class: `item-listing listing-${globalIndex}`, 'data-card': globalIndex },
      createOptimizedPicture(home.image, home.address, false, [{ width: '300' }]),
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

    const debouncedHighlight = debounce(() => highlightActiveHome(globalIndex), 10);

    $home.addEventListener('mouseenter', () => {
      debouncedHighlight();
    });
    return $home;
  });
}

/**
 * Adjust map-filter-container element height if dynamic header changes
 */
function adjustMapFilterHeight(doc) {
  const $header = doc.querySelector('header');
  if ($header) {
    const observer = new MutationObserver((mutationsList) => mutationsList.forEach(() => {
      const $mapFilterContainer = doc.querySelector('.map-filter-container');
      const height = $header.offsetHeight;
      $mapFilterContainer.style.height = `calc(100vh - ${height}px)`;
    }));
    observer.observe($header, { childList: true });
  }
}

function createLoadingIndicator() {
  return div({ class: 'loading-indicator' },
    span('See More Homes'),
    span({ class: 'ellipsis' }, '...'),
    div({ class: 'spinner' }),
  );
}

export default async function decorate(doc) {
  filterListeners();
  await loadRates();
  const inventory = await getAllInventoryHomes(null);
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
    aside(
      filters,
      div({ class: 'scroll-container' },
        div({ class: 'listings-wrapper' },
          ...buildInventoryCards(inventory.slice(0, 10)),
        ),
        createLoadingIndicator(),
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

  const $scrollContainer = document.querySelector('.scroll-container');
  let currentIndex = 10;
  let isLoading = false;
  const $loadingIndicator = $scrollContainer.querySelector('.loading-indicator');

  $scrollContainer.addEventListener('scroll', debounce(async () => {
    if (isLoading || reachedEnd) return;

    const scrollPosition = $scrollContainer.scrollTop + $scrollContainer.clientHeight;
    const scrollThreshold = $scrollContainer.scrollHeight - 400;

    if (scrollPosition >= scrollThreshold && currentIndex < inventory.length) {
      isLoading = true;
      isInfiniteScrolling = true;
      $loadingIndicator.classList.add('loading');

      const isMobile = window.innerWidth <= 990;
      const batchSize = isMobile ? inventory.length - currentIndex : 10;
      const nextBatch = inventory.slice(currentIndex, currentIndex + batchSize);

      if (nextBatch.length > 0) {
        const $listingsWrapper = document.querySelector('.listings-wrapper');

        // Create a temporary container for new cards
        const tempContainer = document.createElement('div');
        const newCards = buildInventoryCards(nextBatch, currentIndex);
        newCards.forEach((card) => tempContainer.appendChild(card));

        // Append new cards
        $listingsWrapper.appendChild(tempContainer);

        await addMapMarkers(inventory.slice(0, currentIndex + batchSize));

        if (isMobile) {
          // Force scroll to bottom
          setTimeout(() => {
            $scrollContainer.scrollTop = $scrollContainer.scrollHeight;
          }, 100);
        } else {
          // For desktop, keep some space from the bottom
          const newScrollPosition = $scrollContainer.scrollHeight
          - $scrollContainer.clientHeight - 800;
          $scrollContainer.scrollTop = Math.max(newScrollPosition, 0);
        }

        currentIndex += batchSize;

        // Remove the temporary container and move its children to the listings wrapper
        while (tempContainer.firstChild) {
          $listingsWrapper.appendChild(tempContainer.firstChild);
        }
        tempContainer.remove();
      }

      isLoading = false;
      $loadingIndicator.classList.remove('loading');

      // Check if we've reached the end of the inventory
      if (currentIndex >= inventory.length) {
        reachedEnd = true;
        $loadingIndicator.style.display = 'none';
      }

      // Short delay to ensure smooth transition
      setTimeout(() => {
        isInfiniteScrolling = false;
      }, 100);
    }
  }, 200));

  // Prevent scroll reset when clicking on markers
  document.addEventListener('click', (event) => {
    if (event.target.closest('.marker')) {
      event.preventDefault();
    }
  }, true);

  // adjust the scroll container height for footer behavior
  function adjustScrollContainerHeight() {
    const header = document.querySelector('header');
    const windowHeight = window.innerHeight;
    const headerHeight = header ? header.offsetHeight : 0;
    $scrollContainer.style.height = `${windowHeight - headerHeight}px`;
  }

  window.addEventListener('load', adjustScrollContainerHeight);
  window.addEventListener('resize', adjustScrollContainerHeight);
}
