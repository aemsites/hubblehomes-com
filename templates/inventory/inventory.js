import {
  aside,
  div,
  a,
  button,
  h2,
  h3,
  h4,
  h5,
  br,
  span,
  h1,
} from '../../scripts/dom-helpers.js';
import { createTemplateBlock } from '../../scripts/block-helper.js';
import {
  getInventoryHomeByPath,
  getInventoryHomesByCommunities,
} from '../../scripts/inventory.js';
import { loadRates, calculateMonthlyPayment } from '../../scripts/mortgage.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import { getSalesCenterForCommunity } from '../../scripts/sales-center.js';
import { loadWorkbook } from '../../scripts/workbook.js';
import {
  buildBlock, decorateBlock,
} from '../../scripts/aem.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';

async function fetchRequiredPageData() {
  await loadWorkbook();
  await loadRates();

  const homeDetails = await getInventoryHomeByPath(window.location.pathname);
  const salesCenter = await getSalesCenterForCommunity(homeDetails.community);
  const phone = salesCenter ? salesCenter.phone : '';

  return {
    homeDetails,
    phoneNumber: phone,
  };
}

function buildBreadCrumbs() {
  return div(
    { class: 'breadcrumbs section' },
    a({ href: '/', 'aria-label': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/foo', 'aria-label': 'View News Page' }, 'CommunityName'),
    ' > ',
    'The Birch',
  );
}

async function buildInventoryCards(inventoryHomes, community) {
  window.hh = window.hh || {};
  window.hh.current = window.hh.current || {};
  window.hh.current.models = inventoryHomes;
  window.hh.current.sale_center = await getSalesCenterForCommunity(community);
  const modelsBlock = buildBlock('cards', []);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadTemplateBlock(modelsBlock);
  return blockWrapper;
}

async function buildAccordion(model) {
  const homesByCommunity = await getInventoryHomesByCommunities(model);
  const content = [];

  const communityName = Object.keys(homesByCommunity);

  await Promise.all(communityName.map(async (community) => {
    const models = await buildInventoryCards(homesByCommunity[community], community);
    content.push([`View All ${model} Quick-Delivery Homes in ${community}`, models]);
  }));

  const block = buildBlock('accordion', content);
  const wrapper = div(block);
  wrapper.classList.add('section');
  decorateBlock(block);
  await loadTemplateBlock(block);
  return wrapper;
}

async function createRightAside(doc, homeDetails, phoneNumber) {
  const modelName = homeDetails['model name'];
  const headingEl = h2(formatPhoneNumber(phoneNumber));
  const availableAt = await createTemplateBlock('available-at-locations', [['model', modelName]]);
  return div(headingEl, br(), availableAt, br(), doc.querySelector('.links-wrapper'));
}

async function createPricingInformation(homeDetails) {
  const { price } = homeDetails;
  const numericPrice = price ? parseFloat(price) : null;
  const estimatedCost = formatPrice(calculateMonthlyPayment(numericPrice));
  const perMonthText = span({ class: 'per-month' }, '/mo*');
  const estimatedCostHeadingText = h4(estimatedCost, perMonthText);
  const priceEl = h3(formatPrice(numericPrice));
  return div({ class: 'pricing-information' }, priceEl, estimatedCostHeadingText);
}

export default async function decorate(doc) {
  const { homeDetails, phoneNumber } = await fetchRequiredPageData();

  const breadCrumbsEl = buildBreadCrumbs();
  const rightAside = await createRightAside(doc, homeDetails, phoneNumber);

  const mainSectionEl = doc.querySelector('main > .section');
  const disclaimer = doc.querySelector('.fragment-wrapper');
  const overview = doc.querySelector('.overview-wrapper');

  const elevations = doc.querySelector('.elevations-wrapper');
  elevations.remove();

  const descriptionWrapper = doc.querySelector('.description-wrapper');
  const floorplanLinks = doc.querySelector('.action-buttons-wrapper');
  floorplanLinks.classList.add('section');
  const tabs = doc.querySelector('.tabs-wrapper');
  tabs.classList.add('section');

  const accordion = await buildAccordion(homeDetails['model name']);

  const address = div({ class: 'directions' }, h1(homeDetails['model name']), a({
    href: `https://www.google.com/maps/dir/Current+Location/${homeDetails.latitude},${homeDetails.longitude}`,
    target: '_blank',
  }, h4(homeDetails.address)), h5(`MLS #${homeDetails.mls}`));

  const pricingContainer = await createPricingInformation(homeDetails);
  const listingHeader = div({ class: 'fluid-flex inventory-details' }, address, pricingContainer);

  const buttons = div(
    { class: 'button-container' },
    button({ class: 'fancy dark-gray' }, 'Request Information'),
    button({ class: 'fancy' }, 'Request a Tour'),
  );

  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, listingHeader, descriptionWrapper, buttons),
    div({ class: 'right' }, overview),
  );

  const leftRight = div({ class: 'section' }, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(rightAside),
  ));

  mainSectionEl.append(
    breadCrumbsEl,
    leftRight,
    floorplanLinks,
    tabs,
    doc.querySelector('.embed-wrapper'),
    accordion,
    div({ class: 'section disclaimer' }, disclaimer),
  );
}
