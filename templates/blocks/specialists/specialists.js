import { a, div, img, small, p } from '../../../scripts/dom-helpers.js';
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
        div({ class: 'email' }, a({ href: `mailto:${email}` }, email), img({ src: '/icons/email.svg' })),
        div({ class: 'phone' }, a({ href: `tel:${phone}` }, formatPhoneNumber(phone)), img({ src: '/icons/phone.svg' })),
      ),
    );
  
    block.innerHTML = '';
    block.appendChild(agent);

}
