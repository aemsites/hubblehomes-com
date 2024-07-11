/* eslint-disable function-paren-newline, object-curly-newline */
import {
  script,
  div,
  aside,
  a,
  i,
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

function addListeners() {
  window.addEventListener('filtersChanged', async (event) => {
    const updatedFilters = event.detail.chosenFilters;
    const filterValues = updatedFilters.map((filter) => filter.value).join(',');
    const inventoryData = await getAllInventoryHomes(filterValues);

    // eslint-disable-next-line no-use-before-define
    const inventoryCards = buildInventoryCards(inventoryData);

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

function buildInventoryCards(homes) {
  return homes.map((home) => div({ class: 'item-listing' },
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
}

export default async function decorate(doc) {
  addListeners();
  await loadRates();
  const inventory = await getAllInventoryHomes(null);
  const filters = await buildFilters();

  const $page = doc.querySelector('main .section');

  const $mapFilter = div({ class: 'map-filter-container' },
    div({ class: 'map' },
      a({ class: 'download', href: '#' },
        i('download'),
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

  const googleAPI = script(`
    // Google Maps API
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: "AIzaSyAL5wQ_SKxuuRXFk3c2Ipxto9C_AKZNq6M",
      v: "weekly",
      // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
      // Add other bootstrap parameters as needed, using camel case.
    });
  `);

  const googleMaps = script({ src: '/templates/map-view/google-maps.js' });

  $page.append($mapFilter, googleAPI, googleMaps);
}
