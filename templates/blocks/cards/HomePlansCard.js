import BaseCard from './BaseCard.js';
import { a, div, span } from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';
import { calculateMonthlyPayment } from '../../../scripts/mortgage.js';

class HomePlansCard extends BaseCard {
  renderTaglineItems(taglineContainer) {
    const from = span('From *');

    const price = span(formatPrice(this.cardData.price));
    const priceContainer = div(from, price);

    const monthly = span(`*${formatPrice(calculateMonthlyPayment(this.cardData.price))}`);
    const perMonth = span({ class: 'card-tagline-monthly' }, '/mo');
    const monthlyRate = div(
      { class: 'card-tagline-monthly-container' },
      from.cloneNode(true),
      monthly,
      perMonth,
    );

    taglineContainer.appendChild(priceContainer);
    taglineContainer.appendChild(monthlyRate);
  }

  // eslint-disable-next-line class-methods-use-this
  renderTopActionBar() {
    return div();
  }

  renderTopRowOfDetailsContainer_left(gridContainer) {
    const link = a({
      href: this.cardData.path,
      class: 'btn light-blue square',
    }, 'Get Info');

    gridContainer.appendChild(link);
  }

  // eslint-disable-next-line class-methods-use-this
  // renderIncentives() {
  //   const divEl = div({ class: 'incentive' }, '$25K Your Way on Quick Move-Ins');
  //   const link = a({
  //     href: '/new-homes/idaho/boise-metro/caldwell/mason-creek',
  //     class: '',
  //     'aria-label': 'Community Incentives Available for Mason Creek',
  //   }, divEl);
  //   return div({ class: 'incentive-container' }, link);
  // }

  // eslint-disable-next-line class-methods-use-this
  renderBottomRowOfDetailsContainer() {
    // override and do not render anything
  }
}

export default HomePlansCard;
