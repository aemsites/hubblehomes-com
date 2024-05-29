import BaseCard from './BaseCard.js';
import { a, div, span } from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';

class HomePlansCard extends BaseCard {
  renderTaglineItems(taglineContainer) {
    const from = span('From *');

    const price = span(formatPrice(this.model.pricing));
    const priceContainer = div(from, price);

    const monthly = span(formatPrice(this.model.estimatedmonthlypayment));
    const perMonth = span({ class: 'model-card-tagline-monthly' }, '/mo');
    const monthlyRate = div(
      { class: 'model-card-tagline-monthly-container' },
      from.cloneNode(true),
      monthly,
      perMonth,
    );

    taglineContainer.appendChild(priceContainer);
    taglineContainer.appendChild(monthlyRate);
  }

  // eslint-disable-next-line class-methods-use-this
  renderIncentives() {
    const divEl = div({ class: 'incentive' }, '$25K Your Way on Quick Move-Ins');
    const link = a({
      href: '/new-homes/idaho/boise-metro/caldwell/mason-creek',
      class: '',
      'aria-label': 'Community Incentives Available for Mason Creek',
    }, divEl);
    return div({ class: 'incentive-container' }, link);
  }
}

export default HomePlansCard;
