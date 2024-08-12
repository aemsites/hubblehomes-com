import { getInventorySheet } from '../../scripts/workbook.js';
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { div, button } from '../../scripts/dom-helpers.js';
import { loadRates } from '../../scripts/mortgage.js';

let startIndex = 0;
let endIndex;
const limit = 8;

async function displayCards(inventoryHomes, fragment) {
  endIndex = startIndex + limit;
  window.hh.current.inventory = inventoryHomes.slice(startIndex, endIndex);
  const modelsBlock = buildBlock('cards', []);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadBlock(modelsBlock, true);
  const cards = div({ class: 'section featured' }, blockWrapper);
  fragment.insertAdjacentElement('beforebegin', cards);
}

export default async function decorate(doc) {
  await loadRates();
  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');
  const inventoryHomes = await getInventorySheet('data');
  const filteredInventory = inventoryHomes.filter((home) => home.status === 'Under Construction');
  const inventorySize = filteredInventory.length;
  const loadMoreBtn = button({ class: 'load-more-btn' }, 'See More');
  const loadMore = div({ class: 'load-more' }, loadMoreBtn);
  await displayCards(filteredInventory, fragment);
  loadMoreBtn.addEventListener(('click'), async () => {
    startIndex = endIndex;
    endIndex += limit;
    await displayCards(filteredInventory, loadMore);
    if (inventorySize <= endIndex) {
      loadMore.classList.add('hidden');
    }
  });
  fragment.insertAdjacentElement('beforebegin', loadMore);
}
