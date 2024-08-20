import { getAllInventoryHomes, SearchFilters } from '../../scripts/inventory.js';
import renderCards from '../blocks/cards/Card.js';
import { loadWorkbook } from '../../scripts/workbook.js';

export default async function decorate(doc) {
  await loadWorkbook();

  const inventoryHomes = await getAllInventoryHomes(SearchFilters.UNDER_CONSTRUCTION);

  const blockWrapper = await renderCards('inventory', inventoryHomes, 5);

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  fragment.insertAdjacentElement('beforebegin', blockWrapper);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        const wrapper = await renderCards('inventory', inventoryHomes.splice(5));
        const cardList = document.querySelector('.cards > ul');
        const liEls = wrapper.querySelectorAll('.cards > ul > li');
        liEls.forEach(cardList.appendChild.bind(cardList));
      }
    });
  });
  observer.observe(document.querySelector('.model-card:last-of-type'));
}
