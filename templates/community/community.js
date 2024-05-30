import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';
import { getInventoryHomes } from '../../scripts/inventory-data.js';
import { getHomePlans } from '../../scripts/home-plans-data.js';

/**
 * Builds the inventory homes block.
 * @returns {Promise<Element>} The inventory homes block wrapped in a div.
 */
async function buildInventoryHomes() {
  const content = [
    ['title', 'inventory'],
    // ['models', 'https://main--hubblehomes-com--aemsites.hlx.page/drafts/bhellema/models.json'],
  ];

  const hero = buildBlock('models', content);
  hero.classList.add('inventory');

  const blockWrapper = div(hero);
  decorateBlock(hero);

  await loadBlock(hero);
  return blockWrapper;
}

export default async function decorate(doc) {
  const homes = await getInventoryHomes('adams-ridge');
  const homeplans = await getHomePlans();

  window.hh = window.hh || {};
  window.hh.inventory = homes;

  const $page = doc.querySelector('main');

  const inventory = await buildInventoryHomes();

  $page.replaceWith(inventory);
}
