import {
  buildBlock, decorateBlock, getMetadata,
} from '../../scripts/aem.js';
import {
  a,
  aside,
  br,
  div,
  form,
  h1,
  h2,
  h3,
  h4,
  option,
  select,
} from '../../scripts/dom-helpers.js';
import {
  filters,
  getHeaderTitleForFilter,
  getInventoryHomes,
} from '../../scripts/inventory.js';
import { getSalesCentersForCommunityUrl } from '../../scripts/sales-center.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';
import { fetchCommunityDetailsForUrl } from '../../scripts/communities.js';
import { createActionBar } from '../../scripts/block-helper.js';
import { getModelsByCommunity } from '../../scripts/models.js';
import { fetchRates } from '../../scripts/mortgage.js';
import DeferredPromise from '../../scripts/deferred.js';

/**
 * Builds the inventory homes block.
 *
 * @returns {Promise<Element>} The inventory homes block wrapped in a div.
 */
async function buildInventoryHomes(community, filter) {
  window.hh.current.models = await getInventoryHomes(community.name, filter);
  const modelsBlock = buildBlock('cards', []);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadTemplateBlock(modelsBlock);
  return blockWrapper;
}

async function buildFeaturedPlans(communityName) {
  window.hh.current.models = await getModelsByCommunity(communityName);
  const modelsBlock = buildBlock('cards', []);
  modelsBlock.classList.add('featured');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadTemplateBlock(modelsBlock);
  return blockWrapper;
}

async function fetchRequiredPageData() {
  // These three calls could be done differently, but for now, we will keep them separate.
  // It might be nice to have a factory that takes the results of these calls and builds the
  // required data for the page.
  // For example this page could ask for the 3 sheets at once and then build the required data.
  await fetchRates();

  const salesCenterData = await getSalesCentersForCommunityUrl(window.location);
  const community = await fetchCommunityDetailsForUrl(window.location.pathname);

  window.hh = window.hh || {};
  window.hh.current = window.hh.current || {};
  window.hh.current.sale_center = salesCenterData.sales_center;
  window.hh.current.community = community;

  return {
    salesCenter: salesCenterData.sales_center,
    community,
  };
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

  Promise.all(promises)
    .then(() => deferred.resolve(agents));
  return deferred.promise;
}

function buildBreadCrumbs() {
  return div(
    { class: 'breadcrumbs' },
    a({
      href: '/',
      'arial-label': 'View Home Page',
    }, 'Home'),
    ' > ',
    a({
      href: '/foo',
      'arial-label': 'View News Page',
    }, 'CommunityName'),
    ' > ',
    'XXX',
  );
}

function createRightAside(doc) {
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

  const linksEl = doc.querySelector('.links-wrapper');
  return div({ class: 'item' }, heading, br(), subheading, locationList, br(), linksEl);
}

function buildFilterForm(filterByValue) {
  function buildOptions(allFilters) {
    const optionEls = [];

    // eslint-disable-next-line max-len
    const selectedItem = allFilters.find((filter) => filter.value === filterByValue)
      || allFilters[0];
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

  return div({ class: 'filter-form' }, form(allListingSelect, sortBySelect, filterBySelect), resetEl);
}

export default async function decorate(doc) {
  const url = new URL(window.location);
  const params = url.searchParams;
  const filter = params.get('filter');
  const areaName = getMetadata('city', doc);

  const {
    salesCenter,
    community,
  } = await fetchRequiredPageData();

  const filterSectionTitle = div({ class: 'grey-divider full-width' }, getHeaderTitleForFilter(filter));
  const inventory = await buildInventoryHomes(community, filter);

  const modelNameAddr = div(h1(community.name), a({
    class: 'directions',
    href: `https://www.google.com/maps/dir/Current+Location/${salesCenter.latitude},${salesCenter.longitude}`,
    target: '_blank',
  }, h4(`${areaName}, ${community['zip-code-abbr']}`)));

  const requestButtons = div({ class: 'request-btns fluid-flex' }, a({
    class: 'btn gray fancy',
    href: `/contact-us/sales-info?communityid=${community.name}`,
  }, 'Request Information'), a({
    class: 'btn fancy',
    href: `/schedule-a-tour?communityid=${community.name}`,
  }, 'Request a Tour'));

  const breadCrumbsEl = buildBreadCrumbs();
  const actions = await createActionBar(['share', 'save']);
  const subNav = doc.querySelector('.subnav-wrapper');
  const rightAside = createRightAside(doc);
  const modelFilter = buildFilterForm(filter);

  const plansAnchor = a({ id: 'plans' }, '');
  const inventoryEl = div({ class: 'section inventory' }, inventory);
  const disclaimer = doc.querySelector('.fragment-wrapper');
  const featuredPlansTitle = div({ class: 'grey-divider featured full-width' }, 'Featured Plans');
  const models = await buildFeaturedPlans(community.name);
  const featuredModels = div({ class: 'section featured' }, models);

  const specialistBanner = div({ class: 'grey-divider full-width' }, `${community.name} New Home Specialists`);

  const specialistsSection = div({ class: 'specialists fluid-flex full-width' });
  const specialistEl = await createSpecialists(salesCenter.specialists);
  specialistEl.forEach((el) => {
    specialistsSection.appendChild(el);
  });

  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, modelNameAddr, doc.querySelector('.description-wrapper'), requestButtons),
    div({ class: 'right' }, div({ class: 'subnav-detail-container' }), doc.querySelector('.promotion-wrapper')),
  );

  const leftRight = div({ class: 'section' }, actions, subNav, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(
      div('right').innerHTML = rightAside,
    ),
  ));

  // place the left right columns after the carousel
  doc.querySelector('.carousel-wrapper').insertAdjacentElement('afterend', leftRight);
  // place the breadcrumbs after the carousel
  doc.querySelector('.carousel-wrapper').insertAdjacentElement('afterend', breadCrumbsEl);

  doc.querySelector('.content-wrapper').insertAdjacentElement('afterend', modelFilter);
  doc.querySelector('.content-wrapper').insertAdjacentElement('afterend', plansAnchor);

  // inventory homes
  doc.querySelector('.section').insertAdjacentElement('beforeend', filterSectionTitle);
  filterSectionTitle.insertAdjacentElement('afterend', inventoryEl);

  inventoryEl.insertAdjacentElement('afterend', featuredPlansTitle);
  featuredPlansTitle.insertAdjacentElement('afterend', featuredModels);

  featuredModels.insertAdjacentElement('afterend', specialistBanner);
  specialistBanner.insertAdjacentElement('afterend', specialistsSection);
  specialistsSection.insertAdjacentElement('afterend', div({ class: 'section disclaimer' }, disclaimer));
}