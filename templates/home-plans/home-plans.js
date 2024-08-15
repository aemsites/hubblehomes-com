import { getHomePlansSheet } from '../../scripts/workbook.js';
import { div, h3 } from '../../scripts/dom-helpers.js';
import { loadRates } from '../../scripts/mortgage.js';
import renderCards from '../blocks/cards/Card.js';

export default async function decorate(doc) {
  await loadRates();
  const homePlans = await getHomePlansSheet('data');

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  const singleFamilyPlans = homePlans.filter((plan) => plan.type === 'Single Family');
  const towneHomePlans = homePlans.filter((plan) => plan.type === 'Townhome');

  const singleCards = await renderCards('home-plans', singleFamilyPlans);
  const cards = div({ class: 'section featured' }, h3('Single Family Homes'), singleCards);

  const townHomeCards = await renderCards('home-plans', towneHomePlans);
  const tcards = div({ class: 'section featured' }, h3('Townhome Plans'), townHomeCards);

  fragment.insertAdjacentElement('beforebegin', cards);
  fragment.insertAdjacentElement('beforebegin', tcards);
}
