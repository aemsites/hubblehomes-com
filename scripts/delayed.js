/* eslint-disable object-curly-newline, no-undef */
/* eslint-disable no-promise-executor-return */
import {
  sampleRUM,
  createOptimizedPicture,
} from './aem.js';
import loadHubSpot from './hubspot-helper.js';
import {
  script, div, span, h4, h5, p, a,
} from './dom-helpers.js';
import { getAllInventoryHomes } from './inventory.js';
import { formatPrice } from './currency-formatter.js';

let mapInitialized = false;
let bounds;
let map;
let markers = [];

function resetActiveHomes() {
  markers.forEach((marker) => {
    marker.content.classList.remove('active');
    marker.zIndex = undefined;
  });
  document.querySelectorAll('[data-card]').forEach((item) => {
    item.classList.remove('active');
  });
}

function highlightActiveHome(i) {
  resetActiveHomes();
  const activeMarker = markers[i];
  if (activeMarker) {
    activeMarker.content.classList.add('active');
    activeMarker.zIndex = 999;
  }
  const activeListItem = document.querySelector(`[data-card="${i}"]`);
  if (activeListItem) {
    activeListItem.classList.add('active');
    activeListItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function createMarker(home, i) {
  const markerElement = div(
    { class: `marker marker-${i}`, 'data-marker': i },
    span(formatPrice(home.price, 'rounded')),
    div(
      { class: 'details' },
      h4(home['model name']),
      h5(home.address),
      createOptimizedPicture(home.image),
      p({ class: 'price' }, formatPrice(home.price)),
      a({ class: 'btn yellow', href: home.path }, 'Details'),
    ),
  );

  markerElement.addEventListener('click', (e) => {
    e.stopPropagation();
    highlightActiveHome(i);
    // load more results if needed
    const event = new CustomEvent('markerClicked', { detail: { index: i, mls: home.mls } });
    window.dispatchEvent(event);
  });

  return markerElement;
}

async function addMapMarkers(inventory) {
  if (!mapInitialized || !map) return;

  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  bounds = new google.maps.LatLngBounds();

  // Clear existing markers
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  if (inventory.length === 0) return;

  inventory.forEach((home, i) => {
    const lat = Number(home.latitude);
    const lng = Number(home.longitude);
    const position = { lat, lng };
    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: createMarker(home, i),
    });

    markers.push(marker);
    bounds.extend(position);

    marker.addListener('click', () => {
      highlightActiveHome(i);
    });
  });

  // Only adjust bounds if we have markers
  if (markers.length > 0) {
    map.fitBounds(bounds, { top: 220, right: 100, bottom: 40, left: 100 });
  }

  // Add click listener to map to close active markers
  map.addListener('click', () => {
    resetActiveHomes();
  });
}

async function initMap() {
  if (mapInitialized) return;

  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  const mapContainer = document.getElementById('google-map');
  const skeleton = mapContainer.querySelector('.map-skeleton');

  map = new Map(mapContainer, {
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

  // Fade out the skeleton after the map is initialized
  if (skeleton) {
    skeleton.style.transition = 'opacity 0.5s ease-out';
    skeleton.style.opacity = '0';
    setTimeout(() => {
      skeleton.remove();
    }, 500);
  }

  // Call addMapMarkers after map initialization
  const inventory = await getAllInventoryHomes(null);
  await addMapMarkers(inventory);
}

// Add the Google Maps script
const googleMapScript = script(`
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: "AIzaSyAL5wQ_SKxuuRXFk3c2Ipxto9C_AKZNq6M",
    v: "weekly",
  });
`);
document.head.appendChild(googleMapScript);

// Export the initMap function and addMapMarkers
window.initMap = initMap;
window.addMapMarkers = addMapMarkers;

async function loadDelayed() {
  sampleRUM('cwv');
  loadHubSpot();
  initMap();
}

loadDelayed();
