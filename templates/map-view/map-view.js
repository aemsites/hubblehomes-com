/* eslint-disable no-use-before-define, no-undef */
/* eslint-disable function-paren-newline, object-curly-newline */
import { script, div, aside, a, strong, p, h3, h4, h5, span, ul, li, button } from '../../scripts/dom-helpers.js';
import { getAllInventoryHomes } from '../../scripts/inventory.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import buildFilters from './map-filters.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import { calculateMonthlyPayment, loadRates } from '../../scripts/mortgage.js';

let map;
let bounds;
let markers = [];

// Sets the map on all markers in the array.
function setAllMarkers(m) {
  markers.forEach((marker) => {
    marker.setMap(m);
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
 * Creates a marker pin element for a home.
 *
 * @param {Object} home - The home object.
 * @param {number} i - The index of the pin.
 * @returns {HTMLElement} - The marker pin element.
 */
function markerPin(home, i) {
  const $closeBtn = a({ class: 'close' });
  $closeBtn.addEventListener('click', disableActiveHomes);

  return div({ class: `pin pin-${i}`, 'data-pin': i },
    span(formatPrice(home.price, 'rounded')),
    div({ class: 'details' },
      $closeBtn,
      h4(home['model name']),
      h5(home.address),
      createOptimizedPicture(home.image),
      p({ class: 'price' }, formatPrice(home.price)),
      a({ class: 'btn yellow', href: home.path }, 'Details'),
    ),
  );
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
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
      content: markerPin(home, i),
    });

    markers.push(marker);
    bounds.extend(new google.maps.LatLng(lat, lng));

    // Note: this click listener must be added in order for any other events to work
    marker.addListener('click', () => {
      highlightActiveHome(i);
    });

    // will not work unles above is present
    marker.content.addEventListener('mouseover', () => {
      highlightActiveHome(i);
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
 * Highlights the active home card and its corresponding pin on the map.
 * @param {number} i - The index of the active home.
 */
function highlightActiveHome(i) {
  disableActiveHomes();
  const $card = document.querySelector(`[data-card="${i}"]`);
  $card.classList.add('active');

  // scroll card into view if it's not visible
  const $scrollContainer = document.querySelector('.listings-wrapper');
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

  const $pin = document.querySelector(`[data-pin="${i}"]`);
  $pin.classList.add('active');
  $pin.parentNode.parentNode.style.zIndex = '999'; // must use javascript to set/unset
}

/**
 * Disables active homes by removing the 'active' class from pins and item listings.
 */
function disableActiveHomes() {
  const allPins = document.querySelectorAll('.pin');
  allPins.forEach((pin) => {
    pin.classList.remove('active');
    pin.parentNode.parentNode.style.zIndex = '';
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
      a({ href: home.path }, createOptimizedPicture(home.image)),
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
      highlightActiveHome(i);
      map.panTo(new google.maps.LatLng(home.latitude, home.longitude));
    });
    return $home;
  });
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
      div({ class: 'listings-wrapper' },
        ...buildInventoryCards(inventory),
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
}
