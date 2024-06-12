/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, a, button, strong, small, h2, h3, h4, h5, br, span } from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';
import { createActionBar } from '../../scripts/block-helper.js';

// Function to fetch and embed SVG content
async function loadSVG(url, className = '') {
  const response = await fetch(url);
  const svgText = await response.text();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = svgText.trim();
  const svgElement = tempDiv.firstElementChild;
  svgElement.classList.add('icon');
  // Add additional class(es) if provided
  if (className) {
    className.split(' ').forEach((name) => {
      if (name) svgElement.classList.add(name);
    });
  }
  return svgElement;
}

function createAlsoAvailableAtAside(linksBlock) {
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

  const heading = h2(phone);
  const subheading = h3('Also Available At:');

  const locationList = div();
  alsoAvailableAt.forEach((location) => {
    const divElement = document.createElement('div');
    divElement.textContent = location;
    divElement.appendChild(br());
    locationList.appendChild(divElement);
  });

  return div({ class: 'item' }, heading, br(), subheading, locationList, br(), linksBlock);
}

async function createPriceCell(price, previousPrice) {
  let symbolElement = null;
  let previouslyPriced = div();

  if (previousPrice) {
    const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
    const numericPreviousPrice = parseFloat(previousPrice.replace(/[^\d.-]/g, ''));
    if (numericPrice > numericPreviousPrice) {
      symbolElement = await loadSVG('/icons/caret-up.svg', 'caret-up');
    }

    previouslyPriced = div(
      div(
        small('Previously'),
        br(),
        strong({ class: 'strike-through' }, previousPrice),
      ),
    );
  }

  const priceHeading = h3(price, symbolElement ? div(symbolElement) : div());
  const buyNowButton = div(button({
    class: 'fancy yellow',
    onclick: () => {
      window.location.href = 'https://www.hubblehomes.com/buy-now';
    },
  }, 'Buy Now'));

  const priceCell = div({ class: 'cell border-right' }, priceHeading, previouslyPriced, buyNowButton);

  return priceCell;
}

function createEstimatedPaymentCell() {
  const estimatedCost = '$2,552';
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
  const estimatedCostCell = div({ class: 'cell' }, estimatedCostHeadingText, div(estimatedText), prequalifyButton);

  return estimatedCostCell;
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
  const $newPage = div();

  const $carouselWrapper = doc.querySelector('.carousel-wrapper');
  $newPage.appendChild($carouselWrapper);

  const $page = doc.querySelector('main .section');

  // breadcrumbs block to be used when available
  const $breadCrumbs = buildBreadCrumbs();

  const linksBlock = doc.querySelector('.links-wrapper');

  // Also Available At Block to be used when available
  const alsoAvailableAtAside = createAlsoAvailableAtAside(linksBlock);

  // subnav block to be added when available
  const homeDetailsBoxContent = `
    <dl>
      <dt>Price</dt>
      <dd>$381,990</dd>
      <dt>Square Feet</dt>
      <dd>1,700</dd>
      <dt>Beds</dt>
      <dd>3 - 4</dd>
      <dt>Baths</dt>
      <dd>2.5</dd>
      <dt>Cars</dt>
      <dd>2</dd>
      <dt>Primary Bed</dt>
      <dd>Up</dd>
      <dt>Home Style</dt>
      <dd>2 Story</dd>
    </dl>`;
  const homeDetailsBox = div({ class: 'details' });
  homeDetailsBox.innerHTML = homeDetailsBoxContent;

  // replace hard-coded values with actual data from spreadsheet when available
  const name = h2('The Birch');
  const svgElement = await loadSVG('/icons/directions.svg', 'icon');
  const address = a({ href: '#', class: 'address-container' }, h4('10883-beechcraft-st', ' ', svgElement));
  const mls = h5('MLS# 98907516');
  const homeIdentity = div(name, address, mls);

  const price = getMetadata('price');
  const previousPrice = getMetadata('previous-price');
  const priceCell = await createPriceCell(price, previousPrice);
  const estimatedCostCell = createEstimatedPaymentCell();
  const priceBlock = div({ class: 'pricing-information' }, priceCell, estimatedCostCell);

  const listingHeader = div({ class: 'listing-header' }, homeIdentity, priceBlock);
  const descriptionText = doc.querySelector('.default-content-wrapper p').textContent;
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

  // create action bar block
  const actionbar = await createActionBar([['save, share']]);

  // floorplan block to be added when available
  const floorplan = $page.querySelector('.floorplan-wrapper');

  // matterport block to be added when available
  const embed = $page.querySelector('.embed-wrapper');

  const disclaimer = $page.querySelector('.fragment-wrapper');
  disclaimer.classList.add('disclaimer');

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
    floorplan,
    embed,
    disclaimer,
  );

  $newPage.appendChild(mainPageContent);
  const $parent = $page.parentNode;
  $parent.replaceChild($newPage, $page);
}
