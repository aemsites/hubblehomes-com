/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
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
import { getInventoryHomeByPath } from '../../scripts/inventory.js';
import { loadRates, calculateMonthlyPayment } from '../../scripts/mortgage.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import { getSalesCenterForCommunity } from '../../scripts/sales-center.js';
import loadSVG from '../../scripts/svg-helper.js';
import { loadWorkbook } from '../../scripts/workbook.js';

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

async function createRightAside(doc, homeDetails, phoneNumber) {
  const modelName = homeDetails['model name'];
  const headingEl = h2(phoneNumber);
  const availableAt = await createTemplateBlock('available-at-locations', [[modelName]]);
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

  const navBar = div({ class: 'fluid-flex nav-bar' }, subNav, actions);
  const address = div({ class: 'directions' }, h1(homeDetails['model name']), a({
    href: `https://www.google.com/maps/dir/Current+Location/${homeDetails.latitude},${homeDetails.longitude}`,
    target: '_blank',
  }, h4(homeDetails.address)), h5(`MLS #${homeDetails.mls}`));

  const pricingContainer = await createPricingInformation(homeDetails);

  const listingHeader = div({ class: 'fluid-grid inventory-details' }, address, pricingContainer);

  const buttons = div({ class: 'button-container' },
    button({ class: 'fancy dark-gray' }, 'Request Information'),
    button({ class: 'fancy' }, 'Request a Tour'),
  );

  // const fullDescription = div({ class: 'full-description' }, listingHeader, br(), descriptionText, buttonContainer);
  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, listingHeader, descriptionWrapper, buttons),
    div({ class: 'right' }, div({ class: 'subnav-detail-container' })),
  );

  // const floorplan = $page.querySelector('.floor-plan-images-wrapper');
  // const embed = $page.querySelector('.embed-wrapper');
  // const disclaimer = $page.querySelector('.fragment-wrapper');
  // if (disclaimer) {
  //   disclaimer.classList.add('disclaimer');
  // }

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
    doc.querySelector('.floorplan-wrapper'),
    doc.querySelector('.embed-wrapper'),
    div({ class: 'section disclaimer' }, disclaimer),
  );
}
