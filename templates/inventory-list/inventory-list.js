import { getInventorySheet, getSalesOfficesSheet } from '../../scripts/workbook.js';
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';
import { loadRates } from '../../scripts/mortgage.js';

export default async function decorate(doc) {
  await loadRates();

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');
  const inventoryHomes = await getInventorySheet('data');
  window.hh.current.inventory = inventoryHomes.filter((home) => home.status === 'Under Construction');
  window.hh.current.sale_center = await getSalesOfficesSheet('data');
  const modelsBlock = buildBlock('cards', []);
  modelsBlock.classList.add('inventory');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadBlock(modelsBlock, true);

  const cards = div({ class: 'section featured' }, blockWrapper);

  fragment.insertAdjacentElement('beforebegin', cards);
}
