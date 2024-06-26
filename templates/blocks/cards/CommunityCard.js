import BaseCard from './BaseCard.js';
import { a, div, h3 } from '../../../scripts/dom-helpers.js';

class CommunityCard extends BaseCard {
  renderTitle() {
    return h3(this.cardData.name || '');
  }

  // eslint-disable-next-line class-methods-use-this
  renderTaglineItems(taglineContainer) {
    const taglinePrice = div('Sold Out. Ask about Brittany Heights');
    const taglineType = div('1 Story, 1.5 Story, 2 Story, Primary Down');

    taglineContainer.appendChild(taglinePrice);
    taglineContainer.appendChild(taglineType);
  }

  renderBottomRowOfDetailsContainer(gridContainer) {
    const link = a({
      class: 'btn-primary2',
      href: this.cardData.href,
    }, 'View Monarch');
    const middleLeft = div({ class: 'grid-col-span-2' }, link);
    gridContainer.appendChild(middleLeft);
  }
}

export default CommunityCard;
