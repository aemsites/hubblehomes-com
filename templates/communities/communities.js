import {
  buildBlock, decorateBlock, getMetadata,
} from '../../scripts/aem.js';
import {
  a,
  aside,
  br, dd,
  div, dl, dt,
  form,
  h1,
  h2,
  h4,
  option, p,
  select, span, strong,
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
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import loadSVG from '../../scripts/svg-helper.js';

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
    { class: 'breadcrumbs section' },
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

async function createRightAside(doc, salesCenter) {
  // The third column of the description box
  const {
    hours,
    phone,
    specialists,
    latitude,
    longitude,
    models,
    note,
    community,
    address,
    zipcode,
    city,
    'zip-code-abbr': zipCodeAbbr,
    'sales-center-model': salesCenterModel,
  } = salesCenter;
  const mainDiv = div({ class: 'sales-center-info' });
  const heading = h2(formatPhoneNumber(phone));

  mainDiv.append(heading);

  if (hours) {
    const hoursEl = div({ class: 'hours' }, ...hours.split('\n')
      .map((hour) => span(hour, br())));
    mainDiv.append(div({ class: 'sales-office-hours' }, strong('Regular Hours'), hoursEl));
  }

  if (salesCenterModel || models) {
    const salesCenterModelInfo = div();
    if (salesCenterModel) {
      salesCenterModelInfo.append(
        div(span({ class: 'label' }, 'Sales Center: '), span(salesCenter['sales-center-model'])),
      );
    }

    if (models) {
      salesCenterModelInfo.append(
        div(span({ class: 'label' }, 'Model: '), span(salesCenter.models)),
      );
    }
    mainDiv.append(salesCenterModelInfo);
  }

  if (note) {
    mainDiv.append(p({ class: 'note' }, note));
  }

  if (specialists) {
    const emailIcon = await loadSVG('/icons/email.svg');
    const phoneIcon = await loadSVG('/icons/phone.svg');
    const sEl = specialists.map((specialist) => {
      const emailEl = emailIcon.cloneNode(true);
      const phoneEl = phoneIcon.cloneNode(true);
      return dd(
        span({ class: 'specialist' }, specialist.name),
        a({ class: 'email', href: `mailto:${specialist.email}` }, specialist.email, emailEl),
        a({ class: 'phone', href: `tel:${specialist.phone}` }, formatPhoneNumber(specialist.phone), phoneEl),
      );
    });
    mainDiv.append(dl({ class: 'sales-center-data' }, dt({ class: 'label' }, 'New Home Specialists: '), ...sEl));
  }

  if (address && community && city && zipCodeAbbr && zipcode) {
    const directionsIcon = await loadSVG('/icons/directions.svg');
    let googleLink;
    if (longitude && latitude) {
      googleLink = a({
        href: `https://www.google.com/maps/dir/Current+Location/${latitude},${longitude}`,
        target: '_blank',
      }, directionsIcon);
    }
    const addressEl = div(
      { class: 'sales-center-address' },
      p(
        { class: 'label' },
        'Sales Center Location: ',
        googleLink,
      ),
      span(community),
      span(address),
      span(`${city}, ${zipCodeAbbr}, ${zipcode}`),
    );
    mainDiv.append(addressEl);
  }

  return div(mainDiv, doc.querySelector('.links-wrapper'));
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

  return div({ class: 'filter-form' }, form({ class: 'fluid-flex' }, allListingSelect, sortBySelect, filterBySelect), resetEl);
}

export default async function decorate(doc) {
  const url = new URL(window.location);
  const params = url.searchParams;
  const filter = params.get('filter');
  const areaName = getMetadata('city', doc);
  const mainSection = doc.querySelector('main > .section');

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
  const rightAside = await createRightAside(doc, salesCenter);
  const modelFilter = buildFilterForm(filter);

  const plansAnchor = a({ id: 'plans' }, '');
  const inventoryEl = div({ class: 'section inventory' }, inventory);
  const disclaimer = doc.querySelector('.fragment-wrapper');
  const featuredPlansTitle = div({ class: 'grey-divider featured full-width' }, 'Featured Plans');
  const models = await buildFeaturedPlans(community.name);
  const hasFeaturedModels = window.hh.current.models.length > 0;
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
    div({ class: 'right' }, div({ class: 'subnav-detail-container' })),
  );

  const leftRight = div({ class: 'section' }, actions, subNav, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(
      rightAside,
    ),
  ));

  mainSection.append(
    breadCrumbsEl,
    leftRight,
    modelFilter,
    plansAnchor,
    filterSectionTitle,
    inventoryEl,
  );

  if (hasFeaturedModels) {
    mainSection.append(featuredPlansTitle, featuredModels);
  }

  mainSection.append(
    specialistBanner,
    specialistsSection,
    div({ class: 'section disclaimer' }, disclaimer),
  );
}
