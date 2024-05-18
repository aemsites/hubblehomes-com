import { div, button, h2, h3, form, input } from '../../scripts/dom-helpers.js';

function createLinkElement(hrefValue, innerHTML) {
  const link = document.createElement('a');
  link.href = hrefValue;
  link.classList.add('spotlight-link');
  link.innerHTML = innerHTML;

  return link;
}

function createButton(hrefValue) {
  const spotlight_button = button({ class: 'spotlightbutton' });

  spotlight_button.textContent = 'LEARN MORE';
  spotlight_button.addEventListener('click', () => {
    window.location.href = hrefValue;
  });
  return spotlight_button;
}



function createBannerText(block) {
  // extract text values from block elements
  const spotlight_title = block.querySelector('h2');
  const spotlight_subtitle = block.querySelector('h3');

  // create hyperlinks with the text values
  const spotlight_link = block.querySelector('a');
  const hrefValue = spotlight_link ? spotlight_link.href : '#';
  const title_link = createLinkElement(hrefValue, spotlight_title.innerHTML);
  const subtitle_link = createLinkElement(hrefValue, spotlight_subtitle.innerHTML);

  // style the hyperlinks
  const heading = h2(title_link);
  const subheading = h3(subtitle_link);
  heading.classList.add('spotlighttext', 'title');
  subheading.classList.add('spotlighttext', 'subtitle');

  // create the button
  const spotlight_button = createButton(hrefValue);

  const textDiv = div();
  textDiv.classList.add('spotlighttext');

  textDiv.appendChild(heading);
  textDiv.appendChild(subheading);
  textDiv.appendChild(spotlight_button);

  // create the form element 
  const spotlight_form = form({ class: "spotlightform" });
  const spotlight_input = input({ class: "spotlightinput" });
  spotlight_input.placeholder = "Enter Email";
  spotlight_form.appendChild(spotlight_input);
  const spotlight_form_button = button({ class: "spotlightformbutton" });
  spotlight_form_button.textContent = "SUBMIT";
  spotlight_form.appendChild(spotlight_form_button);


  textDiv.appendChild(spotlight_form);


  spotlight_title.remove();
  spotlight_subtitle.remove();
  spotlight_link.remove();
  return textDiv;
}

export default function decorate(block) {
  const spotlight_text = createBannerText(block);

  const bannerElement = div({ class: "bannerElement" });

  const bannerPicture = div({ class: "banner-picture" });

  const pictureElement = block.querySelector('picture');
  const imgElement = pictureElement.querySelector('source');
  const src = imgElement.getAttribute('srcset');
  bannerPicture.style.backgroundImage = `url(${src})`;

  block.innerHTML = "";

  // desktop version
  const spotlightHolder = div({ class: "spotlightcircleholder" });
  const spotlightcircle = div({ class: "spotlightcircle" });
  spotlightcircle.appendChild(spotlight_text);
  spotlightHolder.appendChild(spotlightcircle);

  bannerPicture.appendChild(spotlightHolder)
  bannerElement.appendChild(bannerPicture);

  // mobile version
  const mobileBannerHolder = div({ class: "mobileBannerTextHolder" });
  const mobileSpotlightText = spotlight_text.cloneNode(true);

  mobileBannerHolder.appendChild(mobileSpotlightText);
  bannerElement.appendChild(mobileBannerHolder);

  block.appendChild(bannerElement);
}
