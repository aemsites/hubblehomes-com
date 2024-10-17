import { getAllInventoryHomes } from '../../scripts/inventory.js';
import renderCards from '../blocks/cards/Card.js';
import { SearchFilters } from '../../scripts/inventory-filters.js';

export default async function decorate(doc) {
  const inventoryHomes = await getAllInventoryHomes(SearchFilters.UNDER_CONSTRUCTION);

  const blockWrapper = await renderCards('inventory', inventoryHomes, 5);

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  fragment.insertAdjacentElement('beforebegin', blockWrapper);
}
