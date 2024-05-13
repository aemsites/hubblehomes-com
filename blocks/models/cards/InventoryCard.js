import BaseCard from './BaseCard.js';
import {
  a, div, h4, span,
} from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';

class InventoryCard extends BaseCard {
  renderAddress() {
    const addressTitle = h4({ class: 'model-address' }, this.model.address);
    const addressHref = a(addressTitle);
    addressHref.href = this.model.url;
    return addressHref;
  }

  renderTaglineItems(taglineContainer) {
    const price = span(formatPrice(this.model.price));
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
}

export default InventoryCard;
