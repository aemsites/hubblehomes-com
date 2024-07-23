import {
  a, button, div, h2, h3,
} from '../../scripts/dom-helpers.js';

function createBannerText(block) {
  // extract text values from block elements
  const spotlightTitle = block.querySelector('h2');
  const spotlightSubtitle = block.querySelector('h3');

  // create hyperlinks with the text values
  const spotlightLink = block.querySelector('a');
  const hrefValue = spotlightLink ? spotlightLink.href : '#';
  const titleLink = a({ class: 'spotlight-link', href: hrefValue }, spotlightTitle.textContent);
  const subtitleLink = a({ class: 'spotlight-link', href: hrefValue }, spotlightSubtitle.textContent);

  spotlightTitle.remove();
  spotlightSubtitle.remove();
  spotlightLink.remove();

  const heading = h2(titleLink);
  const subheading = h3(subtitleLink);

  let spotlightButton;
  if (hrefValue) {
    spotlightButton = button({
      class: 'spotlight-button banner-blue',
      onclick: () => { window.location.href = hrefValue; },
    }, 'Learn More');
  }

  return div({
    class: 'spotlight-text-container',
  }, heading, subheading, spotlightButton);
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
  const mobileBannerTextContainer = div({ class: 'spotlight-circle-container-mobile' }, mobileSpotlightText);

  const bannerElement = div({ class: 'banner-element' }, bannerPicture, mobileBannerTextContainer);
  block.appendChild(bannerElement);
}
