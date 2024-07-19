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

// Sets the map on all markers in the array.
function setAllMarkers(m) {
  markers.forEach((markerData) => {
    markerData.marker.setMap(m);
  });
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setAllMarkers(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMapMarkers() {
  hideMarkers();
  markers = [];
}

/**
 * Creates a marker marker element for a home.
 * @param {Object} home - The home object.
 * @param {number} i - The index of the marker.
 * @returns {HTMLElement} - The marker element.
 */
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
/**
 * Checks marker position and if it's off the map moves it into view
 * @param {number} i - The index of the active home.
*/
function fitMarkerWithinBounds(marker) {
  // padding around marker when moved into view
  const padding = {
    top: 60, // ensure it clears buttons
    right: 60, // ensure it clears buttons
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

  // calculate pan amounts based on padding
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
 * Adds map markers for each home in the inventory.
 * @param {Array} inventory - The array of homes to add as markers on the map.
 * @returns {Promise<void>} - A promise that resolves when the markers are added.
 */
async function addMapMarkers(inventory) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  bounds = new google.maps.LatLngBounds();

  deleteMapMarkers();

  // if inventory data is empty reset map
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

    // Note: this empty click listener must be added in order for any other events to work
    marker.addListener('click', () => {});

    marker.content.addEventListener('click', () => {
      highlightActiveHome(i);
    });

    map.addListener('click', () => {
      resetActiveHomes();
    });
  });

  // add padding to bounds so markers aren't hiden when active
  map.fitBounds(bounds, { top: 220, right: 100, bottom: 40, left: 100 });
}

/**
 * Builds a map using the Google Maps API.
 * @returns {Promise<void>} A promise that resolves when the map is built.
 */
async function buildMap() {
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  map = new Map(document.getElementById('google-map'), {
    center: { lat: 43.696, lng: -116.641 },
    zoom: 12,
    mapId: 'IM_IMPORTANT',
    disableDefaultUI: true, // remove all buttons
    zoomControl: true, // allow zoom buttons
    streetViewControl: true, // allow street view control
    fullscreenControl: true, // allow fullscreen
    gestureHandling: 'greedy', // allow map to pan when scrolling
  });

  // style map to remove unwanted points
  const mapStyle = [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }], // hide points of interest
  }];
  const mapType = new StyledMapType(mapStyle, { name: 'Grayscale' });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');
}

/**
 * Listener for 'filtersChanged' event and performs actions based on the chosen filters.
 */
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

/**
 * Highlights the active home card and its corresponding marker on the map.
 * @param {number} i - The index of the active home.
 */
let isHighlighting = false;

function highlightActiveHome(i) {
  if (isHighlighting) return; // prevent re-entrant calls
  isHighlighting = true;

  resetActiveHomes();

  // Card actions
  const $card = document.querySelector(`[data-card="${i}"]`);
  $card.classList.add('active');

  // Scroll card into view if it's not visible
  const $scrollContainer = document.querySelector('.scroll-container');
  const scrollContainerRect = $scrollContainer.getBoundingClientRect();
  const activeCardRect = $card.getBoundingClientRect();
  const isVisible = (
    activeCardRect.top >= scrollContainerRect.top
    && activeCardRect.bottom <= scrollContainerRect.bottom
  );
  if (!isVisible) {
    const targetTopRelativeToContainer = activeCardRect.top - scrollContainerRect.top;
    $scrollContainer.scrollTop += targetTopRelativeToContainer;
  }

  // Marker actions
  const $marker = document.querySelector(`[data-marker="${i}"]`);

  if (!$marker) {
    // Marker doesn't exist on the map (user moved too far away)
    // Pan to it, then highlight it
    const { position } = markers[i]; // Retrieve stored position
    if (position) {
      map.panTo(position);
      // Small delay to allow marker to render
      setTimeout(() => {
        isHighlighting = false;
        highlightActiveHome(i); // re-call function if needed
      }, 100);
    }
  } else {
    $marker.classList.add('active');
    $marker.parentNode.parentNode.style.zIndex = '999'; // Must use JavaScript to set/unset
    fitMarkerWithinBounds($marker);
    isHighlighting = false; // Reset flag when done
  }
}

/**
 * Disables active homes by removing the 'active' class from markers and item listings.
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
 * Builds inventory cards for a list of homes.
 *
 * @param {Array} homes - The list of homes.
 * @returns {Array} - An array of inventory cards.
 */
function buildInventoryCards(homes) {
  return homes.map((home, i) => {
    const $home = div({ class: `item-listing listing-${i}`, 'data-card': i },
      createOptimizedPicture(home.image),
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

    const debouncedHighlight = debounce(() => highlightActiveHome(i), 10);

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
  const $header = document.querySelector('header');
  if ($header) {
    const observer = new MutationObserver((mutationsList) => mutationsList.forEach(() => {
      const $banner = doc.querySelector('.top-banner');
      const $mapFilterContainer = document.querySelector('.map-filter-container');
      const height = ($banner) ? $header.offsetHeight + $banner.offsetHeight : $header.offsetHeight;
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
          ...buildInventoryCards(inventory),
        ),
        $footer,
      ),
    ),
  );

  $page.append($mapFilter);

  // mobile view toggle
  $toggleViewBtn.addEventListener('click', () => {
    const text = $toggleViewBtn.textContent;
    $toggleViewBtn.textContent = text === 'View Map' ? 'View List' : 'View Map';
    $mapFilter.setAttribute('data-view', text === 'View Map' ? 'map' : 'list');
  });

  buildMap();
  addMapMarkers(inventory);
  adjustMapFilterHeight(doc);
}
