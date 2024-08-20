import { getAllInventoryHomes, SearchFilters } from '../../scripts/inventory.js';
import renderCards from '../blocks/cards/Card.js';
import { loadWorkbook } from '../../scripts/workbook.js';
import { loadRates } from '../../scripts/mortgage.js';

export default async function decorate(doc) {
  await loadWorkbook();
  await loadRates();

  const inventoryHomes = await getAllInventoryHomes(SearchFilters.UNDER_CONSTRUCTION);

  const blockWrapper = await renderCards('inventory', inventoryHomes, 5);

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  fragment.insertAdjacentElement('beforebegin', blockWrapper);
}
