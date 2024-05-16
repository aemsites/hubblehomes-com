import { div, button, h2, h3, form, input } from '../../scripts/dom-helpers.js';

function createLinkElement(hrefValue, innerHTML) {
    const link = document.createElement('a');
    link.href = hrefValue;
    link.classList.add('spotlight-link');
    link.innerHTML = innerHTML;
    return link;
}

function createButton(hrefValue) {
    const spotlight_button = document.createElement('button');
    spotlight_button.classList.add('spotlightbutton');
    spotlight_button.textContent = 'LEARN MORE';
    spotlight_button.addEventListener('click', () => {
        window.location.href = hrefValue;
    });
    return spotlight_button;
}

function createBannerText(block) {
    // Extract text values from block elements
    const spotlight_title = block.querySelector('h2').innerHTML;
    const spotlight_subtitle = block.querySelector('h3').innerHTML;

    // Create hyperlinks with the text values
    const spotlight_link = block.querySelector('a');
    const hrefValue = spotlight_link ? spotlight_link.href : '#';
    const title_link = createLinkElement(hrefValue, spotlight_title);
    const subtitle_link = createLinkElement(hrefValue, spotlight_subtitle);

    // Style the hyperlinks
    const heading = document.createElement('h2');
    heading.classList.add('spotlighttext', 'title');
    heading.appendChild(title_link);
    const subheading = document.createElement('h3');
    subheading.classList.add('spotlighttext', 'subtitle');
    subheading.appendChild(subtitle_link);

    // Create the button
    const spotlight_button = createButton(hrefValue);

    // Create the form element
    const spotlight_form = document.createElement('form');
    spotlight_form.classList.add('spotlightform');
    const spotlight_input = document.createElement('input');
    spotlight_input.classList.add('spotlightinput');
    spotlight_input.placeholder = 'Enter Email';
    spotlight_form.appendChild(spotlight_input);
    const spotlight_form_button = document.createElement('button');
    spotlight_form_button.classList.add('spotlightformbutton');
    spotlight_form_button.textContent = 'SUBMIT';
    spotlight_form.appendChild(spotlight_form_button);

    const textDiv = document.createElement('div');
    textDiv.classList.add('spotlighttext');
    textDiv.appendChild(heading);
    textDiv.appendChild(subheading);
    textDiv.appendChild(spotlight_button);
    textDiv.appendChild(spotlight_form);

    // Remove original elements
    block.querySelector('h2').remove();
    block.querySelector('h3').remove();
    if (spotlight_link) spotlight_link.remove();

    return textDiv;
}

export default function decorate(block) {
    const spotlight_text = createBannerText(block);

    const bannerElement = div({ class: 'bannerElement' });
    const bannerPicture = div({ class: 'banner-picture' });

    const pictureElement = block.querySelector('picture');
    const imgElement = pictureElement.querySelector('source');
    const src = imgElement.getAttribute('srcset');
    bannerPicture.style.backgroundImage = `url(${src})`;

    block.innerHTML = '';

    // Desktop version
    const spotlightHolder = div({ class: 'spotlightHolder' });
    const spotlightcircle = div({ class: 'spotlightcircle' }, spotlight_text.cloneNode(true));

    spotlightHolder.appendChild(spotlightcircle);
    bannerPicture.appendChild(spotlightHolder);
    bannerElement.appendChild(bannerPicture);

    // Mobile version
    const mobileBannerHolder = document.createElement('div');
    mobileBannerHolder.classList.add('mobileBannerTextHolder');
    const mobileSpotlightText = spotlight_text.cloneNode(true);
    mobileBannerHolder.appendChild(mobileSpotlightText);
    bannerElement.appendChild(mobileBannerHolder);

    block.appendChild(bannerElement);
}
