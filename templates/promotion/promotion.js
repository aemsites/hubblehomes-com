/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, a } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main');
  const divPromotion = div({ class: 'promotion-section' });
  const leftSection = $page.querySelector('.left-column');
  const rightSection = $page.querySelector('.right-column');
  leftSection.style.display = 'block';
  rightSection.style.display = 'block';
  divPromotion.append(leftSection);
  divPromotion.append(rightSection);
  const bottomsection = div({ class: 'bottom-section' });
  const returnButton = a({ class: 'return-button', href: 'https://main--hubblehomes-com--aemsites.hlx.page/promotions' }, 'Return To Promotions');
  bottomsection.append(returnButton);
  $page.append(divPromotion);
  $page.append(bottomsection);
}
