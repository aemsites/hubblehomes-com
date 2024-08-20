import { div } from '../../scripts/dom-helpers.js';
import { getAllInventoryHomes, SearchFilters } from '../../scripts/inventory.js';
import renderCards from '../blocks/cards/Card.js';
import { loadWorkbook } from '../../scripts/workbook.js';

export default async function decorate(doc) {
  await loadWorkbook();

  const inventoryHomes = await getAllInventoryHomes(SearchFilters.UNDER_CONSTRUCTION);
  const blockWrapper = await renderCards('inventory', inventoryHomes, 2);
  const cards = div({ class: 'section featured' }, blockWrapper);

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  fragment.insertAdjacentElement('beforebegin', cards);
}
