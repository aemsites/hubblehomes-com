/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, a } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main > .section');
  const leftSection = doc.querySelector('.left-column');
  const rightSection = doc.querySelector('.right-column');
  leftSection.style.display = 'block';
  rightSection.style.display = 'block';
  const divPromotion = div({ class: 'section' }, div({ class: 'promotion-section' }, leftSection, rightSection));
  const bottomSection = div({ class: 'bottom-section' });
  const returnButton = a({ class: 'return-button', href: 'https://www.hubblehomes.com/promotions' }, 'Return To Promotions');
  bottomSection.append(returnButton);
  $page.append(divPromotion);
  $page.append(bottomSection);
}
