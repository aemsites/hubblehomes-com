/* eslint-disable no-use-before-define, no-undef */
/* eslint-disable function-paren-newline, object-curly-newline */
import { script, div, aside, a, strong, p, h3, h4, h5, span, ul, li, button } from '../../scripts/dom-helpers.js';
import { getAllInventoryHomes } from '../../scripts/inventory.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import buildFilters from './map-filters.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import { calculateMonthlyPayment, loadRates } from '../../scripts/mortgage.js';
import { debounce } from '../../scripts/utils.js';

let map;
let bounds;
let markers = [];
let mapInitialized = false;

function setAllMarkers(m) {
  markers.forEach((markerData) => {
    markerData.marker.setMap(m);
  });
}

function hideMarkers() {
  setAllMarkers(null);
}

function deleteMapMarkers() {
  hideMarkers();
  markers = [];
}

function createMarker(home, i) {
  return div({ class: `marker marker-${i}`, 'data-marker': i },
    span(formatPrice(home.price, 'rounded')),
    div({ class: 'details' },
      h4(home['model name']),
      h5(home.address),
      createOptimizedPicture(home.image),
      p({ class: 'price' }, formatPrice(home.price)),
      a({ class: 'btn yellow', href: home.path }, 'Details'),
    ),
  );
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
  if (!mapInitialized) return;

  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  bounds = new google.maps.LatLngBounds();

  deleteMapMarkers();

  if (inventory.length === 0) {
    buildMap();
    return;
  }

  inventory.forEach((home, i) => {
    const lat = Number(home.latitude);
    const lng = Number(home.longitude);
    const position = { lat, lng };
    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: createMarker(home, i),
    });

    markers.push({ marker, position });
    bounds.extend(new google.maps.LatLng(lat, lng));

    marker.addListener('click', () => {});

    marker.content.addEventListener('click', () => {
      highlightActiveHome(i);
    });

    map.addListener('click', () => {
      resetActiveHomes();
    });
  });

  map.fitBounds(bounds, { top: 220, right: 100, bottom: 40, left: 100 });
}

async function initMap() {
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  map = new Map(document.getElementById('google-map'), {
    center: { lat: 43.696, lng: -116.641 },
    zoom: 12,
    mapId: 'IM_IMPORTANT',
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
  });

  const mapStyle = [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  }];
  const mapType = new StyledMapType(mapStyle, { name: 'Grayscale' });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');

  mapInitialized = true;
  const inventory = await getAllInventoryHomes(null);
  await addMapMarkers(inventory);
}

async function buildMap() {
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  map = new Map(document.getElementById('google-map'), {
    center: { lat: 43.696, lng: -116.641 },
    zoom: 12,
    mapId: 'IM_IMPORTANT',
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
  });

  const mapStyle = [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  }];
  const mapType = new StyledMapType(mapStyle, { name: 'Grayscale' });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');
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
  // Add null check here
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
    const { position } = markers[i];
    if (position) {
      map.panTo(position);
      setTimeout(() => {
        isHighlighting = false;
        highlightActiveHome(i);
      }, 100);
    }
  } else {
    $marker.classList.add('active');
    $marker.parentNode.parentNode.style.zIndex = '999';
    fitMarkerWithinBounds($marker);
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

export default async function decorate(doc) {
  const googleMapScript = script(`
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "AIzaSyAL5wQ_SKxuuRXFk3c2Ipxto9C_AKZNq6M",
      v: "weekly",
    });
  `);
  doc.head.appendChild(googleMapScript);

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
  addMapMarkers(inventory);
  adjustMapFilterHeight(doc);

  const $scrollContainer = document.querySelector('.scroll-container');
  let currentIndex = 10;
  let isLoading = false;
  $scrollContainer.addEventListener('scroll', debounce(async () => {
    if (isLoading) return;

    const scrollPosition = $scrollContainer.scrollTop + $scrollContainer.clientHeight;
    const scrollThreshold = $scrollContainer.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold && currentIndex < inventory.length) {
      isLoading = true;
      isInfiniteScrolling = true;
      const nextBatch = inventory.slice(currentIndex, currentIndex + 10);
      if (nextBatch.length > 0) {
        const $listingsWrapper = document.querySelector('.listings-wrapper');
        const newCards = buildInventoryCards(nextBatch, currentIndex);
        newCards.forEach((card) => $listingsWrapper.appendChild(card));
        currentIndex += 10;

        // Update map markers
        await addMapMarkers(inventory.slice(0, currentIndex));
      }
      isLoading = false;
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

  // Use Intersection Observer to lazy load the map
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !mapInitialized) {
        initMap();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(document.getElementById('google-map'));
}
