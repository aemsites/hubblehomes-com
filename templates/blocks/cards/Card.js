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
 * @returns {Promise<Element>}
 */
export default async function renderCards(type, items) {
  await loadCSS(`${window.hlx.codeBasePath}/templates/blocks/cards/cards.css`);

  if (items.length === 0) {
    return p({ class: 'no-results' }, 'Sorry, no homes match your criteria.');
  }

  const ulEl = ul({ class: 'repeating-grid' });

  const promises = items.map(async (cardData) => {
    const liEl = li({ class: 'model-card' });
    const card = CardFactory.createCard(type, cardData);
    const cardEl = await card.render();
    liEl.appendChild(cardEl);
    ulEl.append(liEl);
  });
  await Promise.all(promises);

  const cards = div({ class: `cards ${type}` }, ulEl);
  const cardWrapper = div({ class: 'cards-wrapper' }, cards);
  return div({ class: `section ${type}` }, cardWrapper);
}
