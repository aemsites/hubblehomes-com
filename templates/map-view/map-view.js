/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable function-paren-newline, object-curly-newline */
import {
  script,
  div,
  aside,
  a,
  strong,
  p,
  h3,
  span,
  ul,
  li,
} from '../../scripts/dom-helpers.js';
import { getAllInventoryHomes } from '../../scripts/inventory.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import buildFilters from './map-filters.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import { calculateMonthlyPayment, loadRates } from '../../scripts/mortgage.js';

let map;
let bounds;
let markers = [];

// Sets the map on all markers in the array.
function setMapOnAll(m) {
  markers.forEach((marker) => {
    marker.setMap(m);
  });
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = [];
}

function resestZoom() {
  const initialZoom = map.getZoom();
  let currentZoom = initialZoom;
  const $resetZoom = document.querySelector('.reset-zoom');

  map.addListener('zoom_changed', () => {
    currentZoom = map.getZoom();
    if (currentZoom !== initialZoom) $resetZoom.classList.add('active');
    else $resetZoom.classList.remove('active');
  });

  $resetZoom.addEventListener('click', () => {
    map.setZoom(initialZoom);
  });
}

function createPin(home, i) {
  const $close = a({ class: 'close' });
  $close.addEventListener('click', () => {
    disableActiveHomes();
  });

  return div({ class: `pin pin-${i}` },
    span(formatPrice(home.price, 'rounded')),
    div({ class: 'details' },
      $close,
      div({ class: 'name' }, home['model name']),
      div({ class: 'address' }, home.address),
      div(
        createOptimizedPicture(home.image),
      ),
      div({ class: 'price' }, formatPrice(home.price)),
      div({ class: 'features' },
        div(
          `beds ${home.beds} | baths ${home.baths} | sqft ${home['square feet']}`,
        ),
      ),
    ),
  );
}

async function addMarkers(inventory) {
  deleteMarkers();

  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  bounds = new google.maps.LatLngBounds();

  // if inventory data is empty reset map
  if (inventory.length === 0) {
    createMap();
    return;
  }

  inventory.forEach((home, i) => {
    // add this https://jsfiddle.net/gh/get/library/pure/googlemaps/js-samples/tree/master/dist/samples/marker-clustering/jsfiddle

    const lat = Number(home.latitude);
    const lng = Number(home.longitude);

    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
      content: createPin(home, i),
      zIndex: 1,
    });

    markers.push(marker);

    bounds.extend(new google.maps.LatLng(lat, lng));

    // important: must add this listener in order for any other events to work
    marker.addListener('click', () => {});

    marker.content.addEventListener('mouseover', () => {
      highlightActiveHome(i);
      // TODO Set z-index here

      // scroll to active listing
    });
    marker.content.addEventListener('mouseout', () => {

    });
  });

  // add padding around bounds so markers are not on the edge when expanded
  map.fitBounds(bounds, { top: 290, right: 100, bottom: 40, left: 100 });
}

async function createMap() {
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  map = new Map(document.getElementById('google-map'), {
    center: { lat: 43.696, lng: -116.641 },
    zoom: 12,
    mapId: 'DEMO_MAP_ID',
    disableDefaultUI: true, // remove all buttons
    zoomControl: true, // allow zoom buttons
    streetViewControl: true, // allow street view control
    fullscreenControl: true, // allow fullscreen
  });

  const mapStyle = [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }], // hide points of interest
  }];

  const mapType = new StyledMapType(mapStyle, { name: 'Grayscale' });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');

  resestZoom();
}

function addListeners() {
  window.addEventListener('filtersChanged', async (event) => {
    const updatedFilters = event.detail.chosenFilters;
    const filterValues = updatedFilters.map((filter) => filter.value).join(',');
    const inventoryData = await getAllInventoryHomes(filterValues);

    // eslint-disable-next-line no-use-before-define
    const inventoryCards = buildInventoryCards(inventoryData);

    addMarkers(inventoryData);

    if (inventoryCards.length === 0) {
      const inventoryContainer = document.querySelector('.listings-wrapper');
      inventoryContainer.innerHTML = 'No homes found.';
    } else {
      const inventoryContainer = document.querySelector('.listings-wrapper');
      inventoryContainer.innerHTML = '';
      inventoryCards.forEach((card) => inventoryContainer.appendChild(card));
    }
  });
}

function highlightActiveHome(i) {
  disableActiveHomes();

  const card = document.querySelector(`.listing-${i}`);
  card.classList.add('active');
  const pin = document.querySelector(`.pin-${i}`);
  pin.classList.add('active');
}

function disableActiveHomes() {
  const allPins = document.querySelectorAll('.pin');
  allPins.forEach((item) => item.classList.remove('active'));

  const allCards = document.querySelectorAll('.item-listing');
  allCards.forEach((item) => item.classList.remove('active'));
}

function buildInventoryCards(homes) {
  const $listing = homes.map((home, i) => div({
    class: `item-listing listing-${i}`,
    'data-lat': home.latitude,
    'data-lng': home.longitude,
  },
  a({ href: home.path }, createOptimizedPicture(home.image)),
  div({ class: 'listing-info' },
    h3(home.address),
    div(span(home.city), span(home['home style'])),
    div(span(formatPrice(home.price)), span(`${calculateMonthlyPayment(home.price)}/mo*`)),
    div(span(home.status)),
    ul({ class: 'specs' },
      li(p('Beds'), p(home.beds)),
      li(p('Baths'), p(home.baths)),
      li(p('Sq. Ft.'), p(home['square feet'])),
      li(p('Cars'), p(home.cars))),
  )));

  $listing.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      highlightActiveHome(i);

      // pan to active home
      const lat = card.getAttribute('data-lat');
      const lng = card.getAttribute('data-lng');
      map.panTo(new google.maps.LatLng(lat, lng));
    });
  });

  return $listing;
}

export default async function decorate(doc) {
  const googleMapScript = script(`
    // Google Maps API
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "AIzaSyAL5wQ_SKxuuRXFk3c2Ipxto9C_AKZNq6M",
      v: "weekly",
      // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
      // Add other bootstrap parameters as needed, using camel case.
    });
  `);
  doc.head.appendChild(googleMapScript);

  addListeners();
  await loadRates();
  const inventory = await getAllInventoryHomes(null);
  const filters = await buildFilters();

  const $page = doc.querySelector('main .section');

  const $mapFilter = div({ class: 'map-filter-container' },
    div({ class: 'map' },
      a({ class: 'download', href: '#' },
        span('download'),
        ' our ',
        strong('Available Homes List'),
      ),
      a({ class: 'btn reset-zoom' }, 'Reset Zoom'),
      div({ id: 'google-map' }),
    ),
    aside(
      filters,
      div({ class: 'listings-wrapper' },
        div({ class: 'scrollable-container' }, ...buildInventoryCards(inventory))),
    ),
  );

  $page.append($mapFilter);

  createMap();
  addMarkers(inventory);
}
