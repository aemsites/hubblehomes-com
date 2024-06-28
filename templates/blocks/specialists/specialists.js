import { a, div, img, small, p } from '../../../scripts/dom-helpers.js';
import { createOptimizedPicture, readBlockConfig } from '../../../scripts/aem.js';
import formatPhoneNumber from '../../../scripts/phone-formatter.js';

export default function decorate(block) {
  const {
    photo,
    name,
    email,
    phone,
    communities = '',
    designation = '',
    type = '',
  } = readBlockConfig(block);  
  if (type === 'sales-team') {
    console.log('sales team block');    
    const agent = div(
      { class: 'specialist, sales-team' },
      div({ class: 'specialist-image-container-sales-team' }, createOptimizedPicture(photo, name)),
      div(
        { class: 'specialist-info-sales-team' },
        div({ class: 'name' }, name),
        div({ class: 'designation' }, designation),
        div({ class: 'line-break'}),
        div({ class: 'phone' }, a({ href: `tel:${phone}` }, `${formatPhoneNumber(phone)} ${small('Direct').innerHTML}`)),
        div({ class: 'email' }, a({ href: `mailto:${email}` }, email)),
      ),
    );
    if (communities !== '') {      
      const communityBlock = div({ class: 'communities' }, div({ class: 'communityheader' }, 'Communities'));        
      const communitiesArray = communities.split(',');
      communitiesArray.forEach((community) => {
        communityBlock.appendChild(div({ class: `community` },community));
      });
      agent.appendChild(communityBlock);
    }      
    block.innerHTML = '';
    block.appendChild(agent);
  } else {
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
}
