import {
  buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';
import {
  a, aside, br, div, form, h2, h3, option, select,
} from '../../scripts/dom-helpers.js';
import {
  getInventoryHomes,
  filters,
  getHeaderTitleForFilter,
} from '../../scripts/inventory-data.js';
import { getHomePlans } from '../../scripts/home-plans-data.js';
import {
  getSalesCenterCommunityNameFromUrl,
  getSalesCenters,
} from '../../scripts/sales-center.js';
import getLastUrlSegment from '../../scripts/url-utils.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';

/**
 * Builds the inventory homes block.
 *
 * @param {string} filterByValue The filter value to use when fetching inventory homes.
 * @returns {Promise<Element>} The inventory homes block wrapped in a div.
 */
async function buildInventoryHomes() {
  const modelsBlock = buildBlock('models', []);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadBlock(modelsBlock);
  return blockWrapper;
}

async function fetchRequiredPageData(filter) {
  // prime the home plans so that model images can be looked up
  // the community page doesn't use the value but the models does
  await getHomePlans();

  // get the sales center and inventory homes
  const salesCenterData = await getSalesCenters(window.location);
  const community = getLastUrlSegment(window.location);

  const homes = await getInventoryHomes(community, filter);

  window.hh = window.hh || {};
  window.hh.current = {};
  window.hh.current.models = homes;
  window.hh.current.sale_center = salesCenterData.sales_center;

  return {
    salesCenter: salesCenterData.sales_center,
    community,
    homes,
  };
}

function DeferredPromise() {
  const deferred = {};

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

async function createSpecialists(specialists) {
  const agents = [];
  const deferred = DeferredPromise();
  const promises = [];

  specialists.forEach((specialist) => {
    const content = [];
    content.push(['name', specialist.name]);
    content.push(['phone', specialist.phone]);
    content.push(['photo', specialist.headshotImage]);
    content.push(['email', specialist.email]);

    const specialistsBlock = buildBlock('specialists', content);
    const blockWrapper = div(specialistsBlock);
    decorateBlock(specialistsBlock);
    promises.push(loadTemplateBlock(specialistsBlock));
    agents.push(blockWrapper);
  });

  Promise.all(promises).then(() => deferred.resolve(agents));
  return deferred.promise;
}

function buildBreadCrumbs($page) {
  return div(
    { class: 'breadcrumbs' },
    a({ href: '/', 'arial-label': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/foo', 'arial-label': 'View News Page' }, 'CommunityName'),
    ' > ',
    'XXX',
  );
}

function createRightAside() {
  // phone number and links
  const alsoAvailableAt = [
    'Adams Ridge',
    'Brittany Heights at Windsor Creek',
    'Franklin Village North',
    'Greendale Grove',
    'Mason Creek',
    'Sera Sol',
    'Southern Ridge',
    'Sunnyvale',
    'Waterford',
  ];

  const links = [
    'Virtual Tour',
    'Floor Plan Handout',
    'Community Map & Directions',
    'Interactive Sitemap',
    'Static Sitemap PDF',
    'Static Sitemap Image',
    'Energy Efficiency',
  ];

  // The third column of the description box
  const heading = h2('(123) 123-1234');
  const subheading = h3('Also Available At:');

  const locationList = div();
  alsoAvailableAt.forEach((location) => {
    const divElement = document.createElement('div');
    divElement.textContent = location;
    divElement.appendChild(br());
    locationList.appendChild(divElement);
  });

  const linksList = div('Links:');
  links.forEach((link) => {
    const linkElement = a({ href: '#' }, link);
    const divElement = document.createElement('div');
    divElement.appendChild(linkElement);
    divElement.appendChild(br());
    linksList.appendChild(divElement);
  });

  return div({ class: 'item' }, heading, br(), subheading, locationList, br(), linksList);
}

function buildFilterForm(filterByValue) {
  function buildOptions(allFilters) {
    const optionEls = [];

    // eslint-disable-next-line max-len
    const selectedItem = allFilters.find((filter) => filter.value === filterByValue) || allFilters[0];
    selectedItem.selected = true;

    allFilters.forEach((filter) => {
      const properties = {
        value: filter.value
          ? `${window.location.pathname}?filter=${filter.value}#plans`
          : `${window.location.pathname}#plans`,
        ...(filter.selected ? { selected: true } : {}),
      };
      optionEls.push(option(properties, filter.label));
    });
    return optionEls;
  }

  function createSelectElement(options) {
    return select({
      onchange: (event) => {
        window.location = event.target.options[event.target.selectedIndex].value;
      },
    }, ...options);
  }

  const allListingOptions = buildOptions(filters.filter((filter) => filter.filter === 'status'));
  const sortByOptions = buildOptions(filters.filter((filter) => filter.filter === 'sortBy'));
  const filterByOptions = buildOptions(filters.filter((filter) => filter.filter === 'filterBy'));

  const allListingSelect = createSelectElement(allListingOptions);
  const sortBySelect = createSelectElement(sortByOptions);
  const filterBySelect = createSelectElement(filterByOptions);

  let resetEl;
  // if there is a filter, then we can provide a reset link to clear the filter
  if (filterByValue) {
    resetEl = a({
      class: 'rest',
      href: `${window.location.pathname}#plans`,
    }, 'Reset');
  }

  return div({ class: 'section' }, div({ class: 'filter-form' }, form(allListingSelect, sortBySelect, filterBySelect), resetEl));
}

function createPromos() {
  const promos = `
      <h3>Current Promotions</h3>
       <a href="/promotions/promotions-detail/quick-move-ins" class="gtm-promotionsdetailcommunitypage" aria-label="View $25K Your Way on Quick Move-Ins Promotion Page">
            $25K Your Way on Quick Move-Ins *
       </a>
       <a href="/promotions/promotions-detail/new-builds" class="gtm-promotionsdetailcommunitypage" aria-label="View $15K Your Way on New Builds Promotion Page">
            $15K Your Way on New Builds *
       </a>
       <a href="/promotions/promotions-detail/Hubble-Homes-for-Heroes" class="gtm-promotionsdetailcommunitypage" aria-label="View Hubble Homes for Heroes Promotion Page">
          Hubble Homes for Heroes *
       </a>
      <br>
      <small>* click for more details</small>
     `;
  const promosEl = div({ class: 'promotions' }, promos);
  promosEl.innerHTML = promos;
  return promosEl;
}

export default async function decorate(doc) {
  const url = new URL(window.location);
  const params = url.searchParams;
  const filter = params.get('filter');

  const {
    salesCenter,
  } = await fetchRequiredPageData(filter);

  const $main = doc.querySelector('main');
  const $page = doc.querySelector('main .section');

  const carousel = doc.querySelector('.carousel-wrapper');
  $main.prepend(carousel);

  const $breadCrumbs = buildBreadCrumbs($page);

  const tabs = div({ class: 'tabs' });
  const description = doc.querySelector('.default-content-wrapper');

  const rightContent = `<dl>
    <dt>From</dt>
    <dd>$381,990</dd>
    <dt>Square Feet</dt>
    <dd>1,700 </dd>
    <dt>Beds</dt><dd>3 - 4</dd>
    <dt>Baths</dt><dd>2.5</dd>
    <dt>Cars</dt><dd>2</dd><dt>Primary Bed</dt>
    <dd>Up</dd><dt>Home Style</dt>
    <dd>2 Story</dd>
  </dl>`;

  const rightCol = div({ class: 'details' });
  rightCol.innerHTML = rightContent;

  const promos = createPromos();

  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, description),
    div({ class: 'right' }, rightCol, promos),
  );

  const title = getHeaderTitleForFilter(filter);
  const titleEl = div({ class: 'grey-divider' }, title);
  const inventory = await buildInventoryHomes();

  const actions = div(
    { class: 'action-bar' },
    a({ class: 'share btn' }, 'Share'),
    a({ class: 'save btn' }, 'Save'),
  );

  const rightAside = createRightAside();

  const mainPageContent = div({ class: 'section' }, $breadCrumbs, actions, tabs, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(
      div('right').innerHTML = rightAside,
    ),
  ));

  const modelFilter = buildFilterForm(filter);
  // create a link so that a filter change will drop the user back down the page
  const plansAnchor = a({ id: 'plans' }, '');

  const inventoryEl = div({ class: 'section inventory' }, inventory);
  $page.replaceWith(carousel, mainPageContent, plansAnchor, modelFilter, titleEl, inventoryEl);

  const communityName = getSalesCenterCommunityNameFromUrl(window.location);

  const banner = div({ class: 'grey-divider' }, `${communityName} New Home Specialists`);
  $main.append(banner);

  const specialistsSection = div({ class: 'specialists fluid-flex' });
  const specialistEl = await createSpecialists(salesCenter.specialists);
  specialistEl.forEach((el) => {
    specialistsSection.appendChild(el);
  });

  $main.append(specialistsSection);
}
