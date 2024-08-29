import BaseCard from './BaseCard.js';
import { a, div, span } from '../../../scripts/dom-helpers.js';
import { formatPrice } from '../../../scripts/currency-formatter.js';
import { calculateMonthlyPayment } from '../../../scripts/mortgage.js';
import { getCommunityForUrl } from '../../../scripts/communities.js';
import formatPhoneNumber from '../../../scripts/phone-formatter.js';

class FeaturedCard extends BaseCard {
  renderTaglineItems(taglineContainer) {
    const priceText = Number.isNaN(parseFloat(this.cardData.price))
      ? this.cardData.price
      : `From ${formatPrice(this.cardData.price)}`;

    const priceElement = span(priceText);
    taglineContainer.appendChild(div(priceElement));

    if (!Number.isNaN(parseFloat(this.cardData.price))) {
      const monthlyPayment = `*${formatPrice(calculateMonthlyPayment(this.cardData.price))}`;
      const monthlyRate = div(
        { class: 'card-tagline-monthly-container' },
        span({ class: 'card-tagline-price-per-month' }, monthlyPayment),
        span({ class: 'card-tagline-monthly' }, '/mo'),
      );
      taglineContainer.appendChild(monthlyRate);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async renderMiddleRowOfDetailsContainer_right(gridContainer) {
    const community = await getCommunityForUrl(window.location.pathname);
    const link = a({
      target: '_blank',
      class: 'btn dark-gray square',
      href: `https://www.google.com/maps/dir/Current+Location/${community.latitude},${community.longitude}`,
    }, 'Directions');

    const middleLeft = div(link);
    gridContainer.appendChild(middleLeft);
  }

  /**
   * Render the bottom left section of the detail's container.
   * @param gridContainer
   */
  // eslint-disable-next-line class-methods-use-this
  renderMiddleRowOfDetailsContainer_left(gridContainer) {
    const { phone } = this.cardData.community;
    const link = a({ class: 'btn yellow square', href: `tel:${phone}` }, formatPhoneNumber(phone));
    gridContainer.appendChild(link);
  }

  /**
   * Previous incarnations of this card displayed the view count of the model.
   * It was decided by the customer that they didn't want to display this information.
   * @returns an empty div
   */
  // eslint-disable-next-line class-methods-use-this
  renderTopBarStatus() {
    return div({ class: 'status' }, 'Home Plan');
  }
}

export default FeaturedCard;
