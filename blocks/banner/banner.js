import {
  div, button, h2, h3, form, input, a,
} from '../../scripts/dom-helpers.js';

function createLinkElement(hrefValue, innerHTML) {
  const link = a({ class: 'spotlight-link', href: hrefValue }, innerHTML);

  return link;
}

function createButton(hrefValue) {
  const spotlightButton = button({
    class: 'spotlight-button',
    onclick: () => { window.location.href = hrefValue; },
  }, 'LEARN MORE');

  return spotlightButton;
}

function createBannerText(block) {
  // extract text values from block elements
  const spotlightTitle = block.querySelector('h2');
  const spotlightSubtitle = block.querySelector('h3');

  // create hyperlinks with the text values
  const spotlightLink = block.querySelector('a');
  const hrefValue = spotlightLink ? spotlightLink.href : '#';
  const titleLink = createLinkElement(hrefValue, spotlightTitle.innerHTML);
  const subtitleLink = createLinkElement(hrefValue, spotlightSubtitle.innerHTML);

  spotlightTitle.remove();
  spotlightSubtitle.remove();
  spotlightLink.remove();

  const heading = h2(titleLink);
  const subheading = h3(subtitleLink);

  // create the button
  const spotlightButton = createButton(hrefValue);

  // create the form element
  const spotlightInput = input({ class: 'spotlight-input', placeholder: 'Enter Email' });
  const spotlightFormButton = button({ class: 'spotlight-form-button' }, 'SUBMIT');
  const spotlightForm = form({ class: 'spotlight-form' }, spotlightInput, spotlightFormButton);

  const textDiv = div({
    class: 'spotlight-text-container',
  }, heading, subheading, spotlightButton, spotlightForm);

  return textDiv;
}

export default function decorate(block) {
  const spotlightTextContainer = createBannerText(block);

  // extract the background image for bannerPicture
  const pictureElement = block.querySelector('picture');
  const imgElement = pictureElement.querySelector('source');
  const src = imgElement.getAttribute('srcset');

  block.innerHTML = '';

  // desktop version
  const spotlightCircle = div({ class: 'spotlight-circle' }, spotlightTextContainer);
  const spotlightCircleContainer = div({ class: 'spotlight-circle-container' }, spotlightCircle);
  const bannerPicture = div({ class: 'banner-picture' }, spotlightCircleContainer);
  bannerPicture.style.backgroundImage = `url(${src})`;

  // mobile version
  const mobileSpotlightText = spotlightTextContainer.cloneNode(true);
  const mobileBannerTextContainer = div({ class: 'mobile-bannertext-container' }, mobileSpotlightText);

  const bannerElement = div({ class: 'banner-element' }, bannerPicture, mobileBannerTextContainer);
  block.appendChild(bannerElement);
}
