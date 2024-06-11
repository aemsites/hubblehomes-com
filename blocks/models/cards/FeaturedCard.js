import BaseCard from './BaseCard.js';
import { a, div, span } from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';

class FeaturedCard extends BaseCard {
  renderTaglineItems(taglineContainer) {
    const price = span(`From ${formatPrice(this.model.price)}`);
    const priceContainer = div(price);
    const monthly = span(
      { class: 'model-card-tagline-price-per-month' },
      `*${formatPrice(this.model.estimatedmonthlypayment)}`,
    );
    const perMonth = span({ class: 'model-card-tagline-monthly' }, '/mo');
    const monthlyRate = div({ class: 'model-card-tagline-monthly-container' }, monthly, perMonth);
    taglineContainer.appendChild(priceContainer);
    taglineContainer.appendChild(monthlyRate);
  }

  /**
   * Render the sales center driving directions.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderButtonActionsOfDetailsContainer_left(gridContainer) {
    const link = a({
      target: '_blank',
      class: 'btn-action btn-icons btn-directions',
      href: `https://www.google.com/maps/dir/Current+Location/${window.hh.current.community.latitude},${window.hh.current.community.longitude}`,
    }, 'Directions');

    const actionContainer = div(link);
    gridContainer.appendChild(actionContainer);
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
