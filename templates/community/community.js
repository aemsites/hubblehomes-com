import {
  buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';
import {
  a, aside, br, div, h2, h3,
} from '../../scripts/dom-helpers.js';
import { getInventoryHomes } from '../../scripts/inventory-data.js';
import { getHomePlans } from '../../scripts/home-plans-data.js';
import {
  getSalesCenterCommunityNameFromUrl,
  getSalesCenters,
} from '../../scripts/sales-center.js';
import getLastUrlSegment from '../../scripts/url-utils.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';

/**
 * Builds the inventory homes block.
 * @returns {Promise<Element>} The inventory homes block wrapped in a div.
 */
async function buildInventoryHomes() {
  const content = [
    ['title', 'All New Home Listings'],
    // ['models', 'https://main--hubblehomes-com--aemsites.hlx.page/drafts/bhellema/models.json'],
  ];

  const modelsBlock = buildBlock('models', content);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadBlock(modelsBlock);
  return blockWrapper;
}

async function fetchRequiredPageData() {
  // prime the home plans so that model images can be looked up
  await getHomePlans();

  // get the sales center and inventory homes
  const salesCenterData = await getSalesCenters(window.location);
  const community = getLastUrlSegment(window.location);

  const homes = await getInventoryHomes(community);

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
  const $h1 = $page.querySelector('h1');
  return div(
    { class: 'breadcrumbs' },
    a({ href: '/', 'arial-label': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/foo', 'arial-label': 'View News Page' }, 'CommunityName'),
    ' > ',
    $h1.textContent,
  );
}

function createRightAside() {
  // phone number and links
  const phone = '(208) 649-5529';
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
  alsoAvailableAt.map((location) => {
    const divElement = document.createElement('div');
    divElement.textContent = location;
    divElement.appendChild(br());
    locationList.appendChild(divElement);
  });

  const linksList = div('Links:');
  links.map((link) => {
    const linkElement = a({ href: '#' }, link);
    const divElement = document.createElement('div');
    divElement.appendChild(linkElement);
    divElement.appendChild(br());
    linksList.appendChild(divElement);
  });

  return div({ class: 'item' }, heading, br(), subheading, locationList, br(), linksList);
}

export default async function decorate(doc) {
  const {
    salesCenter,
  } = await fetchRequiredPageData();

  const $main = doc.querySelector('main');
  const $page = doc.querySelector('main .section');

  const carousel = doc.querySelector('.carousel-wrapper');
  $main.prepend(carousel);

  const $breadCrumbs = buildBreadCrumbs($page);

  const tabs = div({ class: 'tabs' });
  const description = doc.querySelector('.default-content-wrapper');

  const rightContent = `<dl>
    <dt>From</dt>
    <dd> $ 381,990</dd>
    <dt>Square Feet</dt>
    <dd>1,700 </dd>
    <dt>Beds</dt><dd>3  - 4</dd>
    <dt>Baths</dt><dd>2.5</dd>
    <dt>Cars</dt><dd>2</dd><dt>Primary Bed</dt>
    <dd>Up</dd><dt>Home Style</dt>
    <dd>2 Story</dd>
  </dl>`;

  const rightCol = div();
  rightCol.innerHTML = rightContent;

  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, description),
    div({ class: 'right' }, rightCol),
  );

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

  const inventoryEl = div({ class: 'section inventory' }, inventory);
  $page.replaceWith(carousel, mainPageContent, inventoryEl);

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
