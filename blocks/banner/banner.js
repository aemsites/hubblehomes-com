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
  const spotlightButton = button({ class: 'spotlightbutton' });

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

  // style the hyperlinks
  const heading = h2(titleLink);
  const subheading = h3(subtitleLink);
  heading.classList.add('spotlighttext', 'title');
  subheading.classList.add('spotlighttext', 'subtitle');

  // create the button
  const spotlightButton = createButton(hrefValue);

  const textDiv = div();
  textDiv.classList.add('spotlighttext');

  textDiv.appendChild(heading);
  textDiv.appendChild(subheading);
  textDiv.appendChild(spotlightButton);

  // create the form element
  const spotlightForm = form({ class: 'spotlightform' });
  const spotlightInput = input({ class: 'spotlightinput' });
  spotlightInput.placeholder = 'Enter Email';
  spotlightForm.appendChild(spotlightInput);
  const spotlightFormButton = button({ class: 'spotlightformbutton' });
  spotlightFormButton.textContent = 'SUBMIT';
  spotlightForm.appendChild(spotlightFormButton);

  textDiv.appendChild(spotlightForm);

  spotlightTitle.remove();
  spotlightSubtitle.remove();
  spotlightLink.remove();
  return textDiv;
}

export default function decorate(block) {
  const spotlightText = createBannerText(block);

  const bannerElement = div({ class: 'bannerElement' });

  const bannerPicture = div({ class: 'banner-picture' });

  const pictureElement = block.querySelector('picture');
  const imgElement = pictureElement.querySelector('source');
  const src = imgElement.getAttribute('srcset');
  bannerPicture.style.backgroundImage = `url(${src})`;

  block.innerHTML = '';

  // desktop version
  const spotlightHolder = div({ class: 'spotlightcircleholder' });
  const spotlightCircle = div({ class: 'spotlightcircle' });
  spotlightCircle.appendChild(spotlightText);
  spotlightHolder.appendChild(spotlightCircle);

  bannerPicture.appendChild(spotlightHolder);
  bannerElement.appendChild(bannerPicture);

  // mobile version
  const mobileBannerHolder = div({ class: 'mobileBannerTextHolder' });
  const mobileSpotlightText = spotlightText.cloneNode(true);

  mobileBannerHolder.appendChild(mobileSpotlightText);
  bannerElement.appendChild(mobileBannerHolder);

  block.appendChild(bannerElement);
}
