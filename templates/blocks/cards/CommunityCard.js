import BaseCard from './BaseCard.js';
import {
  a, div, h3,
} from '../../../scripts/dom-helpers.js';
import { getCommunityMinMaxDetails } from '../../../scripts/communities.js';
import formatPhoneNumber from '../../../scripts/phone-formatter.js';
import { getModelsByCommunity } from '../../../scripts/models.js';
import {
  getInventoryHomesForCommunity,
} from '../../../scripts/inventory.js';

class CommunityCard extends BaseCard {
  renderTitle() {
    return h3(this.cardData.name || '');
  }

  async renderTaglineItems(taglineContainer) {
    const taglinePrice = div(this.cardData.price);

    const models = await getModelsByCommunity(this.cardData.name);
    const inventory = await getInventoryHomesForCommunity(this.cardData.name);

    const plans = a({ href: `${this.cardData.path}#plans` }, `${models.length} Plans Available`);
    const quickMoveIn = a({ href: `${this.cardData.path}#inventory` }, `${inventory ? inventory.length : 0} Quick Move-In`);
    const taglineType = div(plans, quickMoveIn);

    taglineContainer.appendChild(taglinePrice);
    taglineContainer.appendChild(taglineType);
  }

  async renderModelImage() {
    const image = this.createModelImage(this.cardData.image, this.cardData.city);
    const imageLink = a({ href: this.cardData.path }, image);
    const imagePicture = div(imageLink);
    return div({ class: 'model-card-image-container' }, imagePicture);
  }

  // eslint-disable-next-line class-methods-use-this
  getValueForField(field, minMax) {
    return (minMax[field].min === minMax[field].max)
      ? minMax[field].min
      : `${minMax[field].min} - ${minMax[field].max}`;
  }

  async renderGridDetails() {
    const minMax = await getCommunityMinMaxDetails(this.cardData.name);
    const beds = this.getValueForField('beds', minMax);
    const baths = this.getValueForField('baths', minMax);
    const sqft = this.getValueForField('square feet', minMax);
    const cars = this.getValueForField('cars', minMax);

    return div(
      { class: 'card-grid-details repeating-grid' },
      div('Beds'),
      div('Baths'),
      div('SQ FT'),
      div('Cars'),
      div(`${beds}`),
      div(`${baths}`),
      div(`${sqft}`),
      div(`${cars}`),
    );
  }

  async renderMiddleRowOfDetailsContainer_left(gridContainer) {
    const link = a(
      {
        class: 'btn yellow square',
        href: `tel:${this.cardData.phone}`,
      },
      formatPhoneNumber(this.cardData.phone),
    );
    gridContainer.appendChild(link);
  }

  async renderMiddleRowOfDetailsContainer_right(gridContainer) {
    const link = a({
      target: '_blank',
      class: 'btn dark-gray square',
      href: `https://www.google.com/maps/dir/Current+Location/${this.cardData.latitude},${this.cardData.longitude}`,
    }, 'Directions');

    const middleLeft = div(link);
    gridContainer.appendChild(middleLeft);
  }
}

export default CommunityCard;
