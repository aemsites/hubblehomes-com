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
import { createTemplateBlock, safeAppend } from '../../scripts/block-helper.js';
import {
  getInventoryHomeByPath,
  getInventoryHomeModelByCommunities,
} from '../../scripts/inventory.js';
import { calculateMonthlyPayment } from '../../scripts/mortgage.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import { getSalesCenterForCommunity } from '../../scripts/sales-center.js';
import {
  buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';
import renderCards from '../blocks/cards/Card.js';

async function fetchRequiredPageData() {
  const homeDetails = await getInventoryHomeByPath(window.location.pathname);
  const salesCenter = await getSalesCenterForCommunity(homeDetails.community);
  const phone = salesCenter ? salesCenter.phone : '';

  return {
    homeDetails,
    phoneNumber: phone,
  };
}

async function buildAccordion(model) {
  const homesByCommunity = await getInventoryHomeModelByCommunities(model);
  const content = [];

  const communityName = Object.keys(homesByCommunity);

  await Promise.all(communityName.map(async (community) => {
    const models = await renderCards('inventory', homesByCommunity[community]);
    models.classList.remove('section');
    content.push([`View All ${model} Quick-Delivery Homes in ${community}`, models]);
  }));

  const block = buildBlock('accordion', content);
  const wrapper = div(block);
  wrapper.classList.add('section');
  decorateBlock(block);
  await loadBlock(block, true);
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

  const rightAside = await createRightAside(doc, homeDetails, phoneNumber);

  const mainSectionEl = doc.querySelector('main > .section');
  const disclaimer = doc.querySelector('.fragment-wrapper');
  const overview = doc.querySelector('.overview-wrapper');
  const descriptionWrapper = doc.querySelector('.description-wrapper');

  const matterport = doc.querySelector('.embed-wrapper');
  if (matterport) {
    matterport.classList.add('section');
  }

  const elevations = doc.querySelector('.elevations-wrapper');
  if (elevations) {
    elevations.classList.add('section');
  }

  const actionButtons = doc.querySelector('.action-buttons-wrapper');
  if (actionButtons) {
    actionButtons.classList.add('section');
  }

  const tabs = doc.querySelector('.tabs-wrapper');
  if (tabs) {
    tabs.classList.add('section');
  }

  const accordion = await buildAccordion(homeDetails['model name']);

  const address = div({ class: 'page-info' }, h1(homeDetails['model name']), a({
    href: `https://www.google.com/maps/dir/Current+Location/${homeDetails.latitude},${homeDetails.longitude}`,
    target: '_blank',
  }, h4(homeDetails.address)), h5(`MLS #${homeDetails.mls}`));

  const pricingContainer = await createPricingInformation(homeDetails);
  const listingHeader = div({ class: 'fluid-flex inventory-details' }, address, pricingContainer);

  const buttons = div(
    { class: 'button-container' },
    button(
      {
        class: 'fancy yellow',
        onclick: () => {
          window.location.href = '/contact-us';
        },
      },
      'Request Information',
    ),
  );

  const twoCols = div(
    listingHeader,
    div({ class: 'repeating-grid' }, descriptionWrapper, div(overview)),
    buttons,
  );

  const leftRight = div({ class: 'section' }, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(rightAside),
  ));

  safeAppend(
    mainSectionEl,
    leftRight,
    elevations,
    actionButtons,
    tabs,
    matterport,
    accordion,
    div({ class: 'section disclaimer' }, disclaimer),
  );
}
