/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main');
  const divPromotion = div({ class: 'promotion-section' });
  const leftSection = $page.querySelector('.left-column');
  const rightSection = $page.querySelector('.right-column');
  leftSection.style.display = 'block';
  rightSection.style.display = 'block';
  divPromotion.append(leftSection);
  divPromotion.append(rightSection);   
  $page.append(divPromotion);
}

