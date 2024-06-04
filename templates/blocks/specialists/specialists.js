import { div } from '../../../scripts/dom-helpers.js';
import { createOptimizedPicture, readBlockConfig } from '../../../scripts/aem.js';
import formatPhoneNumber from '../../../scripts/phone-formatter.js';

export default function decorate(block) {
  const {
    photo,
    name,
    email,
    phone,
  } = readBlockConfig(block);

  const agent = div(
    { class: 'specialist' },
    div({ class: 'specialist-image-container' }, createOptimizedPicture(photo, name)),
    div(
      { class: 'specialist-info' },
      div({ class: 'name' }, name),
      div({ class: 'email' }, email),
      div({ class: 'phone' }, formatPhoneNumber(phone)),
    ),
  );

  block.innerHTML = '';
  block.appendChild(agent);
}
