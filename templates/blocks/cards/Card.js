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
 * @param eagarLoadCnt - The number of cards to eagar load.  This is useful for the first few cards.
 * @returns {Promise<Element>}
 */
export default async function renderCards(type, items, eagarLoadCnt = 4) {
  await loadCSS(`${window.hlx.codeBasePath}/templates/blocks/cards/cards.css`);

  if (!items || items.length === 0) {
    return p({ class: 'no-results' }, 'No Quick Move-in\'s available at this time');
  }

  const ulEl = ul({ class: 'repeating-grid' });

  const promises = items.map(async (cardData, index) => {
    const liEl = li({ class: 'model-card' });
    const eagarLoading = eagarLoadCnt > 0 && index < eagarLoadCnt;
    const card = CardFactory.createCard(type, cardData);
    const cardEl = await card.render(eagarLoading);
    liEl.appendChild(cardEl);
    ulEl.append(liEl);
  });
  await Promise.all(promises);

  const cards = div({ class: `cards ${type}` }, ulEl);
  const cardWrapper = div({ class: 'cards-wrapper' }, cards);
  return div({ class: `section ${type}` }, cardWrapper);
}
