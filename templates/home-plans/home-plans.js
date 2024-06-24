import { getHomePlansSheet } from '../../scripts/workbook.js';
import { buildBlock, decorateBlock } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';
import { loadTemplateBlock } from '../../scripts/template-block.js';
import { loadRates } from '../../scripts/mortgage.js';

export default async function decorate(doc) {
  await loadRates();

  const fragment = doc.querySelector('.fragment-wrapper');
  fragment.classList.add('disclaimer');

  window.hh.current.models = await getHomePlansSheet('data');

  const modelsBlock = buildBlock('cards', []);
  modelsBlock.classList.add('home-plans');
  const blockWrapper = div(modelsBlock);
  decorateBlock(modelsBlock);
  await loadTemplateBlock(modelsBlock);

  const cards = div({ class: 'section featured' }, blockWrapper);

  fragment.insertAdjacentElement('beforebegin', cards);
}
