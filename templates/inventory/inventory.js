/* eslint-disable function-call-argument-newline, object-curly-newline, function-paren-newline */
import { aside, div, a, button, strong, small, img, ul, h1, h2, h3, h4, h5, br, span } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';

function createAlsoAvailableAtAside() {
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

function createPriceCell(price, previousPrice) {
  // previousPrice = null;
  const priceHeading = h3(price);
  if (previousPrice) {
    if (price > previousPrice) {
      var symbol = div({ class: 'fa-caret-up' });
    }

    var previouslyPriced = div(
      small("Previously"),
      br(),
      strong({ class: 'strike-through' }, previousPrice));
  } else {
    var previouslyPriced = div();
  }

  const buyNowButton = div(button({ class: 'fancy yellow' }, 'Buy Now'));

  const priceCell = div({ class: 'cell price-cell' }, priceHeading, previouslyPriced, buyNowButton);

  return priceCell;
}

function createEstimatedPaymentCell() {
  const estimatedCost = '$2,552';

  // estimated cost per month
  const perMonthText = span({ class: 'per-month' }, '/mo*');
  const estimatedCostHeadingText = h3(strong(estimatedCost), perMonthText);

  // estimated payment text
  const estimatedPayment = 'Estimated<br>Payment';
  const estimatedText = small();
  estimatedText.innerHTML = estimatedPayment;

  // prequalify button
  const prequalifyButton = div(button({ class: 'fancy dark-grey' }, 'Pre-Qualify'));

  const estimatedCostCell = div({ class: 'cell' }, estimatedCostHeadingText, estimatedText, prequalifyButton);

  return estimatedCostCell;
}


function buildBreadCrumbs() {
  return div(
    { class: 'breadcrumbs' },
    a({ href: '/', 'arial-label': 'View Home Page' }, 'Home'),
    ' > ',
    a({ href: '/foo', 'arial-label': 'View News Page' }, 'CommunityName'),
    ' > ',
    'The Birch',
  );
}

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');

  // create a new page
  const $newPage = div();

  // carousel
  const $carouselWrapper = doc.querySelector('.carousel-wrapper');
  $newPage.appendChild($carouselWrapper);

  // actions
  const actions = div(
    { class: 'action-bar' },
    a({ class: 'share btn' }, 'Share'),
    a({ class: 'save btn' }, 'Save'),
  );

  // breadcrumbs
  const $breadCrumbs = buildBreadCrumbs();

  // tabs
  const tabs = div({ class: 'tabs' }, 'tabs');

  // Also Available At aside
  const alsoAvailableAtAside = createAlsoAvailableAtAside();

  const homeDetailsBoxContent = `<dl>
    <dt>Price</dt>
    <dd> $381,990</dd>
    <dt>Square Feet</dt>
    <dd>1,700 </dd>
    <dt>Beds</dt><dd>3  - 4</dd>
    <dt>Baths</dt><dd>2.5</dd>
    <dt>Cars</dt><dd>2</dd><dt>Primary Bed</dt>
    <dd>Up</dd><dt>Home Style</dt>
    <dd>2 Story</dd>
  </dl>`;
  const homeDetailsBox = div({ class: 'details' });
  homeDetailsBox.innerHTML = homeDetailsBoxContent;



  // Name, Address, MLS
  const name = h2('The Birch');
  const address = a({ href: '#', class: 'address-container' },
    h4('10883-beechcraft-st')
  );
  const mls = h5('MLS# 98907516');
  const homeIdentitiy = div( name, address, mls);

  // Pricing block 
  let price = getMetadata('pricing');
  let previousPrice = getMetadata("previous-price");
  const priceCell = createPriceCell(price, previousPrice);
  const estimatedCostCell = createEstimatedPaymentCell();
  const priceBlock = div({ class: 'price-container' }, priceCell, estimatedCostCell);


  const listingHeader = div({ class: 'listing-header' }, homeIdentitiy, priceBlock);
  const descriptionText = doc.querySelector('.default-content-wrapper p').textContent;
  const buttonContainer = div({ class: 'button-container' },
    button({ class: 'fancy dark-grey' }, 'Request Information'),
    button({ class: 'fancy blue' }, 'Request a Tour')
  );

  const fullDescription = div({ class: 'full-description' }, listingHeader, br(), descriptionText, buttonContainer);

  const twoCols = div(
    { class: 'repeating-grid' },
    div({ class: 'left' }, fullDescription),
    div({ class: 'right' }, homeDetailsBox),
  );

  const mainPageContent = div({ class: 'section' }, $breadCrumbs, actions, tabs, div(
    { class: 'content-wrapper' },
    div(
      { class: 'content' },
      twoCols,
    ),
    aside(
      div('right').innerHTML = alsoAvailableAtAside,
    ),
  ));

  $newPage.appendChild(mainPageContent);

  const $parent = $page.parentNode;
  $parent.replaceChild($newPage, $page);
}

