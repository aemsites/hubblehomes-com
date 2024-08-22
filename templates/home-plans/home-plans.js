import { getHomePlansSheet } from '../../scripts/workbook.js';
import { div, h3 } from '../../scripts/dom-helpers.js';
import { loadRates } from '../../scripts/mortgage.js';
import renderCards from '../blocks/cards/Card.js';

export default async function decorate(doc) {
  await loadRates();
  const homePlans = await getHomePlansSheet('data');
  if (homePlans) {
    homePlans.sort((a, b) => a.price - b.price);
  }

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  const singleFamilyPlans = homePlans.filter((plan) => plan.type === 'Single Family');
  const townHomePlans = homePlans.filter((plan) => plan.type === 'Townhome');

  if (townHomePlans) {
    townHomePlans.sort((a, b) => a.price - b.price);
  }

  const singleCards = await renderCards('home-plans', singleFamilyPlans, 5);
  const cards = div({ class: 'section featured' }, h3('Single Family Homes'), singleCards);
  fragment.insertAdjacentElement('beforebegin', cards);

  if (townHomePlans && townHomePlans.length > 0) {
    const townHomeCards = await renderCards('home-plans', townHomePlans, 5);
    const tcards = div({ class: 'section featured' }, h3('Townhome Plans'), townHomeCards);
    fragment.insertAdjacentElement('beforebegin', tcards);
  }
}
