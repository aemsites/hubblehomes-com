import { createOptimizedPicture } from '../../scripts/aem.js';
import { h1 } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((child) => {
      const link = child.querySelector('a').href;
      child.classList.add('promo-card-content');
      const picture = child.querySelector('picture');
      const divImage = document.createElement('div');
      divImage.classList.add('promo-card-image');
      if (picture) {
        const imageLink = document.createElement('a');
        imageLink.href = link;
        imageLink.append(picture);
        divImage.append(imageLink);
        li.prepend(divImage);
      }
      const learnMore = document.createElement('a');
      learnMore.href = link;
      learnMore.textContent = 'Learn More';
      learnMore.classList.add('learn-more-btn');
      child.append(learnMore);
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  const promotiontext = document.createElement('div');
  promotiontext.classList.add('promotion-text');
  promotiontext.append(h1('Promotions'));
  block.append(promotiontext);
  block.append(ul);
}
