import {
  div,
  li, p, ul,
} from '../../../scripts/dom-helpers.js';
import CardFactory from './CardFactory.js';
import { loadCSS } from '../../../scripts/aem.js';

/**
 * Helper function to render cards based on the card type and the data provided.
 *
 * This is an alternative way of rendering cards that's not block related.  Eventually
 * all block references should probably move to this method.
 *
 * @param type - The type of card to render. Can be 'featured', 'home-plans', 'inventory',
 * or 'community'.
 * @param items - The data to render the cards with.
 * @param maxRender - The number of cards render. If -1, render all cards, each card that is
 * rendered will be eagerly loaded if a maxRender value is provided.
 * @returns {Promise<Element>}
 */
export default async function renderCards(type, items, maxRender = -1) {
  await loadCSS(`${window.hlx.codeBasePath}/templates/blocks/cards/cards.css`);
  const parent = div({ class: `section ${type}` });

  if (!items || items.length === 0) {
    parent.append(p({ class: 'no-results' }, 'No Quick Move-in\'s available at this time.'));
  } else {
    const ulEl = ul({ class: 'repeating-grid' });
    const promises = items.map(async (cardData, index) => {
      if (maxRender === -1 || index < maxRender) {
        const liEl = li({ class: 'model-card' });
        const eager = maxRender > 0 && index < maxRender;
        const card = CardFactory.createCard(type, cardData);
        const cardEl = await card.render(eager);
        liEl.appendChild(cardEl);
        ulEl.append(liEl);
      }
    });
    await Promise.all(promises);
    const cards = div({ class: `cards ${type}` }, ulEl);
    const cardWrapper = div({ class: 'cards-wrapper' }, cards);
    parent.append(cardWrapper);
  }

  return parent;
}
