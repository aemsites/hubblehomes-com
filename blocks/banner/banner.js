import {
  div, button, h2, h3, form, input,
} from '../../scripts/dom-helpers.js';

function createLinkElement(hrefValue, innerHTML) {
  const link = document.createElement('a');
  link.href = hrefValue;
  link.classList.add('spotlight-link');
  link.innerHTML = innerHTML;

  return link;
}

function createButton(hrefValue) {
  const spotlightButton = button({ class: 'spotlight-button' });
  spotlightButton.textContent = 'LEARN MORE';
  spotlightButton.addEventListener('click', () => {
    window.location.href = hrefValue;
  });

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

  // style the hyperlinks
  const heading = h2(titleLink);
  const subheading = h3(subtitleLink);
  heading.classList.add('spotlight-text', 'title');
  subheading.classList.add('spotlight-text', 'subtitle');

  // create the button
  const spotlightButton = createButton(hrefValue);

  // create the form element
  const spotlightForm = form({ class: 'spotlight-form' });
  const spotlightInput = input({ class: 'spotlight-input' });
  spotlightInput.placeholder = 'Enter Email';
  spotlightForm.appendChild(spotlightInput);
  const spotlightFormButton = button({ class: 'spotlight-form-button' });
  spotlightFormButton.textContent = 'SUBMIT';
  spotlightForm.appendChild(spotlightFormButton);

  // create the text container div
  const textDiv = div({ class: 'spotlight-text' });
  textDiv.appendChild(heading);
  textDiv.appendChild(subheading);
  textDiv.appendChild(spotlightButton);
  textDiv.appendChild(spotlightForm);

  return textDiv;
}

export default function decorate(block) {
  const spotlightText = createBannerText(block);

  const bannerElement = div({ class: 'banner-element' });
  const bannerPicture = div({ class: 'banner-picture' });

  const pictureElement = block.querySelector('picture');
  const imgElement = pictureElement.querySelector('source');
  const src = imgElement.getAttribute('srcset');
  bannerPicture.style.backgroundImage = `url(${src})`;

  block.innerHTML = '';

  // desktop version
  const spotlightHolder = div({ class: 'spotlight-circle-holder' });
  const spotlightCircle = div({ class: 'spotlight-circle' });
  spotlightCircle.appendChild(spotlightText);
  spotlightHolder.appendChild(spotlightCircle);

  bannerPicture.appendChild(spotlightHolder);
  bannerElement.appendChild(bannerPicture);

  // mobile version
  const mobileBannerHolder = div({ class: 'mobile-bannertext-holder' });
  const mobileSpotlightText = spotlightText.cloneNode(true);

  mobileBannerHolder.appendChild(mobileSpotlightText);
  bannerElement.appendChild(mobileBannerHolder);

  block.appendChild(bannerElement);
}
