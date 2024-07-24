/* eslint-disable function-call-argument-newline */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline, object-curly-newline */
import { div, h3, p, small, a, strong, hr } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import formatTimeStamp from '../../scripts/utils.js';


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

