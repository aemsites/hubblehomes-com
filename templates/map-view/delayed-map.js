import {
  a, div, h4, h5, p, script, span,
} from '../../scripts/dom-helpers.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { getAllInventoryHomes } from '../../scripts/inventory.js';

let mapInitialized = false;
let bounds;
// eslint-disable-next-line import/no-mutable-exports
let map;
const markers = [];

/**
 * Resets the active homes by removing the 'active' class from pins and item listings.
 */
function resetActiveHomes() {
  markers.forEach((marker) => {
    marker.content.classList.remove('active');
    marker.zIndex = undefined;
  });
  document.querySelectorAll('[data-card]').forEach((item) => {
    item.classList.remove('active');
  });
}

/**
 * Creates a marker element for a home.
 * @param {Object} home - The home object.
 * @param {number} i - The index of the home.
 * @returns {HTMLElement} - The marker element.
 */
function createMarker(home, i) {
  const markerElement = div(
    { class: `marker marker-${i}`, 'data-marker': i },
    span(formatPrice(home.price, 'rounded')),
    div(
      { class: 'details' },
      h4(home['model name']),
      h5(home.address),
      createOptimizedPicture(home.image, home['model name'], false, [{ width: 200 }]),
      p({ class: 'price' }, formatPrice(home.price)),
      a({ class: 'btn yellow', href: home.path }, 'Details'),
    ),
  );

  markerElement.addEventListener('click', (e) => {
    e.stopPropagation();
    const event = new CustomEvent('markerClicked', { detail: { index: i, mls: home.mls } });
    window.dispatchEvent(event);
  });

  return markerElement;
}

/**
 * Adds map markers for each home in the collection.
 * @returns {Promise<void>} - A promise that resolves when the markers are added.
 */
async function addMapMarkers(homes) {
  if (!mapInitialized || !map) return;

  // eslint-disable-next-line no-undef
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  // eslint-disable-next-line no-undef
  bounds = new google.maps.LatLngBounds();

  // Clear existing markers
  markers.forEach((marker) => marker.setMap(null));
  markers.length = 0;

  // if we have no homes, then return no markers to create
  if (homes.length === 0) return;

  homes.forEach((home, i) => {
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

    // Note: this empty click listener must be added in order for any other events to work
    marker.addListener('click', () => {});
  });

  // Only adjust bounds if we have markers
  if (markers.length > 0) {
    // add padding to bounds so markers aren't hiden when active
    map.fitBounds(bounds, {
      top: 220, right: 100, bottom: 40, left: 100,
    });
  }

  // Add click listener to map to close active markers
  map.addListener('click', () => {
    resetActiveHomes();
  });
}

async function initMap() {
  if (mapInitialized) return;

  // eslint-disable-next-line no-undef
  const { Map, StyledMapType } = await google.maps.importLibrary('maps');

  const mapContainer = document.getElementById('google-map');
  const skeleton = mapContainer.querySelector('.map-skeleton');

  map = new Map(mapContainer, {
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
  const inventory = await getAllInventoryHomes();
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

export {
  initMap,
  addMapMarkers,
  markers,
  map,
};
