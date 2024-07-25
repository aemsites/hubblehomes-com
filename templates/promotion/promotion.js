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
  const bottomsection = div({ class: 'bottom-section' });
  const returnButton = a({ class: 'return-button', href: 'https://main--hubblehomes-com--aemsites.hlx.page/promotions' }, 'Return To Promotions');
  bottomsection.append(returnButton);
  $page.append(divPromotion);
  $page.append(bottomsection);
}
