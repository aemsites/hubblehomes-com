import {
  buildBlock, decorateBlock, getMetadata, loadBlock,
} from '../../scripts/aem.js';
import {
  a, aside, div, small, strong,
} from '../../scripts/dom-helpers.js';
import { getInventoryHomes } from '../../scripts/inventory-data.js';
import { getHomePlans } from '../../scripts/home-plans-data.js';
import {
  getSalesCenterNameFromUrl,
  getSalesCenters,
} from '../../scripts/sales-center.js';
import getLastUrlSegment from '../../scripts/url-utils.js';
import { loadTemplateBlock } from '../../scripts/template-scripts.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

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
    content.push(['name', `- ${specialist.name}`]);
    content.push(['phone', specialist.phone]);
    content.push(['photo', specialist.headshotImage]);
    content.push(['email', specialist.email]);

    const specialistsBlock = buildBlock('specialists', content);
    specialistsBlock.classList.add('agents');
    const blockWrapper = div({ class: 'section' }, specialistsBlock);
    decorateBlock(specialistsBlock);
    promises.push(loadTemplateBlock(specialistsBlock));
    agents.push(blockWrapper);
  });

  Promise.all(promises).then(() => deferred.resolve(agents));
  return deferred.promise;
}

export default async function decorate(doc) {
  const {
    salesCenter,
  } = await fetchRequiredPageData();

  const $main = doc.querySelector('main');
  const $page = doc.querySelector('main .section');

  const carousel = doc.querySelector('.carousel-wrapper');
  $main.prepend(carousel);

  const $h1 = $page.querySelector('h1');
  const $breadCrumbs = div(
    { class: 'breadcrumbs' },
    a({ href: '/', 'arial-label': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/foo', 'arial-label': 'View News Page' }, 'CommunityName'),
    ' > ',
    $h1.textContent,
  );

  const tabs = div({ class: 'tabs' }, 'tabs');
  const description = doc.querySelector('.default-content-wrapper');

  const twoCols = div({ class: 'repeating-grid' }, div({ class: 'left' }, description), div({ class: 'right' }, 'right'));


  const inventory = await buildInventoryHomes();

  const mainPageContent = div({ class: 'section' }, $breadCrumbs,
    div({ class: 'content-wrapper' },
      div(
        { class: 'content' },
        tabs,
        twoCols,
      ),
      aside(
        { class: 'wip' },
        div('hello side wall'),
      ),
    ));

  const inventoryEl = div({ class: 'section' }, inventory);
  $page.replaceWith(carousel, mainPageContent, inventoryEl);


  // mainContent.appendChild(inventory);
  //
  // const communityName = getSalesCenterNameFromUrl(window.location);
  //
  // const banner = div({ class: 'grey-divider' }, `${communityName} New Home Specialists`);
  //
  // const specialistsSection = div({ class: 'section specialists' });
  //
  // const specialistEl = await createSpecialists(salesCenter.specialists);
  // specialistEl.forEach((el) => {
  //   specialistsSection.appendChild(el);
  // });

  // $page.replaceWith($newPage);
}
