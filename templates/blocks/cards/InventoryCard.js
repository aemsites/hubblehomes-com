import BaseCard from './BaseCard.js';
import {
  a, div, h4, span,
} from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';
import { calculateMonthlyPayment } from '../../../scripts/mortgage.js';

class InventoryCard extends BaseCard {
  renderAddress() {
    const addressTitle = h4({ class: 'model-address' }, this.cardData.address);
    const addressHref = a(addressTitle);
    addressHref.href = this.cardData.url;
    return addressHref;
  }

  renderTaglineItems(taglineContainer) {
    const price = span(formatPrice(this.cardData.price));
    const priceContainer = div(price);
    const monthly = span(
      { class: 'card-tagline-price-per-month' },
      `* ${formatPrice(calculateMonthlyPayment(this.cardData.price))}`,
    );
    const perMonth = span({ class: 'card-tagline-monthly' }, '/mo');
    const monthlyRate = div({ class: 'card-tagline-monthly-container' }, monthly, perMonth);
    taglineContainer.appendChild(priceContainer);
    taglineContainer.appendChild(monthlyRate);
  }
}

export default InventoryCard;
