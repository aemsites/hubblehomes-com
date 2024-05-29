import BaseCard from './BaseCard.js';
import { div, span } from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';

class FeaturedCard extends BaseCard {
  renderTaglineItems(taglineContainer) {
    const price = span(`From ${formatPrice(this.model.price)}`);
    const priceContainer = div(price);
    const monthly = span(
      { class: 'model-card-tagline-price-per-month' },
      `*${formatPrice(this.model.monthly)}`,
    );
    const perMonth = span({ class: 'model-card-tagline-monthly' }, '/mo');
    const monthlyRate = div({ class: 'model-card-tagline-monthly-container' }, monthly, perMonth);
    taglineContainer.appendChild(priceContainer);
    taglineContainer.appendChild(monthlyRate);
  }

  /**
   * Previous incarnations of this card displayed the view count of the model.
   * It was decided by the customer that they didn't want to display this information.
   * @returns an empty div
   */
  // eslint-disable-next-line class-methods-use-this
  renderTopBarStatus() {
    return div();
  }
}

export default FeaturedCard;
