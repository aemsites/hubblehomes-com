/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, a, button, strong, small, h2, h3, h4, h5, br, span } from '../../scripts/dom-helpers.js';
import { createTemplateBlock } from '../../scripts/block-helper.js';
import { getInventoryHomeByPath } from '../../scripts/inventory.js';
import { fetchRates, calculateMonthlyPayment } from '../../scripts/mortgage.js';
import { formatPrice } from '../../scripts/currency-formatter.js';
import formatPhoneNumber from '../../scripts/phone-formatter.js';
import { getSalesCenterForCommunity } from '../../scripts/sales-center.js';

async function fetchRequiredPageData() {
  await fetchRates();

  const homeDetails = await getInventoryHomeByPath(window.location.pathname);
  const salesCenter = await getSalesCenterForCommunity(homeDetails.community);
  const salesCenterPhoneNumber = salesCenter ? salesCenter['phone-number'] : '';

  return {
    homeDetails,
    phoneNumber: formatPhoneNumber(salesCenterPhoneNumber),
  };
}

// Function to fetch and embed SVG content
async function loadSVG(url, className = '') {
  const response = await fetch(url);
  const svgText = await response.text();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgText.trim();
  const svgElement = tempDiv.firstElementChild;
  svgElement.classList.add('icon');
  if (className) {
    className.split(' ').forEach((name) => {
      if (name) svgElement.classList.add(name);
    });
  }
  return svgElement;
}

async function createPriceCell(homeDetails) {
  const { price } = homeDetails;
  const previousPrice = homeDetails['previous-price'];
  const numericPrice = price ? parseFloat(price.replace(/[^\d.-]/g, '')) : null;
  const numericPreviousPrice = previousPrice ? parseFloat(previousPrice.replace(/[^\d.-]/g, '')) : null;

  let symbolElement = null;
  let previouslyPricedRow = div();

  if (previousPrice) {
    if (numericPrice > numericPreviousPrice) {
      symbolElement = await loadSVG('/icons/caret-up.svg', 'caret-up');
    }
    previouslyPricedRow = div(
      div(
        small('Previously'),
        br(),
        strong({ class: 'strike-through' }, formatPrice(numericPreviousPrice)),
      ),
    );
  }

  const priceHeading = h3(formatPrice(numericPrice), symbolElement ? div(symbolElement) : div());
  const buyNowButton = div(button({
    class: 'fancy yellow',
    onclick: () => {
      window.location.href = 'https://www.hubblehomes.com/buy-now';
    },
  }, 'Buy Now'));

  return div({ class: 'cell border-right' }, priceHeading, previouslyPricedRow, buyNowButton);
}

function createEstimatedPaymentCell(price) {
  const numericPrice = price ? parseFloat(price.replace(/[^\d.-]/g, '')) : null;

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

export default async function decorate(doc) {
  const { homeDetails, phoneNumber } = await fetchRequiredPageData();

  const $newPage = div();

  const $carouselWrapper = doc.querySelector('.carousel-wrapper');
  if ($carouselWrapper) {
    $newPage.appendChild($carouselWrapper);
  }

  const $page = doc.querySelector('main .section');

  const $breadCrumbs = buildBreadCrumbs();

  const linksBlock = doc.querySelector('.links-wrapper');

  const heading = h2(phoneNumber);
  const modelName = homeDetails['model name'];
  const availableAt = await createTemplateBlock('available-at-locations', [[modelName]]);
  const alsoAvailableAtAside = div({ class: 'item' }, heading, br(), availableAt, br(), linksBlock);

  // Temporary for showing home details
  const homeDetailsBoxContent = `
    <dl>
      <dt>Price</dt>
      <dd>${homeDetails.price ? formatPrice(homeDetails.price) : 'N/A'}</dd>
      <dt>Square Feet</dt>
      <dd>${homeDetails['square feet'] || 'N/A'}</dd>
      <dt>Beds</dt>
      <dd>${homeDetails.beds || 'N/A'}</dd>
      <dt>Baths</dt>
      <dd>${homeDetails.baths || 'N/A'}</dd>
      <dt>Cars</dt>
      <dd>${homeDetails.cars || 'N/A'}</dd>
      <dt>Primary Bed</dt>
      <dd>${homeDetails['primary bed'] || 'N/A'}</dd>
      <dt>Home Style</dt>
      <dd>${homeDetails['home style'] || 'N/A'}</dd>
    </dl>`;
  const homeDetailsBox = div({ class: 'details' });
  homeDetailsBox.innerHTML = homeDetailsBoxContent;

  const name = h2(modelName);
  const svgElement = await loadSVG('/icons/directions.svg', 'icon');
  const address = a({
    href: `https://www.google.com/maps/dir/Current+Location/${homeDetails.latitude},${homeDetails.longitude}`,
    class: 'address-container',
  }, h4(homeDetails.address, ' ', svgElement));

  const mls = h5(`MLS #${homeDetails.mls}`);
  const homeIdentity = div(name, address, mls);

  const priceCell = await createPriceCell(homeDetails);
  const estimatedCostCell = createEstimatedPaymentCell(homeDetails.price);
  const pricingContainer = div({ class: 'pricing-information' }, priceCell, estimatedCostCell);

  const listingHeader = div({ class: 'listing-header' }, homeIdentity, pricingContainer);
  const descriptionText = doc.querySelector('.description-wrapper p');
  const buttonContainer = div({ class: 'button-container' },
    button({ class: 'fancy dark-gray' }, 'Request Information'),
    button({ class: 'fancy' }, 'Request a Tour'),
  );

  const fullDescription = div({ class: 'full-description' }, listingHeader, br(), descriptionText, buttonContainer);
  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, fullDescription),
    div({ class: 'right' }, homeDetailsBox),
  );

  const actionbar = await createTemplateBlock('actionbar', [['save, share']]);

  const floorplan = $page.querySelector('.floor-plan-images-wrapper');

  const embed = $page.querySelector('.embed-wrapper');

  const disclaimer = $page.querySelector('.fragment-wrapper');
  if (disclaimer) {
    disclaimer.classList.add('disclaimer');
  }

  const mainPageContent = div({ class: 'section' },
    $breadCrumbs,
    actionbar,
    div(
      { class: 'content-wrapper' },
      div(
        { class: 'content' },
        twoCols,
      ),
      aside(alsoAvailableAtAside),
    ),
    floorplan || null,
    embed || null,
    disclaimer || null,
  );

  $newPage.appendChild(mainPageContent);
  const $parent = $page.parentNode;
  $parent.replaceChild($newPage, $page);
}
