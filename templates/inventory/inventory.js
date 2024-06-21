import {
  aside,
  div,
  a,
  button,
  strong,
  small,
  h2,
  h3,
  h4,
  h5,
  br,
  span,
  h1,
} from '../../scripts/dom-helpers.js';
import { createActionBar, createTemplateBlock } from '../../scripts/block-helper.js';
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
  const salesCenterPhoneNumber = salesCenter ? salesCenter['phone-number'] : '';

  return {
    homeDetails,
    phoneNumber: formatPhoneNumber(salesCenterPhoneNumber),
  };
}

async function createPriceCell(homeDetails) {
  const { price } = homeDetails;
  const numericPrice = price ? parseFloat(price) : null;
  const priceHeading = h3(formatPrice(numericPrice));
  const buyNowButton = div(button({
    class: 'fancy yellow',
    onclick: () => { window.location.href = '/buy-now'; },
  }, 'Buy Now'));

  return div({ class: 'cell border-right' }, priceHeading, div(), buyNowButton);
}

function createEstimatedPaymentCell(price) {
  const numericPrice = price ? parseFloat(price.trim()) : null;

  const estimatedCost = formatPrice(calculateMonthlyPayment(numericPrice));
  const perMonthText = span({ class: 'per-month' }, '/mo*');
  const estimatedCostHeadingText = h3(strong(estimatedCost), perMonthText);

  const estimatedPayment = 'Estimated<br>Payment';
  const estimatedText = small();
  estimatedText.innerHTML = estimatedPayment;

  const prequalifyButton = div(button({
    class: 'fancy dark-gray',
    onclick: () => {
      window.location.href = 'https://www.hubblehomes.com/contact-us/get-pre-qualified';
    },
  }, 'Pre-Qualify'));

  return div({ class: 'cell' }, estimatedCostHeadingText, div(estimatedText), prequalifyButton);
}

function buildBreadCrumbs() {
  return div(
    { class: 'breadcrumbs' },
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
  const headingEl = h2(phoneNumber);
  const availableAt = await createTemplateBlock('available-at-locations', [['model', modelName]]);
  return div(headingEl, br(), availableAt, br(), doc.querySelector('.links-wrapper'));
}

async function createPricingInformation(homeDetails) {
  const priceCell = await createPriceCell(homeDetails);
  const estimatedCostCell = createEstimatedPaymentCell(homeDetails.price);
  return div({ class: 'pricing-information' }, priceCell, estimatedCostCell);
}

export default async function decorate(doc) {
  const { homeDetails, phoneNumber } = await fetchRequiredPageData();

  const breadCrumbsEl = buildBreadCrumbs();
  const actions = await createActionBar(['share', 'save']);
  const rightAside = await createRightAside(doc, homeDetails, phoneNumber);

  const mainSectionEl = doc.querySelector('main > .section');
  const disclaimer = doc.querySelector('.fragment-wrapper');
  const subNav = doc.querySelector('.subnav-wrapper');
  const descriptionWrapper = doc.querySelector('.description-wrapper');
  const floorplanLinks = doc.querySelector('.floorplan-links-wrapper');
  const tabs = doc.querySelector('.tabs-wrapper');
  tabs.classList.add('section');

  const accordion = await buildAccordion(homeDetails['model name']);

  const navBar = div({ class: 'fluid-flex nav-bar' }, subNav, actions);
  const address = div({ class: 'directions' }, h1(homeDetails['model name']), a({
    href: `https://www.google.com/maps/dir/Current+Location/${homeDetails.latitude},${homeDetails.longitude}`,
    target: '_blank',
  }, h4(homeDetails.address)), h5(`MLS #${homeDetails.mls}`));

  const pricingContainer = await createPricingInformation(homeDetails);
  const listingHeader = div({ class: 'fluid-grid inventory-details' }, address, pricingContainer);

  const buttons = div(
    { class: 'button-container' },
    button({ class: 'fancy dark-gray' }, 'Request Information'),
    button({ class: 'fancy' }, 'Request a Tour'),
  );

  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, listingHeader, descriptionWrapper, buttons),
    div({ class: 'right' }, div({ class: 'subnav-detail-container' })),
  );

  const leftRight = div({ class: 'section' }, navBar, div(
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
